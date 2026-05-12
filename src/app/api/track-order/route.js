import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const orderNumber = searchParams.get("orderNumber");

    if (!email || !orderNumber) {
      return NextResponse.json({ error: "Email and Order Number are required" }, { status: 400 });
    }

    const order = await Order.findOne({ 
      orderNumber: orderNumber.trim(), 
      "customer.email": email.trim().toLowerCase() 
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order._id 
    });

  } catch (error) {
    console.error("Track Order Fetch Error:", error);
    return NextResponse.json({ error: "Failed to track order" }, { status: 500 });
  }
}
