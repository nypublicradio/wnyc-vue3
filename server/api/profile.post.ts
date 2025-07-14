import salesforce from '../utils/salesforce';
import { createError, defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
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
        const soql = `SELECT Id, cfg_Active_Sustainer__c, npo02__LastCloseDate__c, npo02__LastOppAmount__c FROM Contact WHERE Id = '${salesforceID}'`;
        result = await salesforce.queryRecord(soql);
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