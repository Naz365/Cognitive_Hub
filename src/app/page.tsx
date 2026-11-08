'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import WorkstationMap from '@/components/studio/WorkstationMap';
import { Batch, SyllabusCode } from '@/types';
import { COURSES, STUDIO_CONFIG } from '@/lib/constants';
import {
  Sparkles,
  ArrowRight,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Terminal,
  Cpu,
  Layers,
  ChevronRight,
  Brain,
  Code2,
  FileCheck2,
} from 'lucide-react';

export default function HomePage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeCourseFilter, setActiveCourseFilter] = useState<SyllabusCode>('0478');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      const data = await res.json();
      if (data.success && data.batches.length > 0) {
        setBatches(data.batches);
        setSelectedBatchId(data.batches[0].id);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const filteredBatches = batches.filter((b) => b.courseCode === activeCourseFilter);
  const activeBatch = filteredBatches.find((b) => b.id === selectedBatchId) || filteredBatches[0] || batches[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Futuristic Ambient Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/15 via-indigo-500/10 to-violet-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Invariant Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-6 backdrop-blur-md shadow-lg shadow-cyan-950/40">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Strict Invariant: Exactly 3 Desks Per Batch • Never Overbooked</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-mono max-w-4xl mx-auto leading-tight">
            The 3-Desk <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">Micro-Studio</span> for CS & ICT
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate generic 30-student coaching center lectures. An ultra-exclusive 3-workstation learning lab for Cambridge (0478, 9618) and Pearson Edexcel (4CP0, 4IT1).
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admissions"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Reserve Workstation (24-Hour Free Hold)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/qr"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl text-sm font-mono font-semibold text-amber-300 bg-amber-950/30 border border-amber-500/40 hover:bg-amber-900/30 flex items-center justify-center gap-2 transition"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Poster Fast-Track (&lt; 60s)</span>
            </Link>
          </div>

          {/* Value Stats Pills */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left font-mono">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <span className="text-[11px] text-slate-400 uppercase">Batch Size Cap</span>
              <p className="text-xl font-bold text-white mt-1">3 Students Max</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <span className="text-[11px] text-slate-400 uppercase">Hardware Rigs</span>
              <p className="text-xl font-bold text-cyan-400 mt-1">Dual 27″ QHD</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <span className="text-[11px] text-slate-400 uppercase">Curricula Covered</span>
              <p className="text-xl font-bold text-indigo-400 mt-1">0478 • 9618 • 4CP0 • 4IT1</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <span className="text-[11px] text-slate-400 uppercase">Seat Hold Policy</span>
              <p className="text-xl font-bold text-amber-400 mt-1">24h Auto-Release</p>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE INTERACTIVE 3-DESK WORKSTATION ENGINE PREVIEW */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Live Workstation Telemetry
            </span>
            <h2 className="text-3xl font-bold text-white font-mono mt-1">
              Real-Time 3-Desk Studio Availability
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every batch has exactly three physical desks. Check availability in real time and lock your seat for 24 hours.
            </p>
          </div>

          {/* Syllabus Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {(['0478', '9618', '4CP0', '4IT1'] as SyllabusCode[]).map((code) => {
              const course = COURSES[code];
              const isSelected = activeCourseFilter === code;
              return (
                <button
                  key={code}
                  onClick={() => {
                    setActiveCourseFilter(code);
                    const matching = batches.filter((b) => b.courseCode === code);
                    if (matching.length > 0) setSelectedBatchId(matching[0].id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{code}</span>
                  <span className="text-[10px] opacity-80">({course.board})</span>
                </button>
              );
            })}
          </div>

          {/* Active Batch Selection & Map */}
          {activeBatch && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400 font-bold">{activeBatch.courseCode}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-sm font-bold text-white">{activeBatch.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Schedule: {activeBatch.daysSchedule} • {activeBatch.timeSlot}
                  </p>
                </div>

                <Link
                  href={`/admissions?course=${activeBatch.courseCode}`}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0"
                >
                  <span>Reserve This Batch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Physical SVG Workstation Map */}
              <WorkstationMap desks={activeBatch.desks} interactive={false} />
            </div>
          )}
        </div>
      </section>

      {/* FOUR SYLLABUS TRACKS (0478, 9618, 4CP0, 4IT1) */}
      <section id="courses" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Official Examination Curricula
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-1">
              Engineered for Board Distinctions
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Deep alignment with Cambridge International and Pearson Edexcel specifications, mark schemes, and practical programming papers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['0478', '9618', '4CP0', '4IT1'] as SyllabusCode[]).map((code) => {
              const course = COURSES[code];
              return (
                <div
                  key={code}
                  className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-lg font-mono text-xs font-bold bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                        {course.code}
                      </span>
                      <span className="text-xs font-mono text-slate-400 uppercase">{course.board}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white font-mono">{course.title}</h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{course.description}</p>

                    <div className="mt-5 space-y-2">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">
                        Hands-On Practical Lab Focus:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {course.practicalFocus.map((focus) => (
                          <span
                            key={focus}
                            className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-950 border border-slate-800 text-slate-300"
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Monthly Tuition</span>
                      <span className="text-sm font-bold font-mono text-white">
                        BDT {course.monthlyFeeBDT.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/admissions?course=${course.code}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition flex items-center gap-1.5"
                    >
                      <span>Reserve Desk</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* THE 3-DESK PEDAGOGICAL MODEL */}
      <section id="methodology" className="py-20 bg-slate-900/30 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Pedagogical Paradigm
            </span>
            <h2 className="text-3xl font-extrabold text-white font-mono mt-1">
              Why 3 Desks Beat 30-Student Classes
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              In computer science, passive listening produces syntax errors. Active code monitoring builds distinction-level mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Generic Coaching */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-rose-900/40 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Typical Coaching Centers (20–40 Students)</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Passive whiteboard copying while the teacher rushes through syllabus theory.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Student code logic errors go unnoticed on laptops in the back row.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Mark schemes handed out weeks later with generic scores and no line-by-line feedback.</span>
                </li>
              </ul>
            </div>

            {/* Cognitive Hub Micro-Studio */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-xl shadow-cyan-950/30 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Cognitive Hub Micro-Studio (Max 3 Desks)</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Live code monitoring: Teacher sees all 3 workstation screens simultaneously.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Instant mark-scheme keyword checking with highlighted matched and missed marks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Trace-table simulator, logic gate diagnostics, and direct WhatsApp guardian updates.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/05_vector_svg_sources/logo-icon-dark-glow.svg"
              alt="Cognitive Hub Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <div>
              <span className="text-sm font-bold font-mono text-white">COGNITIVE HUB</span>
              <p className="text-xs text-slate-400">{STUDIO_CONFIG.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400">
            <Link href="/admissions" className="hover:text-cyan-400 transition">
              Admissions
            </Link>
            <Link href="/qr" className="hover:text-amber-400 transition">
              QR Fast-Track
            </Link>
            <Link href="/admin" className="hover:text-cyan-400 transition">
              Teacher Command
            </Link>
            <a
              href={`https://wa.me/${STUDIO_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}`}
              className="text-cyan-400 hover:underline"
            >
              WhatsApp: {STUDIO_CONFIG.whatsappFormatted}
            </a>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            &copy; 2026 Cognitive Hub Micro-Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
