import { cache } from './cache';
import logger, { LogCategory } from './logger';

/**
 * Enterprise Rate Limiter (Redis-backed)
 * Prevents brute-force attempts on coupon validation.
 */
export async function rateLimit(key, limit = 10, window = 60) {
    const cacheKey = `RATELIMIT:${key}`;
    
    try {
        const current = await cache.get(cacheKey);
        const count = current ? parseInt(current) : 0;

        if (count >= limit) {
            logger.warn({ category: LogCategory.SECURITY_HARDENING, key }, "Rate limit exceeded for coupon validation.");
            return { success: false, remaining: 0 };
        }

        // Increment count
        await cache.set(cacheKey, count + 1, window);
        return { success: true, remaining: limit - (count + 1) };
        
    } catch (err) {
        logger.error({ category: LogCategory.SECURITY_HARDENING, error: err.message }, "Rate limiter failed. Falling back to allow.");
        return { success: true, remaining: 1 }; // Fail-Open for UX
    }
}
