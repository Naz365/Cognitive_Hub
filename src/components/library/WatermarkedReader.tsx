'use client';

import React, { useState } from 'react';
import { LibraryResource } from '@/types';
import { X, ShieldCheck, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Lock, BookOpen } from 'lucide-react';

interface WatermarkedReaderProps {
  resource: LibraryResource;
  studentName?: string;
  studentAdmissionId?: string;
  onClose: () => void;
}

export default function WatermarkedReader({
  resource,
  studentName = 'Samiul Haque',
  studentAdmissionId = 'CH-2026-0105',
  onClose,
}: WatermarkedReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const totalPages = resource.pagesCount || 12;

  const watermarkText = `COGNITIVE HUB MICRO-STUDIO • LICENSED TO: ${studentName.toUpperCase()} (${studentAdmissionId}) • CONFIDENTIAL COPY`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6">
      <div className="relative w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/90 select-none">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md font-mono">
                {resource.title}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span>{resource.courseCode} Shelf</span>
                <span>•</span>
                <span className="text-cyan-400">Page {currentPage} of {totalPages}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <button
                onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                className="hover:text-cyan-400 p-1"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                className="hover:text-cyan-400 p-1"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Watermark Banner */}
        <div className="px-4 py-1.5 bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-950 border-b border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Watermarked In-Browser Reader: Tamper-evident copy logged for {studentName}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-[10px]">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>Right-click & copy disabled</span>
          </div>
        </div>

        {/* Reader Viewer Canvas */}
        <div
          className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-950/70 flex justify-center relative select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Watermark Diagonal Repeating Overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden flex flex-col justify-around opacity-15">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="whitespace-nowrap font-mono text-sm font-black text-cyan-300 tracking-widest -rotate-12 translate-x-12 select-none"
              >
                {watermarkText} • {watermarkText}
              </div>
            ))}
          </div>

          {/* Document Sheet Simulation */}
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-12 relative min-h-[700px] flex flex-col justify-between transition-transform duration-150"
          >
            {/* Sheet Content Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-700 uppercase">
                    Cognitive Hub Syllabus Library • {resource.courseCode}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-serif mt-1">
                    {resource.title}
                  </h3>
                </div>
                <div className="text-right text-xs font-mono text-slate-500">
                  Section {currentPage}.0
                </div>
              </div>

              {/* Sample Excerpt */}
              <div className="space-y-4 font-serif text-slate-800 text-sm leading-relaxed">
                <p className="first-letter:text-3xl first-letter:font-bold first-letter:text-cyan-700 first-letter:float-left first-letter:mr-2">
                  {resource.previewSample}
                </p>

                <p>
                  In this unit, students examine the underlying theoretical principles verified by official Cambridge and Edexcel mark schemes. All algorithmic solutions must adhere strictly to board notation conventions.
                </p>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700">
                  <p className="font-bold text-slate-900 mb-1">Key Examiner Tip:</p>
                  Always specify data types when declaring variables or procedure parameters. In Paper 2 and Paper 4, candidates lose marks when array indexing is assumed to start at 0 instead of checking the syllabus convention (1-based vs 0-based).
                </div>

                <p>
                  Complete questions at the end of this chapter in the Cognitive Hub Timed Quiz Engine to test keyword recognition against recent examination examiner reports.
                </p>
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Licensed copy: {studentAdmissionId}</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        </div>

        {/* Bottom Pagination Controls */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between select-none font-mono text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-40 flex items-center gap-1 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Page</span>
          </button>

          <span className="text-slate-400">
            Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-40 flex items-center gap-1 transition"
          >
            <span>Next Page</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
