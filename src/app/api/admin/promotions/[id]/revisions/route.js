import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Promotion from "@/models/Promotion";
import PromotionRevision from "@/models/PromotionRevision";
import HistoryService from "@/lib/promotionEngine/HistoryService";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const revisions = await PromotionRevision.find({ promotionId: params.id }).sort({ version: -1 });
    return NextResponse.json(revisions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const { version } = await req.json();
    const revision = await PromotionRevision.findOne({ promotionId: params.id, version });

    if (!revision) {
      return NextResponse.json({ error: "Revision not found" }, { status: 404 });
    }

    const oldPromo = await Promotion.findById(params.id);
    
    // Restore the snapshot
    const updated = await Promotion.findByIdAndUpdate(params.id, revision.snapshot, { new: true });

    // Log the rollback action
    await HistoryService.logAction('ROLLBACK', params.id, { 
        adminName: session.user.name || session.user.email,
        metadata: { version }
    }, [{ field: 'version', oldValue: 'current', newValue: version }]);

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
