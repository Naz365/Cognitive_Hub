'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Download, CheckCircle2, Database, Table, Code, Plus } from 'lucide-react';

export default function EvidenceDocumentBuilder() {
  const [candidateName, setCandidateName] = useState('Samiul Haque');
  const [candidateNumber, setCandidateNumber] = useState('0105');
  const [centerNumber, setCenterNumber] = useState('BD042');
  const [syllabus, setSyllabus] = useState('4IT1');

  // Database Relationship Evidence
  const [parentTable, setParentTable] = useState('tblMembers');
  const [childTable, setChildTable] = useState('tblBookings');
  const [primaryKey, setPrimaryKey] = useState('MemberID');
  const [foreignKey, setForeignKey] = useState('MemberID');
  const [relationshipType, setRelationshipType] = useState('One-to-Many');

  // SQL Query Evidence
  const [queryName, setQueryName] = useState('qry_UpcomingBookings');
  const [sqlStatement, setSqlStatement] = useState(
    'SELECT tblMembers.MemberID, tblMembers.LastName, tblBookings.BookingDate, tblBookings.StudioDesk\nFROM tblMembers INNER JOIN tblBookings ON tblMembers.MemberID = tblBookings.MemberID\nWHERE tblBookings.BookingDate >= Date()\nORDER BY tblBookings.BookingDate ASC;'
  );

  // Spreadsheet Formula Evidence
  const [cellLocation, setCellLocation] = useState('Sheet1!G5');
  const [formulaCode, setFormulaCode] = useState('=VLOOKUP(C5, tblPricing!$A$2:$D$20, 3, FALSE) * (1 - E5)');
  const [formulaExplanation, setFormulaExplanation] = useState(
    'Retrieves unit hourly workstation rate using exact match with absolute cell referencing ($A$2:$D$20) and multiplies by discount rate in E5.'
  );

  const [generating, setGenerating] = useState(false);

  const handleExportPDF = async () => {
    try {
      setGenerating(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header Banner
      doc.setFillColor(9, 13, 22);
      doc.rect(0, 0, 210, 38, 'F');
      doc.setFillColor(6, 182, 212);
      doc.rect(0, 36, 210, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('CANDIDATE PRACTICAL EVIDENCE DOCUMENT', 20, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(34, 211, 238);
      doc.text(`SYLLABUS: ${syllabus} • COGNITIVE HUB MICRO-STUDIO TESTING RIG`, 20, 26);

      // Candidate Identification Box
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(20, 46, 170, 22, 2, 2, 'F');
      doc.setDrawColor(209, 213, 219);
      doc.roundedRect(20, 46, 170, 22, 2, 2, 'D');

      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.text(`Candidate Name: ${candidateName}`, 26, 54);
      doc.text(`Candidate Number: ${candidateNumber}`, 120, 54);
      doc.text(`Center Number: ${centerNumber}`, 26, 62);
      doc.text(`Session: November 2026 Practical Examination`, 120, 62);

      // EVIDENCE 1: Database Relationship Schema
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text('EVIDENCE 1: Relational Database Schema & Integrity', 20, 80);

      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(20, 85, 170, 40, 2, 2, 'FD');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(`Parent Primary Table: ${parentTable} (PK: ${primaryKey})`, 26, 95);
      doc.text(`Child Related Table: ${childTable} (FK: ${foreignKey})`, 26, 103);
      doc.text(`Relationship Cardinality: ${relationshipType}`, 26, 111);
      doc.text('Referential Integrity: Enforced (Cascade updates permitted)', 26, 119);

      // EVIDENCE 2: SQL Query Structure
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text(`EVIDENCE 2: SQL Query Code (${queryName})`, 20, 137);

      doc.setFillColor(15, 23, 42); // dark code box
      doc.roundedRect(20, 142, 170, 44, 2, 2, 'F');

      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(34, 211, 238);
      const splitSql = doc.splitTextToSize(sqlStatement, 158);
      doc.text(splitSql, 26, 152);

      // EVIDENCE 3: Spreadsheet Formula Modelling
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.text('EVIDENCE 3: Spreadsheet Formula Construction', 20, 198);

      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(20, 203, 170, 48, 2, 2, 'FD');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(75, 85, 99);
      doc.text(`Target Cell Location: ${cellLocation}`, 26, 213);

      doc.setFont('courier', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text(formulaCode, 26, 222);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(107, 114, 128);
      const splitExp = doc.splitTextToSize(`Explanation: ${formulaExplanation}`, 158);
      doc.text(splitExp, 26, 232);

      // Footer
      doc.setFontSize(7.5);
      doc.setTextColor(156, 163, 175);
      doc.text(`${candidateName} (${candidateNumber}) • Center ${centerNumber} • Page 1 of 1`, 20, 280);

      doc.save(`${candidateName.replace(/\s+/g, '_')}_Practical_Evidence_${syllabus}.pdf`);
    } catch (err) {
      console.error('Error generating evidence PDF:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Box */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Pearson Edexcel & Cambridge Practical Evidence System
          </span>
          <h3 className="text-lg font-bold text-white font-mono mt-0.5">
            ICT & Computer Science Evidence Document Builder
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Document database relationships, SQL queries, and Excel formulas, then export board-ready PDF.
          </p>
        </div>

        {/* Candidate Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Candidate Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Candidate Number</label>
            <input
              type="text"
              value={candidateNumber}
              onChange={(e) => setCandidateNumber(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Center Number</label>
            <input
              type="text"
              value={centerNumber}
              onChange={(e) => setCenterNumber(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Syllabus Code</label>
            <select
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold"
            >
              <option value="4IT1">4IT1 (Edexcel ICT)</option>
              <option value="0478">0478 (Cambridge CS)</option>
              <option value="9618">9618 (Cambridge A-Level)</option>
              <option value="4CP0">4CP0 (Edexcel CS)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evidence Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Relational DB Schema */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Database className="w-4 h-4" />
            <span>Evidence 1: Relational Database Schema</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-500 block mb-1">Primary Table</label>
              <input
                type="text"
                value={parentTable}
                onChange={(e) => setParentTable(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Primary Key (PK)</label>
              <input
                type="text"
                value={primaryKey}
                onChange={(e) => setPrimaryKey(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-500 block mb-1">Related Table</label>
              <input
                type="text"
                value={childTable}
                onChange={(e) => setChildTable(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Foreign Key (FK)</label>
              <input
                type="text"
                value={foreignKey}
                onChange={(e) => setForeignKey(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-violet-400 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Spreadsheet Formula Evidence */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Table className="w-4 h-4" />
            <span>Evidence 2: Spreadsheet Formula Modelling</span>
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Target Cell (Sheet!Cell)</label>
            <input
              type="text"
              value={cellLocation}
              onChange={(e) => setCellLocation(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">Formula Code</label>
            <input
              type="text"
              value={formulaCode}
              onChange={(e) => setFormulaCode(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold"
            />
          </div>
        </div>

        {/* Section 2: SQL Query Evidence */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-violet-400 font-bold">
              <Code className="w-4 h-4" />
              <span>Evidence 3: SQL Query Statement ({queryName})</span>
            </div>
          </div>

          <textarea
            rows={4}
            value={sqlStatement}
            onChange={(e) => setSqlStatement(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Export Action */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleExportPDF}
          disabled={generating}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{generating ? 'Compiling PDF...' : 'Export Board-Formatted Evidence PDF'}</span>
        </button>
      </div>
    </div>
  );
}
