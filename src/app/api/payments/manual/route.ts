import { NextResponse } from 'next/server';
import { studioDb } from '@/lib/store/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { admissionNumber, method, trxId } = body;

    if (!admissionNumber || !method || !trxId) {
      return NextResponse.json(
        { success: false, error: 'Admission Number, Payment Method, and Transaction ID (TrxID) are required.' },
        { status: 400 }
      );
    }

    if (!['bkash_manual', 'nagad_manual'].includes(method)) {
      return NextResponse.json(
        { success: false, error: 'Invalid manual payment method. Choose bKash or Nagad.' },
        { status: 400 }
      );
    }

    const result = studioDb.submitManualPayment({
      admissionNumber,
      method: method as 'bkash_manual' | 'nagad_manual',
      trxId,
    });

    if (!result.success || !result.admission) {
      return NextResponse.json(
        { success: false, error: result.reason || 'Failed to submit payment verification.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      admission: result.admission,
      message: 'TrxID submitted successfully! Teacher verification is pending (usually under 30 minutes).',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error while submitting payment.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
