import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import dbConnect from '../../lib/db.js';
import Promotion from '../../models/Promotion.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';

/**
 * ATOMIC LOGIC STRESS TEST
 * Objective: Verify that findOneAndUpdate with constraints prevents over-utilization.
 */
async function runAtomicStressTest() {
    console.log("\n🚀 [STRESS:ATOMIC] Starting Atomic Logic Verification...");
    await dbConnect();

    const testPromoId = new mongoose.Types.ObjectId();
    const testProductId = new mongoose.Types.ObjectId();

    // 1. SETUP
    await Promotion.create({
        _id: testPromoId,
        title: "Atomic Stress Test",
        usageLimits: { currentTotalUses: 0, maxTotalUses: 10 },
        adminStatus: "Active"
    });

    await Product.create({
        _id: testProductId,
        name: "Atomic Product",
        price: 100,
        stock: 5, // Small stock to test exhaustion
        manageStock: true
    });

    console.log("[SETUP] Promo Limit: 10, Product Stock: 5");

    // 2. SIMULATE CONCURRENCY (100 attempts)
    const concurrentCount = 100;
    
    // We simulate the exact logic from checkout/route.js
    const simulateCheckoutStep = async (userId) => {
        const session = await mongoose.startSession();
        try {
            let result = { success: false, reason: "" };
            
            await session.withTransaction(async () => {
                // Step A: Reserve Promo
                const promoRes = await Promotion.findOneAndUpdate(
                    { 
                        _id: testPromoId,
                        $or: [
                            { 'usageLimits.maxTotalUses': null },
                            { $expr: { $lt: ['$usageLimits.currentTotalUses', '$usageLimits.maxTotalUses'] } }
                        ]
                    },
                    { $inc: { 'usageLimits.currentTotalUses': 1 } },
                    { session, new: true }
                );

                if (!promoRes) throw new Error("PROMO_EXHAUSTED");

                // Step B: Reserve Inventory
                const invRes = await Product.findOneAndUpdate(
                    { _id: testProductId, stock: { $gte: 1 } },
                    { $inc: { stock: -1 } },
                    { session, new: true }
                );

                if (!invRes) throw new Error("STOCK_EXHAUSTED");

                // Step C: Create Order
                await Order.create([{
                    orderNumber: `TEST-${userId}-${Date.now()}`,
                    items: [{ productId: testProductId, quantity: 1 }]
                }], { session });

                result.success = true;
            });

            return result;
        } catch (err) {
            return { success: false, reason: err.message };
        } finally {
            await session.endSession();
        }
    };

    console.log(`[SIM] Dispatching ${concurrentCount} concurrent atomic transactions...`);
    
    const start = Date.now();
    const results = await Promise.all(
        Array.from({ length: concurrentCount }).map((_, i) => simulateCheckoutStep(i))
    );
    const duration = Date.now() - start;

    // 3. ANALYZE
    const successes = results.filter(r => r.success).length;
    const promoExhausted = results.filter(r => r.reason === "PROMO_EXHAUSTED").length;
    const stockExhausted = results.filter(r => r.reason === "STOCK_EXHAUSTED").length;

    const finalPromo = await Promotion.findById(testPromoId);
    const finalProduct = await Product.findById(testProductId);
    const finalOrders = await Order.countDocuments({ "items.productId": testProductId });

    console.log("\n📊 [STRESS:RESULTS]");
    console.log(`Successes: ${successes}`);
    console.log(`Promo Exhausted: ${promoExhausted}`);
    console.log(`Stock Exhausted: ${stockExhausted}`);
    console.log(`Final Promo Usage: ${finalPromo.usageLimits.currentTotalUses}`);
    console.log(`Final Product Stock: ${finalProduct.stock}`);
    console.log(`Final Order Count: ${finalOrders}`);

    // 4. VERIFY
    // Since stock was 5 and promo was 10, we expect exactly 5 successes
    const isSafe = (successes === 5 && finalPromo.usageLimits.currentTotalUses === 5 && finalProduct.stock === 0 && finalOrders === 5);

    if (isSafe) {
        console.log("\n✅ [STATUS] ATOMIC INTEGRITY VERIFIED: NO LEAKAGE.");
    } else {
        console.log("\n❌ [STATUS] ATOMIC FAILURE: STATE CORRUPTION DETECTED!");
    }

    // Cleanup
    await Promotion.deleteOne({ _id: testPromoId });
    await Product.deleteOne({ _id: testProductId });
    await Order.deleteMany({ "items.productId": testProductId });
    await mongoose.connection.close();
    process.exit(0);
}

runAtomicStressTest();
