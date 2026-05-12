import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Discount from "@/models/Discount";

export async function POST(req) {
  try {
    await dbConnect();
    const { code, cartSubtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const discount = await Discount.findOne({ 
      code: code.toUpperCase(), 
      isActive: true,
      isDeleted: false 
    });

    if (!discount) {
      return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 404 });
    }

    // Check expiry
    if (discount.endDate && new Date() > discount.endDate) {
      return NextResponse.json({ error: "Promo code has expired" }, { status: 400 });
    }

    // Check usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return NextResponse.json({ error: "Promo code usage limit reached" }, { status: 400 });
    }

    // Check min purchase
    if (cartSubtotal < discount.minPurchase) {
      return NextResponse.json({ 
        error: `Minimum purchase of $${discount.minPurchase} required for this code` 
      }, { status: 400 });
    }

    // Calculate Discount Amount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (cartSubtotal * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }

    return NextResponse.json({
      success: true,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      discountAmount: Math.min(discountAmount, cartSubtotal) // Can't discount more than subtotal
    });

  } catch (error) {
    console.error("Coupon Validation Error:", error);
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 });
  }
}
