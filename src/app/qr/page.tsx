'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Batch, SyllabusCode, AdmissionRecord } from '@/types';
import { COURSES, STUDIO_CONFIG } from '@/lib/constants';
import { generateAdmissionReceiptPDF } from '@/lib/pdf-receipt';
import {
  Sparkles,
  QrCode,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  Download,
  AlertCircle,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QRFastTrackPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [studentName, setStudentName] = useState('');
  const [guardianWhatsApp, setGuardianWhatsApp] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<SyllabusCode>('0478');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedDesk, setSelectedDesk] = useState<1 | 2 | 3 | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [reservation, setReservation] = useState<AdmissionRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Manual payment state
  const [paymentMethod, setPaymentMethod] = useState<'bkash_manual' | 'nagad_manual'>('bkash_manual');
  const [trxId, setTrxId] = useState('');
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Waitlist state
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, [selectedCourse]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/batches?courseCode=${selectedCourse}`);
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
        if (data.batches.length > 0) {
          setSelectedBatchId(data.batches[0].id);
          // Auto-select first available desk
          const firstAvail = data.batches[0].desks.find((d: { status: string }) => d.status === 'available');
          setSelectedDesk(firstAvail ? (firstAvail.number as 1 | 2 | 3) : null);
        }
      }
    } catch {
      setError('Could not fetch studio batches.');
    } finally {
      setLoading(false);
    }
  };

  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const allDesksFull = currentBatch?.desks.every((d) => d.status !== 'available');

  const handleFastTrackReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !guardianWhatsApp.trim() || !selectedDesk || !selectedBatchId) {
      setError('Please provide your name, WhatsApp number, and choose an available desk.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/admissions/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          studentPhone: guardianWhatsApp,
          guardianWhatsApp,
          courseCode: selectedCourse,
          targetSeries: COURSES[selectedCourse].targetSeries[0],
          batchId: selectedBatchId,
          deskNumber: selectedDesk,
        }),
      });

      const data = await res.json();
      if (data.success && data.admission) {
        setReservation(data.admission);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22D3EE', '#06B6D4', '#6366F1'],
        });
      } else {
        setError(data.error || 'Failed to lock desk hold. Desk may have been taken.');
      }
    } catch {
      setError('Network error reserving seat. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinWaitlist = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('/api/admissions/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          studentPhone: guardianWhatsApp,
          guardianWhatsApp,
          courseCode: selectedCourse,
          batchId: selectedBatchId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWaitlistJoined(true);
      } else {
        setError(data.error || 'Failed to join waitlist.');
      }
    } catch {
      setError('Error joining waitlist.');
    } finally {
      setSubmitting(false);
    }
  };

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

  const handleDownloadSlip = async () => {
    if (!reservation) return;
    const doc = await generateAdmissionReceiptPDF(reservation);
    doc.save(`${reservation.admissionNumber}-Workstation-Slip.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Top Speed Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-cyan-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Flyer / Poster Fast-Track
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono">
                  &lt; 60s
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Check 3-desk live availability & reserve your workstation instantly
              </p>
            </div>
          </div>
          <QrCode className="w-6 h-6 text-amber-400/80 hidden sm:block" />
        </div>

        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COGNITIVE HUB MICRO-STUDIO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            Fast-Track Workstation Pass
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hard cap of 3 students per batch • Realtime seat allocation
          </p>
        </div>

        {/* SUCCESS STATE: SEAT HELD */}
        {reservation ? (
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">Official Reservation ID</span>
                <p className="text-2xl font-black text-cyan-400 font-mono tracking-wider">
                  {reservation.admissionNumber}
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 text-xs font-bold">
                <Clock className="w-4 h-4 animate-spin text-amber-400" />
                <span>24-Hour Hold Active</span>
              </div>
            </div>

            {/* Assigned Details Card */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs font-mono">
              <div>
                <span className="text-slate-400">Student:</span>
                <p className="text-white font-semibold text-sm mt-0.5">{reservation.studentName}</p>
              </div>
              <div>
                <span className="text-slate-400">Assigned Desk:</span>
                <p className="text-cyan-400 font-bold text-sm mt-0.5">Desk 0{reservation.deskNumber}</p>
              </div>
              <div>
                <span className="text-slate-400">Syllabus Track:</span>
                <p className="text-white font-semibold mt-0.5">{reservation.courseCode} ({COURSES[reservation.courseCode]?.title})</p>
              </div>
              <div>
                <span className="text-slate-400">Batch Slot:</span>
                <p className="text-slate-300 mt-0.5">{reservation.batchName}</p>
              </div>
            </div>

            {/* Direct Studio WhatsApp Action */}
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Send className="w-4 h-4" />
                <span>Notify Studio WhatsApp (+8801963341868)</span>
              </div>
              <p className="text-slate-300">
                To prevent accidental expiration, send your Admission ID directly to the lead instructor on WhatsApp:
              </p>
              <a
                href={`https://wa.me/${STUDIO_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hi Cognitive Hub! I reserved Desk 0${reservation.deskNumber} under Admission ID ${reservation.admissionNumber} for syllabus ${reservation.courseCode}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition"
              >
                <span>Open WhatsApp & Send Confirmation</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Manual Payment Submission Form */}
            <div className="border-t border-slate-800 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">bKash / Nagad TrxID Submission</h3>
                  <p className="text-xs text-slate-400">
                    Monthly Fee: <span className="text-cyan-400 font-bold">BDT {reservation.payment.amountBDT.toLocaleString()}</span>
                  </p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <div>bKash/Nagad Merchant:</div>
                  <div className="text-white font-bold">{STUDIO_CONFIG.bkashMerchantNumber}</div>
                </div>
              </div>

              {paymentSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">TrxID Submitted!</span> Pending 1-tap teacher verification. Your workstation hold is locked.
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
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingPayment || !trxId.trim()}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    {submittingPayment ? 'Submitting TrxID...' : 'Submit TrxID for Verification'}
                  </button>
                </form>
              )}
            </div>

            {/* Actions: Download PDF slip */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadSlip}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Reservation PDF with QR</span>
              </button>
              <Link
                href="/"
                className="py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs text-center text-slate-400 hover:text-white transition"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          /* RESERVATION FORM */
          <form
            onSubmit={handleFastTrackReserve}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
          >
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                  1. Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahir Abdullah"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">
                  2. Parent / Student WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX or +8801..."
                  value={guardianWhatsApp}
                  onChange={(e) => setGuardianWhatsApp(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Admission pass and hold expiration alerts are delivered here.
                </span>
              </div>
            </div>

            {/* Step 2: Course Syllabus Selector */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                3. Target Examination Syllabus *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['0478', '9618', '4CP0', '4IT1'] as SyllabusCode[]).map((code) => {
                  const course = COURSES[code];
                  const isSelected = selectedCourse === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setSelectedCourse(code)}
                      className={`p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-400">{code}</span>
                        <span className="text-[10px] text-slate-400">{course.board}</span>
                      </div>
                      <p className="text-xs font-semibold text-white mt-1 line-clamp-1">{course.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">BDT {course.monthlyFeeBDT.toLocaleString()}/mo</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Batch Slot Selector */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                4. Select Studio Batch Slot *
              </label>
              {loading ? (
                <div className="p-4 text-center text-xs text-slate-400 animate-pulse font-mono">
                  Checking workstation availability...
                </div>
              ) : batches.length === 0 ? (
                <p className="text-xs text-amber-400">No active batches for this syllabus yet.</p>
              ) : (
                <div className="space-y-2">
                  {batches.map((batch) => {
                    const availableDesksCount = batch.desks.filter((d) => d.status === 'available').length;
                    const isSelected = selectedBatchId === batch.id;
                    return (
                      <div
                        key={batch.id}
                        onClick={() => {
                          setSelectedBatchId(batch.id);
                          const firstAvail = batch.desks.find((d) => d.status === 'available');
                          setSelectedDesk(firstAvail ? (firstAvail.number as 1 | 2 | 3) : null);
                        }}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/30'
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{batch.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {batch.daysSchedule} • {batch.timeSlot}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              availableDesksCount > 0
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {availableDesksCount > 0 ? `${availableDesksCount}/3 Seats Open` : 'FULL (3/3)'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 4: Interactive 3-Desk Workstation Selector */}
            {currentBatch && (
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                  5. Choose Dedicated Workstation (Strict Max 3 Desks) *
                </label>
                {allDesksFull ? (
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                      <Clock className="w-4 h-4" />
                      <span>All 3 Desks Are Currently Reserved in This Batch</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      You can enter our 1-click Priority Waitlist. If a 24-hour hold expires without payment verification, you will receive immediate WhatsApp promotion.
                    </p>
                    {waitlistJoined ? (
                      <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-medium">
                        ✓ You are #1 on the Priority Waitlist for {currentBatch.name}.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleJoinWaitlist}
                        disabled={submitting || !studentName.trim() || !guardianWhatsApp.trim()}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
                      >
                        Join 1-Click Priority Waitlist
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {currentBatch.desks.map((desk) => {
                      const isAvailable = desk.status === 'available';
                      const isSelected = selectedDesk === desk.number;
                      return (
                        <button
                          key={desk.id}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setSelectedDesk(desk.number as 1 | 2 | 3)}
                          className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-between min-h-[90px] ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-950/60 ring-2 ring-cyan-400'
                              : isAvailable
                              ? 'border-emerald-500/40 bg-emerald-950/10 hover:border-emerald-400 hover:bg-emerald-950/30'
                              : 'border-slate-800 bg-slate-950 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-xs font-mono font-bold text-slate-200">
                            Desk 0{desk.number}
                          </span>
                          <span
                            className={`text-[10px] font-semibold mt-1 ${
                              isSelected
                                ? 'text-cyan-300 font-bold'
                                : isAvailable
                                ? 'text-emerald-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : isAvailable ? 'Open' : desk.status.toUpperCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Fast-Track Reserve Button */}
            {!allDesksFull && (
              <button
                type="submit"
                disabled={submitting || !selectedDesk}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Reserving Workstation...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Lock Workstation for 24 Hours Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            <div className="text-center text-[11px] text-slate-400 font-mono">
              Reservation is 100% free for 24 hours • Pay via bKash/Nagad only after reserving
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
