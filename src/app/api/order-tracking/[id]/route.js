import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    // Public access by ID (hard to guess)
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // We only return safe info for public view
    const safeOrder = {
      orderNumber: order.orderNumber,
      status: order.status,
      items: order.items,
      financials: order.financials,
      shippingAddress: order.shippingAddress,
      timeline: order.timeline,
      createdAt: order.createdAt
    };

    return NextResponse.json({ success: true, order: safeOrder });

  } catch (error) {
    console.error("Order Tracking Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
  }
}
