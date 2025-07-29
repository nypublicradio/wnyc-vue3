import salesforce from '../utils/salesforce';
import { createError, defineEventHandler, readBody } from 'h3';
import { requireAuth } from '../utils/jwt';
import { rateLimit } from '../utils/rateLimiter';

// Rate limiting: 10 requests per minute per IP
const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
});

export default defineEventHandler(async (event) => {
    // Apply rate limiting
    rateLimiter(event);
    // Verify JWT authentication
    const authPayload = requireAuth(event);
    // Validate input parameter
    const body = await readBody(event);
    const salesforceID = body?.salesforceID as string;
    if (!salesforceID || salesforceID.trim() === '') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Profile ID is required'
        });
    }

    // Validate Salesforce ID format (15 or 18 character alphanumeric)
    const salesforceIdPattern = /^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$/;
    if (!salesforceIdPattern.test(salesforceID)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Invalid Salesforce ID format'
        });
    }

    try {
        await salesforce.connect();
    } catch (error) {
        throw createError({
            statusCode: 503,
            statusMessage: 'Service Unavailable',
            message: error.message || 'Failed to connect to Salesforce'
        });
    }

    // Execute query with error handling
    let result;
    try {
        // Safely escape the salesforceID since it's already validated
        const escapedSalesforceID = salesforceID.replace(/'/g, "\\'");
        const soqlQuery = `SELECT Id, cfg_Active_Sustainer__c, npo02__LastCloseDate__c, npo02__LastOppAmount__c FROM Contact WHERE Id = '${escapedSalesforceID}'`;
        result = await salesforce.queryRecord(soqlQuery);
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: error.message || 'Failed to query Salesforce'
        });
    }

    // Process results with proper error for not found
    if (!result?.records?.length) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            message: 'Profile not found'
        });
    }

    // Return normalized response
    const record = result.records[0];
    return {
        activeSustainer: record.cfg_Active_Sustainer__c,
        lastCloseDate: record.npo02__LastCloseDate__c,
        lastOppAmount: record.npo02__LastOppAmount__c,
    };
});