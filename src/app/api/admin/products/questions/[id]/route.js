import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import ProductQuestion from "@/models/ProductQuestion";
import Product from "@/models/Product";
import { can } from "@/lib/rbac";
import { sendQuestionReplyEmail } from "@/lib/email";
import { logAction } from "@/lib/audit";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!can(session.user, "products.edit") && !can(session.user, "reviews.moderate")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await req.json();
    const { action, status, replyText } = body;

    await dbConnect();
    const question = await ProductQuestion.findById(id).populate("productId");
    if (!question || question.isDeleted) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (action === "toggle_status") {
      question.status = status;
      await question.save();

      await logAction({
        userId: session.user.id,
        action: "TOGGLE_QUESTION_STATUS",
        targetType: "ProductQuestion",
        targetId: question._id,
        details: { status }
      });

      return NextResponse.json(question);
    }

    if (action === "reply") {
      if (!replyText || replyText.trim() === "") {
        return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
      }

      // Add reply to array
      question.replies.push({
        staffId: session.user.id,
        staffName: session.user.name || "Store Administrator",
        answer: replyText
      });
      
      // Auto-approve the question when replying
      question.status = "Approved";
      await question.save();

      // Send email to customer
      const product = question.productId;
      if (product) {
        await sendQuestionReplyEmail({
          customerEmail: question.customerEmail,
          customerName: question.customerName,
          originalQuestion: question.question,
          replyText: replyText,
          productName: product.name,
          productSlug: product.slug
        });
      }

      await logAction({
        userId: session.user.id,
        action: "REPLY_PRODUCT_QUESTION",
        targetType: "ProductQuestion",
        targetId: question._id,
        details: { replyText }
      });

      return NextResponse.json(question);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PUT Admin Product Question Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!can(session.user, "products.delete") && !can(session.user, "reviews.delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await dbConnect();
    const question = await ProductQuestion.findById(id);
    if (!question || question.isDeleted) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    question.isDeleted = true;
    await question.save();

    await logAction({
      userId: session.user.id,
      action: "DELETE_PRODUCT_QUESTION",
      targetType: "ProductQuestion",
      targetId: id
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Admin Product Question Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
