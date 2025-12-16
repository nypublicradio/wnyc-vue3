import jsforce from 'jsforce';
import jwt from 'jsonwebtoken';

// Error types for better categorization
enum SalesforceErrorType {
    AUTHENTICATION = 'authentication',
    AUTHORIZATION = 'authorization',
    NETWORK = 'network',
    VALIDATION = 'validation',
    DATA_FORMAT = 'data_format',
    RATE_LIMIT = 'rate_limit',
    SOQL_INJECTION = 'soql_injection',
    CIRCUIT_BREAKER = 'circuit_breaker',
    CONNECTION_POOL = 'connection_pool',
    UNKNOWN = 'unknown'
}

// Enhanced error class for better error handling
class SalesforceError extends Error {
    public type: SalesforceErrorType;
    public originalError?: Error;
    public context?: Record<string, any>;
    public statusCode?: number;

    constructor(
        message: string,
        type: SalesforceErrorType = SalesforceErrorType.UNKNOWN,
        originalError?: Error,
        context?: Record<string, any>,
        statusCode?: number
    ) {
        super(message);
        this.name = 'SalesforceError';
        this.type = type;
        this.originalError = originalError;
        this.context = context;
        this.statusCode = statusCode;

        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SalesforceError);
        }
    }
}

// Error handler utility functions

/**
 * Captures and logs errors using console logging
 * @param error - The error to capture (Error or SalesforceError instance)
 * @param context - Optional context object with additional error information
 */
export function captureError(error: Error | SalesforceError, context?: Record<string, any>): void {
    // Enhanced console logging
    console.error('Salesforce Error:', {
        message: error.message,
        type: error instanceof SalesforceError ? error.type : 'UNKNOWN',
        context,
        stack: error.stack,
        ...(error instanceof SalesforceError && {
            salesforceErrorType: error.type,
            statusCode: error.statusCode,
            originalError: error.originalError?.message
        })
    });
}

/**
 * Categorizes Salesforce errors based on error codes and messages for better error handling.
 * 
 * This function analyzes the error object to determine the most appropriate error type,
 * which helps in implementing proper retry logic and user-friendly error messages.
 * 
 * @param error - The error object to categorize (can be any type)
 * @returns The categorized error type from SalesforceErrorType enum
 * 
 * @example
 * ```typescript
 * const errorType = categorizeError(someError);
 * if (errorType === SalesforceErrorType.AUTHENTICATION) {
 *   // Handle authentication errors
 * }
 * ```
 */
export function categorizeError(error: any): SalesforceErrorType {
    if (!error) return SalesforceErrorType.UNKNOWN;

    const message = error.message?.toLowerCase() || '';
    const errorCode = error.errorCode || error.code || '';
    const errorName = error.name || '';

    // Define error code mappings
    const errorCodeMappings: Record<string, SalesforceErrorType> = {
        'INVALID_LOGIN': SalesforceErrorType.AUTHENTICATION,
        'INVALID_SESSION_ID': SalesforceErrorType.AUTHENTICATION,
        'INSUFFICIENT_ACCESS': SalesforceErrorType.AUTHORIZATION,
        'REQUEST_LIMIT_EXCEEDED': SalesforceErrorType.RATE_LIMIT,
        'MALFORMED_QUERY': SalesforceErrorType.VALIDATION,
        'INVALID_FIELD': SalesforceErrorType.VALIDATION,
        'ENOTFOUND': SalesforceErrorType.NETWORK,
        'ECONNREFUSED': SalesforceErrorType.NETWORK,
        'TIMEOUT': SalesforceErrorType.NETWORK,
    };

    // Define error name mappings
    const errorNameMappings: Record<string, SalesforceErrorType> = {
        'FetchError': SalesforceErrorType.NETWORK,
    };

    // Define message keyword mappings
    const messageKeywords: Array<{ keywords: string[], type: SalesforceErrorType }> = [
        {
            keywords: ['authentication', 'invalid session', 'jwt authentication failed'],
            type: SalesforceErrorType.AUTHENTICATION
        },
        {
            keywords: ['insufficient access', 'authorization'],
            type: SalesforceErrorType.AUTHORIZATION
        },
        {
            keywords: ['network', 'timeout', 'connection'],
            type: SalesforceErrorType.NETWORK
        },
        {
            keywords: ['rate limit', 'too many requests'],
            type: SalesforceErrorType.RATE_LIMIT
        },
        {
            keywords: ['potentially dangerous patterns'],
            type: SalesforceErrorType.SOQL_INJECTION
        },
        {
            keywords: ['circuit breaker'],
            type: SalesforceErrorType.CIRCUIT_BREAKER
        },
        {
            keywords: ['invalid', 'malformed'],
            type: SalesforceErrorType.VALIDATION
        }
    ];

    // Check error code mappings first
    if (errorCode && errorCodeMappings[errorCode]) {
        return errorCodeMappings[errorCode];
    }

    // Check error name mappings
    if (errorName && errorNameMappings[errorName]) {
        return errorNameMappings[errorName];
    }

    // Check message keywords
    for (const { keywords, type } of messageKeywords) {
        if (keywords.some(keyword => message.includes(keyword))) {
            return type;
        }
    }

    return SalesforceErrorType.UNKNOWN;
}

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

/**
 * A robust Salesforce client with connection pooling, automatic token management, and circuit breaker pattern.
 * 
 * Features:
 * - Connection pooling for better performance and resource management
 * - Automatic JWT token generation and refresh
 * - Circuit breaker pattern to handle failures gracefully
 * - SOQL injection prevention
 * - Comprehensive error handling and monitoring
 * - Session retry logic for authentication errors
 * 
 * @example
 * ```typescript
 * const client = new SalesforceClient();
 * await client.connect();
 * const results = await client.queryRecord('SELECT Id, Name FROM Account LIMIT 10');
 * ```
 */
export class SalesforceClient {
    private connectionPool: PooledConnection[] = [];
    private tokenCache: TokenCache | null = null;
    private readonly poolConfig: PoolConfig;
    private isInitialized = false;
    private circuitBreakerFailures = 0;
    private circuitBreakerLastFailure = 0;
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

            return shouldKeep || this.connectionPool.length <= this.poolConfig.minConnections;
        });

        this.connectionPool = activeConnections;
    }

    /**
     * Generate and cache JWT access token
     */
    private async generateAccessToken(): Promise<TokenCache> {
        if (this.isCircuitBreakerOpen()) {
            const error = new SalesforceError(
                'Salesforce connection circuit breaker is open. Too many recent failures.',
                SalesforceErrorType.CIRCUIT_BREAKER,
                undefined,
                {
                    failures: this.circuitBreakerFailures,
                    lastFailure: new Date(this.circuitBreakerLastFailure).toISOString()
                }
            );
            captureError(error);
            throw error;
        }

        if (!process.env.SF_CLIENT_ID || !process.env.SF_USERNAME || !process.env.SF_PRIVATE_KEY) {
            const error = new SalesforceError(
                'Missing required environment variables: SF_CLIENT_ID, SF_USERNAME, SF_PRIVATE_KEY',
                SalesforceErrorType.VALIDATION,
                undefined,
                {
                    missingVars: {
                        SF_CLIENT_ID: !process.env.SF_CLIENT_ID,
                        SF_USERNAME: !process.env.SF_USERNAME,
                        SF_PRIVATE_KEY: !process.env.SF_PRIVATE_KEY
                    }
                }
            );
            captureError(error);
            throw error;
        }

        try {
            // Decode and validate the private key
            let privateKey = process.env.SF_PRIVATE_KEY;
            if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
                try {
                    privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
                } catch (e) {
                    const error = new SalesforceError(
                        'Failed to decode Salesforce private key. Please check that the environment variable SF_PRIVATE_KEY is a valid base64 string.',
                        SalesforceErrorType.VALIDATION,
                        e as Error,
                        { keyFormat: 'base64_decode_failed' }
                    );
                    captureError(error);
                    throw error;
                }
            }

            // Validate private key format after decoding
            if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
                const error = new SalesforceError(
                    'Invalid private key format. Must be a valid PEM-formatted private key.',
                    SalesforceErrorType.VALIDATION,
                    undefined,
                    { keyFormat: 'invalid_pem_format' }
                );
                captureError(error);
                throw error;
            }

            // Validate private key length (basic check for RSA-2048 minimum)
            const keyContent = privateKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n|\r/g, '');
            if (keyContent.length < 1000) {
                const error = new SalesforceError(
                    'Private key appears to be too short. Minimum RSA-2048 required.',
                    SalesforceErrorType.VALIDATION,
                    undefined,
                    { keyLength: keyContent.length, minimumRequired: 1000 }
                );
                captureError(error);
                throw error;
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

                const errorType = response.status === 401 || response.status === 403
                    ? SalesforceErrorType.AUTHENTICATION
                    : response.status >= 500
                        ? SalesforceErrorType.NETWORK
                        : SalesforceErrorType.UNKNOWN;

                const error = new SalesforceError(
                    `JWT Authentication failed: ${response.statusText} - ${errorText}`,
                    errorType,
                    undefined,
                    {
                        statusCode: response.status,
                        statusText: response.statusText,
                        responseText: errorText,
                        loginUrl
                    },
                    response.status
                );

                this.recordFailure();
                captureError(error);
                throw error;
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
            const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
            const errorType = isNetworkError
                ? SalesforceErrorType.NETWORK
                : categorizeError(error);

            if (!(error instanceof SalesforceError)) {
                const enhancedError = new SalesforceError(
                    `Failed to generate Salesforce access token: ${error.message}`,
                    errorType,
                    error as Error,
                    {
                        connectionTimeout: this.poolConfig.connectionTimeout,
                        circuitBreakerFailures: this.circuitBreakerFailures
                    }
                );

                this.recordFailure();
                captureError(enhancedError);
                throw enhancedError;
            } else {
                this.recordFailure();
                throw error;
            }
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
            availableConnection = this.createNewConnection();
        } else if (!availableConnection) {
            // Reuse the least recently used connection
            availableConnection = this.connectionPool.reduce((oldest, current) =>
                current.lastUsed < oldest.lastUsed ? current : oldest
            );

            // Update the connection with fresh token
            this.refreshConnection(availableConnection);
        }

        // Update usage tracking
        availableConnection.lastUsed = Date.now();
        availableConnection.useCount++;

        return availableConnection;
    }

    /**
     * Create a new pooled connection
     */
    private createNewConnection(): PooledConnection {
        if (!this.tokenCache) {
            throw new Error('No valid token cache available');
        }

        const connectionId = `sf-conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const conn = new jsforce.Connection({
            loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
            instanceUrl: this.tokenCache.instanceUrl,
            accessToken: this.tokenCache.accessToken,
            refreshFn: (conn: any, callback: (err: Error | null, accessToken?: string) => void) => {
                this.generateAccessToken()
                    .then(newToken => {
                        conn.instanceUrl = newToken.instanceUrl;
                        callback(null, newToken.accessToken);
                    })
                    .catch(error => {
                        callback(error instanceof Error ? error : new Error(String(error)));
                    });
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
    private refreshConnection(pooledConnection: PooledConnection): void {
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

            this.connectionPool.forEach(conn => this.refreshConnection(conn));
        }
    }

    /**
     * Execute a raw SOQL query using pooled connections
     */
    async queryRecord(soql: string) {
        // Sanitize SOQL input to prevent injection
        if (!soql || typeof soql !== 'string') {
            const error = new SalesforceError(
                'Invalid SOQL query: must be a non-empty string',
                SalesforceErrorType.VALIDATION,
                undefined,
                {
                    providedValue: soql,
                    valueType: typeof soql
                }
            );
            captureError(error);
            throw error;
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
                const error = new SalesforceError(
                    'Invalid SOQL query: contains potentially dangerous patterns',
                    SalesforceErrorType.VALIDATION,
                    undefined,
                    {
                        soql,
                        matchedPattern: pattern.toString(),
                        securityRisk: 'SQL_INJECTION_ATTEMPT'
                    }
                );
                captureError(error);
                throw error;
            }
        }

        let pooledConnection: PooledConnection | null = null;

        try {
            await this.connect(); // Ensure pool is initialized
            pooledConnection = await this.getConnection();
            const result = await pooledConnection.conn.query(soql);

            if (!result) {
                const error = new SalesforceError(
                    'Query returned null or undefined result',
                    SalesforceErrorType.DATA_FORMAT,
                    undefined,
                    { soql }
                );
                captureError(error);
                throw error;
            }

            return result;
        } catch (error: any) {
            // If it's an authentication error, try to reconnect once
            if (
                (error?.errorCode === 'INVALID_SESSION_ID') ||
                (error?.name === 'INVALID_SESSION_ID') ||
                (error?.message?.includes('INVALID_SESSION_ID'))
            ) {
                try {
                    // Refresh the token and retry
                    await this.generateAccessToken();
                    if (pooledConnection) {
                        this.refreshConnection(pooledConnection);
                        const result = await pooledConnection.conn.query(soql);

                        if (!result) {
                            const error = new SalesforceError(
                                'Query returned null or undefined result after token refresh',
                                SalesforceErrorType.DATA_FORMAT,
                                undefined,
                                { soql, retryAttempt: true }
                            );
                            captureError(error);
                            throw error;
                        }

                        return result;
                    }
                } catch (retryError) {
                    const enhancedError = new SalesforceError(
                        `Failed to retry query after authentication error: ${retryError.message}`,
                        SalesforceErrorType.AUTHENTICATION,
                        retryError as Error,
                        {
                            originalError: error?.message,
                            soql,
                            retryAttempt: true
                        }
                    );
                    captureError(enhancedError);
                    throw enhancedError;
                }
            }

            // Don't re-wrap SalesforceError instances
            if (error instanceof SalesforceError) {
                throw error;
            }

            const errorType = categorizeError(error);
            const enhancedError = new SalesforceError(
                `SOQL query execution failed: ${error.message}`,
                errorType,
                error as Error,
                {
                    soql,
                    soqlLength: soql.length,
                    errorCode: error?.errorCode,
                    errorName: error?.name
                }
            );

            captureError(enhancedError);
            throw enhancedError;
        }
    }

    /**
     * Finds a single record using SObject methods with automatic sanitization
     */
    async findOne(objectType: string, conditions: any, fields?: string[] | string): Promise<any> {
        // Validate inputs
        if (!objectType || typeof objectType !== 'string') {
            const error = new SalesforceError(
                'Invalid object type: must be a non-empty string',
                SalesforceErrorType.VALIDATION,
                undefined,
                {
                    providedObjectType: objectType,
                    objectTypeType: typeof objectType
                }
            );
            captureError(error);
            throw error;
        }

        if (!conditions || typeof conditions !== 'object') {
            const error = new SalesforceError(
                'Invalid conditions: must be a non-empty object',
                SalesforceErrorType.VALIDATION,
                undefined,
                {
                    providedConditions: conditions,
                    conditionsType: typeof conditions,
                    objectType
                }
            );
            captureError(error);
            throw error;
        }

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
                try {
                    // Refresh the token and retry
                    await this.generateAccessToken();
                    if (pooledConnection) {
                        this.refreshConnection(pooledConnection);
                        const sobject = pooledConnection.conn.sobject(objectType);
                        const result = await sobject.findOne(conditions, fields);
                        return result;
                    }
                } catch (retryError) {
                    const enhancedError = new SalesforceError(
                        `Failed to retry findOne after authentication error: ${retryError.message}`,
                        SalesforceErrorType.AUTHENTICATION,
                        retryError as Error,
                        {
                            originalError: error?.message,
                            objectType,
                            conditions,
                            fields,
                            retryAttempt: true
                        }
                    );
                    captureError(enhancedError);
                    throw enhancedError;
                }
            }

            // Don't re-wrap SalesforceError instances
            if (error instanceof SalesforceError) {
                throw error;
            }

            const errorType = categorizeError(error);
            const enhancedError = new SalesforceError(
                `SObject findOne operation failed: ${error.message}`,
                errorType,
                error as Error,
                {
                    objectType,
                    conditions,
                    fields,
                    errorCode: error?.errorCode,
                    errorName: error?.name
                }
            );

            captureError(enhancedError);
            throw enhancedError;
        }
    }

    /**
     * Finds multiple records using SObject methods with automatic sanitization
     */
    async find(objectType: string, conditions: any, fields?: string[] | string): Promise<any[]> {
        // Validate inputs
        if (!objectType || typeof objectType !== 'string') {
            const error = new SalesforceError(
                'Invalid object type: must be a non-empty string',
                SalesforceErrorType.VALIDATION,
                undefined,
                {
                    providedObjectType: objectType,
                    objectTypeType: typeof objectType
                }
            );
            captureError(error);
            throw error;
        }

        if (!conditions || typeof conditions !== 'object') {
            const error = new SalesforceError(
                'Invalid conditions: must be a non-empty object',
                SalesforceErrorType.VALIDATION,
                undefined,
                {
                    providedConditions: conditions,
                    conditionsType: typeof conditions,
                    objectType
                }
            );
            captureError(error);
            throw error;
        }

        let pooledConnection: PooledConnection | null = null;

        try {
            await this.connect(); // Ensure pool is initialized
            pooledConnection = await this.getConnection();

            const sobject = pooledConnection.conn.sobject(objectType);
            const results = await sobject.find(conditions, fields);

            // Ensure results is an array
            if (!Array.isArray(results)) {
                const error = new SalesforceError(
                    'SObject find returned non-array result',
                    SalesforceErrorType.DATA_FORMAT,
                    undefined,
                    {
                        objectType,
                        conditions,
                        fields,
                        resultType: typeof results,
                        resultValue: results
                    }
                );
                captureError(error);
                throw error;
            }

            return results;
        } catch (error: any) {
            // Handle session expiration and retry
            if (
                (error?.errorCode === 'INVALID_SESSION_ID') ||
                (error?.name === 'INVALID_SESSION_ID') ||
                (error?.message?.includes('INVALID_SESSION_ID'))
            ) {
                try {
                    // Refresh the token and retry
                    await this.generateAccessToken();
                    if (pooledConnection) {
                        this.refreshConnection(pooledConnection);
                        const sobject = pooledConnection.conn.sobject(objectType);
                        const results = await sobject.find(conditions, fields);

                        // Validate retry result format
                        if (!Array.isArray(results)) {
                            const error = new SalesforceError(
                                'SObject find returned non-array result after retry',
                                SalesforceErrorType.DATA_FORMAT,
                                undefined,
                                {
                                    objectType,
                                    conditions,
                                    fields,
                                    resultType: typeof results,
                                    resultValue: results,
                                    retryAttempt: true
                                }
                            );
                            captureError(error);
                            throw error;
                        }

                        return results;
                    }
                } catch (retryError) {
                    const enhancedError = new SalesforceError(
                        `Failed to retry find after authentication error: ${retryError.message}`,
                        SalesforceErrorType.AUTHENTICATION,
                        retryError as Error,
                        {
                            originalError: error?.message,
                            objectType,
                            conditions,
                            fields,
                            retryAttempt: true
                        }
                    );
                    captureError(enhancedError);
                    throw enhancedError;
                }
            }

            // Don't re-wrap SalesforceError instances
            if (error instanceof SalesforceError) {
                throw error;
            }

            const errorType = categorizeError(error);
            const enhancedError = new SalesforceError(
                `SObject find operation failed: ${error.message}`,
                errorType,
                error as Error,
                {
                    objectType,
                    conditions,
                    fields,
                    errorCode: error?.errorCode,
                    errorName: error?.name
                }
            );

            captureError(enhancedError);
            throw enhancedError;
        }
    }

    /**
     * Get connection pool statistics for monitoring
     */
    getPoolStats() {
        return {
            totalConnections: this.connectionPool.length,
            activeConnections: this.connectionPool.filter(conn => conn.isActive).length,
            tokenCached: Boolean(this.tokenCache),
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