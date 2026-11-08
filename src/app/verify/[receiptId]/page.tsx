'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { ShieldCheck, XCircle, ArrowLeft } from 'lucide-react';
import { STUDIO_CONFIG, COURSES } from '@/lib/constants';

interface ReceiptDetails {
  receiptId: string;
  admissionNumber: string;
  studentName: string;
  courseCode: string;
  batchName: string;
  deskNumber: number;
  status: string;
  paymentStatus: string;
  amountBDT: number;
  method?: string;
  trxId?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

function VerifyReceiptContent() {
  const params = useParams();
  const receiptId = params.receiptId as string;

  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!receiptId) return;

    const checkReceipt = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/verify/${receiptId}`);
        const data = await res.json();
        if (data.success && data.receipt) {
          setReceipt(data.receipt);
        } else {
          setError(data.error || 'Receipt record not found in Cognitive Hub registry.');
        }
      } catch {
        setError('Error connecting to verification registry.');
      } finally {
        setLoading(false);
      }
    };

    checkReceipt();
  }, [receiptId]);

  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Cognitive Hub</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono animate-pulse">
          Cryptographically verifying reservation receipt {receiptId}...
        </div>
      ) : error || !receipt ? (
        <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white font-mono">Invalid or Unrecognized Slip</h1>
          <p className="text-xs text-slate-400">{error || 'This receipt ID is not registered in our micro-studio database.'}</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Verification Stamp */}
          <div className="text-center pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              Official Studio Verification
            </span>
            <h1 className="text-2xl font-black text-white font-mono mt-1">
              Authentic Reservation Pass
            </h1>
            <p className="text-xs font-mono text-cyan-400 mt-1">
              Receipt #{receipt.receiptId}
            </p>
          </div>

          {/* Verified Details */}
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Student Name:</span>
              <span className="font-bold text-white text-sm">{receipt.studentName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Admission ID:</span>
              <span className="font-bold text-cyan-400">{receipt.admissionNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Allocated Workstation:</span>
              <span className="font-bold text-emerald-400">Desk 0{receipt.deskNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Syllabus Track:</span>
              <span className="font-bold text-white">{receipt.courseCode} ({COURSES[receipt.courseCode]?.title})</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Batch Schedule:</span>
              <span className="text-slate-200">{receipt.batchName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Payment Status:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                receipt.paymentStatus === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {receipt.paymentStatus}
              </span>
            </div>
            {receipt.trxId && (
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Verified TrxID:</span>
                <span className="text-amber-400 font-bold">{receipt.trxId}</span>
              </div>
            )}
          </div>

          {/* Studio Guarantee */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 font-mono text-center">
            Verified by {STUDIO_CONFIG.name} • {STUDIO_CONFIG.location}
            <br />
            Teacher WhatsApp: {STUDIO_CONFIG.whatsappFormatted}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyReceiptPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="p-12 text-center text-xs text-slate-400 font-mono animate-pulse">
            Loading verification data...
          </div>
        }>
          <VerifyReceiptContent />
        </Suspense>
      </main>
    </div>
  );
}
