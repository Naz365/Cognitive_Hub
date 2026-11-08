import { NextResponse } from 'next/server';
import { INITIAL_LIBRARY_RESOURCES } from '@/lib/phase2-constants';
import { SyllabusCode } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseCode = searchParams.get('courseCode') as SyllabusCode | null;
    const category = searchParams.get('category');

    let results = INITIAL_LIBRARY_RESOURCES;
    if (courseCode) {
      results = results.filter((r) => r.courseCode === courseCode);
    }
    if (category) {
      results = results.filter((r) => r.category === category);
    }

    return NextResponse.json({
      success: true,
      resources: results,
      totalCount: results.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching library resources';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
