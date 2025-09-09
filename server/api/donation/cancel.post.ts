import axios from 'axios';
import { createError, defineEventHandler, getQuery } from 'h3';
import { requireAuth } from '../../utils/jwt';
import { rateLimit } from '../../utils/rateLimiter';

// Runtime config for environment variables
const config = useRuntimeConfig();

// Response type definition
interface DonationCancelResponse {
    status: string;
    donation_id: string;
    cancel_date: string;
    reason: string;
}

/**
 * Validates the input parameters for the donation cancellation request
 */
const validateCancelRequest = (query: any): { did: number; reason: string } => {
    const did = query?.did;
    const reason = query?.reason;

    // Validate donation ID
    if (!did) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Donation ID (did) is required'
        });
    }

    const donationId = Number(did);
    if (isNaN(donationId) || donationId <= 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Donation ID must be a valid positive number'
        });
    }

    // Validate reason
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Cancellation reason is required'
        });
    }

    return {
        did: donationId,
        reason: reason.trim()
    };
};

/**
 * Makes the cancellation request to Springboard API
 */
const cancelDonationWithSpringboard = async (donationId: number, reason: string): Promise<DonationCancelResponse> => {
    try {
        const springboardUrl = config.SPRINGBOARD_URL;
        const springboardKey = config.SPRINGBOARD_KEY;

        if (!springboardUrl || !springboardKey) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Internal Server Error',
                message: 'Springboard configuration is missing'
            });
        }

        const apiUrl = `${springboardUrl}/springboard-api/springboard-donation/cancel`;

        // Prepare the request payload
        const requestBody = {
            did: donationId,
            reason
        };

        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${springboardKey}`,
                'Accept': 'application/json'
            }
        });

        const responseData = response.data;

        // Validate response structure
        if (!responseData.status || !responseData.donation_id || !responseData.cancel_date || !responseData.reason) {
            throw createError({
                statusCode: 502,
                statusMessage: 'Bad Gateway',
                message: 'Invalid response format from Springboard API'
            });
        }

        return {
            status: responseData.status,
            donation_id: responseData.donation_id,
            cancel_date: responseData.cancel_date,
            reason: responseData.reason
        };

    } catch (error: any) {
        // Re-throw if it's already a formatted error
        if (error.statusCode) throw error;

        // Handle axios errors
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            throw createError({
                statusCode: error.response.status,
                statusMessage: error.response.statusText || 'API Error',
                message: `Springboard API error: ${error.response.data || 'Unknown error'}`
            });
        } else if (error.request) {
            // The request was made but no response was received
            throw createError({
                statusCode: 503,
                statusMessage: 'Service Unavailable',
                message: 'No response received from Springboard API'
            });
        } else {
            // Something happened in setting up the request
            throw createError({
                statusCode: 503,
                statusMessage: 'Service Unavailable',
                message: `Failed to connect to Springboard API: ${error.message || 'Unknown error'}`
            });
        }
    }
};

// Rate limiting: 5 requests per minute per IP for cancellation operations
const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
});

/**
 * Donation Cancellation API Endpoint
 * 
 * Cancels a recurring donation through the Springboard API.
 * 
 * Required URL Parameters:
 * - did: Donation ID (number)
 * - reason: Cancellation reason (string)
 * 
 * Authentication: Requires valid JWT token in Authorization header
 * 
 * Returns:
 * - status: Cancellation status
 * - donation_id: ID of the cancelled donation
 * - cancel_date: Date when the donation was cancelled
 * - reason: Reason for cancellation
 */
export default defineEventHandler(async (event): Promise<DonationCancelResponse> => {
    // Apply rate limiting
    rateLimiter(event);

    // Verify JWT authentication
    requireAuth(event);

    // Get URL parameters
    const query = getQuery(event);

    // Validate input parameters
    const { did, reason } = validateCancelRequest(query);

    // Make the cancellation request to Springboard
    const cancellationResult = await cancelDonationWithSpringboard(did, reason);

    return cancellationResult;
});
