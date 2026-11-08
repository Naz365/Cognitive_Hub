'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import WorkstationMap from '@/components/studio/WorkstationMap';
import { Batch, SyllabusCode, AdmissionRecord, DiagnosticQuestion } from '@/types';
import { COURSES, STUDIO_CONFIG, DIAGNOSTIC_QUESTIONS } from '@/lib/constants';
import { generateAdmissionReceiptPDF } from '@/lib/pdf-receipt';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Send,
  Download,
  AlertCircle,
  Brain,
  Layers,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdmissionsPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form States
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [guardianWhatsApp, setGuardianWhatsApp] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<SyllabusCode>('0478');
  const [targetSeries, setTargetSeries] = useState(COURSES['0478'].targetSeries[0]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedDesk, setSelectedDesk] = useState<1 | 2 | 3 | undefined>(undefined);

  // Diagnostic State
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, number>>({});
  const [diagnosticResult, setDiagnosticResult] = useState<{ correct: number; total: number; percentage: number } | undefined>(undefined);

  // Submission State
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reservation, setReservation] = useState<AdmissionRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Manual payment state
  const [paymentMethod, setPaymentMethod] = useState<'bkash_manual' | 'nagad_manual'>('bkash_manual');
  const [trxId, setTrxId] = useState('');
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Waitlist state
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  useEffect(() => {
    fetchBatchesForCourse(selectedCourse);
    setTargetSeries(COURSES[selectedCourse].targetSeries[0]);
  }, [selectedCourse]);

  const fetchBatchesForCourse = async (courseCode: SyllabusCode) => {
    try {
      setLoadingBatches(true);
      const res = await fetch(`/api/batches?courseCode=${courseCode}`);
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
        if (data.batches.length > 0) {
          setSelectedBatchId(data.batches[0].id);
          const firstAvail = data.batches[0].desks.find((d: { status: string }) => d.status === 'available');
          setSelectedDesk(firstAvail ? (firstAvail.number as 1 | 2 | 3) : undefined);
        }
      }
    } catch {
      setError('Failed to fetch batch availability.');
    } finally {
      setLoadingBatches(false);
    }
  };

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const diagnosticQuestionsForCourse = DIAGNOSTIC_QUESTIONS.filter((q) => q.courseCode === selectedCourse);

  // Step 1 Validation
  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !guardianWhatsApp.trim() || !studentPhone.trim()) {
      setError('Please provide student name, contact phone, and guardian WhatsApp number.');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  // Step 2 Validation (Batch & Desk)
  const handleNextFromStep2 = () => {
    if (!selectedDesk) {
      setError('Please select an available workstation desk (Desk 01, 02, or 03).');
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  // Step 3 Validation (Diagnostic Assessment) & Submission
  const handleSubmitAdmission = async () => {
    // Calculate diagnostic score
    let correctCount = 0;
    diagnosticQuestionsForCourse.forEach((q) => {
      if (diagnosticAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scoreData = {
      correct: correctCount,
      total: diagnosticQuestionsForCourse.length,
      percentage: Math.round((correctCount / (diagnosticQuestionsForCourse.length || 1)) * 100),
    };
    setDiagnosticResult(scoreData);

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/admissions/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          studentPhone,
          guardianWhatsApp,
          courseCode: selectedCourse,
          targetSeries,
          batchId: selectedBatchId,
          deskNumber: selectedDesk,
          diagnosticScore: scoreData,
        }),
      });

      const data = await res.json();
      if (data.success && data.admission) {
        setReservation(data.admission);
        setCurrentStep(4);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#22D3EE', '#06B6D4', '#6366F1', '#10B981'],
        });
      } else {
        setError(data.error || 'The chosen desk was just reserved by another student. Please pick another desk.');
        setCurrentStep(2); // Go back to seat picker
      }
    } catch {
      setError('Connection error. Please try reserving again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Manual payment submission
  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation || !trxId.trim()) return;

    try {
      setSubmittingPayment(true);
      const res = await fetch('/api/payments/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionNumber: reservation.admissionNumber,
          method: paymentMethod,
          trxId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSubmitted(true);
        setReservation(data.admission);
      } else {
        setError(data.error || 'Failed to submit TrxID.');
      }
    } catch {
      setError('Error submitting payment.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleJoinWaitlist = async () => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/admissions/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          studentPhone,
          guardianWhatsApp,
          courseCode: selectedCourse,
          batchId: selectedBatchId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWaitlistSuccess(true);
      } else {
        setError(data.error || 'Failed to join waitlist.');
      }
    } catch {
      setError('Error joining waitlist.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reservation) return;
    const doc = await generateAdmissionReceiptPDF(reservation);
    doc.save(`${reservation.admissionNumber}-CognitiveHub-Slip.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Wizard Progress Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, title: 'Track & Student' },
              { num: 2, title: '3-Desk Allocation' },
              { num: 3, title: 'Diagnostic Check' },
              { num: 4, title: '24h Hold & Pass' },
            ].map((step, idx) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;

              return (
                <div key={step.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-sm font-bold transition ${
                        isPast
                          ? 'bg-cyan-500 text-slate-950'
                          : isActive
                          ? 'bg-cyan-950 border-2 border-cyan-400 text-cyan-300 ring-4 ring-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                          : 'bg-slate-900 border border-slate-800 text-slate-500'
                      }`}
                    >
                      {isPast ? '✓' : `0${step.num}`}
                    </div>
                    <span
                      className={`text-[11px] font-mono mt-1.5 hidden sm:block ${
                        isActive ? 'text-cyan-400 font-bold' : isPast ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div
                      className={`w-12 sm:w-20 h-0.5 mx-2 transition ${
                        currentStep > idx + 1 ? 'bg-cyan-500' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Syllabus Track & Applicant Details */}
        {currentStep === 1 && (
          <form onSubmit={handleNextFromStep1} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Step 01 of 04</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
                Select Syllabus Track & Student Info
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose between Cambridge or Pearson Edexcel computer science and ICT syllabi.
              </p>
            </div>

            {/* Course Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['0478', '9618', '4CP0', '4IT1'] as SyllabusCode[]).map((code) => {
                const course = COURSES[code];
                const isSelected = selectedCourse === code;
                return (
                  <div
                    key={code}
                    onClick={() => setSelectedCourse(code)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-400">{code}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">{course.board}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1.5">{course.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{course.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-300">BDT {course.monthlyFeeBDT.toLocaleString()}/mo</span>
                      <span className={`text-[11px] font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`}>
                        {isSelected ? '✓ Selected' : 'Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Target Exam Series */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Target Examination Series *</label>
              <select
                value={targetSeries}
                onChange={(e) => setTargetSeries(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                {COURSES[selectedCourse].targetSeries.map((series) => (
                  <option key={series} value={series}>
                    {series}
                  </option>
                ))}
              </select>
            </div>

            {/* Applicant Contact Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samiul Haque"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Student Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Parent / Guardian WhatsApp Number (Official Verification Alerts) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+8801XXXXXXXXX or 01XXXXXXXXX"
                  value={guardianWhatsApp}
                  onChange={(e) => setGuardianWhatsApp(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Weekly progress reports and 24-hour hold expiration reminders are sent to this WhatsApp number.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="py-3 px-6 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition"
              >
                <span>Continue to Workstation Allocation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Batch Selection & 3-Desk SVG Workstation Map */}
        {currentStep === 2 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Step 02 of 04</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
                  Choose Batch & Physical Workstation
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Cognitive Hub enforces an absolute 3-desk cap per batch. Desks 01, 02, and 03 are hardware-dedicated.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* Batch Selector Tabs */}
            {loadingBatches ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse font-mono">
                Polling studio workstation states...
              </div>
            ) : batches.length === 0 ? (
              <div className="p-6 text-center text-amber-300 text-sm">
                No active batches found for syllabus {selectedCourse}.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {batches.map((batch) => {
                    const openSeats = batch.desks.filter((d) => d.status === 'available').length;
                    const isSelected = selectedBatchId === batch.id;
                    return (
                      <div
                        key={batch.id}
                        onClick={() => {
                          setSelectedBatchId(batch.id);
                          const firstAvail = batch.desks.find((d) => d.status === 'available');
                          setSelectedDesk(firstAvail ? (firstAvail.number as 1 | 2 | 3) : undefined);
                        }}
                        className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-white">{batch.name}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {batch.daysSchedule} • {batch.timeSlot}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                            openSeats > 0
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {openSeats > 0 ? `${openSeats}/3 Open` : 'FULL'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* SVG 3-Desk Workstation Map */}
                {selectedBatch && (
                  <div className="mt-6">
                    <WorkstationMap
                      desks={selectedBatch.desks}
                      selectedDesk={selectedDesk}
                      onSelectDesk={(deskNum) => setSelectedDesk(deskNum)}
                      interactive={true}
                    />
                  </div>
                )}

                {/* All Desks Full Warning & Waitlist */}
                {selectedBatch && selectedBatch.desks.every((d) => d.status !== 'available') && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>{selectedBatch.name} is currently 100% full (3/3 workstations occupied).</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      You can claim a position on our 1-click Priority Waitlist. If a student&apos;s 24-hour hold lapses without payment verification, you will be offered the desk first.
                    </p>
                    {waitlistSuccess ? (
                      <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-medium">
                        ✓ You have been prioritized on the waitlist for {selectedBatch.name}.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleJoinWaitlist}
                        disabled={submitting}
                        className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
                      >
                        Join 1-Click Priority Waitlist
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-2.5 px-4 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNextFromStep2}
                disabled={!selectedDesk}
                className="py-3 px-6 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition flex items-center gap-2"
              >
                <span>Proceed to 3-Minute Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: 3-Minute Diagnostic Baseline */}
        {currentStep === 3 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Step 03 of 04</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
                  3-Minute Diagnostic Baseline
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Quick conceptual benchmark for {selectedCourse}. This establishes your initial baseline profile for the teacher.
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-mono flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                <span>Baseline Check</span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {diagnosticQuestionsForCourse.map((q, index) => (
                <div key={q.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-xs font-bold text-slate-300">
                      Q{index + 1}
                    </span>
                    <p className="text-sm font-medium text-slate-200">{q.question}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIndex) => {
                      const isChosen = diagnosticAnswers[q.id] === optIndex;
                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() =>
                            setDiagnosticAnswers({ ...diagnosticAnswers, [q.id]: optIndex })
                          }
                          className={`p-3 rounded-lg border text-left text-xs transition ${
                            isChosen
                              ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-400'
                              : 'border-slate-800/80 bg-slate-900/40 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="font-mono text-[10px] text-slate-500 mr-2">
                            {String.fromCharCode(65 + optIndex)})
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-2.5 px-4 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSubmitAdmission}
                disabled={submitting}
                className="py-3 px-6 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50 transition flex items-center gap-2"
              >
                {submitting ? (
                  <span>Reserving Workstation...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Lock 24-Hour Hold & Generate Admission Pass</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmation, 24-Hour Hold & Manual Payment */}
        {currentStep === 4 && reservation && (
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Workstation Locked (24-Hour Hold)
                </span>
                <p className="text-3xl font-black text-cyan-400 font-mono tracking-wider mt-0.5">
                  {reservation.admissionNumber}
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-2 text-xs font-bold self-start sm:self-auto">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <span>24-Hour Reservation Lease Active</span>
              </div>
            </div>

            {/* Diagnostic Score Baseline Summary */}
            {diagnosticResult && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Baseline Diagnostic Score:</span>
                <span className="text-cyan-400 font-bold">
                  {diagnosticResult.correct}/{diagnosticResult.total} Correct ({diagnosticResult.percentage}%)
                </span>
              </div>
            )}

            {/* Allocation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono">
              <div>
                <span className="text-slate-500">Student:</span>
                <p className="text-white font-semibold mt-0.5 truncate">{reservation.studentName}</p>
              </div>
              <div>
                <span className="text-slate-500">Assigned Desk:</span>
                <p className="text-cyan-400 font-bold mt-0.5">Desk 0{reservation.deskNumber}</p>
              </div>
              <div>
                <span className="text-slate-500">Course Code:</span>
                <p className="text-white font-semibold mt-0.5">{reservation.courseCode}</p>
              </div>
              <div>
                <span className="text-slate-500">Monthly Tuition:</span>
                <p className="text-emerald-400 font-bold mt-0.5">BDT {reservation.payment.amountBDT.toLocaleString()}</p>
              </div>
            </div>

            {/* Automated WhatsApp Trigger to Studio */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Send className="w-4 h-4" />
                <span>Notify Studio WhatsApp (+8801963341868)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click below to send your Admission ID directly to the studio instructor on WhatsApp to guarantee your 24-hour seat hold:
              </p>
              <a
                href={`https://wa.me/${STUDIO_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Assalamu Alaikum. I reserved Desk 0${reservation.deskNumber} under Admission ID ${reservation.admissionNumber} for ${reservation.courseCode} (${reservation.batchName}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Send WhatsApp Admission Alert</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Manual Payment Submission */}
            <div className="border-t border-slate-800 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">bKash / Nagad TrxID Submission</h3>
                  <p className="text-xs text-slate-400">
                    Submit TrxID now or within 24 hours to transition from Hold to Enrolled.
                  </p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>Merchant No: </span>
                  <span className="text-white font-bold">{STUDIO_CONFIG.bkashMerchantNumber}</span>
                </div>
              </div>

              {paymentSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">Payment TrxID Received!</span> The teacher command center has been notified for 1-tap ledger verification.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleManualPayment} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bkash_manual')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        paymentMethod === 'bkash_manual'
                          ? 'bg-pink-950/60 border-pink-500 text-pink-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      bKash Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('nagad_manual')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        paymentMethod === 'nagad_manual'
                          ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Nagad Payment
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Enter 10-Character Transaction ID (TrxID)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BKA79X4Q9"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingPayment || !trxId.trim()}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    {submittingPayment ? 'Submitting...' : 'Submit TrxID for Verification'}
                  </button>
                </form>
              )}
            </div>

            {/* Actions: Download PDF slip with QR */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Official Reservation Slip (PDF + QR)</span>
              </button>
              <Link
                href="/admin"
                className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs text-center text-slate-400 hover:text-white transition"
              >
                View Teacher Command Center
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
