import PromotionRevision from "../../models/PromotionRevision";
import PromotionAuditLog from "../../models/PromotionAuditLog";

export default class HistoryService {
  /**
   * Records a snapshot of the current promotion state.
   */
  static async recordRevision(promotion, adminContext = {}) {
    try {
        // Find the latest version
        const latest = await PromotionRevision.findOne({ promotionId: promotion._id }).sort({ version: -1 });
        const nextVersion = (latest?.version || 0) + 1;

        await PromotionRevision.create({
            promotionId: promotion._id,
            snapshot: promotion.toObject ? promotion.toObject() : promotion,
            version: nextVersion,
            createdBy: adminContext.adminName || 'System',
            changeSummary: adminContext.summary || ''
        });

        return nextVersion;
    } catch (err) {
        console.error("Failed to record revision:", err);
        return null;
    }
  }

  /**
   * Logs an administrative action with optional field-level diffs.
   */
  static async logAction(action, promotionId, adminContext = {}, diff = []) {
    try {
        await PromotionAuditLog.create({
            promotionId,
            action,
            changes: diff,
            adminName: adminContext.adminName,
            adminId: adminContext.adminId,
            ipAddress: adminContext.ipAddress,
            metadata: adminContext.metadata
        });
    } catch (err) {
        console.error("Failed to log audit action:", err);
    }
  }

  /**
   * Helper to generate a simple field-level diff between two objects.
   */
  static generateDiff(oldObj, newObj) {
    const diff = [];
    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of keys) {
        if (['updatedAt', 'createdAt', '__v', '_id'].includes(key)) continue;
        
        const oldVal = JSON.stringify(oldObj[key]);
        const newVal = JSON.stringify(newObj[key]);

        if (oldVal !== newVal) {
            diff.push({
                field: key,
                oldValue: oldObj[key],
                newValue: newObj[key]
            });
        }
    }
    return diff;
  }
}
