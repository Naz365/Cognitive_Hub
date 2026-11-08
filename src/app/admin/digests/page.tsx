'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { MessageSquare, Send, CheckCircle2, ArrowLeft, Users, Sparkles, Phone, Award } from 'lucide-react';
import { STUDIO_CONFIG } from '@/lib/constants';

interface StudentDigest {
  studentName: string;
  admissionId: string;
  guardianWhatsApp: string;
  courseCode: string;
  batchName: string;
  deskNumber: number;
  attendancePercent: number;
  sessionsAttended: number;
  labScoreAvg: number;
  masteredUnits: string;
  teacherObservation: string;
}

const STUDENT_DIGESTS: StudentDigest[] = [
  {
    studentName: 'Samiul Haque',
    admissionId: 'CH-2026-0105',
    guardianWhatsApp: '+8801711223344',
    courseCode: '0478',
    batchName: 'Batch A1: Weekend Prime',
    deskNumber: 1,
    attendancePercent: 100,
    sessionsAttended: 8,
    labScoreAvg: 92,
    masteredUnits: 'Data Representation, von Neumann Architecture, Boolean Logic',
    teacherObservation:
      'Demonstrated excellent 2D array matrix logic in Python practicals. Recommended to review trace-table bubble sort passes.',
  },
  {
    studentName: 'Fahim Rahman',
    admissionId: 'CH-2026-0104',
    guardianWhatsApp: '+8801819876543',
    courseCode: '0478',
    batchName: 'Batch A2: Mon/Wed Evening',
    deskNumber: 1,
    attendancePercent: 95,
    sessionsAttended: 7,
    labScoreAvg: 88,
    masteredUnits: 'Computer Architecture, Algorithm Design',
    teacherObservation:
      'Solid command of Python loops and string slicing. Prepared for upcoming Paper 2 mock exam.',
  },
  {
    studentName: 'Tazrian Ahmed',
    admissionId: 'CH-2026-0103',
    guardianWhatsApp: '+8801911445566',
    courseCode: '9618',
    batchName: 'Batch B1: Weekend A-Level Focus',
    deskNumber: 1,
    attendancePercent: 100,
    sessionsAttended: 8,
    labScoreAvg: 95,
    masteredUnits: 'Paper 4 OOP Practical, Abstract Data Types (Binary Trees)',
    teacherObservation:
      'Exceptional recursive tree traversal implementation. Distinction-level Paper 4 trajectory.',
  },
];

export default function ParentWhatsAppDigestsPage() {
  const [digests, setDigests] = useState<StudentDigest[]>(STUDENT_DIGESTS);
  const [sentRecords, setSentRecords] = useState<Record<string, boolean>>({});

  const generateWhatsAppMessage = (s: StudentDigest) => {
    return (
      `*Cognitive Hub Micro-Studio • Weekly Student Progress Digest*\n\n` +
      `Assalamu Alaikum,\n` +
      `Here is the official weekly academic progress report for *${s.studentName}* (*${s.admissionId}*):\n\n` +
      `• *Assigned Workstation:* Desk 0${s.deskNumber} (${s.batchName})\n` +
      `• *Studio Attendance:* ${s.attendancePercent}% (${s.sessionsAttended} / ${s.sessionsAttended} sessions attended)\n` +
      `• *Practical Lab Average:* ${s.labScoreAvg} / 100 Marks\n` +
      `• *Mastered Syllabus Topics:* ${s.masteredUnits}\n` +
      `• *Instructor Observation:* ${s.teacherObservation}\n\n` +
      `Weekly studio consultations are open every Wednesday evening. Feel free to reply directly to this message.\n\n` +
      `*Engr. Nazmul*\n` +
      `Lead Instructor, Cognitive Hub Micro-Studio\n` +
      `WhatsApp: ${STUDIO_CONFIG.whatsappFormatted}`
    );
  };

  const markAsSent = (admissionId: string) => {
    setSentRecords((prev) => ({ ...prev, [admissionId]: true }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/admin" className="text-slate-400 hover:text-white transition mr-2">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <span className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                  <span>Parent WhatsApp Progress Digest Generator</span>
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  Weekly automated attendance, lab scores, and mastery reports delivered directly to guardians
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Digest Cards Roster */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {digests.map((student) => {
            const isSent = sentRecords[student.admissionId];
            const messageText = generateWhatsAppMessage(student);
            const waLink = `https://wa.me/${student.guardianWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              messageText
            )}`;

            return (
              <div
                key={student.admissionId}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-xl space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      Desk 0{student.deskNumber}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{student.admissionId}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-mono">{student.studentName}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {student.batchName} ({student.courseCode})
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Attendance</span>
                      <span className="font-bold text-emerald-400 mt-0.5 block">
                        {student.attendancePercent}% ({student.sessionsAttended} sessions)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Lab Avg</span>
                      <span className="font-bold text-cyan-400 mt-0.5 block">
                        {student.labScoreAvg} / 100
                      </span>
                    </div>
                  </div>

                  {/* Teacher Observation Preview */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-sans text-slate-300">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase block mb-1">
                      Instructor Observation:
                    </span>
                    <p className="line-clamp-3 leading-relaxed">{student.teacherObservation}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => markAsSent(student.admissionId)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition ${
                      isSent
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/40'
                    }`}
                  >
                    {isSent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Digest Sent! (Click to Resend)</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send WhatsApp Digest</span>
                      </>
                    )}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
