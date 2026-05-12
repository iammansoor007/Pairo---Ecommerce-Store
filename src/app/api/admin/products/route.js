import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

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
    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
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
