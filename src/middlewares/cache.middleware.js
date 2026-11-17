const cacheService = require('../infrastructure/cache/cache.service');

/**
 * Route-level HTTP caching middleware for GET endpoints.
 * Returns cached responses with 'X-Cache: HIT' header when available.
 *
 * @param {number} [ttlSeconds=120] Cache time-to-live in seconds
 * @param {Function} [keyGenerator] Optional custom key generator: (req) => string
 */
const cacheMiddleware = (ttlSeconds = 120, keyGenerator = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `http:${req.baseUrl || ''}${req.path}:${JSON.stringify(req.query || {})}`;

    try {
      const cached = await cacheService.get(cacheKey);

      if (cached !== null && cached !== undefined) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cached);
      }

      res.setHeader('X-Cache', 'MISS');

      // Intercept res.json to capture response payload
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, body, ttlSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch {
      next();
    }
  };
};

module.exports = cacheMiddleware;
