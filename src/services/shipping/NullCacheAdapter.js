/**
 * NullCacheAdapter
 * 
 * A no-op cache adapter that always misses. Used as the default injected adapter
 * in ShippingService so that caching can be added later (via RedisCacheAdapter)
 * without changing any business logic — Open/Closed Principle.
 * 
 * To enable Redis caching, create a RedisCacheAdapter with the same interface
 * and inject it when constructing ShippingService:
 * 
 *   const service = new ShippingService(new RedisCacheAdapter(redisClient));
 */

export const NullCacheAdapter = {
  /**
   * Always returns null (cache miss).
   * @param {string} key
   * @returns {Promise<null>}
   */
  async get(key) {
    return null;
  },

  /**
   * No-op set — discards the value.
   * @param {string} key
   * @param {*} value
   * @param {number} ttlSeconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttlSeconds) {
    return;
  }
};

export default NullCacheAdapter;
