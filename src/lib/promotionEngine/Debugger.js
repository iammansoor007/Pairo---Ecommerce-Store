/**
 * Translates complex engine evaluation results into human-readable messages.
 */
export default class Debugger {
  /**
   * Formats the evaluation results for storefront display.
   */
  static formatEligibility(evaluation) {
    if (evaluation.isEligible) {
      return evaluation.explanation || "Promotion applied successfully.";
    }

    // Phase 2: Intelligent near-miss feedback
    if (evaluation.debugMetadata) {
        // Find the specific rule that failed
        const failedRule = this.findFirstFailedRule(evaluation.debugMetadata);
        if (failedRule) {
            return this.translateRuleFailure(failedRule);
        }
    }

    return evaluation.explanation || "This promotion is not applicable to your current cart.";
  }

  /**
   * Explains why a promotion was blocked by the ConflictResolver.
   */
  static explainConflict(promotion, appliedPromotions) {
    const blockingPromo = appliedPromotions.find(p => !p.stackable || p.exclusive);
    if (blockingPromo) {
      return `This offer cannot be combined with "${blockingPromo.title}".`;
    }
    return "This offer conflicts with another applied promotion.";
  }

  /**
   * Explains status-based failures.
   */
  static explainStatus(promotion) {
    if (promotion.adminStatus === 'Paused') return "This campaign is currently inactive.";
    if (promotion.adminStatus === 'Expired') return "This offer has expired.";
    if (promotion.adminStatus === 'Exhausted') return "This offer has reached its usage limit.";
    return "This promotion is not available.";
  }

  static findFirstFailedRule(metadata) {
    if (Array.isArray(metadata)) {
        for (const item of metadata) {
            if (item.passed === false) {
                if (item.debugMetadata) return this.findFirstFailedRule(item.debugMetadata);
                return item;
            }
        }
    }
    return null;
  }

  static translateRuleFailure(failedRule) {
    const { field, op, value } = failedRule.rule || {};
    
    switch (field) {
      case 'subtotal':
        if (op === '>') return `Spend more than $${value} to unlock this offer.`;
        if (op === '>=') return `Spend $${value} or more to unlock this offer.`;
        break;
      case 'items_count':
        return `Add ${value} or more items to your cart to use this discount.`;
      case 'product_id':
        return `This offer is only valid for specific products.`;
      case 'category_id':
        return `This offer is only valid for specific categories.`;
      default:
        return failedRule.explanation;
    }
    return failedRule.explanation;
  }
}
