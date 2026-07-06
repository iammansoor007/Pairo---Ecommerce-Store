import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmailVerification } from "@/lib/email";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    console.log("[Signup] 🚀 Starting registration process...");

    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json({
        message: "Database connection error",
        error: "Database configuration is missing in environment variables."
      }, { status: 500 });
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check existing
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      // If they exist but never verified, resend the verification email
      if (!existingCustomer.emailVerified) {
        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        existingCustomer.verificationToken = token;
        existingCustomer.verificationTokenExpiry = expiry;
        await existingCustomer.save();

        const siteUrl = process.env.NEXTAUTH_URL || "https://pairolifestyle.com";
        const verificationUrl = `${siteUrl}/verify-email?token=${token}`;
        try {
          await sendEmailVerification(email, name, verificationUrl);
          return NextResponse.json({
            message: "Verification email resent. Please check your inbox.",
            resent: true
          }, { status: 200 });
        } catch (emailError) {
          console.error("[Signup] ⚠️ Failed to resend verification email:", emailError);
          // Fallback: auto-verify existing customer so they can log in
          existingCustomer.emailVerified = true;
          existingCustomer.verificationToken = null;
          existingCustomer.verificationTokenExpiry = null;
          await existingCustomer.save();
          console.log(`[Signup] 🛡️ Existing customer auto-verified due to resend email failure: ${existingCustomer._id}`);
          return NextResponse.json({
            message: "Account verified and ready to use!",
            resent: false,
            verified: true
          }, { status: 200 });
        }
      }
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Create unverified customer
    const customer = await Customer.create({
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });
    console.log(`[Signup] ✨ Customer created (unverified): ${customer._id}`);

    // Send verification email
    const siteUrl = process.env.NEXTAUTH_URL || "https://pairolifestyle.com";
    const verificationUrl = `${siteUrl}/verify-email?token=${verificationToken}`;
    try {
      await sendEmailVerification(email, name, verificationUrl);
      console.log(`[Signup] ✅ Verification email dispatched to ${email}`);
      return NextResponse.json({
        message: "Account created. Please check your email to verify your account.",
        pendingVerification: true
      }, { status: 201 });
    } catch (emailError) {
      console.error("[Signup] ⚠️ Failed to send verification email:", emailError);
      // Fallback: auto-verify customer so they are not locked out due to SMTP failure
      customer.emailVerified = true;
      customer.verificationToken = null;
      customer.verificationTokenExpiry = null;
      await customer.save();
      console.log(`[Signup] 🛡️ Customer auto-verified due to email delivery failure: ${customer._id}`);
      return NextResponse.json({
        message: "Account created successfully!",
        pendingVerification: false
      }, { status: 201 });
    }

  } catch (error) {
    console.error("[Signup] ❌ CRITICAL ERROR:", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
    }, { status: 500 });
  }
}
