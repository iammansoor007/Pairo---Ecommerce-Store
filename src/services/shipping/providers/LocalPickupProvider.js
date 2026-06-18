/**
 * LocalPickupProvider
 * 
 * For customers picking up their order from a physical store.
 * Usually free (cost = 0) but can have a handling fee.
 * Optionally resolves a pickupLocationId to attach store address
 * to the rate response (future enhancement).
 * 
 * Provider settings shape:
 *   {
 *     cost: Number,             // handling/admin fee (usually 0)
 *     pickupLocationId: string  // ObjectId ref to PickupLocation model (future)
 *   }
 */

const LocalPickupProvider = {
  /**
   * @param {object} method - ShippingMethod document
   * @param {object} cart   - { subtotal, items, totalQuantity, totalWeight }
   * @returns {{ cost: number, label: string, pickupLocationId?: string }}
   */
  calculate(method, cart) {
    const cost             = Number(method.settings?.cost ?? 0);
    const pickupLocationId = method.settings?.pickupLocationId ?? null;

    return {
      cost,
      label: method.name || 'Local Pickup',
      ...(pickupLocationId && { pickupLocationId })
    };
  }
};

export default LocalPickupProvider;
