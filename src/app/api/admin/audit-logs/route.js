import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { can } from "@/lib/rbac";
import { NextResponse } from "next/server";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isStaff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Usually only Super Admin or high-level Admin can see logs
    if (!can(session.user, "settings.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();
    try {
        const logs = await AuditLog.find()
            .populate('staffId', 'name email')
            .sort({ timestamp: -1 })
            .limit(100)
            .lean();
        
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
