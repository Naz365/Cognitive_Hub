import { NextResponse } from 'next/server';
import { studioDb } from '@/lib/store/db';

export async function GET() {
  try {
    const stats = studioDb.getStats();
    const batches = studioDb.getBatches();
    const admissions = studioDb.getAdmissions();
    const waitlist = studioDb.getWaitlist();

    return NextResponse.json({
      success: true,
      stats,
      batches,
      admissions,
      waitlist,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error fetching admin overview.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
