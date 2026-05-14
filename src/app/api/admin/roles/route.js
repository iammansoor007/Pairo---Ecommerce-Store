import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Role from "@/models/Role";
import { can } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isStaff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Note: Staff management permission usually covers role viewing
    if (!can(session.user, "staff.manage_roles") && !can(session.user, "staff.view")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    try {
        const roles = await Role.find().sort({ isSystem: -1, name: 1 }).lean();
        return NextResponse.json(roles);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isStaff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!can(session.user, "staff.manage_roles")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await dbConnect();
    try {
        const body = await req.json();
        const { name, description, permissions } = body;

        const slug = name.toLowerCase().replace(/\s+/g, '-');
        
        const existing = await Role.findOne({ slug });
        if (existing) return NextResponse.json({ error: "Role already exists" }, { status: 400 });

        const newRole = await Role.create({
            name,
            slug,
            description,
            permissions,
            isSystem: false
        });

        await logAction(req, session, 'CREATE_ROLE', 'roles', {
            after: newRole,
            message: `Created new role: ${name}`
        });

        return NextResponse.json(newRole, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
