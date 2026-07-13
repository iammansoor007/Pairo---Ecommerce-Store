import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CustomJacketInquiry from "@/models/CustomJacketInquiry";
import { sendCustomJacketConfirmation, sendCustomJacketAdminNotification } from "@/lib/email";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      firstName, lastName, email, phone, country, city,
      jacketType, gender, preferredLeather, preferredColor, size,
      budget, deadline, referenceImages, additionalNotes
    } = body;

    // Required field validation
    if (!firstName?.trim()) return NextResponse.json({ error: "First name is required" }, { status: 400 });
    if (!lastName?.trim()) return NextResponse.json({ error: "Last name is required" }, { status: 400 });
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!phone?.trim()) return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    if (!jacketType?.trim()) return NextResponse.json({ error: "Jacket type is required" }, { status: 400 });
    if (!preferredLeather?.trim()) return NextResponse.json({ error: "Preferred leather is required" }, { status: 400 });

    // Capture IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "";

    const inquiry = await CustomJacketInquiry.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      country: country?.trim() || "",
      city: city?.trim() || "",
      jacketType: jacketType.trim(),
      gender: gender || "",
      preferredLeather: preferredLeather.trim(),
      preferredColor: preferredColor?.trim() || "",
      size: size || "",
      budget: budget || "",
      deadline: deadline?.trim() || "",
      referenceImages: Array.isArray(referenceImages) ? referenceImages : [],
      additionalNotes: additionalNotes?.trim() || "",
      ipAddress,
      userAgent,
      tenantId: "DEFAULT_STORE"
    });

    // Send emails (non-blocking — don't fail the request if email fails)
    Promise.all([
      sendCustomJacketConfirmation(email, firstName, inquiry.toObject()),
      sendCustomJacketAdminNotification(inquiry.toObject())
    ]).catch(err => console.error("[CustomJacket Email Error]", err.message));

    return NextResponse.json({ success: true, id: inquiry._id }, { status: 201 });
  } catch (err) {
    console.error("[CustomJacketInquiry POST Error]", err);
    return NextResponse.json({ error: "Failed to submit inquiry. Please try again." }, { status: 500 });
  }
}
