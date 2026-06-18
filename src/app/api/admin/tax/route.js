import { NextResponse } from 'next/server';
import dbConnect        from '@/lib/db';
import TaxSettings      from '@/models/TaxSettings';
import { getServerSession } from 'next-auth';
import { authOptions }      from '@/app/api/auth/[...nextauth]/route';
import { can }              from '@/lib/rbac';

async function requireSettings() {
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
    const settings = await TaxSettings.findOne({ tenantId: TENANT_ID }).lean();
    return NextResponse.json({ success: true, settings: settings ?? { tenantId: TENANT_ID, enabled: false } });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    if (!await requireSettings()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const body = await req.json();
    const { enabled, taxLabel, defaultTaxRate, calculationMethod, taxRoundingMode, applyToShipping, taxRules, zonalRules } = body;
    const settings = await TaxSettings.findOneAndUpdate(
      { tenantId: TENANT_ID },
      { $set: { enabled: enabled ?? false, taxLabel: taxLabel ?? 'Tax', defaultTaxRate: defaultTaxRate ?? 0, calculationMethod: calculationMethod ?? 'exclusive', taxRoundingMode: taxRoundingMode ?? 'round', applyToShipping: applyToShipping ?? false, taxRules: taxRules ?? [], zonalRules: zonalRules ?? [] } },
      { upsert: true, new: true, runValidators: true }
    );
    return NextResponse.json({ success: true, settings });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
