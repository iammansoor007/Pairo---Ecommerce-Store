import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import dbConnect from '../../lib/db.js';
import Loader from '../../lib/promotionEngine/Loader.js';
import Engine from '../../lib/promotionEngine/Engine.js';
import Promotion from '../../models/Promotion.js';
import ConditionEvaluator from '../../lib/promotionEngine/ConditionEvaluator.js';

async function runSaaSIsolationTest() {
    console.log("\n🚀 [STRESS:SAAS] Starting SaaS Isolation & Safety Verification...");
    await dbConnect();

    // 1. SETUP: Create identical codes for different tenants
    const tenantA = "STORE_A";
    const tenantB = "STORE_B";

    await Promotion.deleteMany({ tenantId: { $in: [tenantA, tenantB] } });

    await Promotion.create({
        tenantId: tenantA,
        title: "Store A Promo",
        code: "WELCOME10",
        isAutomatic: false,
        adminStatus: "Active",
        actions: [{ type: "percentage_discount", value: 10 }]
    });

    await Promotion.create({
        tenantId: tenantB,
        title: "Store B Promo",
        code: "WELCOME10", 
        isAutomatic: false,
        adminStatus: "Active",
        actions: [{ type: "percentage_discount", value: 20 }]
    });

    console.log("[SETUP] Two tenants created with identical code 'WELCOME10'");

    // 2. TEST ISOLATION
    console.log("[SIM] Evaluating for Tenant A...");
    const resA = await Loader.loadPromotions(["WELCOME10"], tenantA);
    const valA = resA[0]?.actions[0]?.value;
    
    console.log("[SIM] Evaluating for Tenant B...");
    const resB = await Loader.loadPromotions(["WELCOME10"], tenantB);
    const valB = resB[0]?.actions[0]?.value;

    console.log(`[RESULTS] Tenant A Value: ${valA}%, Tenant B Value: ${valB}%`);

    const isIsolated = (valA === 10 && valB === 20 && resA[0].tenantId === tenantA && resB[0].tenantId === tenantB);

    if (isIsolated) {
        console.log("✅ [STATUS] TENANT ISOLATION VERIFIED.");
    } else {
        console.log("❌ [STATUS] ISOLATION FAILURE: DATA LEAKAGE DETECTED!");
    }

    // 3. TEST SAFETY TIMEOUT
    console.log("\n[SIM] Testing Evaluation Safety Timeout (50ms limit)...");
    
    const originalEval = ConditionEvaluator.evaluate;
    ConditionEvaluator.evaluate = () => {
        const start = Date.now();
        while (Date.now() - start < 200) { /* Busy wait 200ms */ }
        return { isEligible: true };
    };

    const cart = { subtotal: 1000, items: [] };
    const start = Date.now();
    const result = await Engine.evaluate(cart, { tenantId: tenantA });
    const duration = Date.now() - start;

    console.log(`[RESULTS] Evaluation returned in ${duration}ms (Applied Promos: ${result.appliedPromotions.length})`);

    // We expect the result to be 0 discount (fallback) and duration to be around 50-70ms
    if (duration < 150 && result.appliedPromotions.length === 0) {
        console.log("✅ [STATUS] SAFETY TIMEOUT VERIFIED: Evaluation killed correctly.");
    } else {
        console.log("❌ [STATUS] TIMEOUT FAILURE: Engine allowed runaway evaluation.");
    }

    // Cleanup
    ConditionEvaluator.evaluate = originalEval;
    await Promotion.deleteMany({ tenantId: { $in: [tenantA, tenantB] } });
    await mongoose.connection.close();
    process.exit(0);
}

runSaaSIsolationTest();
