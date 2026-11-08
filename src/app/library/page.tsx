'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import WatermarkedReader from '@/components/library/WatermarkedReader';
import { INITIAL_LIBRARY_RESOURCES } from '@/lib/phase2-constants';
import { COURSES } from '@/lib/constants';
import { SyllabusCode, LibraryResource } from '@/types';
import {
  BookOpen,
  FileCode,
  Archive,
  Eye,
  Download,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function DigitalLibraryPage() {
  const [selectedShelf, setSelectedShelf] = useState<SyllabusCode>('0478');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingResource, setReadingResource] = useState<LibraryResource | null>(null);

  const shelves: SyllabusCode[] = ['0478', '9618', '4CP0', '4IT1'];

  const filteredResources = INITIAL_LIBRARY_RESOURCES.filter((res) => {
    const matchesShelf = res.courseCode === selectedShelf;
    const matchesCategory = selectedCategory === 'all' || res.category === selectedCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesShelf && matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (category: LibraryResource['category']) => {
    switch (category) {
      case 'endorsed_ebook':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            Endorsed Textbook
          </span>
        );
      case 'pseudocode_handbook':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-950/80 text-violet-300 border border-violet-800/60">
            Pseudocode Handbook
          </span>
        );
      case 'past_paper_bundle':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            Starter Code Bundle (ZIP)
          </span>
        );
      case 'formula_sheet':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
            Formula Sheet
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
            Resource
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  Digital Book Corner & Source-File Vault
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Four board-specific shelves with watermarked reading and practical code starter bundles
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Signed & Watermarked Stamping</span>
            </div>
          </div>
        </div>

        {/* 4 Board Shelves Switcher */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {shelves.map((code) => {
            const course = COURSES[code];
            const isSelected = selectedShelf === code;
            const resourceCount = INITIAL_LIBRARY_RESOURCES.filter((r) => r.courseCode === code).length;

            return (
              <button
                key={code}
                onClick={() => setSelectedShelf(code)}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400 shadow-lg shadow-cyan-950/30'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-cyan-400">{code}</span>
                    <span className="text-[10px] font-mono uppercase text-slate-400">{course.board}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white mt-1.5 line-clamp-1">{course.title}</h3>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{resourceCount} Documents / Vaults</span>
                  <span className={isSelected ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                    {isSelected ? '✓ Active Shelf' : 'View'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search books, pseudocode, Python ZIPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'endorsed_ebook', label: 'E-Books' },
              { id: 'pseudocode_handbook', label: 'Pseudocode' },
              { id: 'past_paper_bundle', label: 'Code Bundles' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Grid */}
        {filteredResources.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
            No resources matched your search filter in the {selectedShelf} shelf.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {getCategoryBadge(res.category)}
                    <span className="text-[11px] font-mono text-slate-400">
                      {res.sizeMb} MB • {res.fileFormat.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white font-mono leading-snug">{res.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{res.description}</p>

                  <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300">
                    <span className="text-slate-500 block mb-1">Snippet / Index Preview:</span>
                    <p className="line-clamp-2 text-slate-300">{res.previewSample}</p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setReadingResource(res)}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>In-Browser Reader</span>
                  </button>

                  <button
                    onClick={() =>
                      alert(`Initiating signed, tamper-verified download for: ${res.title}`)
                    }
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition"
                    title="Download ZIP/PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Watermarked Modal Viewer */}
      {readingResource && (
        <WatermarkedReader
          resource={readingResource}
          studentName="Samiul Haque"
          studentAdmissionId="CH-2026-0105"
          onClose={() => setReadingResource(null)}
        />
      )}
    </div>
  );
}
