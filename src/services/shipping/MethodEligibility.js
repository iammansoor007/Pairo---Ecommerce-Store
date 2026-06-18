/**
 * MethodEligibility
 * 
 * Pure function module — no database access, no side effects.
 * 
 * Evaluates whether a ShippingMethod is eligible for a given cart context.
 * Checks:
 *   1. Method status = Active
 *   2. activeFrom / activeUntil date window (Refinement #7)
 *   3. All conditions[] pass against the cart
 */

/**
 * Cart context shape:
 * @typedef {{ subtotal: number, totalQuantity: number, totalWeight: number, country?: string, state?: string, city?: string }} Cart
 */

/**
 * Extract the relevant cart value for a condition type.
 * @param {string} type
 * @param {Cart} cart
 * @returns {number|string}
 */
function getCartValue(type, cart) {
  switch (type) {
    case 'subtotal':        return cart.subtotal ?? 0;
    case 'quantity':        return cart.totalQuantity ?? 0;
    case 'weight':          return cart.totalWeight ?? 0;
    case 'country':         return (cart.country || '').toLowerCase().trim();
    case 'state':           return (cart.state || '').toLowerCase().trim();
    case 'city':            return (cart.city || '').toLowerCase().trim();
    case 'customer_group':  return (cart.customerGroup || '').toLowerCase().trim();
    default:                return 0;
  }
}

/**
 * Evaluate a single condition (left op right).
 * Numeric operators coerce to Number; equality operators are case-insensitive strings.
 * @param {number|string} left
 * @param {string} op
 * @param {number|string} right
 * @returns {boolean}
 */
function evaluateCondition(left, op, right) {
  switch (op) {
    case '>':  return Number(left) >  Number(right);
    case '<':  return Number(left) <  Number(right);
    case '>=': return Number(left) >= Number(right);
    case '<=': return Number(left) <= Number(right);
    case '==': return String(left).toLowerCase() === String(right).toLowerCase();
    case '!=': return String(left).toLowerCase() !== String(right).toLowerCase();
    default:   return false;
  }
}

/**
 * Determine whether a ShippingMethod is eligible given the current cart.
 * 
 * @param {object} method - ShippingMethod document
 * @param {Cart}   cart   - Cart context
 * @param {Date}   [now]  - Override for testability (default: new Date())
 * @returns {boolean}
 */
export function isEligible(method, cart, now = new Date()) {
  // 1. Status check
  if (method.status !== 'Active') return false;

  // 2. Activation window check (Refinement #7)
  if (method.activeFrom && now < new Date(method.activeFrom)) return false;
  if (method.activeUntil && now > new Date(method.activeUntil)) return false;

  // 3. Conditions check — all conditions must pass (AND logic)
  const conditions = method.conditions ?? [];
  for (const cond of conditions) {
    const cartValue = getCartValue(cond.type, cart);
    if (!evaluateCondition(cartValue, cond.operator, cond.value)) {
      return false;
    }
  }

  return true;
}
