import { NextResponse } from 'next/server';
import { INITIAL_LAB_SUBMISSIONS } from '@/lib/phase2-constants';
import { LabSubmission } from '@/types';

// In-memory submissions store for student portal
let submissions: LabSubmission[] = [...INITIAL_LAB_SUBMISSIONS];

export async function GET() {
  return NextResponse.json({
    success: true,
    submissions,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, fileName, fileType, fileSizeKb, courseCode } = body;

    if (!title || !fileName || !fileType) {
      return NextResponse.json(
        { success: false, error: 'Title, fileName, and fileType are required.' },
        { status: 400 }
      );
    }

    const newSub: LabSubmission = {
      id: `sub-${Date.now()}`,
      studentId: 'std-105',
      studentName: 'Samiul Haque',
      courseCode: courseCode || '0478',
      title: title.trim(),
      fileName: fileName.trim(),
      fileType: fileType as 'py' | 'html' | 'css' | 'xlsx' | 'accdb',
      fileSizeKb: fileSizeKb || 16.5,
      submittedAt: new Date().toISOString(),
      version: 1,
      status: 'pending_review',
    };

    submissions.unshift(newSub);

    return NextResponse.json({
      success: true,
      submission: newSub,
      message: 'Lab source file uploaded successfully! Ready for teacher review and annotation.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error uploading submission';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
