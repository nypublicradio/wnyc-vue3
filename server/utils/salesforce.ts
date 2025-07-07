import * as jsforce from '@jsforce/jsforce-node';

export class SalesforceClient {
    private conn: jsforce.Connection;
    private isConnected: boolean = false;

    constructor() {
        this.conn = new jsforce.Connection({
            oauth2: {
                loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
                clientId: process.env.SF_CLIENT_ID as string,
                clientSecret: process.env.SF_CLIENT_SECRET as string,
                redirectUri: process.env.SF_REDIRECT_URI || 'http://localhost:3000/api/salesforce/callback'
            }
        });
    }

    // Get authorization URL for initial setup
    getAuthUrl(): string {
        return this.conn.oauth2.getAuthorizationUrl({
            scope: 'api refresh_token'
        });
    }

    // Exchange authorization code for tokens (one-time setup)
    async authorizeWithCode(code: string): Promise<any> {
        try {
            const result = await this.conn.oauth2.requestToken(code);
            this.isConnected = true;
            console.log('Successfully authorized with Salesforce');
            console.log('Refresh token:', this.conn.refreshToken);
            return result;
        } catch (error) {
            console.error('Failed to authorize with Salesforce:', error);
            throw error;
        }
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;

        console.log('=== SALESFORCE CONNECTION DEBUG ===');
        console.log('SF_CLIENT_ID:', process.env.SF_CLIENT_ID ? 'Set' : 'Not set');
        console.log('SF_CLIENT_SECRET:', process.env.SF_CLIENT_SECRET ? 'Set' : 'Not set');
        console.log('SF_REFRESH_TOKEN:', process.env.SF_REFRESH_TOKEN ? 'Set' : 'Not set');
        console.log('Login URL:', this.conn.oauth2?.loginUrl);

        // Try to use stored refresh token
        const storedRefreshToken = process.env.SF_REFRESH_TOKEN;

        if (!storedRefreshToken) {
            const authUrl = this.getAuthUrl();
            throw new Error(`No refresh token available. Please authorize first by visiting: ${authUrl}`);
        }

        try {
            // Use refresh token to get new access token
            const tokenResponse = await this.conn.oauth2.refreshToken(storedRefreshToken);

            this.isConnected = true;
            console.log('Successfully connected to Salesforce using refresh token');

        } catch (error) {
            console.error('Failed to connect to Salesforce:', error);
            const authUrl = this.getAuthUrl();
            throw new Error(`Refresh token failed. Please re-authorize by visiting: ${authUrl}`);
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