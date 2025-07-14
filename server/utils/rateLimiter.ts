import { createError, setHeader, getHeader } from 'h3';

// Simple in-memory rate limiting store
// In production, consider using Redis or similar persistent store
const requestStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
}

function getClientIP(event: any): string {
    const xForwardedFor = getHeader(event, 'x-forwarded-for');
    const xRealIp = getHeader(event, 'x-real-ip');

    if (typeof xForwardedFor === 'string') {
        return xForwardedFor.split(',')[0].trim();
    }

    if (typeof xRealIp === 'string') {
        return xRealIp.trim();
    }

    return event.node?.req?.socket?.remoteAddress || 'unknown';
}

export function rateLimit(options: RateLimitOptions) {
    const { windowMs, maxRequests } = options;

    return (event: any) => {
        const clientIP = getClientIP(event);
        const key = `rate_limit:${clientIP}`;
        const now = Date.now();

        // Get or create request data for this IP
        let requestData = requestStore.get(key);

        if (!requestData || now > requestData.resetTime) {
            // Reset window for this IP
            requestData = {
                count: 1,
                resetTime: now + windowMs,
            };
        } else {
            // Increment request count
            requestData.count++;
        }

        requestStore.set(key, requestData);

        // Check if limit exceeded
        if (requestData.count > maxRequests) {
            const remainingTime = Math.ceil((requestData.resetTime - now) / 1000);

            throw createError({
                statusCode: 429,
                statusMessage: 'Too Many Requests',
                message: `Rate limit exceeded. Try again in ${remainingTime} seconds.`,
            });
        }

        // Set rate limit headers
        setHeader(event, 'X-RateLimit-Limit', maxRequests.toString());
        setHeader(event, 'X-RateLimit-Remaining', (maxRequests - requestData.count).toString());
        setHeader(event, 'X-RateLimit-Reset', Math.ceil(requestData.resetTime / 1000).toString());
    };
}

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestStore.entries()) {
        if (now > data.resetTime) {
            requestStore.delete(key);
        }
    }
}, 60000); // Clean up every minute
