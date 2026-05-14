import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  try {
    const user = await User.findById(id).select("-password").lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch all orders for this user
    const orders = await Order.find({ "customer.userId": id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
        ...user,
        orders: orders.map(o => ({
            ...o,
            id: o._id.toString()
        }))
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
