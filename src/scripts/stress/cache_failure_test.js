import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import dbConnect from '../../lib/db.js';
import Loader from '../../lib/promotionEngine/Loader.js';
import Promotion from '../../models/Promotion.js';

// We mock the cache to simulate failure
import { cache } from '../../lib/cache.js';

async function runCacheFailureTest() {
    console.log("\n🚀 [STRESS:CACHE] Starting Redis Fail-Open Verification...");
    await dbConnect();

    // 1. SETUP: Create a promo to load
    try {
        await Promotion.create({
            title: "Cache Failure Test Promo",
            isAutomatic: true,
            adminStatus: "Active",
            priority: 100
        });
    } catch (e) {
        console.error(`  ❌ [SETUP] Failed to create promo: ${e.message}`);
    }

    const dbCount = await Promotion.countDocuments({ adminStatus: 'Active', isAutomatic: true });
    console.log(`[SETUP] Active Promos in DB: ${dbCount}`);

    // 2. SIMULATE REDIS OUTAGE
    // We override the cache.get to throw an error
    const originalGet = cache.get;
    cache.get = async () => { 
        console.log("  ⚠️ [SIM] Redis GET failing...");
        throw new Error("REDIS_CONNECTION_REFUSED"); 
    };

    console.log("[SIM] Attempting to load promotions during Redis outage...");

    try {
        const start = Date.now();
        const promotions = await Loader.loadPromotions();
        const duration = Date.now() - start;

        console.log(`[SIM] Success! Loaded ${promotions.length} promotions in ${duration}ms via Fallback.`);

        // 3. VERIFY
        if (promotions.length > 0) {
            console.log("\n✅ [STATUS] REDIS FAIL-OPEN VERIFIED: ENGINE SURVIVED OUTAGE.");
        } else {
            console.log("\n❌ [STATUS] FAIL-OPEN FAILURE: NO PROMOTIONS LOADED.");
        }
    } catch (err) {
        console.log(`\n❌ [STATUS] CRITICAL FAILURE: ENGINE CRASHED DURING OUTAGE: ${err.message}`);
    }

    // Restore
    cache.get = originalGet;
    await Promotion.deleteMany({ title: "Cache Failure Test Promo" });
    await mongoose.connection.close();
    process.exit(0);
}

runCacheFailureTest();
