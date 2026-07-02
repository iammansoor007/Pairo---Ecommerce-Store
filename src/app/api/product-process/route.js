import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ProductProcess from "@/models/ProductProcess";

export async function GET() {
  try {
    await dbConnect();
    const process = await ProductProcess.findOne({ key: "global" }).lean();
    return NextResponse.json(process || { title: "", subtitle: "", steps: [] });
  } catch (error) {
    console.error("GET Public Product Process Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
