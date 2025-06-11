import * as jsforce from '@jsforce/jsforce-node';

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
            // Use OAuth Client Credentials flow with Consumer ID and Secret
            const response = await fetch(`${this.conn.loginUrl}/services/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: process.env.SF_CLIENT_ID as string,
                    client_secret: process.env.SF_CLIENT_SECRET as string
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Authentication failed: ${response.statusText} - ${errorText}`);
            }

            const authResponse = await response.json();
            this.accessToken = authResponse.access_token;
            this.instanceUrl = authResponse.instance_url;

            // Update connection with received token
            this.conn.accessToken = this.accessToken;
            this.conn.instanceUrl = this.instanceUrl;
            
            this.isConnected = true;
            console.log('Connected to Salesforce via Client Credentials');
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