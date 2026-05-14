import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Role from "@/models/Role";
import { can } from "@/lib/rbac";
import { logAction } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isStaff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!can(session.user, "staff.manage_roles")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await dbConnect();

    try {
        const body = await req.json();
        const { permissions, description, name } = body;

        const role = await Role.findById(id);
        if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

        // Prevent modification of critical system slug but allow name/desc/permissions
        const before = JSON.parse(JSON.stringify(role));

        if (name && !role.isSystem) role.name = name;
        if (description) role.description = description;
        if (permissions) role.permissions = permissions;

        await role.save();

        await logAction(req, session, 'UPDATE_ROLE', 'roles', {
            before,
            after: role,
            message: `Updated permissions for role: ${role.name}`
        });

        return NextResponse.json(role);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isStaff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!can(session.user, "staff.manage_roles")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await dbConnect();

    try {
        const role = await Role.findById(id);
        if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

        if (role.isSystem) {
            return NextResponse.json({ error: "Cannot delete system roles" }, { status: 400 });
        }

        await Role.findByIdAndDelete(id);

        await logAction(req, session, 'DELETE_ROLE', 'roles', {
            before: role,
            message: `Deleted role: ${role.name}`
        });

        return NextResponse.json({ message: "Role deleted" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
