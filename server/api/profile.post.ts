import salesforce from '../utils/salesforce';
import { createError, defineEventHandler, readBody } from 'h3';
import { requireAuth } from '../utils/jwt';
import { rateLimit } from '../utils/rateLimiter';

// Response type definitions
interface RecurringDonation {
    springboardId: string | null;
    brand: string | null;
    amount: number | null;
    nextChargeDate: string | null;
    membershipStartDate: string | null;
}

interface ProfileResponse {
    name: string | null;
    lastDonationDate: string | null;
    lastDonationAmount: number | null;
    isActiveSustainer: boolean;
    activeRecurringDonations: RecurringDonation[];
}

/**
 * Validates the input parameters for the profile request
 */
const validateProfileRequest = (body: any): string => {
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

    return salesforceID;
};

/**
 * Retrieves contact data from Salesforce
 */
const getContactData = async (escapedSalesforceID: string): Promise<any> => {
    try {
        const contactQuery = `SELECT Id, FirstName, LastName, npo02__LastCloseDate__c, npo02__LastOppAmount__c FROM Contact WHERE Id = '${escapedSalesforceID}'`;
        const contactResult = await salesforce.queryRecord(contactQuery);

        if (!contactResult?.records?.length) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found',
                message: 'Profile not found'
            });
        }

        return contactResult.records[0];
    } catch (error) {
        if (error.statusCode) throw error; // Re-throw if it's already a formatted error
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: error.message || 'Failed to query Salesforce Contact'
        });
    }
};

/**
 * Retrieves active recurring donations from Salesforce
 */
const getActiveRecurringDonations = async (escapedSalesforceID: string): Promise<any[]> => {
    try {
        const recurringDonationsQuery = `SELECT Id, Master_Donation_ID__c, nypr_GAU_Property_Name_Current__c, npe03__Amount__c, npe03__Next_Payment_Date__c, npe03__Date_Established__c, cfg_Digital_Membership_Program_Name__c FROM npe03__Recurring_Donation__c WHERE npe03__Contact__c = '${escapedSalesforceID}' AND npsp__Status__c = 'Active' AND cfg_Digital_Membership_Program_Name__c != 'The Lab'`;
        const recurringDonationsResult = await salesforce.queryRecord(recurringDonationsQuery);

        return recurringDonationsResult?.records || [];
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: error.message || 'Failed to query recurring donations'
        });
    }
};

/**
 * Formats recurring donations data for the API response
 */
const formatRecurringDonations = (donations: any[]): RecurringDonation[] => {
    return donations.map(donation => ({
        springboardId: donation.Master_Donation_ID__c,
        brand: donation.nypr_GAU_Property_Name_Current__c,
        amount: donation.npe03__Amount__c,
        nextChargeDate: donation.npe03__Next_Payment_Date__c,
        membershipStartDate: donation.npe03__Date_Established__c
    }));
};

/**
 * Combines first and last name into a single name field
 */
const combineName = (contact: any): string | null => {
    const combinedName = [contact.FirstName, contact.LastName]
        .filter(name => name && name.trim()) // Remove null/empty values
        .join(' ')
        .trim();

    return combinedName || null;
};

/**
 * Builds the complete profile response
 */
const buildProfileResponse = (
    contact: any,
    activeRecurringDonations: any[]
): ProfileResponse => {
    const formattedRecurringDonations = formatRecurringDonations(activeRecurringDonations);
    const isActiveSustainer = activeRecurringDonations.length > 0;
    const name = combineName(contact);

    return {
        name,
        lastDonationDate: contact.npo02__LastCloseDate__c,
        lastDonationAmount: contact.npo02__LastOppAmount__c,
        isActiveSustainer,
        activeRecurringDonations: formattedRecurringDonations
    };
};

// Rate limiting: 10 requests per minute per IP
const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
});

/**
 * Profile API Endpoint
 * 
 * Retrieves comprehensive user profile data from Salesforce including:
 * - Combined name (FirstName + LastName)
 * - Last donation date and amount
 * - Active sustainer status (computed from active recurring donations)
 * - List of active recurring donations (excluding Radiolab's 'The Lab' program)
 * 
 * Note: Filters out Radiolab donations where cfg_Digital_Membership_Program_Name__c = 'The Lab'
 * as they use Supporting Cast instead of Springboard.
 */
export default defineEventHandler(async (event): Promise<ProfileResponse> => {
    // Apply rate limiting
    rateLimiter(event);

    // Verify JWT authentication
    const authPayload = requireAuth(event);

    // Validate input parameter
    const body = await readBody(event);
    const salesforceID = validateProfileRequest(body);

    // Connect to Salesforce
    try {
        await salesforce.connect();
    } catch (error) {
        throw createError({
            statusCode: 503,
            statusMessage: 'Service Unavailable',
            message: error.message || 'Failed to connect to Salesforce'
        });
    }

    // Safely escape the salesforceID since it's already validated
    const escapedSalesforceID = salesforceID.replace(/'/g, "\\'");

    // Get contact data and recurring donations in parallel for better performance
    const [contact, activeRecurringDonations] = await Promise.all([
        getContactData(escapedSalesforceID),
        getActiveRecurringDonations(escapedSalesforceID)
    ]);

    // Return comprehensive profile response
    return buildProfileResponse(contact, activeRecurringDonations);
});