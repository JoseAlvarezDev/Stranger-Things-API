/**
 * Security Middleware for Stranger Things API
 * Implements rate limiting, request validation, and security headers
 */

const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// ==================== RATE LIMITING ====================

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Please try again in 15 minutes.',
        code: 429,
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
});

/**
 * Stricter rate limiter for random endpoints
 * Limits: 30 requests per minute per IP
 */
const randomEndpointLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 requests per minute
    message: {
        error: 'Too Many Requests',
        message: 'Random endpoint rate limit exceeded. Please wait before trying again.',
        code: 429,
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Very strict rate limiter for abuse prevention
 * Limits: 1000 requests per hour per IP (for heavy users)
 */
const heavyUsageLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // Limit each IP to 1000 requests per hour
    message: {
        error: 'Rate Limit Exceeded',
        message: 'You have made too many requests in the last hour. Please try again later.',
        code: 429,
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ==================== REQUEST VALIDATION ====================

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (req.query.page && (isNaN(page) || page < 1)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid page parameter. Must be a positive integer.',
            code: 400
        });
    }

    if (req.query.limit && (isNaN(limit) || limit < 1 || limit > 50)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid limit parameter. Must be between 1 and 50.',
            code: 400
        });
    }

    next();
};

/**
 * Validate ID parameter
 */
const validateId = (req, res, next) => {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid ID parameter. Must be a positive integer.',
            code: 400
        });
    }

    next();
};

/**
 * Sanitize query parameters
 * Removes potentially dangerous characters
 */
const sanitizeQuery = (req, res, next) => {
    // Sanitize query parameters
    Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
            // Remove any script tags or dangerous patterns
            req.query[key] = req.query[key]
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/[<>'"]/g, '') // Remove special characters
                .trim()
                .substring(0, 100); // Limit length
        }
    });

    next();
};

// ==================== SECURITY HEADERS ====================

/**
 * Additional security headers
 */
const securityHeaders = (req, res, next) => {
    // Prevent caching of sensitive data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Add custom API headers
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Powered-By', 'Stranger Things API');

    next();
};

/**
 * API-specific CORS configuration
 */
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // In production, you might want to whitelist specific origins
        // For now, we allow all origins for public API access
        callback(null, true);
    },
    methods: ['GET', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'X-API-Version'],
    credentials: false,
    maxAge: 86400 // 24 hours
};

// ==================== API KEY VALIDATION (OPTIONAL) ====================

/**
 * Optional API key validation middleware
 * If X-API-Key header is provided, validate it
 * This is optional - the API works without keys too
 */
const optionalApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (apiKey) {
        // For now, just log that an API key was provided
        // In production, you could validate against a database
        req.hasApiKey = true;
        req.apiKey = apiKey;

        // Log API key usage (in production, store this for analytics)
        console.log(`[API Key Usage] Key: ${apiKey.substring(0, 8)}... | Endpoint: ${req.path}`);
    } else {
        req.hasApiKey = false;
    }

    next();
};

module.exports = {
    // Rate limiters
    generalLimiter,
    randomEndpointLimiter,
    heavyUsageLimiter,

    // Validation
    validatePagination,
    validateId,
    sanitizeQuery,

    // Security
    securityHeaders,
    corsOptions,
    hpp: hpp(),
    optionalApiKey
};
