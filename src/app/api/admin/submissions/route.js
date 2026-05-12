import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Submission from "@/models/Submission";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  try {
    const submissions = await Submission.find({ isDeleted: false }).sort({ createdAt: -1 });
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
