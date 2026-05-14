import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn(`[Signup] ⚠️ User already exists: ${email}`);
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
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

    // 5. Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });
    console.log(`[Signup] ✨ User created successfully: ${user._id}`);

    return NextResponse.json({ 
      message: "User created", 
      user: { id: user._id, name, email } 
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
