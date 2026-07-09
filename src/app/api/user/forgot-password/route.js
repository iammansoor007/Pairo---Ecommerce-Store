import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import { sendCustomerPasswordReset } from "@/lib/email";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  await dbConnect();
  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const customer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    });

    // Always return success to prevent email enumeration
    if (!customer) {
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    if (!customer.emailVerified) {
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    // Generate secure reset token (32 bytes = 64 hex chars)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Store hashed token + 1 hour expiry
    customer.resetPasswordToken = hashedToken;
    customer.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await customer.save({ validateBeforeSave: false });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(customer.email)}`;

    try {
      await sendCustomerPasswordReset(customer.email, customer.name, resetUrl);
    } catch (mailErr) {
      customer.resetPasswordToken = undefined;
      customer.resetPasswordExpires = undefined;
      await customer.save({ validateBeforeSave: false });
      console.error("[CustomerForgotPassword] Email send failed:", mailErr.message);
      return NextResponse.json({ error: "Failed to send reset email. Please try again." }, { status: 500 });
    }

    console.log(`[CustomerForgotPassword] Reset link sent to ${customer.email}`);
    return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });

  } catch (error) {
    console.error("[CustomerForgotPassword Error]", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
