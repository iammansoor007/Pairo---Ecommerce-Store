import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json({ success: true, order });

  } catch (error) {
    return NextResponse.json({ error: "Fetch error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, adminNotes, timelineMessage } = await req.json();
    const order = await Order.findById(id);

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const oldStatus = order.status;
    
    // Prevent invalid transitions if order is already delivered/cancelled (Optional strict check)
    if (oldStatus === "Cancelled" && status !== "Cancelled") {
      // Logic for re-activating a cancelled order if needed, but for now we keep it strict
    }

    // 1. If status is changing to Cancelled, revert stock ONLY if it wasn't already cancelled
    if (status === "Cancelled" && oldStatus !== "Cancelled") {
      for (const item of order.items) {
        if (item.selectedVariant?.title && item.selectedVariant.title !== "Standard") {
           await Product.updateOne(
              { _id: item.productId, "variantCombinations.title": item.selectedVariant.title },
              { $inc: { "variantCombinations.$.stock": item.quantity, "stock": item.quantity } }
           );
        } else {
           await Product.updateOne(
              { _id: item.productId },
              { $inc: { stock: item.quantity } }
           );
        }
      }
    }

    // 2. Update Order
    if (status) order.status = status;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;
    
    // 3. Add to Timeline
    if (status && status !== oldStatus) {
      order.timeline.push({
        status: status,
        message: timelineMessage || `Order status updated from ${oldStatus} to ${status}.`,
        source: "Admin",
        adminUser: session.user.id
      });
    } else if (timelineMessage) {
      order.timeline.push({
        status: order.status,
        message: timelineMessage,
        source: "Admin",
        adminUser: session.user.id
      });
    }

    await order.save();

    return NextResponse.json({ success: true, order });

  } catch (error) {
    console.error("Order Update Error:", error);
    return NextResponse.json({ error: "Update failed: " + error.message }, { status: 500 });
  }
}
