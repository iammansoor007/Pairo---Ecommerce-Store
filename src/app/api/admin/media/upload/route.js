import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public/uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Already exists
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    await dbConnect();
    const media = await Media.create({
      filename: file.name,
      url: fileUrl,
      altText: file.name,
      fileType: file.type,
      size: file.size,
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
