import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Discount from "@/models/Discount";
import Engine from "@/lib/promotionEngine/Engine";

export async function POST(req) {
  try {
    await dbConnect();
    const { code, cartSubtotal, items = [] } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // 1. Try the new Enterprise Promotion Engine first
    const engineResults = await Engine.evaluate({ subtotal: cartSubtotal, items }, { appliedCodes: [code] });
    
    if (engineResults.appliedPromotions.length > 0) {
      const applied = engineResults.appliedPromotions[0];
      return NextResponse.json({
        success: true,
        code: applied.code,
        type: applied.type,
        value: applied.value,
        discountAmount: applied.discountAmount,
        explanation: applied.explanation,
        isEnterprise: true
      });
    }

    // 2. Fallback to Legacy Discount model for backward compatibility
    const discount = await Discount.findOne({ 
      code: code.toUpperCase(), 
      isActive: true,
      isDeleted: false 
    });

    if (discount) {
        // Check legacy expiry
        if (discount.endDate && new Date() > discount.endDate) {
          return NextResponse.json({ error: "Promo code has expired" }, { status: 400 });
        }
    
        // Check legacy usage limit
        if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
          return NextResponse.json({ error: "Promo code usage limit reached" }, { status: 400 });
        }
    
        // Check legacy min purchase
        if (cartSubtotal < discount.minPurchase) {
          return NextResponse.json({ 
            error: `Minimum purchase of $${discount.minPurchase} required for this code` 
          }, { status: 400 });
        }
    
        let discountAmount = discount.type === 'percentage' 
          ? (cartSubtotal * discount.value) / 100 
          : discount.value;
    
        return NextResponse.json({
          success: true,
          code: discount.code,
          type: discount.type,
          value: discount.value,
          discountAmount: Math.min(discountAmount, cartSubtotal),
          isLegacy: true
        });
    }

    return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 404 });

  } catch (error) {
    console.error("Coupon Validation Error:", error);
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 });
  }
}
