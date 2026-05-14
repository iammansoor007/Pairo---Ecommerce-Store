const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function seedCustomers() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!");

    const Customer = mongoose.connection.collection('customers');
    
    // Clear existing to be clean (WARNING: This deletes Atlas data in the customers collection)
    // If you want to keep data, comment out the line below.
    // await Customer.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const dummyCustomers = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: hashedPassword,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: hashedPassword,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        password: hashedPassword,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    console.log("Inserting dummy customers...");
    await Customer.insertMany(dummyCustomers);
    console.log("✅ Successfully seeded 3 dummy customers into Atlas.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seedCustomers();
