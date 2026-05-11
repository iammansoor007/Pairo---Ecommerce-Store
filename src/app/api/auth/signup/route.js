import { NextResponse } from "next-auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    return Response.json({ message: "User created", user: { id: user._id, name, email } }, { status: 201 });
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
