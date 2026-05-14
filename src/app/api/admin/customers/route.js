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
    // 1. Fetch all customers (excluding admins if any)
    const customers = await Customer.find({ role: { $ne: "admin" } })
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();
    
    if (!customers || customers.length === 0) {
        return NextResponse.json([]);
    }

    // 2. Enrich customers with real order stats
    const enrichedCustomers = await Promise.all(customers.map(async (customer) => {
        try {
            // Find orders for this specific customer
            const orders = await Order.find({ "customer.userId": customer._id }).sort({ createdAt: -1 }).lean();
            
            return {
                ...customer,
                orderCount: orders.length,
                totalSpent: orders.reduce((sum, o) => sum + (o.financials?.total || 0), 0),
                lastOrderDate: orders[0]?.createdAt || null
            };
        } catch (e) {
            console.error(`Error enriching customer ${customer.email}:`, e.message);
            return { ...customer, orderCount: 0, totalSpent: 0, lastOrderDate: null };
        }
    }));

    return NextResponse.json(enrichedCustomers);
  } catch (error) {
    console.error("[Customer API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
