import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { rateLimit } from '../../lib/rateLimit.js';
import { cache } from '../../lib/cache.js';

async function runRateLimitTest() {
    console.log("\n🚀 [STRESS:SECURITY] Starting Rate Limiter Logic Verification (Mocked Cache)...");

    // MOCK CACHE STORAGE
    const mockStore = {};
    cache.get = async (k) => mockStore[k] || null;
    cache.set = async (k, v) => { mockStore[k] = v; return true; };

    const testKey = `IP:127.0.0.1:COUPON:EXPLOIT`;
    const limit = 5;
    const window = 60;

    console.log(`[SIM] Firing 10 attempts (Limit: ${limit})...`);

    let allowed = 0;
    let blocked = 0;

    for (let i = 1; i <= 10; i++) {
        const result = await rateLimit(testKey, limit, window);
        if (result.success) {
            allowed++;
            console.log(`  - Attempt ${i}: ALLOWED (Remaining: ${result.remaining})`);
        } else {
            blocked++;
            console.log(`  - Attempt ${i}: BLOCKED`);
        }
    }

    console.log("\n📊 [STRESS:RESULTS]");
    console.log(`Allowed: ${allowed}`);
    console.log(`Blocked: ${blocked}`);

    if (allowed === 5 && blocked === 5) {
        console.log("\n✅ [STATUS] RATE LIMITER LOGIC VERIFIED.");
    } else {
        console.log("\n❌ [STATUS] RATE LIMITER FAILURE.");
    }

    process.exit(0);
}

runRateLimitTest();
