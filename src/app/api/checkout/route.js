import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Discount from "@/models/Discount";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pairoEvents from "@/lib/events";

export async function POST(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { items, shippingAddress, financials, customerEmail, customerNote, idempotencyKey } = body;

    // 1. Idempotency Check (Duplicate Order Prevention)
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      if (existingOrder) {
        return NextResponse.json({ 
          success: true, 
          orderNumber: existingOrder.orderNumber,
          orderId: existingOrder._id,
          message: "Existing order retrieved"
        });
      }
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 2. Validate Coupon (Safety Layer)
    if (financials.promoCode) {
      const coupon = await Discount.findOne({ code: financials.promoCode, isActive: true });
      if (coupon) {
        // Check per-user limit
        if (session) {
          const userUsage = await Order.countDocuments({ 
            "customer.userId": session.user.id, 
            "financials.promoCode": financials.promoCode,
            status: { $ne: 'Cancelled' }
          });
          if (userUsage >= coupon.usagePerUserLimit) {
            throw new Error(`You have already used the code ${financials.promoCode}`);
          }
        }
        // Increment usage count atomically
        await Discount.updateOne({ _id: coupon._id }, { $inc: { usageCount: 1 } });
      }
    }

    // 3. Prepare Items & Inventory
    const orderItems = [];
    for (const item of items) {
      let product = await Product.findById(item.id || item._id);
      if (!product && item.id) product = await Product.findOne({ id: item.id });

      if (!product) continue;

      if (product.manageStock) {
        const variantTitle = item.selectedOptions ? Object.values(item.selectedOptions).join(" / ") : "Standard";
        
        // Atomic deduction with safety
        let updateQuery = { _id: product._id, stock: { $gte: item.quantity } };
        let updateOp = { $inc: { stock: -item.quantity } };

        if (variantTitle !== "Standard") {
          updateQuery = { 
            _id: product._id, 
            "variantCombinations.title": variantTitle,
            "variantCombinations.stock": { $gte: item.quantity } 
          };
          updateOp = { 
            $inc: { 
              "variantCombinations.$.stock": -item.quantity,
              "stock": -item.quantity 
            } 
          };
        }

        const res = await Product.updateOne(updateQuery, updateOp);
        if (res.modifiedCount === 0) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        sku: item.sku || product.sku,
        image: item.image || product.image,
        priceAtPurchase: item.price,
        quantity: item.quantity,
        selectedVariant: {
          title: item.selectedOptions ? Object.values(item.selectedOptions).join(" / ") : "Standard",
          options: item.selectedOptions || {}
        }
      });
    }

    // 4. Create Order
    const count = await Order.countDocuments();
    const orderNumber = `PAI-${1000 + count + 1}`;

    const newOrder = await Order.create({
      orderNumber,
      idempotencyKey,
      status: "Confirmed",
      items: orderItems,
      financials: {
        ...financials,
        currency: "USD"
      },
      customer: {
        userId: session?.user?.id || null,
        email: customerEmail || session?.user?.email || shippingAddress?.email,
        isGuest: !session,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown"
      },
      shippingAddress,
      customerNote,
      timeline: [{
        status: "Confirmed",
        message: "Order placed successfully. Inventory secured.",
        source: "System"
      }]
    });

    // 5. Dispatch Event (Asynchronous side-effects)
    pairoEvents.dispatch('ORDER_CREATED', newOrder);

    return NextResponse.json({ 
      success: true, 
      orderNumber: newOrder.orderNumber,
      orderId: newOrder._id 
    });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
