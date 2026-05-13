import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  try {
    const categories = await Category.find({ isDeleted: false }).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  try {
    const data = await req.json();
    const category = await Category.create(data);

    // Track media usage for category image
    if (data.image) {
      const { trackMediaUsage, findMediaByUrl } = await import("@/lib/mediaUsage");
      const media = await findMediaByUrl(data.image);
      if (media) {
        await trackMediaUsage(media._id, {
          entityType: 'Category',
          entityId: category._id,
          fieldName: 'image',
          label: category.name
        });
      }
    }

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  try {
    const { id, ...data } = await req.json();
    const oldCategory = await Category.findById(id);
    const category = await Category.findByIdAndUpdate(id, data, { new: true });

    // Handle Media Usage Tracking
    if (oldCategory.image !== data.image) {
      const { trackMediaUsage, removeMediaUsage, findMediaByUrl } = await import("@/lib/mediaUsage");
      
      // Remove old usage
      if (oldCategory.image) {
        const oldMedia = await findMediaByUrl(oldCategory.image);
        if (oldMedia) await removeMediaUsage(oldMedia._id, 'Category', id);
      }

      // Add new usage
      if (data.image) {
        const newMedia = await findMediaByUrl(data.image);
        if (newMedia) {
          await trackMediaUsage(newMedia._id, {
            entityType: 'Category',
            entityId: id,
            fieldName: 'image',
            label: category.name
          });
        }
      }
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await dbConnect();
  try {
    const category = await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    
    // Usage tracking is usually kept for soft deletes, but we could remove it if desired.
    // Keeping it for now so "Trash" items still show as "In Use".

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
