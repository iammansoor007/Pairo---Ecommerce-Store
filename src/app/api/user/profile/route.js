import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const user = await User.findById(session.user.id).select("-password");
    return NextResponse.json(user);
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
        await User.findByIdAndDelete(session.user.id);
        return NextResponse.json({ message: "Account deleted" });
      default:
        return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }
    await user.save();
    return NextResponse.json({ message: "Profile updated successfully", user });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
