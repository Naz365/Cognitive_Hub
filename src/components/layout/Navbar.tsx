'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, QrCode, Shield, ArrowRight, Sparkles, BookOpen, Brain, UserCheck } from 'lucide-react';
import { STUDIO_CONFIG } from '@/lib/constants';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-cyan-500/50 transition">
            <Image
              src="/05_vector_svg_sources/logo-icon-dark-glow.svg"
              alt="Cognitive Hub Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-white font-mono group-hover:text-cyan-400 transition">
                COGNITIVE HUB
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase tracking-wider">
                3-Desk Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Cambridge & Pearson Edexcel CS/ICT
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5">
          <Link
            href="/portal"
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300 hover:text-cyan-400 transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Student Portal</span>
          </Link>
          <Link
            href="/library"
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300 hover:text-cyan-400 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span>Book Corner</span>
          </Link>
          <Link
            href="/quiz"
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300 hover:text-cyan-400 transition"
          >
            <Brain className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quiz & Mark Scheme</span>
          </Link>
          <Link
            href="/qr"
            className="flex items-center gap-1 text-xs font-mono font-medium text-amber-400 hover:text-amber-300 transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Fast-Track QR</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1 text-xs font-mono font-medium text-slate-400 hover:text-white transition"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Teacher Command</span>
          </Link>
        </nav>

        {/* Header CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={`https://wa.me/${STUDIO_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700 transition"
          >
            WA: {STUDIO_CONFIG.whatsappFormatted}
          </a>
          <Link
            href="/admissions"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reserve Workstation</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            href="/portal"
            className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
          >
            <UserCheck className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-2 font-mono text-xs">
          <Link
            href="/portal"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-cyan-300 bg-cyan-950/40 border border-cyan-800/60"
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Portal & Mastery Tracker</span>
          </Link>
          <Link
            href="/library"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-900"
          >
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>Digital Book Corner & Source Files</span>
          </Link>
          <Link
            href="/quiz"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-900"
          >
            <Brain className="w-4 h-4 text-emerald-400" />
            <span>Quiz & Mark-Scheme Keyword Scanner</span>
          </Link>
          <Link
            href="/qr"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-300 bg-amber-950/30 border border-amber-900/60"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Fast-Track Mobile QR (&lt; 60s)</span>
          </Link>
          <Link
            href="/admissions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-900"
          >
            4-Step Admission Wizard
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-900"
          >
            <Shield className="w-4 h-4" />
            <span>Teacher Command Center</span>
          </Link>
          <div className="pt-2">
            <a
              href={`https://wa.me/${STUDIO_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}`}
              className="block text-center py-2.5 rounded-xl text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800"
            >
              Direct WhatsApp: {STUDIO_CONFIG.whatsappFormatted}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
