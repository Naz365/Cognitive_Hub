'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Eye, Sparkles, HelpCircle } from 'lucide-react';

interface TraceTask {
  id: string;
  title: string;
  syllabus: string;
  codeSnippet: string;
  inputDescription: string;
  columns: string[];
  expectedRows: string[][];
  maxMarks: number;
}

const TRACE_TASKS: TraceTask[] = [
  {
    id: 'trace-01',
    title: 'Linear Search with Early Termination Flag',
    syllabus: '0478 / 4CP0 Paper 2',
    codeSnippet: `DECLARE Numbers : ARRAY[1:5] OF INTEGER
Numbers <- [24, 13, 88, 42, 19]
Target <- 42
Found <- FALSE
Index <- 1

WHILE Index <= 5 AND Found = FALSE DO
    IF Numbers[Index] = Target THEN
        Found <- TRUE
        OUTPUT "Found at position ", Index
    ENDIF
    Index <- Index + 1
ENDWHILE`,
    inputDescription: 'Array Numbers = [24, 13, 88, 42, 19], Target value = 42',
    columns: ['Iteration', 'Index', 'Numbers[Index]', 'Found', 'OUTPUT'],
    expectedRows: [
      ['1', '1', '24', 'FALSE', ''],
      ['2', '2', '13', 'FALSE', ''],
      ['3', '3', '88', 'FALSE', ''],
      ['4', '4', '42', 'TRUE', 'Found at position 4'],
    ],
    maxMarks: 5,
  },
  {
    id: 'trace-02',
    title: 'Divisible by 3 Counter with MOD Operator',
    syllabus: '0478 Paper 1 & 2',
    codeSnippet: `Count <- 0
Total <- 0
FOR Number <- 1 TO 6
    IF Number MOD 3 = 0 THEN
        Count <- Count + 1
        Total <- Total + Number
    ENDIF
NEXT Number
OUTPUT "Count=", Count, " Total=", Total`,
    inputDescription: 'Loop through Numbers from 1 to 6',
    columns: ['Number', 'Number MOD 3', 'Count', 'Total', 'OUTPUT'],
    expectedRows: [
      ['1', '1', '0', '0', ''],
      ['2', '2', '0', '0', ''],
      ['3', '0', '1', '3', ''],
      ['4', '1', '1', '3', ''],
      ['5', '2', '1', '3', ''],
      ['6', '0', '2', '9', 'Count= 2 Total= 9'],
    ],
    maxMarks: 5,
  },
];

export default function TraceTableSimulator() {
  const [selectedTaskId, setSelectedTaskId] = useState(TRACE_TASKS[0].id);
  const currentTask = TRACE_TASKS.find((t) => t.id === selectedTaskId) || TRACE_TASKS[0];

  // User input grid state: rows of columns
  const [userRows, setUserRows] = useState<string[][]>(() =>
    currentTask.expectedRows.map(() => Array(currentTask.columns.length).fill(''))
  );
  const [validationResult, setValidationResult] = useState<{
    score: number;
    cellResults: boolean[][];
  } | null>(null);
  const [showExpected, setShowExpected] = useState(false);

  const handleTaskChange = (taskId: string) => {
    setSelectedTaskId(taskId);
    const task = TRACE_TASKS.find((t) => t.id === taskId) || TRACE_TASKS[0];
    setUserRows(task.expectedRows.map(() => Array(task.columns.length).fill('')));
    setValidationResult(null);
    setShowExpected(false);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const updated = userRows.map((r, rIdx) =>
      rIdx === rowIndex ? r.map((c, cIdx) => (cIdx === colIndex ? value : c)) : r
    );
    setUserRows(updated);
  };

  const handleValidate = () => {
    let correctCells = 0;
    let totalCells = 0;
    const cellResults: boolean[][] = [];

    for (let r = 0; r < currentTask.expectedRows.length; r++) {
      const rowResult: boolean[] = [];
      for (let c = 0; c < currentTask.columns.length; c++) {
        totalCells++;
        const expected = currentTask.expectedRows[r][c].trim().toLowerCase();
        const actual = (userRows[r]?.[c] || '').trim().toLowerCase();

        const isMatch = actual === expected;
        if (isMatch) correctCells++;
        rowResult.push(isMatch);
      }
      cellResults.push(rowResult);
    }

    const calculatedScore = Math.round((correctCells / totalCells) * currentTask.maxMarks);
    setValidationResult({ score: calculatedScore, cellResults });
  };

  const handleReset = () => {
    setUserRows(currentTask.expectedRows.map(() => Array(currentTask.columns.length).fill('')));
    setValidationResult(null);
    setShowExpected(false);
  };

  return (
    <div className="space-y-6">
      {/* Task Selector & Description */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Cambridge Trace-Table Mark-Scheme Engine
            </span>
            <h3 className="text-lg font-bold text-white font-mono mt-0.5">
              {currentTask.title}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Exam Target: {currentTask.syllabus} • {currentTask.inputDescription}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {TRACE_TASKS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTaskChange(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  selectedTaskId === t.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {t.id === 'trace-01' ? 'Task 1: Search' : 'Task 2: Loop'}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm Code Snippet */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto">
          <pre>{currentTask.codeSnippet}</pre>
        </div>
      </div>

      {/* Interactive Trace Table Grid */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-white uppercase">
              Trace Execution Grid
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              (Fill each cell as variables mutate per iteration)
            </span>
          </div>

          {validationResult && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-300">Score:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                {validationResult.score} / {currentTask.maxMarks} Marks
              </span>
            </div>
          )}
        </div>

        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-cyan-400">
              {currentTask.columns.map((col, idx) => (
                <th key={idx} className="p-3 border border-slate-800/80 font-bold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(showExpected ? currentTask.expectedRows : userRows).map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/30">
                {row.map((cellValue, cIdx) => {
                  const isCorrect = validationResult?.cellResults[rIdx]?.[cIdx];

                  return (
                    <td key={cIdx} className="p-2 border border-slate-800/80">
                      {showExpected ? (
                        <div className="px-2 py-1.5 text-slate-200 font-bold bg-slate-950/60 rounded">
                          {cellValue || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={cellValue}
                          onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                          placeholder="-"
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-950 border transition focus:outline-none ${
                            validationResult
                              ? isCorrect
                                ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'
                                : 'border-amber-500/60 bg-amber-950/30 text-amber-300'
                              : 'border-slate-800 text-white focus:border-cyan-400'
                          }`}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleValidate}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Validate Trace Table</span>
            </button>

            <button
              onClick={handleReset}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <button
            onClick={() => setShowExpected(!showExpected)}
            className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono flex items-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showExpected ? 'Return to My Trace' : 'Reveal Official Cambridge Mark Scheme'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
