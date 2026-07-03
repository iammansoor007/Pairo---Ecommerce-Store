import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Missing verification token." }, { status: 400 });
    }

    await dbConnect();

    const customer = await Customer.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }, // not expired
    });

    if (!customer) {
      return NextResponse.json({
        message: "This verification link is invalid or has expired. Please sign up again."
      }, { status: 400 });
    }

    // Mark verified and clear token
    customer.emailVerified = true;
    customer.verificationToken = null;
    customer.verificationTokenExpiry = null;
    await customer.save();

    console.log(`[VerifyEmail] ✅ Email verified for: ${customer.email}`);

    return NextResponse.json({ message: "Email verified successfully!" }, { status: 200 });

  } catch (error) {
    console.error("[VerifyEmail] ❌ Error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
