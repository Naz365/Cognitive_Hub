import { NextResponse } from 'next/server';
import { OPEN_QUESTIONS } from '@/lib/phase2-constants';
import { evaluateCandidateAnswer } from '@/lib/keyword-scanner';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId, answerText } = body;

    if (!questionId || answerText === undefined) {
      return NextResponse.json(
        { success: false, error: 'Question ID and answer text are required.' },
        { status: 400 }
      );
    }

    const question = OPEN_QUESTIONS.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Open-ended question not found.' },
        { status: 404 }
      );
    }

    const evaluation = evaluateCandidateAnswer(answerText, question);

    return NextResponse.json({
      success: true,
      evaluation,
      modelAnswer: question.modelAnswer,
      paperVariant: question.paperVariant,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error evaluating answer';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
