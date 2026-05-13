import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { trackMediaUsage, removeMediaUsage, findMediaByUrl } from "@/lib/mediaUsage";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const isDeleted = searchParams.get("isDeleted") === "true";
  const status = searchParams.get("status");

  await dbConnect();
  try {
    if (id) {
      const product = await Product.findById(id);
      return NextResponse.json(product);
    }

    let query = { isDeleted };
    if (status) query.status = status;

    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json(products);
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
    
    // Generate unique slug if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    const product = await Product.create(data);

    // Track media usage
    const allImages = [
      ...(data.images || []),
      data.seo?.ogImage,
      ...(data.variantCombinations || []).map(v => v.image)
    ].filter(Boolean);

    for (const url of allImages) {
      const media = await findMediaByUrl(url);
      if (media) {
        await trackMediaUsage(media._id, {
          entityType: 'Product',
          entityId: product._id,
          fieldName: 'multiple',
          label: product.name
        });
      }
    }

    return NextResponse.json(product, { status: 201 });
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
    const oldProduct = await Product.findById(id);
    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });

    // Update media usage tracking
    const oldImages = [
      ...(oldProduct?.images || []),
      oldProduct?.seo?.ogImage,
      ...(oldProduct?.variantCombinations || []).map(v => v.image)
    ].filter(Boolean);

    const newImages = [
      ...(data.images || []),
      data.seo?.ogImage,
      ...(data.variantCombinations || []).map(v => v.image)
    ].filter(Boolean);

    // Remove old usage refs
    for (const url of oldImages) {
      if (!newImages.includes(url)) {
        const media = await findMediaByUrl(url);
        if (media) await removeMediaUsage(media._id, 'Product', id);
      }
    }

    // Add new usage refs
    for (const url of newImages) {
      if (!oldImages.includes(url)) {
        const media = await findMediaByUrl(url);
        if (media) {
          await trackMediaUsage(media._id, {
            entityType: 'Product',
            entityId: id,
            fieldName: 'multiple',
            label: product.name
          });
        }
      }
    }

    return NextResponse.json(product);
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
    // Soft delete
    const product = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
