import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import dbConnect from '../../lib/db.js';
import Promotion from '../../models/Promotion.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';

async function runRollbackTest() {
    console.log("\n🚀 [STRESS:ROLLBACK] Starting Transaction Rollback Verification...");
    await dbConnect();

    const testPromoId = new mongoose.Types.ObjectId();
    const testProductId = new mongoose.Types.ObjectId();

    // 1. SETUP
    await Promotion.create({
        _id: testPromoId,
        title: "Rollback Test",
        usageLimits: { currentTotalUses: 0, maxTotalUses: 10 },
        adminStatus: "Active"
    });

    await Product.create({
        _id: testProductId,
        name: "Rollback Product",
        price: 100,
        stock: 100,
        manageStock: true
    });

    console.log("[SETUP] Initial Promo Usage: 0, Stock: 100");

    // 2. EXECUTE FAILING TRANSACTION
    const session = await mongoose.startSession();
    try {
        console.log("[SIM] Starting transaction with forced failure...");
        await session.withTransaction(async () => {
            // Step A: Reserve Promo
            await Promotion.findOneAndUpdate(
                { _id: testPromoId },
                { $inc: { 'usageLimits.currentTotalUses': 1 } },
                { session, new: true }
            );
            console.log("  - Promo incremented");

            // Step B: Reserve Inventory
            await Product.findOneAndUpdate(
                { _id: testProductId },
                { $inc: { stock: -1 } },
                { session, new: true }
            );
            console.log("  - Inventory decremented");

            // Step C: FORCE CRASH
            console.log("  💥 Triggering artificial crash...");
            throw new Error("SIMULATED_TRANSACTION_FAILURE");
        });
    } catch (err) {
        console.log(`[SIM] Caught expected error: ${err.message}`);
    } finally {
        await session.endSession();
    }

    // 3. VERIFY
    const finalPromo = await Promotion.findById(testPromoId);
    const finalProduct = await Product.findById(testProductId);
    const finalOrders = await Order.countDocuments({ "items.productId": testProductId });

    console.log("\n📊 [STRESS:RESULTS]");
    console.log(`Final Promo Usage: ${finalPromo.usageLimits.currentTotalUses} (Expected: 0)`);
    console.log(`Final Product Stock: ${finalProduct.stock} (Expected: 100)`);
    console.log(`Final Order Count: ${finalOrders} (Expected: 0)`);

    const isRollbackSuccessful = (
        finalPromo.usageLimits.currentTotalUses === 0 && 
        finalProduct.stock === 100 && 
        finalOrders === 0
    );

    if (isRollbackSuccessful) {
        console.log("\n✅ [STATUS] TRANSACTION ROLLBACK VERIFIED: STATE IS CONSISTENT.");
    } else {
        console.log("\n❌ [STATUS] ROLLBACK FAILURE: DATA CORRUPTION DETECTED!");
    }

    // Cleanup
    await Promotion.deleteOne({ _id: testPromoId });
    await Product.deleteOne({ _id: testProductId });
    await mongoose.connection.close();
    process.exit(0);
}

runRollbackTest();
