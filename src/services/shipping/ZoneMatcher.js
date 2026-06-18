/**
 * ZoneMatcher
 * 
 * Pure function module — no database access, no side effects.
 * 
 * Matches a customer's shipping address against a list of pre-loaded
 * ShippingZone documents. Uses a specificity scoring system inspired by
 * CSS specificity: more specific geographic rules win over general ones.
 * 
 * Specificity weights (higher = more specific):
 *   postal_code       100
 *   postal_code_range  90
 *   city               70
 *   state / province   50
 *   country            30
 *   region             10
 *   custom              5
 */

/** @type {Record<string, number>} */
const RULE_WEIGHTS = {
  postal_code:       100,
  postal_code_range:  90,
  city:               70,
  state:              50,
  province:           50,
  country:            30,
  region:             10,
  custom:              5
};

/**
 * Evaluate a single MatchRule against the customer address.
 * Comparison is case-insensitive and trimmed.
 * 
 * @param {{ type: string, values: string[] }} rule
 * @param {{ country?: string, state?: string, city?: string, zip?: string }} address
 * @returns {boolean}
 */
function evaluateRule(rule, address) {
  const normalizedValues = rule.values.map(v => v.trim().toLowerCase());

  const getField = () => {
    switch (rule.type) {
      case 'country':            return (address.country || '').trim().toLowerCase();
      case 'state':
      case 'province':           return (address.state || '').trim().toLowerCase();
      case 'city':               return (address.city || '').trim().toLowerCase();
      case 'postal_code':        return (address.zip || '').trim().toLowerCase();
      case 'postal_code_range': {
        // values[0] = start, values[1] = end
        const zip = parseInt((address.zip || '').replace(/\D/g, ''), 10);
        const start = parseInt((rule.values[0] || '0').replace(/\D/g, ''), 10);
        const end   = parseInt((rule.values[1] || '999999').replace(/\D/g, ''), 10);
        return (zip >= start && zip <= end) ? '__range_match__' : '';
      }
      case 'region':
      case 'custom':             return (address.country || address.state || '').trim().toLowerCase();
      default:                   return '';
    }
  };

  const fieldValue = getField();

  if (rule.type === 'postal_code_range') {
    return fieldValue === '__range_match__';
  }

  // Empty values list = wildcard (matches anything)
  if (normalizedValues.length === 0) return true;

  return normalizedValues.includes(fieldValue);
}

/**
 * Find the best matching ShippingZone for a given address.
 * 
 * Algorithm:
 *   1. All zones with no matchRules are considered wildcard zones (match everything).
 *   2. For each zone with rules, all rules must match (AND logic).
 *   3. Winner = highest combined specificity score.
 *   4. Tie-break = highest zone.priority.
 * 
 * @param {Array<object>} zones  - ShippingZone documents (pre-fetched from DB)
 * @param {object}        address - { country, state, city, zip }
 * @returns {object|null} The winning zone document, or null if no match
 */
export function matchZone(zones, address) {
  let bestZone        = null;
  let highestScore    = -1;
  let highestPriority = -Infinity;

  for (const zone of zones) {
    // Wildcard zone — matches everything at score 0
    if (!zone.matchRules || zone.matchRules.length === 0) {
      const p = zone.priority ?? 0;
      if (highestScore < 0 || (highestScore === 0 && p > highestPriority)) {
        bestZone        = zone;
        highestScore    = 0;
        highestPriority = p;
      }
      continue;
    }

    let zoneScore = 0;
    let allMatch  = true;

    for (const rule of zone.matchRules) {
      if (!evaluateRule(rule, address)) {
        allMatch = false;
        break;
      }
      zoneScore += RULE_WEIGHTS[rule.type] ?? 5;
    }

    if (!allMatch) continue;

    const p = zone.priority ?? 0;
    if (
      zoneScore > highestScore ||
      (zoneScore === highestScore && p > highestPriority)
    ) {
      bestZone        = zone;
      highestScore    = zoneScore;
      highestPriority = p;
    }
  }

  return bestZone;
}
