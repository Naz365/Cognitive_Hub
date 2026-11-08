import { NextResponse } from 'next/server';
import { studioDb } from '@/lib/store/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { admissionNumber, action, teacherId } = body;

    if (!admissionNumber || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Admission Number and valid action (approve/reject) are required.' },
        { status: 400 }
      );
    }

    const result = studioDb.verifyPayment({
      admissionNumber,
      action: action as 'approve' | 'reject',
      teacherId: teacherId || 'TEACHER-01',
    });

    if (!result.success || !result.admission) {
      return NextResponse.json(
        { success: false, error: result.reason || 'Verification failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      admission: result.admission,
      message:
        action === 'approve'
          ? `Payment verified! Desk locked permanently as Enrolled. Receipt ${result.admission.receiptId} generated.`
          : 'Payment rejected. Desk hold released back to Available.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error verifying payment.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
