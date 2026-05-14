import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { can } from "@/lib/rbac";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.isStaff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!can(session.user, "customers.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  try {
    const customers = await Customer.find({ role: { $ne: "admin" } }).select('-password').sort({ createdAt: -1 }).lean();
    
    // Enrich customers with real order stats from Order collection
    const enrichedCustomers = await Promise.all(customers.map(async (customer) => {
        const orders = await Order.find({ "customer.userId": customer._id }).lean();
        return {
            ...customer,
            orderCount: orders.length,
            totalSpent: orders.reduce((sum, o) => sum + (o.financials?.total || 0), 0),
            lastOrderDate: orders[0]?.createdAt || null
        };
    }));

    return NextResponse.json(enrichedCustomers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
