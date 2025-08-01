import jsforce from 'jsforce';
import jwt from 'jsonwebtoken';

// Connection pool configuration
interface PoolConfig {
    maxConnections: number;
    minConnections: number;
    maxIdleTime: number; // milliseconds
    connectionTimeout: number; // milliseconds
}

// Token cache interface
interface TokenCache {
    accessToken: string;
    instanceUrl: string;
    expirationTime: number;
    createdAt: number;
}

// Connection wrapper for pool management
interface PooledConnection {
    id: string;
    conn: any; // jsforce.Connection
    lastUsed: number;
    isActive: boolean;
    useCount: number;
}

export class SalesforceClient {
    private connectionPool: PooledConnection[] = [];
    private tokenCache: TokenCache | null = null;
    private poolConfig: PoolConfig;
    private isInitialized: boolean = false;
    private circuitBreakerFailures: number = 0;
    private circuitBreakerLastFailure: number = 0;
    private readonly circuitBreakerThreshold = 5;
    private readonly circuitBreakerCooldown = 60000; // 1 minute

    constructor() {
        this.poolConfig = {
            maxConnections: parseInt(process.env.SF_MAX_CONNECTIONS || '5'),
            minConnections: parseInt(process.env.SF_MIN_CONNECTIONS || '2'),
            maxIdleTime: parseInt(process.env.SF_MAX_IDLE_TIME || '300000'), // 5 minutes
            connectionTimeout: parseInt(process.env.SF_CONNECTION_TIMEOUT || '30000') // 30 seconds
        };

        // Initialize pool cleanup interval
        setInterval(() => this.cleanupIdleConnections(), 60000); // Check every minute
    }

    /**
     * Check if circuit breaker is open (too many recent failures)
     */
    private isCircuitBreakerOpen(): boolean {
        if (this.circuitBreakerFailures >= this.circuitBreakerThreshold) {
            const timeSinceLastFailure = Date.now() - this.circuitBreakerLastFailure;
            return timeSinceLastFailure < this.circuitBreakerCooldown;
        }
        return false;
    }

    /**
     * Record a failure for circuit breaker tracking
     */
    private recordFailure(): void {
        this.circuitBreakerFailures++;
        this.circuitBreakerLastFailure = Date.now();
    }

    /**
     * Reset circuit breaker on successful operations
     */
    private resetCircuitBreaker(): void {
        this.circuitBreakerFailures = 0;
        this.circuitBreakerLastFailure = 0;
    }

    /**
     * Check if cached token is still valid
     */
    private isTokenValid(): boolean {
        if (!this.tokenCache) return false;

        // Check if token expires in the next 60 seconds (buffer time)
        const bufferTime = 60000; // 1 minute buffer
        return Date.now() < (this.tokenCache.expirationTime - bufferTime);
    }

    /**
     * Clean up idle connections from the pool
     */
    private cleanupIdleConnections(): void {
        const now = Date.now();
        const activeConnections = this.connectionPool.filter(pooledConn => {
            const isIdle = (now - pooledConn.lastUsed) > this.poolConfig.maxIdleTime;
            const shouldKeep = pooledConn.isActive && !isIdle;

            if (!shouldKeep && this.connectionPool.length > this.poolConfig.minConnections) {
                // console.log(`Cleaning up idle connection ${pooledConn.id}`);
                return false;
            }
            return true;
        });

        this.connectionPool = activeConnections;
    }

    /**
     * Generate and cache JWT access token
     */
    private async generateAccessToken(): Promise<TokenCache> {
        if (this.isCircuitBreakerOpen()) {
            throw new Error('Salesforce connection circuit breaker is open. Too many recent failures.');
        }

        if (!process.env.SF_CLIENT_ID || !process.env.SF_USERNAME || !process.env.SF_PRIVATE_KEY) {
            throw new Error('Missing required environment variables: SF_CLIENT_ID, SF_USERNAME, SF_PRIVATE_KEY');
        }

        try {
            // Decode and validate the private key
            let privateKey = process.env.SF_PRIVATE_KEY;
            if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
                try {
                    privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
                } catch (e) {
                    throw new Error('Failed to decode Salesforce private key. Please check that the environment variable SF_PRIVATE_KEY is a valid base64 string.');
                }
            }

            // Validate private key format after decoding
            if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
                throw new Error('Invalid private key format. Must be a valid PEM-formatted private key.');
            }

            // Validate private key length (basic check for RSA-2048 minimum)
            const keyContent = privateKey.replace(/-----BEGIN PRIVATE KEY-----|\-----END PRIVATE KEY-----|\n|\r/g, '');
            if (keyContent.length < 1000) {
                throw new Error('Private key appears to be too short. Minimum RSA-2048 required.');
            }

            // Create JWT payload with current timestamp
            const now = Math.floor(Date.now() / 1000);
            const loginUrl = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
            const jwtPayload = {
                iss: process.env.SF_CLIENT_ID,
                sub: process.env.SF_USERNAME,
                aud: loginUrl,
                exp: now + 300, // Expires in 5 minutes
                iat: now
            };

            // Sign the JWT with your private key
            const token = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256' });

            // Request access token using the JWT Bearer flow
            const response = await fetch(`${loginUrl}/services/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'wnyc-vue3-app/1.0',
                    'Accept': 'application/json'
                },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: token
                }),
                signal: AbortSignal.timeout(this.poolConfig.connectionTimeout)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Salesforce auth error:', errorText);
                this.recordFailure();
                throw new Error(`JWT Authentication failed: ${response.statusText} - ${errorText}`);
            }

            const authResponse = await response.json();

            // Create token cache
            const tokenCache: TokenCache = {
                accessToken: authResponse.access_token,
                instanceUrl: authResponse.instance_url,
                expirationTime: Date.now() + (4 * 60 * 1000), // 4 minutes to be safe
                createdAt: Date.now()
            };

            this.tokenCache = tokenCache;
            this.resetCircuitBreaker();

            return tokenCache;
        } catch (error) {
            console.error('Failed to generate Salesforce access token:', error.message);
            this.recordFailure();
            throw error;
        }
    }

    /**
     * Get or create a connection from the pool
     */
    private async getConnection(): Promise<PooledConnection> {
        // Ensure we have a valid token
        if (!this.isTokenValid()) {
            await this.generateAccessToken();
        }

        // Look for an available connection in the pool
        let availableConnection = this.connectionPool.find(conn =>
            conn.isActive &&
            (Date.now() - conn.lastUsed) < this.poolConfig.maxIdleTime
        );

        if (!availableConnection && this.connectionPool.length < this.poolConfig.maxConnections) {
            // Create new connection
            availableConnection = await this.createNewConnection();
        } else if (!availableConnection) {
            // Reuse the least recently used connection
            availableConnection = this.connectionPool.reduce((oldest, current) =>
                current.lastUsed < oldest.lastUsed ? current : oldest
            );

            // Update the connection with fresh token
            await this.refreshConnection(availableConnection);
        }

        // Update usage tracking
        availableConnection.lastUsed = Date.now();
        availableConnection.useCount++;

        return availableConnection;
    }

    /**
     * Create a new pooled connection
     */
    private async createNewConnection(): Promise<PooledConnection> {
        if (!this.tokenCache) {
            throw new Error('No valid token cache available');
        }

        const connectionId = `sf-conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const conn = new jsforce.Connection({
            loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
            instanceUrl: this.tokenCache.instanceUrl,
            accessToken: this.tokenCache.accessToken,
            refreshFn: async (conn: any, callback: (err: Error | null, accessToken?: string) => void) => {
                try {
                    const newToken = await this.generateAccessToken();
                    conn.instanceUrl = newToken.instanceUrl;
                    callback(null, newToken.accessToken);
                } catch (error) {
                    callback(error instanceof Error ? error : new Error(String(error)));
                }
            }
        });

        const pooledConnection: PooledConnection = {
            id: connectionId,
            conn,
            lastUsed: Date.now(),
            isActive: true,
            useCount: 0
        };

        this.connectionPool.push(pooledConnection);
        return pooledConnection;
    }

    /**
     * Refresh an existing connection with new token
     */
    private async refreshConnection(pooledConnection: PooledConnection): Promise<void> {
        if (!this.tokenCache) {
            throw new Error('No valid token cache available');
        }

        pooledConnection.conn.instanceUrl = this.tokenCache.instanceUrl;
        pooledConnection.conn.accessToken = this.tokenCache.accessToken;
        pooledConnection.lastUsed = Date.now();
    }

    /**
     * Initialize the connection pool
     */
    async connect(): Promise<void> {
        if (!this.isInitialized) {
            // Create minimum number of connections
            await this.generateAccessToken();

            const initPromises = [];
            for (let i = 0; i < this.poolConfig.minConnections; i++) {
                initPromises.push(this.createNewConnection());
            }

            await Promise.all(initPromises);
            this.isInitialized = true;
        } else if (!this.isTokenValid()) {
            // Refresh token and update all connections
            await this.generateAccessToken();

            const refreshPromises = this.connectionPool.map(conn => this.refreshConnection(conn));
            await Promise.all(refreshPromises);
        }
    }

    /**
     * Execute a raw SOQL query using pooled connections
     */
    async queryRecord(soql: string) {
        // Sanitize SOQL input to prevent injection
        if (!soql || typeof soql !== 'string') {
            throw new Error('Invalid SOQL query: must be a non-empty string');
        }

        // Basic SOQL injection prevention - check for dangerous patterns
        const dangerousPatterns = [
            /;\s*(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER)\s+/i, // SQL commands after semicolon
            /UNION\s+SELECT/i, // UNION injection attempts
            /--\s/, // SQL comments 
            /\/\*.*\*\//, // Block comments
            /'\s*;\s*(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER)/i, // Quote followed by dangerous commands
            /'\s*UNION\s+SELECT/i, // Quote followed by UNION
            /'\s*OR\s+'1'\s*=\s*'1/i // Classic SQL injection pattern
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(soql)) {
                throw new Error('Invalid SOQL query: contains potentially dangerous patterns');
            }
        }

        let pooledConnection: PooledConnection | null = null;

        try {
            await this.connect(); // Ensure pool is initialized
            pooledConnection = await this.getConnection();
            const result = await pooledConnection.conn.query(soql);
            return result;
        } catch (error: any) {
            // If it's an authentication error, try to reconnect once
            if (
                (error?.errorCode === 'INVALID_SESSION_ID') ||
                (error?.name === 'INVALID_SESSION_ID') ||
                (error?.message?.includes('INVALID_SESSION_ID'))
            ) {
                // Refresh the token and retry
                await this.generateAccessToken();
                if (pooledConnection) {
                    await this.refreshConnection(pooledConnection);
                    const result = await pooledConnection.conn.query(soql);
                    return result;
                }
            }

            throw error;
        }
    }

    /**
     * Finds a single record using SObject methods with automatic sanitization
     */
    async findOne(objectType: string, conditions: any, fields?: string[] | string): Promise<any> {
        let pooledConnection: PooledConnection | null = null;

        try {
            await this.connect(); // Ensure pool is initialized
            pooledConnection = await this.getConnection();

            const sobject = pooledConnection.conn.sobject(objectType);
            const result = await sobject.findOne(conditions, fields);

            return result;
        } catch (error: any) {
            // Handle session expiration and retry
            if (
                (error?.errorCode === 'INVALID_SESSION_ID') ||
                (error?.name === 'INVALID_SESSION_ID') ||
                (error?.message?.includes('INVALID_SESSION_ID'))
            ) {
                // Refresh the token and retry
                await this.generateAccessToken();
                if (pooledConnection) {
                    await this.refreshConnection(pooledConnection);
                    const sobject = pooledConnection.conn.sobject(objectType);
                    const result = await sobject.findOne(conditions, fields);
                    return result;
                }
            }

            throw error;
        }
    }

    /**
     * Finds multiple records using SObject methods with automatic sanitization
     */
    async find(objectType: string, conditions: any, fields?: string[] | string): Promise<any[]> {
        let pooledConnection: PooledConnection | null = null;

        try {
            await this.connect(); // Ensure pool is initialized
            pooledConnection = await this.getConnection();

            const sobject = pooledConnection.conn.sobject(objectType);
            const results = await sobject.find(conditions, fields);

            return results;
        } catch (error: any) {
            // Handle session expiration and retry
            if (
                (error?.errorCode === 'INVALID_SESSION_ID') ||
                (error?.name === 'INVALID_SESSION_ID') ||
                (error?.message?.includes('INVALID_SESSION_ID'))
            ) {
                // Refresh the token and retry
                await this.generateAccessToken();
                if (pooledConnection) {
                    await this.refreshConnection(pooledConnection);
                    const sobject = pooledConnection.conn.sobject(objectType);
                    const results = await sobject.find(conditions, fields);
                    return results;
                }
            }

            throw error;
        }
    }

    /**
     * Get connection pool statistics for monitoring
     */
    getPoolStats() {
        return {
            totalConnections: this.connectionPool.length,
            activeConnections: this.connectionPool.filter(conn => conn.isActive).length,
            tokenCached: !!this.tokenCache,
            tokenValid: this.isTokenValid(),
            circuitBreakerFailures: this.circuitBreakerFailures,
            circuitBreakerOpen: this.isCircuitBreakerOpen(),
            poolConfig: this.poolConfig
        };
    }

    /**
     * Force refresh all connections and clear cache
     */
    async refreshPool(): Promise<void> {
        this.tokenCache = null;
        this.connectionPool = [];
        this.isInitialized = false;
        await this.connect();
    }
}

// Export singleton instance
const salesforce = new SalesforceClient();
export default salesforce;