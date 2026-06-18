/**
 * ProviderRegistry
 * 
 * Dependency-Inversion-compliant registry that maps provider keys to their
 * concrete implementation instances. ShippingService resolves providers through
 * this registry and never imports them directly — adding a new provider
 * (e.g. UPS, FedEx) requires only registering it here, with zero changes
 * to the core shipping engine.
 */

class ProviderRegistry {
  #registry = new Map();

  /**
   * Register a provider implementation under a key.
   * @param {string} key - Provider enum key (e.g. 'FLAT_RATE')
   * @param {object} provider - Object implementing { calculate(method, cart): { cost, label } }
   */
  register(key, provider) {
    if (typeof provider.calculate !== 'function') {
      throw new Error(`[ProviderRegistry] Provider "${key}" must implement calculate(method, cart).`);
    }
    this.#registry.set(key, provider);
    return this; // fluent API for chaining
  }

  /**
   * Resolve a registered provider by key.
   * @param {string} key - Provider enum key
   * @returns {object} Provider instance
   * @throws If no provider is registered for the key
   */
  resolve(key) {
    const provider = this.#registry.get(key);
    if (!provider) {
      throw new Error(`[ProviderRegistry] No provider registered for key "${key}". Registered: [${[...this.#registry.keys()].join(', ')}]`);
    }
    return provider;
  }

  /**
   * List all registered provider keys.
   * @returns {string[]}
   */
  list() {
    return [...this.#registry.keys()];
  }

  /**
   * Check whether a key is registered.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.#registry.has(key);
  }
}

// Export a singleton registry instance — providers are registered at app init
export const providerRegistry = new ProviderRegistry();
export default ProviderRegistry;
