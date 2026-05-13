import dbConnect from './db';
import Media from '@/models/Media';

/**
 * Track or update a media usage reference.
 * Call this whenever a product/category/config saves with a media URL.
 */
export async function trackMediaUsage(mediaId, { entityType, entityId, fieldName, label }) {
  if (!mediaId) return;
  await dbConnect();
  try {
    await Media.findByIdAndUpdate(mediaId, {
      $addToSet: {
        usageRefs: { entityType, entityId, fieldName, label }
      },
      $set: {},
    });
    // Recalculate usageCount
    const media = await Media.findById(mediaId);
    if (media) {
      await Media.findByIdAndUpdate(mediaId, { usageCount: media.usageRefs.length });
    }
  } catch (err) {
    console.error('[MediaUsage] trackMediaUsage error:', err.message);
  }
}

/**
 * Remove a specific usage reference from a media item.
 * Call this when a product/category removes or changes an image.
 */
export async function removeMediaUsage(mediaId, entityType, entityId, fieldName) {
  if (!mediaId) return;
  await dbConnect();
  try {
    await Media.findByIdAndUpdate(mediaId, {
      $pull: {
        usageRefs: { entityType, entityId: entityId?.toString(), fieldName }
      }
    });
    const media = await Media.findById(mediaId);
    if (media) {
      await Media.findByIdAndUpdate(mediaId, { usageCount: media.usageRefs.length });
    }
  } catch (err) {
    console.error('[MediaUsage] removeMediaUsage error:', err.message);
  }
}

/**
 * Resolve a media document from a URL.
 * Used to find the mediaId from a stored image URL.
 */
export async function findMediaByUrl(url) {
  if (!url) return null;
  await dbConnect();
  try {
    return await Media.findOne({ url, isDeleted: false });
  } catch {
    return null;
  }
}
