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

    // 1. Try to find customer with signup verification token
    let customer = await Customer.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (customer) {
      customer.emailVerified = true;
      customer.verificationToken = null;
      customer.verificationTokenExpiry = null;
      await customer.save();
      console.log(`[VerifyEmail] ✅ Initial email verified for: ${customer.email}`);
      return NextResponse.json({ message: "Email verified successfully!" }, { status: 200 });
    }

    // 2. Try to find customer with email-change verification token
    customer = await Customer.findOne({
      pendingEmailToken: token,
      pendingEmailTokenExpiry: { $gt: new Date() },
    });

    if (customer) {
      const newEmail = customer.pendingEmail;
      
      // Ensure the pending email wasn't taken by another account in the meantime
      const emailExists = await Customer.findOne({ email: newEmail, _id: { $ne: customer._id } });
      if (emailExists) {
        return NextResponse.json({
          message: "The new email address is already in use by another account."
        }, { status: 400 });
      }

      customer.email = newEmail;
      customer.pendingEmail = null;
      customer.pendingEmailToken = null;
      customer.pendingEmailTokenExpiry = null;
      await customer.save();

      console.log(`[VerifyEmail] ✅ Email changed and verified to: ${newEmail}`);
      return NextResponse.json({ message: "Email changed and verified successfully!" }, { status: 200 });
    }

    return NextResponse.json({
      message: "This verification link is invalid or has expired."
    }, { status: 400 });

  } catch (error) {
    console.error("[VerifyEmail] ❌ Error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
