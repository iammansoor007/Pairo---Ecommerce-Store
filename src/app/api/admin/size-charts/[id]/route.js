import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import SizeChart from "@/models/SizeChart";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { can } from "@/lib/rbac";
import { NextResponse } from "next/server";

// GET: Retrieve a single size chart
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.isStaff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.user, "products.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  await dbConnect();
  try {
    const sizeChart = await SizeChart.findById(id).lean();
    if (!sizeChart || sizeChart.isDeleted) {
      return NextResponse.json({ error: "Size chart not found" }, { status: 404 });
    }
    return NextResponse.json(sizeChart);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update a size chart
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.isStaff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.user, "products.edit")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const data = await req.json();

  await dbConnect();
  try {
    // Check duplicate label (excluding current size chart)
    if (data.label) {
      const existing = await SizeChart.findOne({
        _id: { $ne: id },
        label: data.label,
        isDeleted: { $ne: true }
      }).lean();
      if (existing) {
        return NextResponse.json({ error: "A size chart with this label already exists." }, { status: 400 });
      }
    }

    const oldChart = await SizeChart.findById(id).lean();
    if (!oldChart) {
      return NextResponse.json({ error: "Size chart not found" }, { status: 404 });
    }

    const updatedChart = await SizeChart.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).lean();

    // Check if assignment changed
    const assignmentChanged =
      oldChart.assignmentType !== data.assignmentType ||
      String(oldChart.assignmentTargetId || "") !== String(data.assignmentTargetId || "");

    if (assignmentChanged) {
      // 1. Clean up old assignment
      if (oldChart.assignmentType === "category" && oldChart.assignmentTargetId) {
        await Category.updateOne(
          { _id: oldChart.assignmentTargetId, sizeChart: id },
          { $set: { sizeChart: null } }
        );
      } else if (oldChart.assignmentType === "product" && oldChart.assignmentTargetId) {
        await Product.updateOne(
          { _id: oldChart.assignmentTargetId, sizeChart: id },
          { $set: { sizeChart: null, sizeChartSource: "category_default" } }
        );
      }

      // 2. Apply new assignment
      if (data.assignmentType === "category" && data.assignmentTargetId) {
        // Clear this size chart from any other categories first
        await Category.updateMany({ sizeChart: id }, { $set: { sizeChart: null } });
        await Category.findByIdAndUpdate(data.assignmentTargetId, { $set: { sizeChart: id } });
      } else if (data.assignmentType === "product" && data.assignmentTargetId) {
        // Clear this size chart from any other products first
        await Product.updateMany(
          { sizeChart: id },
          { $set: { sizeChart: null, sizeChartSource: "category_default" } }
        );
        await Product.findByIdAndUpdate(data.assignmentTargetId, {
          $set: { sizeChart: id, sizeChartSource: "custom" }
        });
      } else if (data.assignmentType === "none") {
        // Clear references
        await Category.updateMany({ sizeChart: id }, { $set: { sizeChart: null } });
        await Product.updateMany(
          { sizeChart: id },
          { $set: { sizeChart: null, sizeChartSource: "category_default" } }
        );
      }
    }

    return NextResponse.json(updatedChart);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Soft delete a size chart and clear references
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.isStaff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.user, "products.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  await dbConnect();
  try {
    await SizeChart.findByIdAndUpdate(id, { $set: { isDeleted: true } });

    // Clear references from categories and products
    await Category.updateMany({ sizeChart: id }, { $set: { sizeChart: null } });
    await Product.updateMany(
      { sizeChart: id },
      { $set: { sizeChart: null, sizeChartSource: "category_default" } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
