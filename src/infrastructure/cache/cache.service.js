const Redis = require('ioredis');
const logger = require('../../utils/logger');

class CacheService {
  constructor(options = {}) {
    this.prefix = options.prefix || process.env.REDIS_KEY_PREFIX || 'swimletes:';
    this.defaultTTL = Number(options.defaultTTL || process.env.REDIS_DEFAULT_TTL || 300); // 5 minutes default
    this.maxMemoryEntries = options.maxMemoryEntries || 2000;

    this.memoryStore = new Map();
    this.isRedisReady = false;
    this.client = null;

    this._initPruneTimer();
    this._initClient();
  }

  /**
   * Initialize Redis client
   */
  _initClient() {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST;

    if (!redisUrl && !redisHost) {
      logger.info('CacheService: Running in-memory cache mode (No Redis config specified).');
      return;
    }

    try {
      const config = redisUrl || {
        host: redisHost || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB || 0),
        keyPrefix: this.prefix,
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        connectTimeout: 5000,
        retryStrategy: (times) => {
          if (times > 5) {
            logger.warn('CacheService: Max connection retries reached. Using in-memory fallback.');
            return null; // Stop reconnecting after 5 attempts to avoid flooding logs
          }
          return Math.min(times * 300, 2000);
        }
      };

      this.client = new Redis(config);

      this.client.on('connect', () => {
        this.isRedisReady = true;
        logger.info('CacheService: Connected to Redis successfully.');
      });

      this.client.on('ready', () => {
        this.isRedisReady = true;
      });

      this.client.on('error', (err) => {
        this.isRedisReady = false;
        logger.warn(`CacheService: Redis connection error (${err.message}). Using memory fallback.`);
      });

      this.client.on('close', () => {
        this.isRedisReady = false;
      });

      // Initiate connection asynchronously
      this.client.connect().catch((err) => {
        this.isRedisReady = false;
        logger.warn(`CacheService: Initial connection failed (${err.message}). In-memory cache active.`);
      });
    } catch (err) {
      this.isRedisReady = false;
      logger.error(`CacheService: Failed to configure Redis: ${err.message}`);
    }
  }

  /**
   * Internal memory store cleanup timer to avoid memory leaks
   */
  _initPruneTimer() {
    this.pruneInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.memoryStore.entries()) {
        if (item.expiresAt && now > item.expiresAt) {
          this.memoryStore.delete(key);
        }
      }
    }, 60000);

    // Ensure timer does not prevent process exit
    if (this.pruneInterval.unref) {
      this.pruneInterval.unref();
    }
  }

  _formatKey(key) {
    if (this.isRedisReady) {
      // ioredis keyPrefix handles the prefix automatically if configured
      return key;
    }
    return `${this.prefix}${key}`;
  }

  /**
   * Retrieve cached value
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (!key) return null;

    try {
      if (this.isRedisReady && this.client) {
        const data = await this.client.get(this._formatKey(key));
        return data ? JSON.parse(data) : null;
      }
    } catch (err) {
      logger.warn(`CacheService.get error for key "${key}": ${err.message}`);
    }

    // Memory fallback
    const item = this.memoryStore.get(this._formatKey(key));
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryStore.delete(this._formatKey(key));
      return null;
    }

    return item.data;
  }

  /**
   * Set cached value with TTL
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds
   * @returns {Promise<boolean>}
   */
  async set(key, value, ttlSeconds = this.defaultTTL) {
    if (!key || value === undefined) return false;

    const formattedKey = this._formatKey(key);
    const ttl = Number(ttlSeconds) > 0 ? Number(ttlSeconds) : this.defaultTTL;

    try {
      if (this.isRedisReady && this.client) {
        await this.client.set(formattedKey, JSON.stringify(value), 'EX', ttl);
        return true;
      }
    } catch (err) {
      logger.warn(`CacheService.set error for key "${key}": ${err.message}`);
    }

    // Enforce memory store size boundary (LRU eviction)
    if (this.memoryStore.size >= this.maxMemoryEntries) {
      const oldestKey = this.memoryStore.keys().next().value;
      if (oldestKey) {
        this.memoryStore.delete(oldestKey);
      }
    }

    this.memoryStore.set(formattedKey, {
      data: value,
      expiresAt: Date.now() + ttl * 1000
    });

    return true;
  }

  /**
   * Cache-Aside Helper: Gets cached value, or executes fetcher function and caches result
   * @param {string} key
   * @param {Function} fetcherFn
   * @param {number} ttlSeconds
   * @returns {Promise<any>}
   */
  async getOrSet(key, fetcherFn, ttlSeconds = this.defaultTTL) {
    const cached = await this.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const fresh = await fetcherFn();
    if (fresh !== null && fresh !== undefined) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }

  /**
   * Check if key exists in cache
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    if (!key) return false;

    try {
      if (this.isRedisReady && this.client) {
        const count = await this.client.exists(this._formatKey(key));
        return count > 0;
      }
    } catch (err) {
      logger.warn(`CacheService.has error for key "${key}": ${err.message}`);
    }

    const item = this.memoryStore.get(this._formatKey(key));
    if (!item) return false;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryStore.delete(this._formatKey(key));
      return false;
    }
    return true;
  }

  /**
   * Delete a key from cache
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async del(key) {
    if (!key) return false;

    const formattedKey = this._formatKey(key);

    try {
      if (this.isRedisReady && this.client) {
        await this.client.del(formattedKey);
      }
    } catch (err) {
      logger.warn(`CacheService.del error for key "${key}": ${err.message}`);
    }

    this.memoryStore.delete(formattedKey);
    return true;
  }

  /**
   * Delete multiple keys from cache
   * @param {string[]} keys
   * @returns {Promise<boolean>}
   */
  async delMany(keys = []) {
    if (!Array.isArray(keys) || keys.length === 0) return false;

    try {
      if (this.isRedisReady && this.client) {
        const formattedKeys = keys.map((k) => this._formatKey(k));
        await this.client.del(...formattedKeys);
      }
    } catch (err) {
      logger.warn(`CacheService.delMany error: ${err.message}`);
    }

    keys.forEach((k) => this.memoryStore.delete(this._formatKey(k)));
    return true;
  }

  /**
   * Invalidate keys matching a pattern using non-blocking SCAN (Production Safe)
   * @param {string} pattern Example: 'users:*' or 'instructor:123*'
   * @returns {Promise<number>} Number of keys removed
   */
  async delByPattern(pattern) {
    if (!pattern) return 0;

    let deletedCount = 0;

    if (this.isRedisReady && this.client) {
      try {
        const searchPattern = `${this.prefix}${pattern}`;
        let cursor = '0';

        do {
          const [nextCursor, keys] = await this.client.scan(
            cursor,
            'MATCH',
            searchPattern,
            'COUNT',
            100
          );
          cursor = nextCursor;

          if (keys && keys.length > 0) {
            // Unlink or del matching keys
            if (typeof this.client.unlink === 'function') {
              await this.client.unlink(...keys);
            } else {
              await this.client.del(...keys);
            }
            deletedCount += keys.length;
          }
        } while (cursor !== '0');
      } catch (err) {
        logger.warn(`CacheService.delByPattern error for pattern "${pattern}": ${err.message}`);
      }
    }

    // In-memory pattern removal (regex matching)
    try {
      const regex = new RegExp(`^${this.prefix}${pattern.replace(/\*/g, '.*')}$`);
      for (const storedKey of this.memoryStore.keys()) {
        if (regex.test(storedKey)) {
          this.memoryStore.delete(storedKey);
          deletedCount++;
        }
      }
    } catch (err) {
      logger.warn(`CacheService memory pattern cleanup error: ${err.message}`);
    }

    return deletedCount;
  }

  /**
   * Clear all cached keys
   */
  async flush() {
    try {
      if (this.isRedisReady && this.client) {
        await this.client.flushdb();
      }
    } catch (err) {
      logger.warn(`CacheService.flush error: ${err.message}`);
    }
    this.memoryStore.clear();
    return true;
  }

  /**
   * Check connection status
   * @returns {{ provider: string, isReady: boolean, inMemoryItems: number }}
   */
  healthCheck() {
    return {
      provider: this.isRedisReady ? 'redis' : 'memory',
      isReady: this.isRedisReady || this.memoryStore !== null,
      inMemoryItems: this.memoryStore.size
    };
  }

  /**
   * Graceful disconnect on server termination
   */
  async disconnect() {
    if (this.pruneInterval) {
      clearInterval(this.pruneInterval);
    }
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
    }
    this.memoryStore.clear();
  }
}

module.exports = new CacheService();
