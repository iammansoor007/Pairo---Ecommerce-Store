/**
 * RateCalculator
 * 
 * Resolves the shipping cost for a single method by delegating to the
 * appropriate provider via ProviderRegistry. Returns a structured rate
 * object ready to send to the client.
 */

import { providerRegistry } from './providers/ProviderRegistry.js';

/**
 * Calculate the shipping rate for a single eligible method.
 * 
 * @param {object} method   - ShippingMethod document
 * @param {object} cart     - { subtotal, totalQuantity, totalWeight, items }
 * @param {string} currency - ISO 4217 currency code from Store Settings
 * @param {object} zone     - The matched ShippingZone document
 * @returns {{
 *   methodId: string,
 *   methodName: string,
 *   description: string,
 *   provider: string,
 *   zoneId: string,
 *   zoneName: string,
 *   cost: number,
 *   currency: string,
 *   settings: object,
 *   conditions: object[]
 * }}
 */
export function calculateRate(method, cart, currency, zone) {
  const provider = providerRegistry.resolve(method.provider);
  const result   = provider.calculate(method, cart);

  return {
    methodId:    method._id?.toString(),
    methodName:  method.name,
    description: method.description ?? '',
    provider:    method.provider,
    zoneId:      zone._id?.toString(),
    zoneName:    zone.name,
    cost:        result.cost,
    label:       result.label,
    currency,
    // Snapshot fields — included so checkout page can build shippingSnapshot without extra fetches
    settings:    method.settings ?? {},
    conditions:  method.conditions ?? [],
    // Pass through pickup location if provided by LocalPickupProvider
    ...(result.pickupLocationId && { pickupLocationId: result.pickupLocationId })
  };
}
