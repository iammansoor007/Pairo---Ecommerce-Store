/**
 * Executes the actions of a promotion to calculate discount amounts.
 * Supports targeted discounts (products/categories) and BXGY logic.
 */
export default class ActionExecutor {
  /**
   * @param {Object} promotion - The promotion model instance
   * @param {Object} cart - The cart object
   */
  static execute(promotion, cart) {
    console.log(`[Engine:Executor] Executing actions for: ${promotion.title}`);
    
    let discountAmount = 0;
    let isFreeShipping = false;
    const appliedActions = [];

    if (!promotion.actions || !Array.isArray(promotion.actions)) {
      return { discountAmount, isFreeShipping, appliedActions };
    }

    for (const action of promotion.actions) {
      let currentActionDiscount = 0;

      switch (action.type) {
        case 'percentage_discount':
          if (action.target === 'product' && action.targetIds?.length > 0) {
            currentActionDiscount = this.calculateTargetedDiscount(cart, action, 'percentage');
          } else {
            currentActionDiscount = (cart.subtotal * (parseFloat(action.value) || 0)) / 100;
          }
          break;

        case 'fixed_discount':
          if (action.target === 'product' && action.targetIds?.length > 0) {
            currentActionDiscount = this.calculateTargetedDiscount(cart, action, 'fixed');
          } else {
            currentActionDiscount = parseFloat(action.value) || 0;
          }
          break;

        case 'free_shipping':
          isFreeShipping = true;
          break;

        case 'bxgy':
          currentActionDiscount = this.calculateBXGY(cart, action);
          break;

        default:
          console.warn(`[Engine:Executor] Action type ${action.type} not supported.`);
      }

      appliedActions.push({ 
        ...action, 
        calculatedValue: parseFloat(currentActionDiscount.toFixed(2)) 
      });
      discountAmount += currentActionDiscount;
    }

    // Guardrail: Cannot discount more than the subtotal
    if (discountAmount > cart.subtotal) {
      discountAmount = cart.subtotal;
    }

    return {
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      isFreeShipping,
      appliedActions
    };
  }

  /**
   * Calculates discount for specific products in the cart.
   */
  static calculateTargetedDiscount(cart, action, type) {
    let totalTargetedDiscount = 0;
    const targetIds = action.targetIds.map(id => id.toString());

    for (const item of cart.items || []) {
      const productId = item.productId?.toString() || item.id?.toString();
      if (targetIds.includes(productId)) {
        const itemTotal = item.price * item.quantity;
        if (type === 'percentage') {
          totalTargetedDiscount += (itemTotal * (parseFloat(action.value) || 0)) / 100;
        } else if (type === 'fixed') {
          totalTargetedDiscount += (parseFloat(action.value) || 0) * item.quantity;
        }
      }
    }
    return totalTargetedDiscount;
  }

  /**
   * Calculates Buy X Get Y (BXGY) discount.
   * Logic: For every X bought, get Y at discount.
   */
  static calculateBXGY(cart, action) {
    const { buyX, buyQty = 1, getY, getQty = 1, discountValue = 100, useCheapest = false } = action.bxgyConfig || {};
    console.log(`[Engine:Executor] BXGY Logic: Buy ${buyQty} of ${buyX} -> Get ${getQty} of ${getY} (Cheapest: ${useCheapest})`);

    // 1. Find all eligible "X" items (could be a specific ID or a category if we expand later)
    const buyItems = cart.items?.filter(i => (i.productId?.toString() || i.id?.toString()) === buyX) || [];
    const totalBuyQty = buyItems.reduce((acc, i) => acc + i.quantity, 0);

    if (totalBuyQty < buyQty) {
        console.log(`[Engine:Executor] BXGY FAILED: Insufficient quantity of buy item (${totalBuyQty} < ${buyQty})`);
        return 0;
    }

    // 2. Find all eligible "Y" items
    let getItems = cart.items?.filter(i => (i.productId?.toString() || i.id?.toString()) === getY) || [];
    if (getItems.length === 0) return 0;

    // 3. Calculate sets
    const sets = Math.floor(totalBuyQty / buyQty);
    let totalEligibleGetQty = sets * getQty;

    // 4. Calculate Discount
    let totalDiscount = 0;

    if (useCheapest) {
        // Sort eligible "Y" items by price ascending
        const sortedY = [...getItems].sort((a, b) => a.price - b.price);
        let remainingToDiscount = totalEligibleGetQty;

        for (const item of sortedY) {
            if (remainingToDiscount <= 0) break;
            const take = Math.min(item.quantity, remainingToDiscount);
            totalDiscount += (item.price * take * discountValue) / 100;
            remainingToDiscount -= take;
        }
    } else {
        // Default: Apply to the first found "Y" item (or specific logic)
        const item = getItems[0];
        const take = Math.min(item.quantity, totalEligibleGetQty);
        totalDiscount = (item.price * take * discountValue) / 100;
    }

    return totalDiscount;
  }
}
