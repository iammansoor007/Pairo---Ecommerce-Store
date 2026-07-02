import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import ProductQuestion from "@/models/ProductQuestion";
import { can } from "@/lib/rbac";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!can(session.user, "products.view") && !can(session.user, "reviews.view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    
    // Filters
    const status = searchParams.get("status"); // Pending, Approved, Hidden, All, Trash
    const search = searchParams.get("search");
    const productId = searchParams.get("productId");

    await dbConnect();

    const query = { isDeleted: { $ne: true } };

    if (status && status !== "All") {
      query.status = status;
    }
    if (productId && mongoose.isValidObjectId(productId)) {
      query.productId = new mongoose.Types.ObjectId(productId);
    }
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { question: { $regex: search, $options: "i" } }
      ];
    }

    const total = await ProductQuestion.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const questions = await ProductQuestion.find(query)
      .populate({
        path: "productId",
        select: "name slug image images"
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const [pendingCount, approvedCount, hiddenCount] = await Promise.all([
      ProductQuestion.countDocuments({ status: "Pending", isDeleted: { $ne: true } }),
      ProductQuestion.countDocuments({ status: "Approved", isDeleted: { $ne: true } }),
      ProductQuestion.countDocuments({ status: "Hidden", isDeleted: { $ne: true } })
    ]);

    return NextResponse.json({
      questions,
      pagination: {
        total,
        page,
        limit,
        totalPages
      },
      stats: {
        pendingCount,
        approvedCount,
        hiddenCount
      }
    });
  } catch (error) {
    console.error("GET Product Questions Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
