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
 * Retrieves contact or account data from Salesforce using SObject methods
 * First tries Contact, then falls back to Account if not found
 */
const getContactData = async (salesforceID: string): Promise<any> => {
    try {
        // First try to find as a Contact
        let record = await salesforce.findOne(
            'Contact',
            { Id: salesforceID },
            ['Id', 'FirstName', 'LastName', 'npo02__LastCloseDate__c', 'npo02__LastOppAmount__c']
        );

        // If not found as Contact, try as Account
        if (!record) {
            record = await salesforce.findOne(
                'Account',
                { Id: salesforceID },
                ['Id', 'Name', 'npo02__LastCloseDate__c', 'npo02__LastOppAmount__c']
            );

            // If found as Account, normalize the structure to match Contact format
            if (record) {
                record.FirstName = null;
                record.LastName = record.Name; // Use Account Name as LastName
                record.isAccount = true; // Flag to indicate this is an Account record
            }
        } else {
            record.isAccount = false; // Flag to indicate this is a Contact record
        }

        if (!record) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found',
                message: 'Profile not found'
            });
        }

        return record;
    } catch (error: any) {
        if (error.statusCode) throw error; // Re-throw if it's already a formatted error

        // Enhanced error handling with categorization
        const statusCode = error.name === 'SalesforceError' && error.type === 'authentication' ? 401 :
            error.name === 'SalesforceError' && error.type === 'network' ? 503 :
                error.name === 'SalesforceError' && error.type === 'validation' ? 400 : 500;

        throw createError({
            statusCode,
            statusMessage: statusCode === 401 ? 'Unauthorized' :
                statusCode === 503 ? 'Service Unavailable' :
                    statusCode === 400 ? 'Bad Request' : 'Internal Server Error',
            message: error.message || 'Failed to query Salesforce Contact or Account'
        });
    }
};

/**
 * Retrieves active recurring donations from Salesforce using SObject methods
 * Handles both Contact and Account lookups
 */
const getActiveRecurringDonations = async (salesforceID: string, isAccount: boolean = false): Promise<any[]> => {
    try {
        let recurringDonations;

        if (isAccount) {
            // For Accounts, look for donations where the Account matches
            // This might need to be adjusted based on your Salesforce schema
            recurringDonations = await salesforce.find(
                'npe03__Recurring_Donation__c',
                {
                    'npe03__Organization__c': salesforceID, // Account relationship field
                    'npsp__Status__c': 'Active',
                    'cfg_Digital_Membership_Program_Name__c': { $ne: 'The Lab' }
                },
                [
                    'Id',
                    'Master_Donation_ID__c',
                    'nypr_GAU_Property_Name_Current__c',
                    'npe03__Amount__c',
                    'npe03__Next_Payment_Date__c',
                    'npe03__Date_Established__c',
                    'cfg_Digital_Membership_Program_Name__c'
                ]
            );
        } else {
            // For Contacts, use the original Contact relationship
            recurringDonations = await salesforce.find(
                'npe03__Recurring_Donation__c',
                {
                    'npe03__Contact__c': salesforceID,
                    'npsp__Status__c': 'Active',
                    'cfg_Digital_Membership_Program_Name__c': { $ne: 'The Lab' }
                },
                [
                    'Id',
                    'Master_Donation_ID__c',
                    'nypr_GAU_Property_Name_Current__c',
                    'npe03__Amount__c',
                    'npe03__Next_Payment_Date__c',
                    'npe03__Date_Established__c',
                    'cfg_Digital_Membership_Program_Name__c'
                ]
            );
        }

        return recurringDonations || [];
    } catch (error: any) {
        // Enhanced error handling with categorization
        const statusCode = error.name === 'SalesforceError' && error.type === 'authentication' ? 401 :
            error.name === 'SalesforceError' && error.type === 'network' ? 503 :
                error.name === 'SalesforceError' && error.type === 'validation' ? 400 : 500;

        throw createError({
            statusCode,
            statusMessage: statusCode === 401 ? 'Unauthorized' :
                statusCode === 503 ? 'Service Unavailable' :
                    statusCode === 400 ? 'Bad Request' : 'Internal Server Error',
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
    } catch (error: any) {
        // Enhanced error handling with categorization for connection errors
        const statusCode = error.name === 'SalesforceError' && error.type === 'authentication' ? 401 :
            error.name === 'SalesforceError' && error.type === 'network' ? 503 :
                error.name === 'SalesforceError' && error.type === 'circuit_breaker' ? 503 : 503;

        throw createError({
            statusCode,
            statusMessage: statusCode === 401 ? 'Unauthorized' : 'Service Unavailable',
            message: error.message || 'Failed to connect to Salesforce'
        });
    }

    // Get contact data and recurring donations in parallel for better performance
    // No need to escape salesforceID since SObject methods handle sanitization automatically
    const contact = await getContactData(salesforceID);
    const activeRecurringDonations = await getActiveRecurringDonations(salesforceID, contact.isAccount);

    // Return comprehensive profile response
    return buildProfileResponse(contact, activeRecurringDonations);
});