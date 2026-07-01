import dbConnect from "@/lib/db";
import CustomizationRequest from "@/models/CustomizationRequest";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const { customer, product, customizations, additionalNotes } = body;

    if (!customer?.name || !customer?.email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    // Generate request number
    const count = await CustomizationRequest.countDocuments();
    const requestNumber = `CR-${1000 + count + 1}`;

    const doc = await CustomizationRequest.create({
      requestNumber,
      customer,
      product,
      customizations,
      additionalNotes,
      status: "New"
    });

    return NextResponse.json({ success: true, requestNumber: doc.requestNumber }, { status: 201 });
  } catch (err) {
    console.error("[CustomizationRequest POST]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
