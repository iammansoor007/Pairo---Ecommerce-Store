import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import bcrypt from "bcryptjs";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    console.log("[Signup] 🚀 Starting registration process...");
    
    // 1. Validate DB Connection
    const conn = await dbConnect();
    if (!conn) {
      console.error("[Signup] ❌ Database connection failed: MONGODB_URI missing or connection refused.");
      return NextResponse.json({ 
        message: "Database connection error", 
        error: "Database configuration is missing in environment variables." 
      }, { status: 500 });
    }
    console.log("[Signup] ✅ DB Connected");

    // 2. Parse Body
    const body = await req.json();
    const { name, email, password } = body;
    console.log(`[Signup] Attempting registration for: ${email}`);

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 3. Check existing
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      console.warn(`[Signup] ⚠️ Customer already exists: ${email}`);
      return NextResponse.json({ message: "Customer already exists" }, { status: 400 });
    }

    // 4. Hash Password
    console.log("[Signup] Hashing password...");
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (hashError) {
      console.error("[Signup] ❌ Hashing failed:", hashError);
      throw new Error("Security module failure: " + hashError.message);
    }
    console.log("[Signup] ✅ Password hashed");

    // 5. Create Customer
    const customer = await Customer.create({
      name,
      email,
      password: hashedPassword
    });
    console.log(`[Signup] ✨ Customer created successfully: ${customer._id}`);

    return NextResponse.json({ 
      message: "Customer created", 
      user: { id: customer._id, name, email } 
    }, { status: 201 });

  } catch (error) {
    console.error("[Signup] ❌ CRITICAL ERROR:", error);
    return NextResponse.json({ 
      message: "Internal server error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
