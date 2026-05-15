import dbConnect from "@/lib/db";
import Submission from "@/models/Submission";
import { checkSpam } from "@/lib/spamProtection";
import { sendAdminOrderNotification } from "@/lib/email"; // I'll add a generic notification or use this
import { NextResponse } from "next/server";

/**
 * POST /api/contact
 * Public endpoint for customer inquiries
 */
export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    
    // 1. Spam Protection
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const spamCheck = checkSpam(data, ip);
    
    if (spamCheck.isSpam) {
      console.warn(`[SPAM BLOCKED] IP: ${ip} | Reason: ${spamCheck.reason}`);
      // Return success to the user to avoid brute force info leakage, but save as Spam
      await Submission.create({
        ...data,
        status: 'Spam',
        internalNotes: [{ content: `AUTO-SPAM: ${spamCheck.reason}` }],
        ipAddress: ip,
        userAgent: req.headers.get("user-agent")
      });
      return NextResponse.json({ success: true, message: "Thank you for your message." });
    }

    // 2. Create Submission
    const submission = await Submission.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      sourceForm: data.sourceForm || 'Contact',
      sourcePage: data.sourcePage || '/contact',
      ipAddress: ip,
      userAgent: req.headers.get("user-agent")
    });

    // 3. TODO: Send Admin Notification (Email)
    // For now, we rely on the dashboard counter

    return NextResponse.json({ 
      success: true, 
      message: "Message received. Our team will contact you shortly." 
    });

  } catch (error) {
    console.error("[CONTACT_SUBMIT_ERROR]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
