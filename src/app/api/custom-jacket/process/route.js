import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CustomJacketInquiry from "@/models/CustomJacketInquiry";

/**
 * Public GET - returns process steps for the Custom Jacket page.
 * Currently backed by the ProductProcess model via admin management,
 * or returns empty array if none exist.
 */
export async function GET() {
  try {
    await dbConnect();
    // We fetch from CustomJacketProcess concept — 
    // For now return empty and let the component use its defaults.
    // Admin creates process items via /admin/custom-jacket-process 
    // which we'll implement as a dedicated model in admin.
    return NextResponse.json([]);
  } catch (err) {
    return NextResponse.json([]);
  }
}
