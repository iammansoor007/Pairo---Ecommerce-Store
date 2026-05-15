import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Submission from "@/models/Submission";
import AuditLog from "@/models/AuditLog";
import { can } from "@/lib/rbac";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/submissions
 * Enterprise-grade fetch with pagination, filtering, searching, and sorting.
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!can(session.user, "submissions.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;
  
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const priority = searchParams.get("priority") || "all";
  const assignedTo = searchParams.get("assignedTo") || "all";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  // Build Query
  const query = { isDeleted: false };
  
  if (status !== "all") query.status = status;
  if (priority !== "all") query.priority = priority;
  if (assignedTo !== "all") query.assignedTo = assignedTo;

  if (search) {
    // Fuzzy search using text index
    query.$text = { $search: search };
  }

  try {
    const [items, total] = await Promise.all([
      Submission.find(query)
        .populate("assignedTo", "name email")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Submission.countDocuments(query)
    ]);

    // Summary counts for filter bar
    const counts = await Submission.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusCounts = {
      all: counts.reduce((acc, curr) => acc + curr.count, 0),
      New: counts.find(c => c._id === "New")?.count || 0,
      Read: counts.find(c => c._id === "Read")?.count || 0,
      Replied: counts.find(c => c._id === "Replied")?.count || 0,
      Archived: counts.find(c => c._id === "Archived")?.count || 0,
      Spam: counts.find(c => c._id === "Spam")?.count || 0,
    };

    return NextResponse.json({
      items,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      },
      counts: statusCounts
    });

  } catch (error) {
    console.error("[SUBMISSIONS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

/**
 * POST /api/admin/submissions
 * Bulk actions (trash, restore, mark read, etc.)
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  
  try {
    const { action, ids } = await req.json();
    
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    let update = {};
    let permissionRequired = "submissions.delete";

    switch (action) {
      case "trash":
        update = { isDeleted: true, status: 'Trash' };
        permissionRequired = "submissions.delete";
        break;
      case "restore":
        update = { isDeleted: false, status: 'Read' };
        permissionRequired = "submissions.delete";
        break;
      case "markRead":
        update = { status: 'Read' };
        permissionRequired = "submissions.view";
        break;
      case "markSpam":
        update = { status: 'Spam' };
        permissionRequired = "submissions.manage_spam";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!can(session.user, permissionRequired)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Submission.updateMany(
      { _id: { $in: ids } },
      { $set: update }
    );

    // Audit Log
    await AuditLog.create({
      staffId: session.user.id,
      action: `BULK_${action.toUpperCase()}`,
      resource: 'submissions',
      details: { count: ids.length, ids }
    });

    return NextResponse.json({ success: true, message: `Successfully processed ${ids.length} items` });

  } catch (error) {
    console.error("[SUBMISSIONS_BULK_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
