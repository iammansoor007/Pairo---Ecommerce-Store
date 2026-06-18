import { NextResponse } from 'next/server';
import dbConnect      from '@/lib/db';
import ShippingZone   from '@/models/ShippingZone';
import ShippingMethod from '@/models/ShippingMethod';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/app/api/auth/[...nextauth]/route';
import { can }              from '@/lib/rbac';

async function requireSettings(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isStaff) return null;
  if (!can(session.user, 'settings.manage')) return null;
  return session;
}

const TENANT_ID = 'DEFAULT_STORE';

export async function GET(req) {
  try {
    if (!await requireSettings()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();

    const zones = await ShippingZone.find({ tenantId: TENANT_ID }).sort({ sortOrder: 1 }).lean();
    const counts = await ShippingMethod.aggregate([
      { $match: { tenantId: TENANT_ID } },
      { $group: { _id: '$zoneId', count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));
    const result = zones.map(z => ({ ...z, methodCount: countMap[z._id.toString()] ?? 0 }));
    return NextResponse.json({ success: true, zones: result });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!await requireSettings()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const body = await req.json();
    const { name, description, priority, sortOrder, status, matchRules } = body;
    if (!name?.trim()) return NextResponse.json({ error: 'Zone name is required.' }, { status: 400 });
    const zone = await ShippingZone.create({ tenantId: TENANT_ID, name: name.trim(), description: description ?? '', priority: priority ?? 0, sortOrder: sortOrder ?? 0, status: status ?? 'Active', matchRules: matchRules ?? [] });
    return NextResponse.json({ success: true, zone }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    if (!await requireSettings()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const body = await req.json();
    const { id, name, description, priority, sortOrder, status, matchRules } = body;
    if (!id) return NextResponse.json({ error: 'Zone id is required.' }, { status: 400 });
    const zone = await ShippingZone.findOneAndUpdate(
      { _id: id, tenantId: TENANT_ID },
      { $set: { name, description, priority, sortOrder, status, matchRules } },
      { new: true, runValidators: true }
    );
    if (!zone) return NextResponse.json({ error: 'Zone not found.' }, { status: 404 });
    return NextResponse.json({ success: true, zone });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    if (!await requireSettings()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Zone id is required.' }, { status: 400 });
    await ShippingMethod.deleteMany({ zoneId: id, tenantId: TENANT_ID });
    const result = await ShippingZone.findOneAndDelete({ _id: id, tenantId: TENANT_ID });
    if (!result) return NextResponse.json({ error: 'Zone not found.' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Zone and its methods deleted.' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
