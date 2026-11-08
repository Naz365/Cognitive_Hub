import { NextResponse } from 'next/server';
import { studioDb } from '@/lib/store/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ receiptId: string }> }
) {
  try {
    const { receiptId } = await params;
    if (!receiptId) {
      return NextResponse.json({ success: false, error: 'Receipt ID is required' }, { status: 400 });
    }

    const admission = studioDb.getAdmissionByReceiptId(receiptId);
    if (!admission) {
      return NextResponse.json(
        { success: false, error: 'Invalid or unrecognized receipt ID' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      receipt: {
        receiptId: admission.receiptId,
        admissionNumber: admission.admissionNumber,
        studentName: admission.studentName,
        courseCode: admission.courseCode,
        batchName: admission.batchName,
        deskNumber: admission.deskNumber,
        status: admission.status,
        paymentStatus: admission.payment.status,
        amountBDT: admission.payment.amountBDT,
        method: admission.payment.method,
        trxId: admission.payment.trxId,
        verifiedAt: admission.payment.verifiedAt,
        verifiedBy: admission.payment.verifiedBy,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error validating receipt';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
