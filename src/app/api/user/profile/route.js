import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await dbConnect();
    
    // Fetch Customer
    const customer = await Customer.findById(session.user.id).select("-password").lean();
    if (!customer) return NextResponse.json({ message: "Customer not found" }, { status: 404 });

    // Fetch Orders from Order collection (Live data)
    const orders = await Order.find({ 
      "customer.userId": session.user.id,
      tenantId: 'DEFAULT_STORE' // or dynamic tenantId
    }).sort({ createdAt: -1 }).lean();

    // Merge for compatibility with frontend
    const profileData = {
      ...customer,
      orderHistory: orders.map(o => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        total: o.financials.total,
        date: o.createdAt,
        status: o.status,
        items: o.items
      }))
    };

    return NextResponse.json(profileData);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { action, data } = body;
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    switch (action) {
      case "updateInfo":
        user.name = data.name || user.name;
        user.email = data.email || user.email;
        break;
      case "addAddress":
        if (data.isDefault) user.addresses.forEach(a => a.isDefault = false);
        user.addresses.push(data);
        break;
      case "deleteAddress":
        user.addresses = user.addresses.filter(a => a._id.toString() !== data.id);
        break;
      case "addPayment":
        if (data.isDefault) user.paymentMethods.forEach(p => p.isDefault = false);
        user.paymentMethods.push(data);
        break;
      case "deletePayment":
        user.paymentMethods = user.paymentMethods.filter(p => p._id.toString() !== data.id);
        break;
      case "deleteAccount":
        await Customer.findByIdAndDelete(session.user.id);
        return NextResponse.json({ message: "Account deleted" });
      case "cancelOrder": {
        const order = await Order.findOne({ _id: data.orderId, "customer.userId": session.user.id });
        if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
        
        // Cancellation Logic: Only if not already shipped/packed
        const cancellableStatuses = ['Pending', 'Confirmed', 'Processing'];
        if (!cancellableStatuses.includes(order.status)) {
          return NextResponse.json({ message: `Cannot cancel order with status: ${order.status}` }, { status: 400 });
        }

        const oldStatus = order.status;
        order.status = 'Cancelled';
        order.timeline.push({
          status: 'Cancelled',
          message: 'Order cancelled by customer',
          source: 'Customer'
        });
        await order.save();
        
        // Dispatch event for listeners (like email)
        const pairoEvents = (await import("@/lib/events")).default;
        pairoEvents.dispatch('ORDER_CANCELLED', order);
        
        return NextResponse.json({ message: "Order cancelled successfully" });
      }
      default:
        return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }
    await user.save();
    return NextResponse.json({ message: "Profile updated successfully", user });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
