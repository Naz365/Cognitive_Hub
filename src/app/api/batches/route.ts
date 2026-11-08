import { NextResponse } from 'next/server';
import { studioDb } from '@/lib/store/db';
import { SyllabusCode } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseCode = searchParams.get('courseCode') as SyllabusCode | null;

    const batches = studioDb.getBatches(courseCode || undefined);
    const stats = studioDb.getStats();

    return NextResponse.json({
      success: true,
      batches,
      stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve batches';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
