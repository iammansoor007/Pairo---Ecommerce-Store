import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";
import { NextResponse } from "next/server";
import { uploadToStorage } from "@/lib/storage";

// Allowed MIME types
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'image/webp', 'image/svg+xml', 'image/avif',
];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const formData = await req.formData();
    const files = formData.getAll("file");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const file of files) {
      // ── Validation ─────────────────────────────────
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push({ file: file.name, error: `File type "${file.type}" is not allowed.` });
        continue;
      }

      if (file.size > MAX_SIZE_BYTES) {
        errors.push({ file: file.name, error: `File exceeds 8MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB).` });
        continue;
      }

      // ── Read Buffer ─────────────────────────────────
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ── Upload to Storage (Cloudinary or Local) ─────
      const stored = await uploadToStorage(buffer, file.name, 'pairo-media');

      // ── Sanitize filename ────────────────────────────
      const sanitizedName = file.name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .toLowerCase();

      // ── Determine mediaType ──────────────────────────
      const mediaType = file.type.startsWith('video/') ? 'video'
        : file.type.startsWith('image/') ? 'image' : 'document';

      // ── Save to MongoDB ──────────────────────────────
      const media = await Media.create({
        filename: sanitizedName,
        originalName: file.name,
        url: stored.url,
        publicId: stored.publicId,
        title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        altText: '',
        mimeType: file.type,
        fileSize: stored.bytes || file.size,
        width: stored.width,
        height: stored.height,
        format: stored.format,
        mediaType,
        uploadedBy: session.user.id,
        uploadSource: formData.get('source') || 'admin-upload',
        folder: formData.get('folder') || 'general',
      });

      results.push(media);
    }

    return NextResponse.json({
      success: true,
      uploaded: results,
      errors,
      count: results.length,
    }, { status: 201 });

  } catch (error) {
    console.error('[Media Upload Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
