'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Batch, AdmissionRecord, WaitlistEntry, StudioStats } from '@/types';
import { COURSES, STUDIO_CONFIG } from '@/lib/constants';
import { generateAdmissionReceiptPDF } from '@/lib/pdf-receipt';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  CreditCard,
  Download,
  Send,
  RefreshCw,
  AlertTriangle,
  Monitor,
  Phone,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export default function AdminCommandCenter() {
  const [stats, setStats] = useState<StudioStats | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'batches' | 'payments' | 'waitlist'>('batches');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  const fetchAdminOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setBatches(data.batches);
        setAdmissions(data.admissions);
        setWaitlist(data.waitlist);
      }
    } catch {
      setActionMessage('Failed to load admin overview.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (admissionNumber: string, action: 'approve' | 'reject') => {
    try {
      setProcessingId(admissionNumber);
      const res = await fetch('/api/admin/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionNumber,
          action,
          teacherId: 'LEAD-INSTRUCTOR-01',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        await fetchAdminOverview();
      } else {
        setActionMessage(data.error || 'Failed to verify payment.');
      }
    } catch {
      setActionMessage('Error processing verification.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReleaseDesk = async (batchId: string, deskId: string) => {
    if (!confirm('Are you sure you want to release this desk back to Available?')) return;
    try {
      const res = await fetch('/api/admin/desks/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, deskId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        await fetchAdminOverview();
      } else {
        setActionMessage(data.error || 'Failed to release desk.');
      }
    } catch {
      setActionMessage('Error releasing desk.');
    }
  };

  const handleDownloadReceipt = async (adm: AdmissionRecord) => {
    const doc = await generateAdmissionReceiptPDF(adm);
    doc.save(`${adm.admissionNumber}-Official-Receipt.pdf`);
  };

  const pendingPayments = admissions.filter((a) => a.payment.status === 'pending_verification');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Command Bar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                <Shield className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-white font-mono tracking-tight">
                  Teacher Command Center
                </h1>
                <p className="text-xs text-slate-400">
                  Micro-Studio Workstation Allocator, 3-Desk Concurrency & Ledger Verification
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminOverview}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Studio State</span>
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Realtime Lock Active</span>
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className="mb-6 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs flex items-center justify-between">
            <span>{actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-cyan-400 hover:text-white font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Studio Pipeline Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Total Desks</span>
              <p className="text-2xl font-black text-white font-mono mt-1">
                {stats.totalDesks}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">3 desks × {stats.totalBatches} batches</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Enrolled</span>
              <p className="text-2xl font-black text-indigo-400 font-mono mt-1">
                {stats.enrolledDesks}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Confirmed & Verified</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
              <span className="text-[11px] font-mono text-slate-400 uppercase">24h Active Holds</span>
              <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                {stats.holdDesks}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Awaiting TrxID Approval</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Available Open</span>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {stats.availableDesks}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Instant Booking</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-800/60 bg-gradient-to-b from-cyan-950/20 to-slate-900/80 backdrop-blur-xl col-span-2 lg:col-span-1">
              <span className="text-[11px] font-mono text-cyan-300 uppercase">Monthly Revenue</span>
              <p className="text-2xl font-black text-cyan-400 font-mono mt-1">
                ৳{stats.collectedRevenueBDT.toLocaleString()}
              </p>
              <p className="text-[10px] text-cyan-500/80 mt-0.5">
                Projected: ৳{stats.projectedRevenueBDT.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('batches')}
            className={`py-3 px-4 font-mono text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'batches'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>3-Desk Live Grid ({batches.length} Batches)</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-4 font-mono text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pending TrxID Queue</span>
            {pendingPayments.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                {pendingPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('waitlist')}
            className={`py-3 px-4 font-mono text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'waitlist'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Priority Waitlist ({waitlist.length})</span>
          </button>
        </div>

        {/* TAB 1: 3-Desk Grid Across All Batches */}
        {activeTab === 'batches' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {batches.map((batch) => {
                const course = COURSES[batch.courseCode];
                return (
                  <div
                    key={batch.id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Batch Header */}
                      <div className="flex items-start justify-between pb-3 border-b border-slate-800/80 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-400">{batch.courseCode}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">{course?.board}</span>
                          </div>
                          <h3 className="text-base font-bold text-white mt-1">{batch.name}</h3>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {batch.daysSchedule} • {batch.timeSlot}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300">
                          {batch.desks.filter((d) => d.status === 'enrolled').length}/3 Enrolled
                        </span>
                      </div>

                      {/* 3 Workstations Side-by-Side */}
                      <div className="grid grid-cols-3 gap-3">
                        {batch.desks.map((desk) => {
                          return (
                            <div
                              key={desk.id}
                              className={`p-3 rounded-xl border flex flex-col justify-between min-h-[140px] text-xs ${
                                desk.status === 'enrolled'
                                  ? 'border-indigo-500/40 bg-indigo-950/20'
                                  : desk.status === 'hold'
                                  ? 'border-amber-500/40 bg-amber-950/20'
                                  : 'border-emerald-500/40 bg-emerald-950/10'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-mono font-bold text-slate-200">
                                    0{desk.number}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                      desk.status === 'enrolled'
                                        ? 'bg-indigo-500/20 text-indigo-300'
                                        : desk.status === 'hold'
                                        ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                                        : 'bg-emerald-500/20 text-emerald-400'
                                    }`}
                                  >
                                    {desk.status}
                                  </span>
                                </div>

                                {desk.studentName ? (
                                  <p className="font-semibold text-white truncate text-xs">
                                    {desk.studentName}
                                  </p>
                                ) : (
                                  <p className="text-slate-500 font-mono text-[11px]">Unassigned</p>
                                )}

                                {desk.admissionId && (
                                  <p className="text-[10px] font-mono text-cyan-400 mt-0.5 truncate">
                                    {desk.admissionId}
                                  </p>
                                )}
                              </div>

                              <div className="mt-2 pt-2 border-t border-slate-800/60">
                                {desk.status === 'hold' ? (
                                  <button
                                    onClick={() => handleReleaseDesk(batch.id, desk.id)}
                                    className="w-full py-1 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-[10px] font-mono text-amber-200 transition"
                                  >
                                    Release Hold
                                  </button>
                                ) : desk.status === 'enrolled' ? (
                                  <div className="text-[10px] font-mono text-indigo-400 text-center">
                                    Active Seat
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-mono text-emerald-400 text-center">
                                    Ready for Hold
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Pending TrxID Queue & 1-Tap Verification */}
        {activeTab === 'payments' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white font-mono">
                Manual bKash / Nagad Transaction Verification Queue
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify student-submitted TrxIDs. Approving permanently locks the desk as Enrolled and generates an official verification QR slip.
              </p>
            </div>

            {admissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                No admission holds created yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-3">Admission ID</th>
                      <th className="py-3 px-3">Student & Phone</th>
                      <th className="py-3 px-3">Batch & Desk</th>
                      <th className="py-3 px-3">Method & TrxID</th>
                      <th className="py-3 px-3">Tuition Fee</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {admissions.map((adm) => {
                      const isPending = adm.payment.status === 'pending_verification';
                      const isVerified = adm.payment.status === 'verified';

                      return (
                        <tr key={adm.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3.5 px-3 font-bold text-cyan-400">
                            {adm.admissionNumber}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-white">{adm.studentName}</div>
                            <div className="text-[11px] text-slate-400">WA: {adm.guardianWhatsApp}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div>{adm.batchName}</div>
                            <div className="text-cyan-400 font-bold">Desk 0{adm.deskNumber}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-slate-200">
                              {adm.payment.method ? adm.payment.method.toUpperCase().replace('_', ' ') : 'N/A'}
                            </span>
                            <div className="text-amber-400 font-bold mt-0.5">
                              {adm.payment.trxId || 'Unsubmitted'}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-slate-200">
                            BDT {adm.payment.amountBDT.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isVerified
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : isPending
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {adm.payment.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleVerifyPayment(adm.admissionNumber, 'approve')}
                                  disabled={processingId === adm.admissionNumber}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition"
                                >
                                  1-Tap Approve
                                </button>
                                <button
                                  onClick={() => handleVerifyPayment(adm.admissionNumber, 'reject')}
                                  disabled={processingId === adm.admissionNumber}
                                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-[11px] transition"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : isVerified ? (
                              <button
                                onClick={() => handleDownloadReceipt(adm)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] flex items-center gap-1 ml-auto transition"
                              >
                                <Download className="w-3 h-3" />
                                <span>Receipt PDF</span>
                              </button>
                            ) : (
                              <a
                                href={`https://wa.me/${adm.guardianWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Assalamu Alaikum. Reminder from Cognitive Hub regarding your 24-hour workstation hold for ${adm.admissionNumber}. Please submit your bKash/Nagad TrxID to secure Desk 0${adm.deskNumber}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 ml-auto transition"
                              >
                                <Phone className="w-3 h-3" />
                                <span>WhatsApp Reminder</span>
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Priority Waitlist */}
        {activeTab === 'waitlist' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white font-mono">
                1-Click Priority Waitlist Queue
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Students who attempted to join a full 3-desk batch. When a 24-hour hold expires without verification, promote the top candidate.
              </p>
            </div>

            {waitlist.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                The priority waitlist is currently empty. All requested batches had available desks.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60 font-mono text-xs">
                {waitlist.map((item, idx) => (
                  <div key={item.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-white text-sm">{item.studentName}</p>
                        <p className="text-slate-400 text-xs">
                          {item.batchName} ({item.courseCode}) • WhatsApp: {item.guardianWhatsApp}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${item.guardianWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Assalamu Alaikum! Great news from Cognitive Hub: A workstation has opened up in ${item.batchName}! Click here to reserve: https://cognitivehub.edu.bd/qr`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <span>Offer Workstation via WA</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
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
