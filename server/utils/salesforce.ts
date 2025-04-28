import * as jsforce from '@jsforce/jsforce-node';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';

export class SalesforceClient {
    private conn: jsforce.Connection;
    private isConnected: boolean = false;
    private accessToken: string | null = null;
    private instanceUrl: string | null = null;

    constructor() {
        this.conn = new jsforce.Connection({
            loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com'
        });
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;

        try {
            // Read private key from file - should be securely stored
            const privateKey = process.env.SF_PRIVATE_KEY ||
                fs.readFileSync(process.env.SF_PRIVATE_KEY_PATH || '', 'utf8');

            // Create JWT payload
            const jwtPayload = {
                iss: process.env.SF_CLIENT_ID, // Connected App Consumer Key
                sub: process.env.SF_USERNAME, // The username to impersonate
                aud: this.conn.loginUrl,
                exp: Math.floor(Date.now() / 1000) + 300 // Expires in 5 minutes
            };

            // Sign the JWT with your private key
            const token = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256' });

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

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.statusText}`);
            }

            const authResponse = await response.json();
            this.accessToken = authResponse.access_token;
            this.instanceUrl = authResponse.instance_url;

            // Update connection with received token
            this.conn.accessToken = this.accessToken;
            this.conn.instanceUrl = this.instanceUrl;

            this.isConnected = true;
            console.log('Connected to Salesforce via Connected App');
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