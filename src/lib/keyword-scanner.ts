import { OpenQuestion, KeywordScannerResult } from '@/types';

export function evaluateCandidateAnswer(
  candidateText: string,
  question: OpenQuestion
): KeywordScannerResult {
  const normalizedCandidate = candidateText.toLowerCase();
  let totalMarks = 0;
  const matchedKeywords: KeywordScannerResult['matchedKeywords'] = [];
  const missedKeywords: KeywordScannerResult['missedKeywords'] = [];

  let annotatedHtml = candidateText;

  for (const rule of question.rubricKeywords) {
    const searchTargets = [rule.requiredKeyword, ...rule.synonyms].map((t) => t.toLowerCase());

    let foundMatch: string | null = null;
    for (const target of searchTargets) {
      if (normalizedCandidate.includes(target)) {
        foundMatch = target;
        break;
      }
    }

    if (foundMatch) {
      totalMarks += rule.markWeight;
      matchedKeywords.push({
        keyword: rule.requiredKeyword,
        matchedToken: foundMatch,
        explanation: rule.explanation,
      });

      // Highlight the matched term in HTML with a green neon badge
      try {
        const regex = new RegExp(`(${escapeRegExp(foundMatch)})`, 'gi');
        annotatedHtml = annotatedHtml.replace(
          regex,
          '<mark class="bg-emerald-500/25 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/50">$1</mark>'
        );
      } catch {
        // Fallback if regex compilation fails
      }
    } else {
      missedKeywords.push({
        keyword: rule.requiredKeyword,
        explanation: rule.explanation,
      });
    }
  }

  // Ensure marks cannot exceed question maximum
  const finalMarks = Math.min(totalMarks, question.maxMarks);

  let feedback = '';
  if (finalMarks === question.maxMarks) {
    feedback = 'Outstanding response! Full marks awarded. All Cambridge/Edexcel mark-scheme marking points successfully detected.';
  } else if (finalMarks > 0) {
    feedback = `Partial credit awarded (${finalMarks}/${question.maxMarks} marks). You demonstrated good understanding, but missed specific mark-scheme keywords shown in amber below.`;
  } else {
    feedback = `No mark-scheme points awarded (0/${question.maxMarks}). Be sure to include official syllabus technical vocabulary.`;
  }

  return {
    questionId: question.id,
    totalMarksAwarded: finalMarks,
    maxMarks: question.maxMarks,
    matchedKeywords,
    missedKeywords,
    highlightedHtml: annotatedHtml,
    feedbackAdvice: feedback,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
