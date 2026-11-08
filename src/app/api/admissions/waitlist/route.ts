import { NextResponse } from 'next/server';
import { studioDb } from '@/lib/store/db';
import { SyllabusCode } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentName, studentPhone, guardianWhatsApp, courseCode, batchId } = body;

    if (!studentName || !studentPhone || !guardianWhatsApp || !courseCode || !batchId) {
      return NextResponse.json(
        { success: false, error: 'All fields are required to join the priority waitlist.' },
        { status: 400 }
      );
    }

    const result = studioDb.addToWaitlist({
      studentName,
      studentPhone,
      guardianWhatsApp,
      courseCode: courseCode as SyllabusCode,
      batchId,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.reason }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      entry: result.entry,
      message: 'Added to Priority Waitlist. You will receive immediate WhatsApp alert when a desk is released.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error while joining waitlist.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
