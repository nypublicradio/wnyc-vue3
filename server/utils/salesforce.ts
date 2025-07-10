import jsforce from 'jsforce';
import pkg from 'jsonwebtoken';
const { sign } = pkg;

export class SalesforceClient {
    private conn: jsforce.Connection;
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
            console.log('Token expired or not connected, reconnecting...');
            this.isConnected = false;
            await this.connect();
        }
    }

    async connect(): Promise<void> {
        if (this.isConnected && !this.isTokenExpired()) {
            console.log('Already connected with valid token');
            return;
        }

        console.log('=== SALESFORCE CONNECTION ===');
        console.log('SF_CLIENT_ID:', process.env.SF_CLIENT_ID ? 'Set' : 'Not set');
        console.log('SF_USERNAME:', process.env.SF_USERNAME ? 'Set' : 'Not set');
        console.log('SF_PRIVATE_KEY:', process.env.SF_PRIVATE_KEY ? 'Set' : 'Not set');
        console.log('Login URL:', this.conn.loginUrl);

        if (!process.env.SF_CLIENT_ID || !process.env.SF_USERNAME || !process.env.SF_PRIVATE_KEY) {
            throw new Error('Missing required environment variables: SF_CLIENT_ID, SF_USERNAME, SF_PRIVATE_KEY');
        }

        try {
            // Decode the private key if it's base64 encoded
            let privateKey = process.env.SF_PRIVATE_KEY;
            if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
                // If it doesn't contain the PEM headers, assume it's base64 encoded
                privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
                console.log('Decoded base64 private key');
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

            console.log('Creating JWT with expiration:', new Date((now + 300) * 1000).toISOString());

            // Sign the JWT with your private key
            const token = sign(jwtPayload, privateKey, { algorithm: 'RS256' });

            // Request access token using the JWT Bearer flow
            const response = await fetch(`${this.conn.loginUrl}/services/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: token
                })
            });

            console.log('Salesforce response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Salesforce auth error:', errorText);
                throw new Error(`JWT Authentication failed: ${response.statusText} - ${errorText}`);
            }

            const authResponse = await response.json();
            console.log('Salesforce auth successful');

            this.accessToken = authResponse.access_token;
            this.instanceUrl = authResponse.instance_url;

            // Set token expiration time (JWT tokens typically expire in 5 minutes)
            this.tokenExpirationTime = Date.now() + (4 * 60 * 1000); // 4 minutes to be safe

            // Update connection with received token
            this.conn.accessToken = this.accessToken;
            this.conn.instanceUrl = this.instanceUrl;

            this.isConnected = true;
            console.log('Connected to Salesforce via JWT Bearer flow');
            console.log('Token expires at:', new Date(this.tokenExpirationTime).toISOString());
        } catch (error) {
            console.error('Failed to connect to Salesforce:', error);
            this.isConnected = false;
            throw error;
        }
    }

    async queryRecord(soql: string) {
        try {
            await this.ensureConnection();
            console.log('Executing SOQL query:', soql);
            const result = await this.conn.query(soql);
            console.log('Query successful, records found:', result.records.length);
            return result;
        } catch (error) {
            console.error('Query failed:', error);

            // If it's an authentication error, try to reconnect once
            if (error.message && (error.message.includes('INVALID_SESSION') || error.message.includes('expired'))) {
                console.log('Session expired, attempting to reconnect...');
                this.isConnected = false;
                await this.ensureConnection();

                // Retry the query once after reconnection
                console.log('Retrying query after reconnection...');
                const result = await this.conn.query(soql);
                console.log('Retry successful, records found:', result.records.length);
                return result;
            }

            throw error;
        }
    }
}

// Export singleton instance
const salesforce = new SalesforceClient();
export default salesforce;