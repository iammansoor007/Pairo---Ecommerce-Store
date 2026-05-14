import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Promotion from "@/models/Promotion";
import { NextResponse } from "next/server";
import HistoryService from "@/lib/promotionEngine/HistoryService";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const tenantId = searchParams.get('tenantId') || "DEFAULT_STORE";
    
    const query = { 
        tenantId,
        adminStatus: { $ne: 'Archived' } 
    };
    
    if (status && status !== 'All') {
      query.adminStatus = status;
    }

    const promotions = await Promotion.find(query).sort({ priority: -1, createdAt: -1 });
    return NextResponse.json(promotions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const data = await req.json();
    
    if (!data.title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Ensure tenantId is present (Mandatory for SaaS Hardening)
    const promotionData = {
        ...data,
        tenantId: data.tenantId || "DEFAULT_STORE"
    };

    const promotion = await Promotion.create(promotionData);
    
    // Initial History
    await HistoryService.recordRevision(promotion, { 
        adminName: session.user.name || session.user.email,
        summary: "Initial Creation" 
    });
    await HistoryService.logAction('CREATE', promotion._id, { 
        adminName: session.user.name || session.user.email 
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error("Promotion Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
