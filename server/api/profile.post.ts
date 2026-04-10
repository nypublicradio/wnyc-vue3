import salesforce from '../utils/salesforce';
import { createError, defineEventHandler, readBody } from 'h3';
import { requireAuth } from '../utils/jwt';
import { rateLimit } from '../utils/rateLimiter';
import { supabaseClient } from '~/server/utils/supabaseClient';
import { NyprDb } from '~/server/utils/nyprdb';

const supabase = supabaseClient();
const nyprDb = new NyprDb(supabase);

// Response type definitions
interface RecurringDonation {
    springboardId: string | null;
    brand: string | null;
    amount: number | null;
    nextChargeDate: string | null;
    membershipStartDate: string | null;
    status?: string | null;
}

interface ProfileResponse {
    name: string | null;
    lastDonationDate: string | null;
    lastDonationAmount: number | null;
    isActiveSustainer: boolean;
    activeRecurringDonations: RecurringDonation[];
    queryStringEncrypted: string | null;
    oneTimeDonationAmount: number | null;
    oneTimeDonationDate: string | null;
}

/**
 * Validates the input parameters for the profile request
 * Supports lookup by either Salesforce ID or email
 */
const validateProfileRequest = (body: any): { salesforceID?: string; email?: string } => {
    const salesforceID = body?.salesforceID as string;
    const email = body?.email as string;

    // At least one identifier is required
    if ((!salesforceID || salesforceID.trim() === '') && (!email || email.trim() === '')) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Either Salesforce ID or email is required'
        });
    }

    const result: { salesforceID?: string; email?: string } = {};

    // Validate Salesforce ID format if provided
    if (salesforceID && salesforceID.trim() !== '') {
        const salesforceIdPattern = /^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$/;
        if (!salesforceIdPattern.test(salesforceID)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                message: 'Invalid Salesforce ID format'
            });
        }
        result.salesforceID = salesforceID;
    }

    // Validate email format if provided
    if (email && email.trim() !== '') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                message: 'Invalid email format'
            });
        }
        result.email = email;
    }

    return result;
};

/**
 * Retrieves contact data from Salesforce using SObject methods
 * Supports lookup by either Salesforce ID or email
 */
const getContactData = async (lookupParams: { salesforceID?: string; email?: string }): Promise<any> => {
    try {
        let contact;

        if (lookupParams.salesforceID) {
            // Lookup by Salesforce ID
            contact = await salesforce.findOne(
                'Contact',
                { Id: lookupParams.salesforceID },
                ['Id', 'FirstName', 'LastName', 'npo02__LastCloseDate__c', 'npo02__LastOppAmount__c', 'Last_OneTime_Gift_Amount__c', 'Last_OneTime_Gift_Date__c', 'Query_String_Encrypted__c']
            );
        } else if (lookupParams.email) {
            // Lookup by email
            contact = await salesforce.findOne(
                'Contact',
                { Email: lookupParams.email },
                ['Id', 'FirstName', 'LastName', 'npo02__LastCloseDate__c', 'npo02__LastOppAmount__c', 'Last_OneTime_Gift_Amount__c', 'Last_OneTime_Gift_Date__c', 'Query_String_Encrypted__c']
            );
        }

        if (!contact) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Not Found',
                message: 'Profile not found'
            });
        }

        return contact;
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
            message: error.message || 'Failed to query Salesforce Contact'
        });
    }
};


/**
 * Retrieves active recurring donations from Salesforce using SObject methods
 */
const getActiveRecurringDonations = async (contact: any): Promise<any[]> => {
    try {
        const recurringDonations = await salesforce.find(
            'npe03__Recurring_Donation__c',
            {
                'npe03__Contact__c': contact.Id, // Use the contact ID from the retrieved contact
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

        const transactions = await nyprDb.getTransactionsBySalesforceId(contact.Id);

        // Create maps of springboard_id to status and amount for quick lookup
        const statusMap = new Map<number, string>();
        const amountMap = new Map<number, number>();
        if (transactions && transactions.length > 0) {
            transactions.forEach(transaction => {
                if (transaction.springboard_id) {
                    statusMap.set(transaction.springboard_id, transaction.status || 'Completed');
                    // If type is donation_update and new_amount exists, store it
                    if (transaction.type === 'donation_update' && transaction.new_amount != null) {
                        amountMap.set(transaction.springboard_id, transaction.new_amount);
                    }
                }
            });
        }

        // Attach status and updated amount to each recurring donation
        const donationsWithStatus = (recurringDonations || []).map(donation => {
            const springboardId = Number(donation.Master_Donation_ID__c);
            const updatedAmount = donation.Master_Donation_ID__c ? amountMap.get(springboardId) : undefined;

            return {
                ...donation,
                // Use updated amount if available, otherwise use original amount
                npe03__Amount__c: updatedAmount !== undefined ? updatedAmount : donation.npe03__Amount__c,
                status: donation.Master_Donation_ID__c
                    ? statusMap.get(springboardId) || 'Completed'
                    : 'Complete'
            };
        });

        return donationsWithStatus;
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
        membershipStartDate: donation.npe03__Date_Established__c,
        status: donation.status
    }));
};

/**
 * Combines first and last name into a single name field
 */
const combineName = (contact: any): string | null => {
    const combinedName = [contact.FirstName, contact.LastName]
        .filter(name => name?.trim()) // Remove null/empty values
        .join(' ')
        .trim();

    return combinedName || null;
};

/**
 * Builds the complete profile response
 */
const buildProfileResponse = (
    contact: any,
    activeRecurringDonations: any[],
): ProfileResponse => {
    const formattedRecurringDonations = formatRecurringDonations(activeRecurringDonations);
    const isActiveSustainer = activeRecurringDonations.length > 0;
    const name = combineName(contact);

    return {
        name,
        lastDonationDate: contact.npo02__LastCloseDate__c,
        lastDonationAmount: contact.npo02__LastOppAmount__c,
        isActiveSustainer,
        oneTimeDonationAmount: contact.Last_OneTime_Gift_Amount__c,
        oneTimeDonationDate: contact.Last_OneTime_Gift_Date__c,
        activeRecurringDonations: formattedRecurringDonations,
        queryStringEncrypted: contact.Query_String_Encrypted__c,
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
    requireAuth(event);

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

    // Get contact data first, then use it to fetch recurring donations and giving summary
    // No need to escape salesforceID since SObject methods handle sanitization automatically
    const contact = await getContactData(salesforceID);
    const activeRecurringDonations = await getActiveRecurringDonations(contact);

    // Return comprehensive profile response
    return buildProfileResponse(contact, activeRecurringDonations);
});