import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await dbConnect();
  try {
    const { token, email, password } = await req.json().catch(() => ({}));

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Token, email, and new password are required." }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const customer = await Customer.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!customer) {
      return NextResponse.json({ error: "This reset link is invalid or has expired. Please request a new one." }, { status: 400 });
    }

    const saltRounds = 12;
    customer.password = await bcrypt.hash(password, saltRounds);
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save({ validateBeforeSave: false });

    console.log(`[CustomerResetPassword] Password reset successfully for ${customer.email}`);
    return NextResponse.json({ success: true, message: "Your password has been reset. You can now sign in." });

  } catch (error) {
    console.error("[CustomerResetPassword Error]", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
