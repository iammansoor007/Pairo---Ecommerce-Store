import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";

export async function GET(req) {
   await dbConnect();
   const { searchParams } = new URL(req.url);
   const id = searchParams.get("id");
   const isDeleted = searchParams.get("isDeleted") === "true";
   const status = searchParams.get("status");

   try {
      if (id) {
         const blog = await Blog.findById(id);
         return NextResponse.json(blog);
      }
      let query = { isDeleted };
      if (status) query.status = status;
      
      const blogs = await Blog.find(query).sort({ createdAt: -1 });
      return NextResponse.json(blogs);
   } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
   }
}

export async function POST(req) {
   await dbConnect();
   try {
      const data = await req.json();
      const blog = await Blog.create(data);
      return NextResponse.json(blog);
   } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
   }
}

export async function PUT(req) {
   await dbConnect();
   try {
      const data = await req.json();
      const { id, ...updateData } = data;
      const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
      return NextResponse.json(blog);
   } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
   }
}

export async function DELETE(req) {
   await dbConnect();
   const { searchParams } = new URL(req.url);
   const id = searchParams.get("id");
   try {
      // Soft delete like WordPress
      await Blog.findByIdAndUpdate(id, { isDeleted: true });
      return NextResponse.json({ success: true });
   } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
   }
}
