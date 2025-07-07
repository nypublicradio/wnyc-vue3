import { defineEventHandler, getQuery, createError } from 'h3';
import { SalesforceClient } from '../../utils/salesforce';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const code = query.code as string;
    const error = query.error as string;

    // Check for OAuth error
    if (error) {
        throw createError({
            statusCode: 400,
            statusMessage: 'OAuth Error',
            message: `Salesforce OAuth error: ${error}`
        });
    }

    // Check for authorization code
    if (!code) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Authorization code is required'
        });
    }

    try {
        // Create Salesforce client and exchange code for tokens
        const salesforce = new SalesforceClient();
        const result = await salesforce.authorizeWithCode(code);

        return {
            success: true,
            message: 'Successfully authorized with Salesforce!',
            refreshToken: result.refresh_token,
            accessToken: result.access_token,
            instructions: 'Save the refresh_token to your environment as SF_REFRESH_TOKEN'
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: `Failed to complete OAuth authorization: ${error.message}`
        });
    }
});
