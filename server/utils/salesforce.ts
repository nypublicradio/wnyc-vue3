import jsforce from 'jsforce';
import jwt from 'jsonwebtoken';

export class SalesforceClient {
    private conn: any; // jsforce.Connection type not available, use any
    private accessToken: string | null = null;
    private instanceUrl: string | null = null;
    private isConnected: boolean = false;
    private tokenExpirationTime: number = 0;

    constructor() {
        this.conn = new jsforce.Connection({
            loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com'
        });
    }

    private isTokenExpired(): boolean {
        // Check if token expires in the next 30 seconds (buffer time)
        return Date.now() >= (this.tokenExpirationTime - 30000);
    }

    private async ensureConnection(): Promise<void> {
        if (!this.isConnected || this.isTokenExpired()) {
            //console.log('Token expired or not connected, reconnecting...');
            this.isConnected = false;
            await this.connect();
        }
    }

    async connect(): Promise<void> {
        if (this.isConnected && !this.isTokenExpired()) {
            //console.log('Already connected with valid token');
            return;
        }

        //console.log('=== SALESFORCE CONNECTION ===');
        //console.log('SF_CLIENT_ID:', process.env.SF_CLIENT_ID ? 'Set' : 'Not set');
        //console.log('SF_USERNAME:', process.env.SF_USERNAME ? 'Set' : 'Not set');
        //console.log('SF_PRIVATE_KEY:', process.env.SF_PRIVATE_KEY ? 'Set' : 'Not set');
        //console.log('Login URL:', this.conn.loginUrl);

        if (!process.env.SF_CLIENT_ID || !process.env.SF_USERNAME || !process.env.SF_PRIVATE_KEY) {
            throw new Error('Missing required environment variables: SF_CLIENT_ID, SF_USERNAME, SF_PRIVATE_KEY');
        }

        try {
            // Decode and validate the private key
            let privateKey = process.env.SF_PRIVATE_KEY;
            if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
                // If it doesn't contain the PEM headers, assume it's base64 encoded
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
            if (keyContent.length < 1000) { // Rough check for minimum key size
                throw new Error('Private key appears to be too short. Minimum RSA-2048 required.');
            }

            // Create JWT payload with current timestamp
            const now = Math.floor(Date.now() / 1000);
            const jwtPayload = {
                iss: process.env.SF_CLIENT_ID, // Connected App Consumer Key
                sub: process.env.SF_USERNAME, // The username to impersonate
                aud: this.conn.loginUrl,
                exp: now + 300, // Expires in 5 minutes
                iat: now // Issued at current time
            };

            //console.log('Creating JWT with expiration:', new Date((now + 300) * 1000).toISOString());

            // Sign the JWT with your private key
            const token = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256' });

            // Request access token using the JWT Bearer flow
            const response = await fetch(`${this.conn.loginUrl}/services/oauth2/token`, {
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
                // Add timeout and security options
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            //console.log('Salesforce response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Salesforce auth error:', errorText);
                throw new Error(`JWT Authentication failed: ${response.statusText} - ${errorText}`);
            }

            const authResponse = await response.json();
            //console.log('Salesforce auth successful');

            this.accessToken = authResponse.access_token;
            this.instanceUrl = authResponse.instance_url;

            // Set token expiration time (JWT tokens typically expire in 5 minutes)
            this.tokenExpirationTime = Date.now() + (4 * 60 * 1000); // 4 minutes to be safe

            // Update connection with received token
            this.conn.accessToken = this.accessToken;
            this.conn.instanceUrl = this.instanceUrl;

            this.isConnected = true;
            //console.log('Connected to Salesforce via JWT Bearer flow');
            //console.log('Token expires at:', new Date(this.tokenExpirationTime).toISOString());
        } catch (error) {
            console.error('Failed to connect to Salesforce:', error.message);
            this.isConnected = false;
            // Clear sensitive data on error
            this.accessToken = null;
            this.instanceUrl = null;
            this.tokenExpirationTime = 0;
            throw error;
        }
    }

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

        try {
            await this.ensureConnection();
            const result = await this.conn.query(soql);
            return result;
        } catch (error: any) {
            // If it's an authentication error, try to reconnect once
            if (
                (error?.errorCode === 'INVALID_SESSION_ID') ||
                (error?.name === 'INVALID_SESSION_ID') ||
                (error?.message?.includes('INVALID_SESSION_ID'))
            ) {
                // Session expired, attempting to reconnect...
                this.isConnected = false;
                await this.ensureConnection();

                // Retry the query once after reconnection
                const result = await this.conn.query(soql);
                //console.log('Retry successful, records found:', result.records.length);
                return result;
            }

            throw error;
        }
    }
}

// Export singleton instance
const salesforce = new SalesforceClient();
export default salesforce;