import salesforce from '~/server/utils/salesforce';

export default defineEventHandler(async (event) => {
    try {
        console.log('=== SALESFORCE TEST ENDPOINT ===');
        console.log('Testing Salesforce connection...');

        // Test the connection
        await salesforce.connect();

        // Try a simple SOQL query to verify the connection works
        const result = await salesforce.queryRecord('SELECT Id, Name FROM Organization LIMIT 1');

        return {
            success: true,
            message: 'Salesforce connection successful',
            organization: result.records[0] || null,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Salesforce test failed:', error);

        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
            environmentVariables: {
                SF_CLIENT_ID: !!process.env.SF_CLIENT_ID,
                SF_USERNAME: !!process.env.SF_USERNAME,
                SF_PRIVATE_KEY: !!process.env.SF_PRIVATE_KEY,
                SF_LOGIN_URL: process.env.SF_LOGIN_URL || 'not set'
            }
        };
    }
});
