'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import TraceTableSimulator from '@/components/lab/TraceTableSimulator';
import LogicGateSimulator from '@/components/lab/LogicGateSimulator';
import EvidenceDocumentBuilder from '@/components/lab/EvidenceDocumentBuilder';
import { transpileCambridgeToPython, executeSimulatedPython } from '@/lib/transpiler';
import {
  Code2,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  FileCheck2,
  Table,
  BookOpen,
} from 'lucide-react';

// Dynamic import for Monaco to prevent SSR window issues
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 flex items-center justify-center bg-slate-950 font-mono text-xs text-slate-500 animate-pulse">
      Loading Monaco Code Engine...
    </div>
  ),
});

const STARTER_PSEUDOCODE = `// Cambridge IGCSE / A-Level Standard Pseudocode
DECLARE Scores : ARRAY[1:5] OF INTEGER
DECLARE Total : INTEGER
DECLARE Average : REAL

Scores <- [78, 85, 92, 64, 88]
Total <- 0

FOR Index <- 1 TO 5
    Total <- Total + Scores[Index]
ENDFOR

Average <- Total / 5.0
OUTPUT "Sum of scores: ", Total
OUTPUT "Calculated class average: ", Average
`;

export default function CodingLabPage() {
  const [activeTab, setActiveTab] = useState<'ide' | 'trace' | 'gates' | 'evidence'>('ide');

  // IDE states
  const [pseudocode, setPseudocode] = useState<string>(STARTER_PSEUDOCODE);
  const [pythonCode, setPythonCode] = useState<string>(
    transpileCambridgeToPython(STARTER_PSEUDOCODE).pythonCode
  );
  const [consoleOutput, setConsoleOutput] = useState<string>(
    'Cognitive Hub Python 3 WebAssembly Node Initialized.\nReady for code execution.'
  );
  const [runningCode, setRunningCode] = useState(false);

  const handleTranspile = () => {
    const res = transpileCambridgeToPython(pseudocode);
    setPythonCode(res.pythonCode);
  };

  const handleRunPython = () => {
    setRunningCode(true);
    setConsoleOutput('Executing Python 3 on dedicated virtual workstation...\n');

    setTimeout(() => {
      const result = executeSimulatedPython(pythonCode);
      if (result.error) {
        setConsoleOutput((prev) => `${prev}\n❌ ${result.error}`);
      } else {
        setConsoleOutput((prev) => `${prev}${result.output}\n\n[Finished in 0.04s]`);
      }
      setRunningCode(false);
    }, 250);
  };

  const loadPreset = (preset: 'search' | 'bubble' | 'oop') => {
    if (preset === 'search') {
      const code = `DECLARE Target : INTEGER
DECLARE Found : BOOLEAN
DECLARE Pos : INTEGER
Target <- 42
Found <- FALSE
Pos <- 1

WHILE Pos <= 10 AND Found = FALSE DO
    IF Pos * 7 = Target THEN
        Found <- TRUE
        OUTPUT "Match discovered at index: ", Pos
    ENDIF
    Pos <- Pos + 1
ENDWHILE
`;
      setPseudocode(code);
      setPythonCode(transpileCambridgeToPython(code).pythonCode);
    } else if (preset === 'bubble') {
      const code = `DECLARE Arr : ARRAY[1:4] OF INTEGER
DECLARE Temp : INTEGER
Arr <- [40, 10, 30, 20]

FOR i <- 1 TO 3
    FOR j <- 1 TO 4 - i
        IF Arr[j] > Arr[j + 1] THEN
            Temp <- Arr[j]
            Arr[j] <- Arr[j + 1]
            Arr[j + 1] <- Temp
        ENDIF
    ENDFOR
ENDFOR
OUTPUT "Sorted Array:", Arr
`;
      setPseudocode(code);
      setPythonCode(transpileCambridgeToPython(code).pythonCode);
    } else {
      const code = `// Cambridge 9618 Paper 4 OOP Class
PROCEDURE Main()
    OUTPUT "Initializing Workstation 01 Hardware Rigs"
    OUTPUT "Active Monaco Node Connected."
ENDPROCEDURE

CALL Main()
`;
      setPseudocode(code);
      setPythonCode(transpileCambridgeToPython(code).pythonCode);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                <Code2 className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  In-Browser Coding Lab & Practical Simulators
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dual Cambridge Pseudocode-to-Python IDE, interactive trace tables, logic circuits, and ICT evidence builders
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 gap-2 font-mono text-xs overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('ide')}
            className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ide'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Dual IDE (Pseudocode & Python)</span>
          </button>

          <button
            onClick={() => setActiveTab('trace')}
            className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'trace'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Interactive Trace Table Validator</span>
          </button>

          <button
            onClick={() => setActiveTab('gates')}
            className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'gates'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Logic Gate & Truth Table Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>ICT Practical Evidence Document Builder</span>
          </button>
        </div>

        {/* TAB 1: DUAL IDE (PSEUDOCODE & PYTHON) */}
        {activeTab === 'ide' && (
          <div className="space-y-6">
            {/* Quick Algorithm Presets */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Load Official Cambridge Presets:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadPreset('search')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
                >
                  Linear Search
                </button>
                <button
                  onClick={() => loadPreset('bubble')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
                >
                  Bubble Sort
                </button>
                <button
                  onClick={() => loadPreset('oop')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
                >
                  Procedures
                </button>
              </div>
            </div>

            {/* Split Screen Dual Monaco Editors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Cambridge Pseudocode */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col shadow-xl">
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="font-bold text-white">Cambridge Pseudocode (Source)</span>
                  </div>
                  <button
                    onClick={handleTranspile}
                    className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] font-bold hover:bg-cyan-900 transition"
                  >
                    Transpile ➔
                  </button>
                </div>

                <div className="h-80 sm:h-96">
                  <Editor
                    height="100%"
                    defaultLanguage="pascal"
                    theme="vs-dark"
                    value={pseudocode}
                    onChange={(val) => {
                      const v = val || '';
                      setPseudocode(v);
                      setPythonCode(transpileCambridgeToPython(v).pythonCode);
                    }}
                    options={{
                      fontSize: 13,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>

              {/* Right: Generated Python 3 */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col shadow-xl">
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">Transpiled Python 3 (Executable)</span>
                  </div>

                  <button
                    onClick={handleRunPython}
                    disabled={runningCode}
                    className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono flex items-center gap-1.5 transition disabled:opacity-40"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{runningCode ? 'Executing...' : 'Run in Browser'}</span>
                  </button>
                </div>

                <div className="h-80 sm:h-96">
                  <Editor
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={pythonCode}
                    onChange={(val) => setPythonCode(val || '')}
                    options={{
                      fontSize: 13,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Interactive Terminal Output Console */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl font-mono">
              <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-bold">Studio Execution Terminal (stdout)</span>
                </div>
                <button
                  onClick={() => setConsoleOutput('')}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  Clear Terminal
                </button>
              </div>

              <div className="p-4 bg-slate-950 text-emerald-400 text-xs leading-relaxed min-h-[120px] max-h-[220px] overflow-y-auto whitespace-pre-wrap font-mono">
                {consoleOutput}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRACE TABLE SIMULATOR */}
        {activeTab === 'trace' && <TraceTableSimulator />}

        {/* TAB 3: LOGIC GATE SIMULATOR */}
        {activeTab === 'gates' && <LogicGateSimulator />}

        {/* TAB 4: ICT EVIDENCE BUILDER */}
        {activeTab === 'evidence' && <EvidenceDocumentBuilder />}
      </main>
    </div>
  );
}
