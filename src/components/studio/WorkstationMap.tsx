'use client';

import React from 'react';
import { Desk, DeskStatus } from '@/types';
import { CheckCircle2, Clock, Lock, Monitor, Cpu } from 'lucide-react';

interface WorkstationMapProps {
  desks: [Desk, Desk, Desk];
  selectedDesk?: number;
  onSelectDesk?: (deskNumber: 1 | 2 | 3) => void;
  interactive?: boolean;
}

export default function WorkstationMap({
  desks,
  selectedDesk,
  onSelectDesk,
  interactive = true,
}: WorkstationMapProps) {
  const getStatusColor = (status: DeskStatus, isSelected: boolean) => {
    if (isSelected) return 'border-cyan-400 bg-cyan-950/60 ring-2 ring-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.4)]';
    switch (status) {
      case 'available':
        return 'border-emerald-500/50 bg-emerald-950/20 hover:border-emerald-400 hover:bg-emerald-950/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer';
      case 'hold':
        return 'border-amber-500/40 bg-amber-950/20 cursor-not-allowed';
      case 'enrolled':
        return 'border-indigo-500/40 bg-indigo-950/30 cursor-not-allowed';
    }
  };

  const getStatusBadge = (status: DeskStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available
          </span>
        );
      case 'hold':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3 text-amber-400" />
            24h Hold
          </span>
        );
      case 'enrolled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <Lock className="w-3 h-3 text-indigo-400" />
            Enrolled
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
      {/* Studio Ambient Grid Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))]" />

      {/* Teacher Command Bar / Overhead Display */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-700/60 shadow-lg flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-medium tracking-wider text-slate-300 uppercase">
            Teacher Command Pod & Code Mirror Broadcast
          </span>
        </div>
        <div className="w-48 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mt-2" />
      </div>

      {/* 3 Workstations Physical Layout */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {desks.map((desk) => {
          const isSelected = selectedDesk === desk.number;
          const isAvailable = desk.status === 'available';

          return (
            <div
              key={desk.id}
              onClick={() => {
                if (interactive && isAvailable && onSelectDesk) {
                  onSelectDesk(desk.number);
                }
              }}
              className={`relative rounded-xl border p-5 transition-all duration-200 flex flex-col justify-between min-h-[220px] ${getStatusColor(
                desk.status,
                isSelected
              )}`}
            >
              {/* Top Row: Label & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-sm font-bold ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    0{desk.number}
                  </div>
                  <span className="font-semibold text-slate-100">{desk.label}</span>
                </div>
                {getStatusBadge(desk.status)}
              </div>

              {/* Center Hardware Blueprint Schematic */}
              <div className="my-4 py-3 flex flex-col items-center justify-center rounded-lg bg-slate-900/60 border border-slate-800/60">
                <div className="relative">
                  <Monitor
                    className={`w-12 h-12 transition-transform duration-200 ${
                      isSelected
                        ? 'text-cyan-400 scale-110'
                        : isAvailable
                        ? 'text-emerald-400'
                        : desk.status === 'hold'
                        ? 'text-amber-400'
                        : 'text-indigo-400'
                    }`}
                  />
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center text-slate-950">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span>Dual 27″ QHD Rig</span>
                  <span>•</span>
                  <span>Dedicated Monaco Node</span>
                </div>
              </div>

              {/* Bottom State Details */}
              <div className="text-xs">
                {desk.status === 'available' ? (
                  <button
                    type="button"
                    disabled={!interactive}
                    className={`w-full py-2 px-3 rounded-lg font-medium transition text-center ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                    }`}
                  >
                    {isSelected ? '✓ Selected Workstation' : 'Click to Reserve Desk'}
                  </button>
                ) : desk.status === 'hold' ? (
                  <div className="bg-amber-950/40 border border-amber-900/60 rounded-lg p-2 text-center text-amber-300">
                    <p className="font-medium text-[11px]">Reserved (24h Hold)</p>
                    <p className="text-[10px] text-amber-400/80 mt-0.5">
                      {desk.studentName ? `Held for: ${desk.studentName}` : 'Awaiting manual TrxID verification'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-indigo-950/40 border border-indigo-900/60 rounded-lg p-2 text-center text-indigo-300">
                    <p className="font-medium text-[11px]">Enrolled & Locked</p>
                    <p className="text-[10px] text-indigo-400/80 mt-0.5">
                      {desk.studentName ? `Student: ${desk.studentName}` : 'Active Batch Member'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Policy Footer */}
      <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>24h Hold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Enrolled</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Strict Invariant: Exactly 3 Desks Per Batch • No Overbooking
        </div>
      </div>
    </div>
  );
}
