import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import dbConnect from '../../lib/db.js';
import Engine from '../../lib/promotionEngine/Engine.js';
import Promotion from '../../models/Promotion.js';

async function runDeterminismTest() {
    console.log("\n🚀 [STRESS:DETERMINISM] Starting Execution Consistency Verification...");
    await dbConnect();

    // 1. SETUP: Create complex overlapping promos
    await Promotion.deleteMany({ title: /Determinism/ });

    const p1 = await Promotion.create({
        title: "Determinism P1",
        priority: 10,
        type: "automatic",
        adminStatus: "Active",
        actions: [{ type: "percentage_discount", value: 10 }]
    });

    const p2 = await Promotion.create({
        title: "Determinism P2",
        priority: 10, // Same priority
        type: "automatic",
        adminStatus: "Active",
        actions: [{ type: "percentage_discount", value: 10 }] // Same value
    });

    const p3 = await Promotion.create({
        title: "Determinism P3 - Exclusive",
        priority: 5,
        type: "automatic",
        adminStatus: "Active",
        stacking: { isExclusive: true },
        actions: [{ type: "percentage_discount", value: 20 }]
    });

    console.log(`[SETUP] Overlapping Promos Created. IDs: ${p1._id}, ${p2._id}, ${p3._id}`);

    // 2. REPEATED EVALUATION
    const cart = { subtotal: 1000, items: [] };
    const firstResult = await Engine.evaluate(cart);
    const firstPromoIds = firstResult.appliedPromotions.map(p => p.promotionId.toString()).sort().join(',');

    console.log(`[SIM] Initial Result: Total Discount: ${firstResult.discountTotal}, Promos: ${firstPromoIds}`);

    let driftCount = 0;
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
        const result = await Engine.evaluate(cart);
        const currentIds = result.appliedPromotions.map(p => p.promotionId.toString()).sort().join(',');
        
        if (currentIds !== firstPromoIds || result.discountTotal !== firstResult.discountTotal) {
            driftCount++;
            console.log(`❌ DRIFT AT ITERATION ${i}: ${currentIds} (Expected: ${firstPromoIds})`);
        }
    }

    // 3. RESULTS
    console.log("\n📊 [STRESS:RESULTS]");
    console.log(`Iterations: ${iterations}`);
    console.log(`Drift Count: ${driftCount}`);

    if (driftCount === 0) {
        console.log("\n✅ [STATUS] DETERMINISM VERIFIED: 100% CONSISTENT RESULTS.");
    } else {
        console.log("\n❌ [STATUS] DETERMINISM FAILURE: EXECUTION DRIFT DETECTED!");
    }

    await Promotion.deleteMany({ title: /Determinism/ });
    await mongoose.connection.close();
    process.exit(0);
}

runDeterminismTest();
