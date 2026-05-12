import AuditLog from '@/models/AuditLog';

/**
 * Lightweight Background Queue Processor
 * In a real production env, this would be replaced with BullMQ + Redis.
 * This implementation uses non-blocking Promises with a Retry Loop.
 */
class QueueService {
  /**
   * Push a task to the background
   * @param {string} name - Task name
   * @param {function} taskFn - The actual async function to run
   * @param {object} options - { retries: 3, referenceId: '' }
   */
  static async push(name, taskFn, options = { retries: 3, referenceId: '' }) {
    // Non-blocking execution
    this._execute(name, taskFn, options.retries, 0, options.referenceId);
  }

  static async _execute(name, taskFn, maxRetries, currentRetry, referenceId) {
    try {
      await taskFn();
      
      // Log Success optionally
      if (currentRetry > 0) {
        await AuditLog.create({
          event: `QUEUE_SUCCESS`,
          referenceId,
          severity: 'info',
          message: `Task ${name} succeeded after ${currentRetry} retries`
        });
      }
    } catch (error) {
      console.error(`[Queue Error] ${name}:`, error.message);

      if (currentRetry < maxRetries) {
        const nextRetry = currentRetry + 1;
        const delay = Math.pow(2, nextRetry) * 1000; // Exponential backoff

        console.log(`[Queue Retry] ${name}: Attempt ${nextRetry}/${maxRetries} in ${delay}ms`);
        
        setTimeout(() => {
          this._execute(name, taskFn, maxRetries, nextRetry, referenceId);
        }, delay);
      } else {
        // Final Failure
        console.error(`[Queue Fatal] ${name}: Max retries reached.`);
        await AuditLog.create({
          event: `QUEUE_FAILED`,
          referenceId,
          severity: 'error',
          message: `Task ${name} failed after ${maxRetries} attempts`,
          metadata: { error: error.message }
        });
      }
    }
  }
}

export default QueueService;
