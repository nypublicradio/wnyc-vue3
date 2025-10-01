import axios from 'axios';
import { createError, defineEventHandler, readBody } from 'h3';
import { requireAuth } from '../../utils/jwt';
import { rateLimit } from '../../utils/rateLimiter';

const config = useRuntimeConfig();
// Response type definition
interface DonationUpdateResponse {
    status: string;
    donation_id: string;
    old_amount: number;
    new_amount: number;
}

/**
 * Creates a standardized validation error
 */
const createValidationError = (message: string) => createError({
    statusCode: 400,
    statusMessage: 'Bad Request',
    message
});

/**
 * Creates a standardized server error
 */
const createServerError = (message: string, statusCode = 500, statusMessage = 'Internal Server Error') => createError({
    statusCode,
    statusMessage,
    message
});

/**
 * Validates the input parameters for the donation update request
 */
const validateUpdateRequest = (body: any): { did: number; amount: number } => {
    const { did, new_amount: newAmount } = body || {};

    // Validate and convert donation ID
    if (!did) throw createValidationError('Donation ID (did) is required');
    const donationId = Number(did);
    if (isNaN(donationId) || donationId <= 0) {
        throw createValidationError('Donation ID must be a valid positive number');
    }

    // Validate and convert new amount
    if (newAmount == null) throw createValidationError('New amount (new_amount) is required');
    const amount = Number(newAmount);
    if (isNaN(amount) || amount <= 0) {
        throw createValidationError('New amount must be a valid positive number');
    }

    return { did: donationId, amount };
};

/**
 * Makes the update request to Springboard API
 */
const updateDonationWithSpringboard = async (donationId: number, newAmount: number): Promise<DonationUpdateResponse> => {
    const springboardUrl = config.public.SPRINGBOARD_URL;
    const springboardKey = process.env.SPRINGBOARD_KEY;

    if (!springboardUrl || !springboardKey) {
        throw createServerError('Springboard configuration is missing');
    }

    try {
        const apiUrl = `${springboardUrl}/springboard-api/springboard-donation/update-amount`;
        const response = await axios.post(apiUrl, {
            headers: {
                'api-key': springboardKey,
                'Accept': 'application/json'
            },
            params: {
                did: donationId,
                amount: newAmount
            }
        });

        return response.data as DonationUpdateResponse;
    } catch (error: any) {
        console.log('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        const statusCode = error.response?.status || 500;
        const statusMessage = error.response?.statusText || 'Internal Server Error';
        const message = error.response?.data?.message ||
            (error.response ? 'Error from Springboard API' : 'Failed to communicate with Springboard API');

        throw createServerError(message, statusCode, statusMessage);
    }
}

// Rate limiting: 5 requests per minute per IP for cancellation operations
const rateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
});

/**
 * API endpoint to update a donation amount
 */
export default defineEventHandler(async (event) => {
    // Rate limiting
    rateLimiter(event);

    // Authentication
    requireAuth(event);

    // Parse and validate request body
    const body = await readBody(event);
    const { did, amount } = validateUpdateRequest(body);

    // Update donation via Springboard API
    const updateResponse = await updateDonationWithSpringboard(did, amount);

    return updateResponse;
});