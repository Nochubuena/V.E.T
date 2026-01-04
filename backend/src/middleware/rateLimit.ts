import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for collar vital updates
 * Allows 10 requests per 10 seconds per dog ID
 * This prevents abuse while allowing reasonable update frequency
 */
export const collarLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 10, // 10 requests per window
  message: 'Too many vital updates. Please slow down.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Rate limit per dog ID (allows multiple collars for different dogs)
    return req.params.id || req.ip;
  },
  skip: (req) => {
    // Skip rate limiting in development if needed
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * General rate limiter for all routes
 * More lenient than collar limiter
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});


