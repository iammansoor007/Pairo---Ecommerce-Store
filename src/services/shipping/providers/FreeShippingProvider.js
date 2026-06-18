/**
 * FreeShippingProvider
 * 
 * Returns cost = 0 when eligible. Supports an optional minimum order threshold —
 * if the cart subtotal is below minimumOrderAmount, falls back to fallbackCost
 * (useful for "Free shipping over Rs. 5000" rules).
 * 
 * Provider settings shape:
 *   {
 *     minimumOrderAmount: Number,  // if set, subtotal must meet this to qualify for free shipping
 *     fallbackCost: Number         // cost charged when minimum is not met (default 0)
 *   }
 */

const FreeShippingProvider = {
  /**
   * @param {object} method - ShippingMethod document
   * @param {object} cart   - { subtotal, items, totalQuantity, totalWeight }
   * @returns {{ cost: number, label: string }}
   */
  calculate(method, cart) {
    const minimumOrderAmount = Number(method.settings?.minimumOrderAmount ?? 0);
    const fallbackCost       = Number(method.settings?.fallbackCost ?? 0);

    // If there's a minimum and the cart doesn't meet it, use the fallback cost
    if (minimumOrderAmount > 0 && cart.subtotal < minimumOrderAmount) {
      return {
        cost:  fallbackCost,
        label: method.name || 'Shipping'
      };
    }

    return {
      cost:  0,
      label: method.name || 'Free Shipping'
    };
  }
};

export default FreeShippingProvider;
