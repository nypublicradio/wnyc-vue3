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

        console.log('=== SALESFORCE CONNECTION DEBUG ===');
        console.log('SF_CLIENT_ID:', process.env.SF_CLIENT_ID ? 'Set' : 'Not set');
        console.log('SF_CLIENT_SECRET:', process.env.SF_CLIENT_SECRET ? 'Set' : 'Not set');
        console.log('SF_USERNAME:', process.env.SF_USERNAME ? 'Set' : 'Not set');
        console.log('SF_PASSWORD:', process.env.SF_PASSWORD ? 'Set' : 'Not set');
        console.log('SF_SECURITY_TOKEN:', process.env.SF_SECURITY_TOKEN ? 'Set' : 'Not set');
        console.log('Login URL:', this.conn.loginUrl);

        try {
            // Use OAuth Username-Password flow
            const response = await fetch(`${this.conn.loginUrl}/services/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'password',
                    client_id: process.env.SF_CLIENT_ID as string,
                    client_secret: process.env.SF_CLIENT_SECRET as string,
                    username: process.env.SF_USERNAME as string,
                    password: (process.env.SF_PASSWORD as string) + (process.env.SF_SECURITY_TOKEN || '')
                })
            });

            console.log('Salesforce response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Salesforce auth error:', errorText);
                throw new Error(`Authentication failed: ${response.statusText} - ${errorText}`);
            }

            const authResponse = await response.json();
            console.log('Salesforce auth successful');
            
            this.accessToken = authResponse.access_token;
            this.instanceUrl = authResponse.instance_url;

            // Update connection with received token
            this.conn.accessToken = this.accessToken;
            this.conn.instanceUrl = this.instanceUrl;
            
            this.isConnected = true;
            console.log('Connected to Salesforce via Username-Password flow');
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