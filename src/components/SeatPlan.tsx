import React, { useState, useMemo } from 'react';
import { Student, Batch } from '../types';
import { LayoutGrid, Download, Printer, Layers, AlertCircle, CheckCircle, Clipboard, Shuffle } from 'lucide-react';

interface SeatPlanProps {
  students: Student[];
  batches: Batch[];
  sessions: string[];
}

export default function SeatPlan({ students, batches, sessions }: SeatPlanProps) {
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedSession, setSelectedSession] = useState('all');
  const [benchesCount, setBenchesCount] = useState('8');
  const [seatsPerBench, setSeatsPerBench] = useState('2'); // 2 is standard (left / right)
  const [roomName, setRoomName] = useState('হল রুম ১০১ (Hall Room 101)');
  const [isGenerated, setIsGenerated] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);

  // Generate seat plan automatically
  const seatPlan = useMemo(() => {
    if (!isGenerated) return [];

    // Filter students by selected batch and selected session
    let targetStudents = [...students].filter((s) => {
      const matchBatch = selectedBatch === 'all' || s.batchId === selectedBatch;
      const matchSession = selectedSession === 'all' || s.session === selectedSession;
      return matchBatch && matchSession;
    });

    if (isShuffled) {
      // Fisher-Yates shuffle that triggers with shuffleTrigger
      // Standard random sorting isn't pure pure deterministic but behaves great for live user action!
      const shuffled = [...targetStudents];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      targetStudents = shuffled;
    } else {
      // Sort students by roll number
      targetStudents.sort((a, b) => {
        const rollA = parseInt(a.roll, 10) || 0;
        const rollB = parseInt(b.roll, 10) || 0;
        return rollA - rollB;
      });
    }

    const totalBenches = parseInt(benchesCount, 10) || 8;
    const cols = parseInt(seatsPerBench, 10) || 2;
    const plan: {
      student: Student | null;
      benchNo: number;
      seatPosition: string; // Left, Middle, Right etc.
      roomName: string;
    }[] = [];

    let studentIndex = 0;

    for (let b = 1; b <= totalBenches; b++) {
      for (let s = 1; s <= cols; s++) {
        let seatPosition = '';
        if (cols === 2) {
          seatPosition = s === 1 ? 'বাম পাশ (Left)' : 'ডান পাশ (Right)';
        } else {
          seatPosition = `আসন নং - ${s}`;
        }

        const student = studentIndex < targetStudents.length ? targetStudents[studentIndex] : null;
        if (student) {
          studentIndex++;
        }

        plan.push({
          student,
          benchNo: b,
          seatPosition,
          roomName,
        });
      }
    }

    return plan;
  }, [students, selectedBatch, selectedSession, benchesCount, seatsPerBench, roomName, isGenerated, isShuffled, shuffleTrigger]);

  const assignedStudentsCount = seatPlan.filter((p) => p.student !== null).length;

  const handlePrintSeatSlips = () => {
    const activeSlips = seatPlan.filter((p) => p.student !== null);
    if (activeSlips.length === 0) {
      alert('প্রিন্ট করার মতো কোনো সিট স্লিপ নেই! অনুগ্রহ করে প্রথমে আসন বিন্যাস তৈরি করুন।');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('পপআপ উইন্ডো খুলতে পারেনি! অনুগ্রহ করে আপনার ব্রাউজারের পপআপ ব্লকার নিষ্ক্রিয় করুন এবং পুনরায় চেষ্টা করুন।');
      return;
    }

    // Pre-render the slips into raw HTML strings to prevent escaping issues and build correctly
    const slipsHtml = activeSlips.map((p, idx) => {
      const student = p.student;
      const batch = batches.find((b) => b.id === student?.batchId);
      return `
        <div class="page-break border-2 border-dashed border-slate-300 p-3 rounded-xl bg-white text-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[145px] shadow-xs">
          <!-- Top Tag -->
          <div class="flex justify-between items-center border-b border-slate-200 pb-1 mb-1.5">
            <span class="text-[8px] font-black text-slate-400 tracking-wider uppercase">BENCH SLIP</span>
            <span class="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded">
              ${student?.session || 'N/A'}
            </span>
          </div>

          <!-- Main Info -->
          <div class="space-y-0.5">
            <h3 class="font-extrabold text-slate-900 text-xs leading-snug truncate">${student?.name || 'N/A'}</h3>
            
            <div class="grid grid-cols-2 gap-1 text-[9px] py-0.5">
              <div>রোল নং: <strong class="text-indigo-600 font-bold font-mono text-xs">${student?.roll || 'N/A'}</strong></div>
              <div class="text-right truncate">ব্যাচ: <strong class="text-slate-700 font-semibold">${batch ? batch.name.split(' - ')[0] : 'N/A'}</strong></div>
            </div>
          </div>

          <!-- Bench/Room Assignment Details (Highlighted) -->
          <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-200 grid grid-cols-3 gap-0.5 text-center text-[8px] font-bold text-slate-600 uppercase tracking-wide mt-1">
            <div>
              <span class="text-[7px] text-slate-400 block uppercase">Room</span>
              <strong class="text-[10px] text-slate-800 font-bold">${p.roomName.split(' ')[0]}</strong>
            </div>
            <div class="border-l border-r border-slate-200">
              <span class="text-[7px] text-slate-400 block uppercase">Bench</span>
              <strong class="text-[10px] text-slate-800 font-bold">#${p.benchNo}</strong>
            </div>
            <div>
              <span class="text-[7px] text-slate-400 block uppercase">Seat</span>
              <strong class="text-[9px] text-indigo-700 font-black truncate block">${p.seatPosition.split(' ')[0]}</strong>
            </div>
          </div>

          <!-- Footer watermark -->
          <div class="text-[7px] text-slate-400 text-center border-t border-slate-100 pt-1 mt-1.5 font-semibold tracking-wider">
            আইসিটি প্রাইভেট হোম
          </div>
        </div>
      `;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>পরীক্ষার সিট স্লিপসমূহ - ${roomName}</title>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 6mm;
    }
    body {
      font-family: 'Noto Sans Bengali', 'Inter', sans-serif;
      background-color: #ffffff;
      margin: 0;
      padding: 10px;
    }
    @media print {
      body {
        padding: 0;
        margin: 0;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body class="bg-white">
  <!-- Print controls for browser preview -->
  <div class="no-print flex justify-between items-center mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-[900px] mx-auto gap-4">
    <div class="text-xs text-slate-600 font-bold">
      মোট <span class="text-indigo-600 font-extrabold text-sm">${activeSlips.length}</span> টি সিট স্লিপ প্রস্তুত করা হয়েছে। (A4 সাইজে প্রতি সারিতে ৪টি করে স্লিপ বসেছে)
    </div>
    <div class="flex gap-2">
      <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 border-0">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
        </svg>
        প্রিন্ট করুন / PDF ডাউনলোড
      </button>
      <button onclick="window.close()" class="bg-slate-800 hover:bg-slate-900 text-white font-black px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition cursor-pointer border-0">
        বন্ধ করুন
      </button>
    </div>
  </div>

  <!-- Slips Grid: 4 columns in one row -->
  <div class="grid grid-cols-4 gap-2.5 max-w-[1050px] mx-auto">
    ${slipsHtml}
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 700);
    });
  </script>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div id="seat-plan-module" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-indigo-600" />
          পরীক্ষার আসন পরিকল্পনা জেনারেটর (Seat Plan Planner)
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          রোল নাম্বার অনুযায়ী বা সেশন ও ব্যাচ ফিল্টার করে স্বয়ংক্রিয়ভাবে পরীক্ষার হলে বেঞ্চ নম্বর ও সিট বিন্যাস করুন।
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm items-end">
        {/* Session Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">সেশন নির্বাচন করুন</label>
          <select
            value={selectedSession}
            onChange={(e) => {
              setSelectedSession(e.target.value);
              setIsGenerated(false);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 text-sm font-semibold"
          >
            <option value="all">সব সেশন একত্রে</option>
            {sessions.map((s) => (
              <option key={s} value={s}>
                {s} সেশন
              </option>
            ))}
          </select>
        </div>

        {/* Batch Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">ব্যাচ নির্বাচন করুন</label>
          <select
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setIsGenerated(false);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 text-sm font-semibold"
          >
            <option value="all">সব ব্যাচ একত্রে</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Room Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">কক্ষ/হল রুমের নাম</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => {
              setRoomName(e.target.value);
              setIsGenerated(false);
            }}
            placeholder="যেমন: রুম ১০১"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 text-sm font-semibold"
          />
        </div>

        {/* Total Benches */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">মোট বেঞ্চের সংখ্যা</label>
          <input
            type="number"
            value={benchesCount}
            onChange={(e) => {
              setBenchesCount(e.target.value);
              setIsGenerated(false);
            }}
            min="1"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 text-sm font-semibold"
          />
        </div>

        {/* Seats per bench */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">প্রতি বেঞ্চে আসন সংখ্যা</label>
          <select
            value={seatsPerBench}
            onChange={(e) => {
              setSeatsPerBench(e.target.value);
              setIsGenerated(false);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 text-sm font-semibold"
          >
            <option value="1">১টি আসন</option>
            <option value="2">২টি আসন (বাম ও ডান)</option>
            <option value="3">৩টি আসন</option>
          </select>
        </div>

        {/* Shuffle Option & Re-shuffle action */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5 border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isShuffled}
                onChange={(e) => {
                  setIsShuffled(e.target.checked);
                  // Don't auto reset generated state, just let user toggle it live!
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              <span className="ml-3 text-xs font-bold text-slate-700">সিট স্লিপ এলোমেলো করুন (Shuffle Seat Plan)</span>
            </label>

            {isShuffled && (
              <button
                type="button"
                onClick={() => setShuffleTrigger((prev) => prev + 1)}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-indigo-200 transition active:scale-95 cursor-pointer"
                title="নতুনভাবে এলোমেলো সাজান"
              >
                <Shuffle className="h-3 w-3" /> পুনরায় এলোমেলো করুন
              </button>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={() => setIsGenerated(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            <Layers className="h-4.5 w-4.5" /> আসন বিন্যাস তৈরি করুন
          </button>
        </div>
      </div>

      {isGenerated && (
        <div className="space-y-6">
          {/* Status Board */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span>
                স্থান বরাদ্দ সম্পন্ন! কক্ষ: <strong>{roomName}</strong> | আসন সংখ্যা: 
                <strong> {parseInt(benchesCount, 10) * parseInt(seatsPerBench, 10)}</strong> | শিক্ষার্থী বরাদ্দ হয়েছে: 
                <strong> {assignedStudentsCount} জন</strong>
              </span>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              <Printer className="h-4 w-4" /> আসন পরিকল্পনা প্রিন্ট করুন
            </button>
          </div>

          {/* Tabular/Grid Classroom representation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 border-b pb-2">
              <LayoutGrid className="h-4 w-4 text-indigo-600" />
              হল রুম সিট প্ল্যান ভিউ (Door View Layout)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(() => {
                const totalBenches = parseInt(benchesCount, 10) || 8;
                const cols = parseInt(seatsPerBench, 10) || 2;
                const items = [];

                for (let b = 1; b <= totalBenches; b++) {
                  const benchSeats = seatPlan.filter((p) => p.benchNo === b);
                  items.push(
                    <div key={b} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                      <div className="bg-slate-800 text-white text-center font-bold text-xs py-1 rounded-md">
                        বেঞ্চ নং: {b}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center">
                        {benchSeats.map((seat, sIdx) => (
                          <div
                            key={sIdx}
                            className={`p-2 rounded-lg border text-xs min-h-[50px] flex flex-col justify-center items-center ${
                              seat.student
                                ? 'bg-indigo-50/40 border-indigo-200 text-indigo-950 font-medium'
                                : 'bg-slate-100 border-dashed border-slate-200 text-slate-400 italic'
                            }`}
                          >
                            {seat.student ? (
                              <>
                                <span className="font-bold block text-[10px] text-slate-500">রোল: {seat.student.roll}</span>
                                <span className="truncate max-w-full block font-semibold text-xs mt-0.5">{seat.student.name.split(' ')[0]}</span>
                              </>
                            ) : (
                              'ফাঁকা আসন'
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return items;
              })()}
            </div>
          </div>

          {/* Printable Bench Desk Slips */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <Clipboard className="h-4 w-4 text-indigo-600" />
                বেঞ্চে লাগানোর যোগ্য সিট স্লিপ (Printable Bench Slips)
              </h3>
              <button
                onClick={handlePrintSeatSlips}
                className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-sm shadow-indigo-600/10"
              >
                <Printer className="h-4 w-4" /> স্লিপগুলো প্রিন্ট/ডাউনলোড করুন (A4 PDF)
              </button>
            </div>
            <p className="text-xs text-slate-400">মুদ্রণ করার পর প্রতিটি স্লিপ কেটে বেঞ্চের বাম/ডান পাশে আঠা দিয়ে লাগিয়ে দিন।</p>

            <div id="printable-seat-slips" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {seatPlan
                .filter((p) => p.student !== null)
                .map((p, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-dashed border-slate-300 p-4 rounded-xl space-y-2 bg-slate-50 text-slate-700 relative overflow-hidden text-xs"
                  >
                    <div className="flex justify-between border-b pb-1.5 font-bold text-slate-500 text-[10px]">
                      <span>কক্ষ: {p.roomName.split(' ')[0]}</span>
                      <span>বেঞ্চ: {p.benchNo}</span>
                    </div>

                    <div className="space-y-1 py-1">
                      <div className="flex justify-between font-extrabold text-indigo-700 text-base">
                        <span>রোল: {p.student?.roll}</span>
                        <span>{p.seatPosition.split(' ')[0]}</span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm truncate">{p.student?.name}</div>
                    </div>

                    <div className="text-[10px] text-slate-400 text-center border-t pt-1 font-semibold">
                      আইসিটি প্রাইভেট হোম
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
