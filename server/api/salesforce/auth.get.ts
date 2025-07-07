import { defineEventHandler } from 'h3';
import { SalesforceClient } from '../../utils/salesforce';

export default defineEventHandler(async (event) => {
    try {
        const salesforce = new SalesforceClient();
        const authUrl = salesforce.getAuthUrl();

        return {
            authUrl,
            message: 'Visit the authUrl to authorize with Salesforce, then you\'ll be redirected to the callback to get your refresh token'
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to generate authorization URL',
            message: error.message
        });
    }
});
