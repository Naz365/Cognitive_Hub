'use client';

import React, { useState } from 'react';
import { Cpu, Zap, CheckCircle2, RotateCcw } from 'lucide-react';

export default function LogicGateSimulator() {
  const [circuitType, setCircuitType] = useState<'circuitA' | 'circuitB'>('circuitA');

  // Input states: 0 or 1
  const [inputA, setInputA] = useState<0 | 1>(1);
  const [inputB, setInputB] = useState<0 | 1>(0);
  const [inputC, setInputC] = useState<0 | 1>(1);

  // Circuit A: X = (A NAND B) OR (NOT C)
  // Intermediate P = NOT (A AND B)
  // Intermediate Q = NOT C
  // X = P OR Q
  const pA = !(inputA && inputB) ? 1 : 0;
  const qA = !inputC ? 1 : 0;
  const xA = pA || qA ? 1 : 0;

  // Circuit B: X = (A XOR B) AND (B NOR C)
  // P = A XOR B
  // Q = NOT (B OR C)
  // X = P AND Q
  const pB = inputA !== inputB ? 1 : 0;
  const qB = !(inputB || inputC) ? 1 : 0;
  const xB = pB && qB ? 1 : 0;

  const currentP = circuitType === 'circuitA' ? pA : pB;
  const currentQ = circuitType === 'circuitA' ? qA : qB;
  const currentX = circuitType === 'circuitA' ? xA : xB;

  // Generate complete truth table for 8 combinations
  const truthTableRows = [
    { a: 0, b: 0, c: 0 },
    { a: 0, b: 0, c: 1 },
    { a: 0, b: 1, c: 0 },
    { a: 0, b: 1, c: 1 },
    { a: 1, b: 0, c: 0 },
    { a: 1, b: 0, c: 1 },
    { a: 1, b: 1, c: 0 },
    { a: 1, b: 1, c: 1 },
  ].map((row) => {
    let p = 0;
    let q = 0;
    let x = 0;

    if (circuitType === 'circuitA') {
      p = !(row.a && row.b) ? 1 : 0;
      q = !row.c ? 1 : 0;
      x = p || q ? 1 : 0;
    } else {
      p = row.a !== row.b ? 1 : 0;
      q = !(row.b || row.c) ? 1 : 0;
      x = p && q ? 1 : 0;
    }

    const isActive = row.a === inputA && row.b === inputB && row.c === inputC;
    return { ...row, p, q, x, isActive };
  });

  return (
    <div className="space-y-6">
      {/* Circuit Description & Selector */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Cambridge & Edexcel Circuit Simulator
            </span>
            <h3 className="text-lg font-bold text-white font-mono mt-0.5">
              Boolean Expression: {circuitType === 'circuitA' ? 'X = (A NAND B) OR (NOT C)' : 'X = (A XOR B) AND (B NOR C)'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Toggle input pins A, B, and C to inspect live signal propagation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCircuitType('circuitA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                circuitType === 'circuitA'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Circuit A (NAND/OR)
            </button>
            <button
              onClick={() => setCircuitType('circuitB')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                circuitType === 'circuitB'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Circuit B (XOR/NOR)
            </button>
          </div>
        </div>

        {/* Visual Circuit Schematic Breadboard */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Input Switches Column */}
            <div className="md:col-span-3 space-y-4">
              <span className="text-[11px] font-mono text-slate-500 uppercase block font-bold">
                Input Pins (Click to Toggle)
              </span>

              {[
                { label: 'Input A', val: inputA, setter: setInputA },
                { label: 'Input B', val: inputB, setter: setInputB },
                { label: 'Input C', val: inputC, setter: setInputC },
              ].map((pin) => (
                <div key={pin.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-mono font-bold text-white">{pin.label}</span>
                  <button
                    onClick={() => pin.setter((prev) => (prev === 1 ? 0 : 1))}
                    className={`w-12 h-8 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center ${
                      pin.val === 1
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {pin.val}
                  </button>
                </div>
              ))}
            </div>

            {/* Intermediate Gates Column */}
            <div className="md:col-span-5 space-y-4">
              <span className="text-[11px] font-mono text-slate-500 uppercase block font-bold">
                Logic Gate Processing
              </span>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold">
                    {circuitType === 'circuitA' ? 'Gate 1: NAND (A, B)' : 'Gate 1: XOR (A, B)'}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold ${currentP === 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    Signal P = {currentP}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {circuitType === 'circuitA' ? `NOT (${inputA} AND ${inputB}) = ${currentP}` : `${inputA} XOR ${inputB} = ${currentP}`}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-violet-400 font-bold">
                    {circuitType === 'circuitA' ? 'Gate 2: NOT (C)' : 'Gate 2: NOR (B, C)'}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold ${currentQ === 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    Signal Q = {currentQ}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {circuitType === 'circuitA' ? `NOT (${inputC}) = ${currentQ}` : `NOT (${inputB} OR ${inputC}) = ${currentQ}`}
                </p>
              </div>
            </div>

            {/* Final Output Lamp Column */}
            <div className="md:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
              <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                Final Circuit Output (X)
              </span>

              <div
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                  currentX === 1
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.6)]'
                    : 'border-slate-800 bg-slate-950 text-slate-600'
                }`}
              >
                <Zap className={`w-8 h-8 ${currentX === 1 ? 'animate-bounce' : ''}`} />
              </div>

              <div>
                <span className="text-2xl font-black font-mono text-white">X = {currentX}</span>
                <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                  {circuitType === 'circuitA' ? `${currentP} OR ${currentQ}` : `${currentP} AND ${currentQ}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Truth Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-white uppercase">
            Complete 8-State Truth Table
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            Current Active State Highlighted in Cyan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                <th className="p-2.5 border border-slate-800">A</th>
                <th className="p-2.5 border border-slate-800">B</th>
                <th className="p-2.5 border border-slate-800">C</th>
                <th className="p-2.5 border border-slate-800 text-cyan-400">P</th>
                <th className="p-2.5 border border-slate-800 text-violet-400">Q</th>
                <th className="p-2.5 border border-slate-800 font-bold text-emerald-400">Output X</th>
              </tr>
            </thead>
            <tbody>
              {truthTableRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition ${
                    row.isActive
                      ? 'bg-cyan-950/60 text-white font-bold ring-2 ring-cyan-400/80 shadow-md'
                      : 'hover:bg-slate-800/30 text-slate-300'
                  }`}
                >
                  <td className="p-2 border border-slate-800">{row.a}</td>
                  <td className="p-2 border border-slate-800">{row.b}</td>
                  <td className="p-2 border border-slate-800">{row.c}</td>
                  <td className="p-2 border border-slate-800 text-cyan-400">{row.p}</td>
                  <td className="p-2 border border-slate-800 text-violet-400">{row.q}</td>
                  <td className="p-2 border border-slate-800 font-bold text-emerald-400">{row.x}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
