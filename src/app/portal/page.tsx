'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { INITIAL_SYLLABUS_UNITS, INITIAL_LAB_SUBMISSIONS } from '@/lib/phase2-constants';
import { COURSES, STUDIO_CONFIG } from '@/lib/constants';
import { SyllabusUnit, LabSubmission, SyllabusCode } from '@/types';
import {
  Sparkles,
  Monitor,
  Clock,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileCode,
  FileSpreadsheet,
  Database,
  Layers,
  TrendingUp,
  Award,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export default function StudentPortalPage() {
  const [syllabusUnits, setSyllabusUnits] = useState<SyllabusUnit[]>(INITIAL_SYLLABUS_UNITS);
  const [submissions, setSubmissions] = useState<LabSubmission[]>(INITIAL_LAB_SUBMISSIONS);
  const [activeCourse, setActiveCourse] = useState<SyllabusCode>('0478');

  // File upload state
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFileType, setSelectedFileType] = useState<'py' | 'html' | 'css' | 'xlsx' | 'accdb'>('py');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Make-up slot modal state
  const [makeUpModalOpen, setMakeUpModalOpen] = useState(false);
  const [makeUpReason, setMakeUpReason] = useState('');
  const [makeUpRequested, setMakeUpRequested] = useState(false);

  const filteredUnits = syllabusUnits.filter((u) => u.courseCode === activeCourse);
  const filteredSubmissions = submissions.filter((s) => s.courseCode === activeCourse);

  const averageMastery = Math.round(
    filteredUnits.reduce((acc, u) => acc + u.confidenceScore, 0) / (filteredUnits.length || 1)
  );

  const handleLabUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    try {
      setUploading(true);
      const res = await fetch('/api/portal/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          fileName: `${uploadTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${selectedFileType}`,
          fileType: selectedFileType,
          courseCode: activeCourse,
        }),
      });
      const data = await res.json();
      if (data.success && data.submission) {
        setSubmissions((prev) => [data.submission, ...prev]);
        setUploadTitle('');
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error submitting lab file:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Student Profile Header & Workstation Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Workstation & Batch Card */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Enrolled & Active Workstation
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800">
                  ID: CH-2026-0105
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                Samiul Haque
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                Cambridge IGCSE Computer Science (0478) • May/June 2027 Series
              </p>

              {/* Hardware & Batch Allocation Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                  <span className="text-[10px] text-slate-500 uppercase block">Dedicated Desk</span>
                  <span className="text-sm font-bold text-cyan-400 mt-0.5 block">Desk 01 (Workstation A)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                  <span className="text-[10px] text-slate-500 uppercase block">Batch Schedule</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">Fri & Sat 10:00 AM</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                  <span className="text-[10px] text-slate-500 uppercase block">Next Studio Session</span>
                  <span className="text-xs font-bold text-amber-300 mt-0.5 block">In 2 Days (Friday)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                  <span className="text-[10px] text-slate-500 uppercase block">Attendance Record</span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5 block">100% (8/8 Sessions)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                Lead Instructor: Engr. Nazmul (WhatsApp: {STUDIO_CONFIG.whatsappFormatted})
              </span>
              <button
                onClick={() => setMakeUpModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Request Make-Up Slot
              </button>
            </div>
          </div>

          {/* Quick Mastery & Grade Trajectory Gauge */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-b from-cyan-950/20 to-slate-900/90 border border-cyan-800/60 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  Syllabus Mastery Index
                </span>
                <Award className="w-5 h-5 text-cyan-400" />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white font-mono">{averageMastery}%</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">Grade Trajectory: A*</span>
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${averageMastery}%` }}
                />
              </div>

              <div className="mt-5 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Theory Papers Mastery</span>
                  <span className="text-cyan-400 font-bold">89%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Paper 2 Python Lab Practical</span>
                  <span className="text-amber-400 font-bold">78%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Logic Gate & Trace Tables</span>
                  <span className="text-emerald-400 font-bold">95%</span>
                </div>
              </div>
            </div>

            <Link
              href="/quiz"
              className="mt-6 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono text-center transition flex items-center justify-center gap-1.5"
            >
              <span>Practice Weak Areas in Quiz Engine</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* SECTION 2: OFFICIAL SYLLABUS MASTERY TRACKER */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>Unit-by-Unit Syllabus Mastery Tracker</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target learning objectives classified by Cambridge & Pearson Edexcel assessment standards.
              </p>
            </div>

            {/* Course Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              {(['0478', '9618', '4CP0', '4IT1'] as SyllabusCode[]).map((code) => (
                <button
                  key={code}
                  onClick={() => setActiveCourse(code)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeCourse === code
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      Unit 0{unit.unitNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        unit.masteryLevel === 'mastered'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : unit.masteryLevel === 'practicing'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {unit.masteryLevel.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white font-sans leading-snug">{unit.title}</h3>

                  <ul className="mt-3 space-y-1.5 text-xs text-slate-400 font-sans">
                    {unit.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-mono">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    Confidence: <strong className="text-white">{unit.confidenceScore}%</strong>
                  </span>
                  <span className="text-slate-400">
                    {unit.pastPaperQuestionsLinked} Questions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: PRACTICAL LAB UPLOAD DROPZONE & VERSION HISTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Dropzone */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-cyan-400" />
                <span>Practical Lab Upload Dropzone</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload practical solutions for teacher code annotation (.py, .html, .css, .xlsx, .accdb).
              </p>
            </div>

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Source file received! Teacher annotation scheduled.</span>
              </div>
            )}

            <form onSubmit={handleLabUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Assignment / Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paper 4 Binary Tree ADT Implementation"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  File Format & Environment *
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {(['py', 'html', 'css', 'xlsx', 'accdb'] as const).map((ext) => (
                    <button
                      key={ext}
                      type="button"
                      onClick={() => setSelectedFileType(ext)}
                      className={`py-2 px-3 rounded-lg border uppercase font-bold transition ${
                        selectedFileType === ext
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      .{ext}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 border-2 border-dashed border-slate-700 hover:border-cyan-400/60 rounded-2xl text-center space-y-2 cursor-pointer bg-slate-950/40 transition">
                <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto" />
                <p className="text-xs text-slate-300 font-mono">
                  Drop files here or click to browse source code
                </p>
                <p className="text-[10px] text-slate-500 font-mono">Max size 25MB • Strict security scanner enabled</p>
              </div>

              <button
                type="submit"
                disabled={uploading || !uploadTitle.trim()}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition disabled:opacity-40"
              >
                {uploading ? 'Uploading to Studio Vault...' : 'Submit Lab File for Teacher Annotation'}
              </button>
            </form>
          </div>

          {/* Submissions & Teacher Annotations Feed */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white font-mono">
                Recent Submissions & Teacher Annotations
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {filteredSubmissions.length} Lab Files
              </span>
            </div>

            <div className="space-y-3">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-400 uppercase">
                          .{sub.fileType}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">{sub.title}</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">
                        {sub.fileName} • {sub.fileSizeKb} KB • v{sub.version}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          sub.status === 'graded'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {sub.status === 'graded' ? `${sub.score}/100` : 'Pending Review'}
                      </span>
                    </div>
                  </div>

                  {sub.teacherAnnotation && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-sans text-slate-300 space-y-1">
                      <span className="text-cyan-400 font-mono font-bold block text-[11px]">
                        Teacher Feedback:
                      </span>
                      <p className="leading-relaxed">{sub.teacherAnnotation}</p>
                    </div>
                  )}

                  {sub.rubricFeedback && (
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1">
                      <div className="p-2 rounded bg-slate-900 text-slate-300 text-center">
                        <span className="block text-slate-500">Efficiency</span>
                        <span className="font-bold text-white">{sub.rubricFeedback.algorithmicEfficiency}/10</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 text-slate-300 text-center">
                        <span className="block text-slate-500">Syntax Style</span>
                        <span className="font-bold text-white">{sub.rubricFeedback.syntaxAndStyle}/10</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 text-slate-300 text-center">
                        <span className="block text-slate-500">Mark Scheme</span>
                        <span className="font-bold text-cyan-400">{sub.rubricFeedback.markSchemeCompliance}/10</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Make-Up Slot Modal */}
      {makeUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white font-mono">
              Request 1-on-1 Studio Make-Up Slot
            </h3>
            <p className="text-xs text-slate-400">
              Cognitive Hub provides 1 make-up slot per month for missed micro-studio sessions.
            </p>

            {makeUpRequested ? (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                ✓ Request submitted! The lead teacher will propose an alternate workstation slot via WhatsApp.
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="State reason for absence and preferred make-up day..."
                  value={makeUpReason}
                  onChange={(e) => setMakeUpReason(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setMakeUpModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setMakeUpRequested(true)}
                    disabled={!makeUpReason.trim()}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono disabled:opacity-40"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
