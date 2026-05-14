import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
    console.log("🚀 Starting Index Migration...");
    await mongoose.connect(MONGODB_URI);
    
    try {
        await mongoose.connection.collection('promotions').dropIndex('code_1');
        console.log("✅ Dropped legacy 'code_1' unique index.");
    } catch (e) {
        console.log("ℹ️ Index 'code_1' not found or already dropped.");
    }

    try {
        await mongoose.connection.collection('orders').dropIndex('orderNumber_1');
        console.log("✅ Dropped legacy 'orderNumber_1' unique index.");
    } catch (e) {
        console.log("ℹ️ Index 'orderNumber_1' not found or already dropped.");
    }

    try {
        await mongoose.connection.collection('orders').dropIndex('idempotencyKey_1');
        console.log("✅ Dropped legacy 'idempotencyKey_1' unique index.");
    } catch (e) {
        console.log("ℹ️ Index 'idempotencyKey_1' not found or already dropped.");
    }

    try {
        await mongoose.connection.collection('products').dropIndex('slug_1');
        console.log("✅ Dropped legacy 'slug_1' unique index.");
    } catch (e) {
        console.log("ℹ️ Index 'slug_1' not found or already dropped.");
    }

    console.log("🚀 Migration Complete. Re-syncing indexes...");
    // Mongoose will recreate indexes based on the model definitions
    await mongoose.connection.syncIndexes();
    console.log("✅ Indexes synchronized.");
    
    await mongoose.connection.close();
    process.exit(0);
}

migrate();
