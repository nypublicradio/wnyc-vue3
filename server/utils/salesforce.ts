import * as jsforce from '@jsforce/jsforce-node';
import * as jwt from 'jsonwebtoken';

export class SalesforceClient {
    private conn: jsforce.Connection;
    private isConnected: boolean = false;

    constructor() {
        this.conn = new jsforce.Connection({
            loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com'
        });
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;

        console.log('=== SALESFORCE JWT CONNECTION DEBUG ===');
        console.log('SF_CLIENT_ID:', process.env.SF_CLIENT_ID ? 'Set' : 'Not set');
        console.log('SF_USERNAME:', process.env.SF_USERNAME ? 'Set' : 'Not set');
        console.log('SF_PRIVATE_KEY:', process.env.SF_PRIVATE_KEY ? 'Set' : 'Not set');
        console.log('Login URL:', this.conn.loginUrl);

        if (!process.env.SF_CLIENT_ID || !process.env.SF_USERNAME || !process.env.SF_PRIVATE_KEY) {
            throw new Error('Missing required environment variables: SF_CLIENT_ID, SF_USERNAME, SF_PRIVATE_KEY');
        }

        try {
            // Create JWT payload
            const jwtPayload = {
                iss: process.env.SF_CLIENT_ID, // Connected App Consumer Key
                sub: process.env.SF_USERNAME, // The username to impersonate
                aud: this.conn.loginUrl,
                exp: Math.floor(Date.now() / 1000) + 300 // Expires in 5 minutes
            };

            console.log('Creating JWT with payload:', {
                iss: process.env.SF_CLIENT_ID.substring(0, 10) + '...',
                sub: process.env.SF_USERNAME,
                aud: this.conn.loginUrl
            });

            // Sign the JWT with your private key
            const token = jwt.sign(jwtPayload, process.env.SF_PRIVATE_KEY, { algorithm: 'RS256' });

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
                console.error('Salesforce JWT auth error:', errorText);
                throw new Error(`JWT Authentication failed: ${response.statusText} - ${errorText}`);
            }

            const authResponse = await response.json();
            console.log('Salesforce JWT auth successful');

            // Update connection with received token
            this.conn.accessToken = authResponse.access_token;
            this.conn.instanceUrl = authResponse.instance_url;

            this.isConnected = true;
            console.log('Connected to Salesforce via JWT Bearer flow');
        } catch (error) {
            console.error('Failed to connect to Salesforce:', error);
            throw error;
        }
    }

    async updateRecord(objectName: string, id: string, data: Record<string, any>): Promise<jsforce.SaveResult> {
        if (!this.isConnected) await this.connect();

        try {
            return await this.conn.sobject(objectName).update({ Id: id, ...data });
        } catch (error) {
            console.error(`Failed to update ${objectName} record:`, error);
            throw error;
        }
    }

    async queryRecord(soql: string): Promise<any> {
        if (!this.isConnected) await this.connect();

        try {
            return await this.conn.query(soql);
        } catch (error) {
            console.error('Failed to execute SOQL query:', error);
            throw error;
        }
    }
}

// Export a singleton instance
const salesforce = new SalesforceClient();
export default salesforce;