'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import {
  Monitor,
  Radio,
  Lock,
  Unlock,
  Sparkles,
  Play,
  Share2,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  ArrowLeft,
  Send,
} from 'lucide-react';

interface DeskCodeState {
  deskNumber: 1 | 2 | 3;
  studentName: string;
  admissionId: string;
  code: string;
  language: string;
  isFrozen: boolean;
  isSpotlight: boolean;
  statusText: string;
  statusType: 'ok' | 'error' | 'warning';
}

const INITIAL_DESKS: DeskCodeState[] = [
  {
    deskNumber: 1,
    studentName: 'Samiul Haque',
    admissionId: 'CH-2026-0105',
    code: `def binary_search(arr, target):\n    low = 0\n    high = len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\nprint(binary_search([10, 20, 30, 40], 30))`,
    language: 'python',
    isFrozen: false,
    isSpotlight: true,
    statusText: 'Compiled Successfully (Exit 0)',
    statusType: 'ok',
  },
  {
    deskNumber: 2,
    studentName: 'Fahim Rahman',
    admissionId: 'CH-2026-0104',
    code: `numbers = [45, 12, 85, 32]\ntarget = 85\nfound = False\nfor i in range(len(numbers)):\n    if numbers[i] == target:\n        found = True\n        print("Item located at index", i)\n        break`,
    language: 'python',
    isFrozen: false,
    isSpotlight: false,
    statusText: 'Executing Loop Iteration 2',
    statusType: 'ok',
  },
  {
    deskNumber: 3,
    studentName: 'Tazrian Ahmed',
    admissionId: 'CH-2026-0103',
    code: `class Node:\n    def __init__(self, value):\n        self.value = value\n        self.left = None\n        self.right = None\n\nroot = Node(50)\nroot.left = Node(30)\n# Missing recursive tree traversal`,
    language: 'python',
    isFrozen: false,
    isSpotlight: false,
    statusText: 'Warning: Incomplete Recursion',
    statusType: 'warning',
  },
];

export default function Live3DeskMonitorPage() {
  const [desks, setDesks] = useState<DeskCodeState[]>(INITIAL_DESKS);
  const [starterTemplate, setStarterTemplate] = useState('Paper 4 Binary Tree ADT Starter');
  const [broadcastAlert, setBroadcastAlert] = useState<string | null>(null);

  const toggleFreeze = (deskNum: 1 | 2 | 3) => {
    setDesks((prev) =>
      prev.map((d) => (d.deskNumber === deskNum ? { ...d, isFrozen: !d.isFrozen } : d))
    );
  };

  const toggleSpotlight = (deskNum: 1 | 2 | 3) => {
    setDesks((prev) =>
      prev.map((d) => (d.deskNumber === deskNum ? { ...d, isSpotlight: !d.isSpotlight } : { ...d, isSpotlight: false }))
    );
  };

  const handleBroadcastStarter = () => {
    const starterCode = `# Cognitive Hub Teacher Broadcast Starter: ${starterTemplate}\n# Workstation Task: Implement subroutines according to Cambridge mark scheme\n\ndef solution_task():\n    pass\n`;

    setDesks((prev) => prev.map((d) => ({ ...d, code: starterCode })));
    setBroadcastAlert(`Successfully pushed '${starterTemplate}' to all 3 workstations!`);
    setTimeout(() => setBroadcastAlert(null), 4000);
  };

  const handleUpdateStudentCode = (deskNum: 1 | 2 | 3, newCode: string) => {
    setDesks((prev) =>
      prev.map((d) => (d.deskNumber === deskNum ? { ...d, code: newCode } : d))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="text-slate-400 hover:text-white transition mr-2"
                title="Back to Admin"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                  <span>Live 3-Desk Workstation Code Monitor</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Live Broadcast Active
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  Batch: Batch A1 Weekend Prime (Cambridge 0478) • Desks 01, 02, 03 Synchronized
                </p>
              </div>
            </div>
          </div>

          {/* Broadcast Starter Code Controls */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <select
              value={starterTemplate}
              onChange={(e) => setStarterTemplate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="Paper 4 Binary Tree ADT Starter">Binary Tree ADT</option>
              <option value="Bubble Sort with Flag Starter">Bubble Sort with Early Exit</option>
              <option value="Linear Search Sentinel Starter">Linear Search Sentinel</option>
            </select>

            <button
              onClick={handleBroadcastStarter}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition shadow-md shadow-cyan-950/40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast to 3 Desks</span>
            </button>
          </div>
        </div>

        {broadcastAlert && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{broadcastAlert}</span>
          </div>
        )}

        {/* 3 Workstation Split-Screen Panes Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {desks.map((desk) => (
            <div
              key={desk.deskNumber}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xl min-h-[520px] ${
                desk.isSpotlight
                  ? 'border-cyan-400 bg-slate-900 ring-2 ring-cyan-400/50 shadow-cyan-950/60'
                  : desk.isFrozen
                  ? 'border-amber-500/50 bg-slate-900/90'
                  : 'border-slate-800 bg-slate-900/90'
              }`}
            >
              {/* Desk Pane Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-mono">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs font-bold text-white">Desk 0{desk.deskNumber}</span>
                    <span className="text-[10px] text-slate-500">({desk.admissionId})</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">{desk.studentName}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleSpotlight(desk.deskNumber)}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      desk.isSpotlight
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                    title="Spotlight to Studio Screen"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => toggleFreeze(desk.deskNumber)}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      desk.isFrozen
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                    title={desk.isFrozen ? 'Unfreeze Workstation' : 'Freeze Workstation'}
                  >
                    {desk.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Code Editor Body */}
              <div className="p-3 bg-slate-950 flex-1 flex flex-col font-mono text-xs">
                {desk.isFrozen && (
                  <div className="p-2 mb-2 rounded bg-amber-950/60 border border-amber-800/80 text-amber-300 text-[10px] flex items-center justify-between">
                    <span>🔒 Workstation Frozen by Teacher for Code Inspection</span>
                  </div>
                )}

                <textarea
                  rows={14}
                  disabled={desk.isFrozen}
                  value={desk.code}
                  onChange={(e) => handleUpdateStudentCode(desk.deskNumber, e.target.value)}
                  className="w-full flex-1 p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-cyan-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* Bottom Telemetry Status */}
              <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      desk.statusType === 'ok'
                        ? 'bg-emerald-400'
                        : desk.statusType === 'warning'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  />
                  <span className="text-slate-400 truncate max-w-[160px]">{desk.statusText}</span>
                </div>

                <span className="text-slate-500">{desk.language.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
