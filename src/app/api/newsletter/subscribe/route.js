import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Submission from "@/models/Submission";

export async function POST(req) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if this email already has a newsletter submission
    const existing = await Submission.findOne({
      email: cleanEmail,
      sourceForm: 'Email Subscriber',
      isDeleted: false,
    });

    if (existing) {
      return NextResponse.json({ message: "You're already subscribed! Thank you." });
    }

    await Submission.create({
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      message: 'Newsletter subscription',
      sourceForm: 'Email Subscriber',
      sourcePage: 'Footer',
      status: 'Read',
      priority: 'Low',
    });

    return NextResponse.json({ message: "You're now on the list. Welcome!" }, { status: 201 });
  } catch (error) {
    console.error("[Newsletter Subscribe]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
