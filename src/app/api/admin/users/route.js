import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select('-password').sort({ createdAt: -1 }).lean();
    
    // Enrich users with real order stats from Order collection
    const enrichedUsers = await Promise.all(users.map(async (user) => {
        const orders = await Order.find({ "customer.userId": user._id }).lean();
        return {
            ...user,
            orderCount: orders.length,
            totalSpent: orders.reduce((sum, o) => sum + (o.financials?.total || 0), 0),
            lastOrderDate: orders[0]?.createdAt || null
        };
    }));

    return NextResponse.json(enrichedUsers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
