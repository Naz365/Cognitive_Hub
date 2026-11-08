import { NextResponse } from 'next/server';
import { studioDb } from '@/lib/store/db';
import { STUDIO_CONFIG } from '@/lib/constants';
import { SyllabusCode } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentName, studentPhone, guardianWhatsApp, courseCode, targetSeries, batchId, deskNumber, diagnosticScore } = body;

    if (!studentName || !studentPhone || !guardianWhatsApp || !courseCode || !batchId || !deskNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required admission fields.' },
        { status: 400 }
      );
    }

    if (![1, 2, 3].includes(Number(deskNumber))) {
      return NextResponse.json(
        { success: false, error: 'Invalid desk number. Each micro-studio batch has exactly Desks 1, 2, or 3.' },
        { status: 400 }
      );
    }

    const result = studioDb.reserveDeskHold({
      studentName,
      studentPhone,
      guardianWhatsApp,
      courseCode: courseCode as SyllabusCode,
      targetSeries: targetSeries || 'Upcoming Exam Series',
      batchId,
      deskNumber: Number(deskNumber) as 1 | 2 | 3,
      diagnosticScore,
    });

    if (!result.success || !result.admission) {
      return NextResponse.json(
        { success: false, error: result.reason || 'Failed to lock desk hold.' },
        { status: 409 }
      );
    }

    // Build the WhatsApp message payload for the studio
    const whatsAppMessage = encodeURIComponent(
      `*New Cognitive Hub Admission Hold*\n\n` +
      `*ID:* ${result.admission.admissionNumber}\n` +
      `*Student:* ${result.admission.studentName}\n` +
      `*Phone:* ${result.admission.studentPhone}\n` +
      `*Guardian WA:* ${result.admission.guardianWhatsApp}\n` +
      `*Course:* ${result.admission.courseCode}\n` +
      `*Batch:* ${result.admission.batchName}\n` +
      `*Desk:* Desk 0${result.admission.deskNumber}\n` +
      `*Hold Expires:* 24 Hours from now\n\n` +
      `Please confirm payment via bKash/Nagad TrxID to lock enrollment.`
    );

    const whatsAppLink = `https://wa.me/${STUDIO_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsAppMessage}`;

    return NextResponse.json({
      success: true,
      admission: result.admission,
      whatsAppLink,
      holdHours: STUDIO_CONFIG.holdDurationHours,
      message: `Desk 0${result.admission.deskNumber} locked for 24 hours under Admission ID ${result.admission.admissionNumber}.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error while reserving desk.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
