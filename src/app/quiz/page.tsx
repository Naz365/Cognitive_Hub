'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { OPEN_QUESTIONS, INITIAL_MISTAKE_LOGS } from '@/lib/phase2-constants';
import { DIAGNOSTIC_QUESTIONS } from '@/lib/constants';
import { OpenQuestion, KeywordScannerResult, MistakeLogEntry, SyllabusCode } from '@/types';
import {
  Brain,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCheck2,
  ListRestart,
  BookOpen,
  Printer,
  ChevronRight,
  Send,
  Zap,
} from 'lucide-react';

export default function QuizEnginePage() {
  const [activeTab, setActiveTab] = useState<'drill' | 'scanner' | 'mistakes'>('scanner');
  const [selectedCourse, setSelectedCourse] = useState<SyllabusCode>('0478');

  // Scanner state
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(OPEN_QUESTIONS[0].id);
  const [candidateAnswer, setCandidateAnswer] = useState<string>(
    'Run-Length Encoding (RLE) is a lossless compression technique that identifies repeated consecutive characters in a file. It counts the number of times each character appears consecutively and stores this frequency alongside the character so the original data can be reconstructed without quality degradation.'
  );
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<KeywordScannerResult | null>(null);

  // Rapid Drill state
  const [drillIndex, setDrillIndex] = useState(0);
  const [drillScore, setDrillScore] = useState(0);
  const [selectedDrillOption, setSelectedDrillOption] = useState<number | null>(null);
  const [drillFinished, setDrillFinished] = useState(false);

  // Mistake log state
  const [mistakes, setMistakes] = useState<MistakeLogEntry[]>(INITIAL_MISTAKE_LOGS);

  const currentOpenQuestion = OPEN_QUESTIONS.find((q) => q.id === selectedQuestionId) || OPEN_QUESTIONS[0];
  const drillQuestions = DIAGNOSTIC_QUESTIONS.filter((q) => q.courseCode === selectedCourse);

  const handleEvaluateScanner = async () => {
    if (!candidateAnswer.trim()) return;
    try {
      setEvaluating(true);
      const res = await fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentOpenQuestion.id,
          answerText: candidateAnswer,
        }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setScanResult(data.evaluation);

        // If missed keywords exist, log automatically to the Mistake Logbook!
        if (data.evaluation.missedKeywords.length > 0) {
          const newMistake: MistakeLogEntry = {
            id: `mistake-${Date.now()}`,
            questionId: currentOpenQuestion.id,
            questionText: currentOpenQuestion.questionText,
            courseCode: currentOpenQuestion.courseCode,
            topic: currentOpenQuestion.topic,
            missedKeywords: data.evaluation.missedKeywords.map((m: { keyword: string }) => m.keyword),
            correctConcept: currentOpenQuestion.modelAnswer,
            loggedAt: new Date().toISOString(),
          };
          setMistakes((prev) => [newMistake, ...prev]);
        }
      }
    } catch (err) {
      console.error('Error evaluating answer:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handlePrintMistakes = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                <Brain className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  Automated Mark-Scheme & Quiz Engine
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time keyword matching against Cambridge & Edexcel mark schemes with automatic mistake logbook compilation
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mark Scheme AI Keyword Scanner</span>
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 mb-8 gap-2">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`py-3 px-4 font-mono text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'scanner'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Mark-Scheme Keyword Scanner (Theory)</span>
          </button>

          <button
            onClick={() => setActiveTab('drill')}
            className={`py-3 px-4 font-mono text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'drill'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Rapid Topic Drill</span>
          </button>

          <button
            onClick={() => setActiveTab('mistakes')}
            className={`py-3 px-4 font-mono text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'mistakes'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Mistake Logbook ({mistakes.length})</span>
          </button>
        </div>

        {/* TAB 1: MARK-SCHEME KEYWORD SCANNER */}
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Question Picker & Input */}
            <div className="lg:col-span-7 space-y-6">
              {/* Question Selector */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                    Select Official Board Exam Question
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Max: {currentOpenQuestion.maxMarks} Marks
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {OPEN_QUESTIONS.map((q) => {
                    const isSelected = selectedQuestionId === q.id;
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setSelectedQuestionId(q.id);
                          setScanResult(null);
                        }}
                        className={`p-3 rounded-xl border text-left text-xs font-mono transition ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold">{q.courseCode}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate">{q.topic}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Question Stem Display */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-400">
                      {currentOpenQuestion.paperVariant}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Topic: {currentOpenQuestion.topic}
                    </span>
                  </div>
                  <p className="text-sm font-serif font-medium text-slate-200 leading-relaxed">
                    {currentOpenQuestion.questionText}
                  </p>
                </div>
              </div>

              {/* Student Answer Input Box */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-200">
                    Your Written Response (Type or Paste):
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    {candidateAnswer.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                <textarea
                  rows={6}
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  placeholder="Type your explanation using specific examination board technical terms..."
                  className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-sm font-sans text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 leading-relaxed"
                />

                <button
                  onClick={handleEvaluateScanner}
                  disabled={evaluating || !candidateAnswer.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition disabled:opacity-50"
                >
                  {evaluating ? (
                    <span>Running Keyword Scanner...</span>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>Run Mark-Scheme Keyword Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Live Analysis & Keyword Highlighter */}
            <div className="lg:col-span-5 space-y-6">
              {scanResult ? (
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl space-y-6">
                  {/* Score Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono text-slate-400 uppercase">Score Awarded</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-3xl font-black text-cyan-400 font-mono">
                          {scanResult.totalMarksAwarded}
                        </span>
                        <span className="text-sm font-mono text-slate-500">
                          / {scanResult.maxMarks} Marks
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        scanResult.totalMarksAwarded === scanResult.maxMarks
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : scanResult.totalMarksAwarded > 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {scanResult.totalMarksAwarded === scanResult.maxMarks
                        ? 'FULL MARKS'
                        : scanResult.totalMarksAwarded > 0
                        ? 'PARTIAL CREDIT'
                        : '0 MARKS'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {scanResult.feedbackAdvice}
                  </p>

                  {/* Matched Keywords (Green) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Matched Mark-Scheme Points ({scanResult.matchedKeywords.length})</span>
                    </div>

                    {scanResult.matchedKeywords.length === 0 ? (
                      <p className="text-xs text-slate-500 font-mono italic">No matches detected.</p>
                    ) : (
                      <div className="space-y-2">
                        {scanResult.matchedKeywords.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs font-mono"
                          >
                            <span className="text-emerald-300 font-bold block">{m.keyword}</span>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">{m.explanation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Missed Keywords (Amber) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Missed Mark-Scheme Points ({scanResult.missedKeywords.length})</span>
                    </div>

                    {scanResult.missedKeywords.length === 0 ? (
                      <p className="text-xs text-emerald-400 font-mono">
                        ✓ All required syllabus keywords covered!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {scanResult.missedKeywords.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs font-mono"
                          >
                            <span className="text-amber-300 font-bold block">{m.keyword}</span>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">{m.explanation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Model Answer Preview */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
                    <span className="text-slate-400 font-bold block">Official Examiner Model Answer:</span>
                    <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                      {currentOpenQuestion.modelAnswer}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center mx-auto">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white font-mono">Mark-Scheme Keyword Telemetry</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Type your answer on the left and click &apos;Run Keyword Analysis&apos; to view instant matched keywords (green) and missed points (amber).
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: RAPID TOPIC DRILL */}
        {activeTab === 'drill' && (
          <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase">Rapid Topic Drill</span>
                <h2 className="text-lg font-bold text-white font-mono mt-0.5">
                  Question {drillIndex + 1} of {drillQuestions.length}
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Score: <strong className="text-cyan-400">{drillScore}</strong>
              </span>
            </div>

            {drillFinished ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center mx-auto">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white font-mono">Drill Session Complete!</h3>
                <p className="text-sm text-slate-300">
                  You scored <strong className="text-cyan-400">{drillScore} / {drillQuestions.length}</strong> correct.
                </p>
                <button
                  onClick={() => {
                    setDrillIndex(0);
                    setDrillScore(0);
                    setDrillFinished(false);
                    setSelectedDrillOption(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs font-mono transition hover:bg-cyan-400"
                >
                  Restart Topic Drill
                </button>
              </div>
            ) : drillQuestions.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-200">
                  {drillQuestions[drillIndex].question}
                </p>

                <div className="space-y-2 pt-2">
                  {drillQuestions[drillIndex].options.map((opt, optIdx) => {
                    const isSelected = selectedDrillOption === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setSelectedDrillOption(optIdx)}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-mono transition ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-slate-500 mr-2">{String.fromCharCode(65 + optIdx)})</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      if (selectedDrillOption === null) return;
                      if (selectedDrillOption === drillQuestions[drillIndex].correctAnswer) {
                        setDrillScore((s) => s + 1);
                      }
                      if (drillIndex + 1 < drillQuestions.length) {
                        setDrillIndex((i) => i + 1);
                        setSelectedDrillOption(null);
                      } else {
                        setDrillFinished(true);
                      }
                    }}
                    disabled={selectedDrillOption === null}
                    className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono disabled:opacity-40 transition"
                  >
                    Submit & Next
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-mono">No drill questions available for this course.</p>
            )}
          </div>
        )}

        {/* TAB 3: MISTAKE LOGBOOK (PRINTABLE REVISION SHEET) */}
        {activeTab === 'mistakes' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">
                  Personalized Mistake Logbook & Revision Sheet
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Auto-compiles concepts with missed mark-scheme keywords and logic gaps into a printable target revision sheet.
                </p>
              </div>

              <button
                onClick={handlePrintMistakes}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-mono font-bold flex items-center gap-2 transition self-start sm:self-auto"
              >
                <Printer className="w-4 h-4" />
                <span>Print Revision Sheet</span>
              </button>
            </div>

            {mistakes.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                Your mistake log is empty! No missed keywords recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {mistakes.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">{item.topic}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.loggedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-200">{item.questionText}</p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-slate-400 text-[11px]">Missed Mark Keywords:</span>
                      {item.missedKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 text-[10px] font-bold"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-sans mt-2">
                      <span className="font-bold text-cyan-300 font-mono block mb-0.5">
                        Required Examination Concept:
                      </span>
                      {item.correctConcept}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
