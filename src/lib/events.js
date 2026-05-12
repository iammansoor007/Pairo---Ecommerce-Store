import { EventEmitter } from 'events';
import AuditLog from '@/models/AuditLog';

// Singleton Event Emitter
class PairoEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20);
    
    // Automatically initialize listeners on server-side only
    if (typeof window === 'undefined') {
      import('./listeners/orderListeners').then(({ initOrderListeners }) => {
        initOrderListeners();
      });
    }
  }

  // Enhanced emit with logging
  async dispatch(event, data) {
    try {
      console.log(`[Event Dispatched]: ${event}`, data.orderId || data.id || '');
      
      // Log event to DB for audit trail
      await AuditLog.create({
        event,
        referenceId: data.orderId || data.id,
        message: `Event ${event} triggered`,
        metadata: data
      }).catch(err => console.error("Failed to log event:", err));

      this.emit(event, data);
    } catch (err) {
      console.error(`Error dispatching event ${event}:`, err);
    }
  }
}

// Ensure singleton in development to prevent memory leaks during HMR
let pairoEvents;

if (process.env.NODE_ENV === 'production') {
  pairoEvents = new PairoEventEmitter();
} else {
  if (!global.pairoEvents) {
    global.pairoEvents = new PairoEventEmitter();
  }
  pairoEvents = global.pairoEvents;
}

export default pairoEvents;
