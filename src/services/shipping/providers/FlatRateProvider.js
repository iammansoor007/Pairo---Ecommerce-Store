/**
 * FlatRateProvider
 * 
 * Charges a fixed shipping cost regardless of cart contents.
 * Provider settings shape:
 *   { cost: Number, currency: String }
 */

const FlatRateProvider = {
  /**
   * @param {object} method - ShippingMethod document
   * @param {object} cart   - { subtotal, items, totalQuantity, totalWeight }
   * @returns {{ cost: number, label: string }}
   */
  calculate(method, cart) {
    const cost = Number(method.settings?.cost ?? 0);
    return {
      cost,
      label: method.name || 'Flat Rate Shipping'
    };
  }
};

export default FlatRateProvider;
