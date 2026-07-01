import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import CustomizationRequest from "@/models/CustomizationRequest";
import { NextResponse } from "next/server";

// GET /api/admin/customization-requests
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page   = parseInt(searchParams.get("page")   || "1");
  const limit  = parseInt(searchParams.get("limit")  || "20");
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";
  const skip   = (page - 1) * limit;

  const query = { isDeleted: false };
  if (status !== "all") query.status = status;
  if (search) {
    query.$or = [
      { "customer.name": { $regex: search, $options: "i" } },
      { "customer.email": { $regex: search, $options: "i" } },
      { "product.name": { $regex: search, $options: "i" } },
      { requestNumber: { $regex: search, $options: "i" } }
    ];
  }

  const [items, total] = await Promise.all([
    CustomizationRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CustomizationRequest.countDocuments(query)
  ]);

  return NextResponse.json({
    success: true,
    requests: items,
    pagination: { total, pages: Math.ceil(total / limit), currentPage: page }
  });
}

// PATCH /api/admin/customization-requests?id=xxx
export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const body = await req.json();
  const { status, adminNote } = body;

  const update = {};
  if (status) update.status = status;

  const doc = await CustomizationRequest.findByIdAndUpdate(
    id,
    {
      ...(status ? { status } : {}),
      ...(adminNote ? { $push: { adminNotes: { content: adminNote } } } : {})
    },
    { new: true }
  );

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, request: doc });
}
