import { defineEventHandler } from 'h3';
import { requireAuth } from '../../utils/jwt';

export default defineEventHandler(async (event) => {
    // Verify the JWT token
    const payload = requireAuth(event);

    return {
        success: true,
        user: {
            userId: payload.userId,
            email: payload.email,
        },
        valid: true,
    };
});