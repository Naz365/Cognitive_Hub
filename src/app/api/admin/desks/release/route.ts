import { NextResponse } from 'next/server';
import { studioDb } from '@/lib/store/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { batchId, deskId } = body;

    if (!batchId || !deskId) {
      return NextResponse.json(
        { success: false, error: 'batchId and deskId are required to release hold.' },
        { status: 400 }
      );
    }

    const result = studioDb.releaseDeskHold(batchId, deskId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.reason }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Desk has been released and is now Available.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error releasing desk.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
