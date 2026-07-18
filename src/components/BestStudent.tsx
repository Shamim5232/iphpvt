import React, { useState, useMemo, useEffect } from 'react';
import { Student, Batch, AttendanceRecord, ModelTestMark } from '../types';
import { Trophy, Calendar, Award, Star, Download, Printer, Medal, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import { isFriday } from '../utils/dateHelpers';


interface BestStudentProps {
  students: Student[];
  batches: Batch[];
  attendance: AttendanceRecord[];
  modelTests: ModelTestMark[];
}

const toBengaliNumber = (num: number | string): string => {
  const banglaDigits: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return num.toString().replace(/\d/g, (d) => banglaDigits[d] || d);
};

export default function BestStudent({
  students,
  batches,
  attendance,
  modelTests,
}: BestStudentProps) {
  const getLocalMonthString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getLocalMonthString());
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [showCertificate, setShowCertificate] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(localStorage.getItem('sms_beststudent_page') || '1');
  });

  useEffect(() => {
    localStorage.setItem('sms_beststudent_page', currentPage.toString());
  }, [currentPage]);
  const [certificateStudent, setCertificateStudent] = useState<any | null>(null);

  const handleDownloadCertificate = () => {
    const selectedCertStudent = certificateStudent || bestStudent;
    if (!selectedCertStudent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('পপআপ উইন্ডো খুলতে পারেনি! অনুগ্রহ করে আপনার ব্রাউজারের পপআপ ব্লকার নিষ্ক্রিয় করুন এবং পুনরায় চেষ্টা করুন।');
      return;
    }

    let rankText = '';
    let rankBadgeColor = '';
    let rankTextColor = '';
    if (selectedCertStudent.rank === 1) {
      rankText = 'র্যাঙ্ক ১ (প্রথম স্থান)';
      rankBadgeColor = 'bg-amber-100 border-amber-300';
      rankTextColor = 'text-amber-600';
    } else if (selectedCertStudent.rank === 2) {
      rankText = 'র্যাঙ্ক ২ (দ্বিতীয় স্থান)';
      rankBadgeColor = 'bg-slate-100 border-slate-300';
      rankTextColor = 'text-slate-600';
    } else if (selectedCertStudent.rank === 3) {
      rankText = 'র্যাঙ্ক ৩ (তৃতীয় স্থান)';
      rankBadgeColor = 'bg-amber-50 border-amber-200';
      rankTextColor = 'text-amber-700';
    } else {
      rankText = `র্যাঙ্ক ${toBengaliNumber(selectedCertStudent.rank)}`;
      rankBadgeColor = 'bg-slate-50 border-slate-200';
      rankTextColor = 'text-slate-500';
    }

    const scoreDescription = selectedCertStudent.rank === 1
      ? `প্রতিষ্ঠানের সর্বোচ্চ <strong class="text-amber-600">${selectedCertStudent.totalScore.toFixed(1)}</strong> স্কোর অর্জন করে <strong class="text-amber-600">র্যাঙ্ক ১ (প্রথম স্থান)</strong> অর্জন করেছেন।`
      : selectedCertStudent.rank === 2
      ? `প্রতিষ্ঠানের অসামান্য <strong class="text-slate-600">${selectedCertStudent.totalScore.toFixed(1)}</strong> স্কোর অর্জন করে <strong class="text-slate-600">র্যাঙ্ক ২ (দ্বিতীয় স্থান)</strong> অর্জন করেছেন।`
      : selectedCertStudent.rank === 3
      ? `প্রতিষ্ঠানের গৌরবময় <strong class="text-amber-700">${selectedCertStudent.totalScore.toFixed(1)}</strong> স্কোর অর্জন করে <strong class="text-amber-700">র্যাঙ্ক ৩ (তৃতীয় স্থান)</strong> অর্জন করেছেন।`
      : `প্রতিষ্ঠানের গৌরবময় <strong class="text-slate-700">${selectedCertStudent.totalScore.toFixed(1)}</strong> স্কোর অর্জন করে <strong class="text-slate-700">র্যাঙ্ক ${toBengaliNumber(selectedCertStudent.rank)}</strong> অর্জন করেছেন।`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>সম্মাননা প্রশংসাপত্র - ${selectedCertStudent.student.name}</title>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <style>
    body {
      font-family: 'Noto Sans Bengali', 'Inter', sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .font-serif-title {
      font-family: 'Playfair Display', 'Times New Roman', serif;
    }
    @media print {
      body {
        background-color: white;
        padding: 0;
        margin: 0;
      }
      .no-print {
        display: none !important;
      }
      #print-certificate-container {
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        padding: 40px !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
      }
      @page {
        size: landscape;
        margin: 1cm;
      }
    }
  </style>
</head>
<body class="bg-slate-50 flex items-center justify-center min-h-screen">
  <div class="no-print fixed top-5 right-5 z-50 flex gap-3">
    <button onclick="window.print()" class="bg-amber-600 hover:bg-amber-700 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer border-0">
      <svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
      </svg>
      সার্টিফিকেট মুদ্রণ / PDF ডাউনলোড
    </button>
    <button onclick="window.close()" class="bg-slate-800 hover:bg-slate-900 text-white font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer border-0">
      বন্ধ করুন
    </button>
  </div>

  <div id="print-certificate-container" class="bg-white border-[16px] border-double border-amber-500/80 p-16 rounded-2xl shadow-xl space-y-8 relative overflow-hidden w-full max-w-[900px] mx-auto min-h-[580px] flex flex-col justify-between text-center">
    <!-- Corner Ornaments -->
    <div class="absolute top-4 left-4 w-20 h-20 border-t-4 border-l-4 border-amber-600 rounded-tl-md opacity-70"></div>
    <div class="absolute top-4 right-4 w-20 h-20 border-t-4 border-r-4 border-amber-600 rounded-tr-md opacity-70"></div>
    <div class="absolute bottom-4 left-4 w-20 h-20 border-b-4 border-l-4 border-amber-600 rounded-bl-md opacity-70"></div>
    <div class="absolute bottom-4 right-4 w-20 h-20 border-b-4 border-r-4 border-amber-600 rounded-br-md opacity-70"></div>

    <!-- Inner thin border -->
    <div class="absolute inset-2 border border-amber-300/40 pointer-events-none rounded-lg"></div>

    <!-- Certificate Top Seal/Crown -->
    <div class="flex flex-col items-center gap-2">
      <div class="bg-amber-50 p-3 rounded-full border border-amber-200 shadow-sm inline-block">
        <svg class="h-10 w-10 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"/>
        </svg>
      </div>
      <div class="text-[10px] text-amber-600 font-extrabold tracking-widest uppercase">Academic Excellence Award</div>
    </div>

    <!-- Titles -->
    <div class="space-y-3">
      <h1 class="text-4xl font-extrabold text-slate-800 font-serif-title tracking-wide uppercase">Certificate of Excellence</h1>
      <p class="text-xs text-amber-600 font-black uppercase tracking-widest">মাসিক সেরা ছাত্র/ছাত্রী সম্মাননা প্রশংসাপত্র</p>
      <div class="flex justify-center mt-1">
        <span class="px-4 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider ${rankBadgeColor} ${rankTextColor}">
          ${rankText}
        </span>
      </div>
    </div>

    <!-- Recipient -->
    <div class="space-y-3 my-2">
      <p class="text-sm text-slate-400 italic font-medium">এই প্রশংসাপত্রটি অত্যন্ত গৌরব ও শ্রদ্ধার সাথে প্রদান করা হচ্ছে</p>
      <div class="relative inline-block">
        <h2 class="text-3xl font-black text-slate-900 border-b-2 border-dashed border-amber-400 pb-2 px-8 min-w-[250px] inline-block">
          ${selectedCertStudent.student.name}
        </h2>
      </div>
      <p class="text-xs font-bold text-slate-500 mt-1">রোল নম্বর: <span class="font-mono text-slate-700">${selectedCertStudent.student.roll}</span> | ব্যাচ: <span class="text-slate-700">${selectedCertStudent.batchName}</span></p>
    </div>

    <!-- Description -->
    <div class="max-w-xl mx-auto">
      <p class="text-sm text-slate-600 leading-relaxed font-semibold">
        যিনি <strong class="text-slate-800">${selectedCertStudent.batchName}</strong> ব্যাচে 
        <strong class="text-slate-800">${selectedMonth}</strong> মাসে অনুষ্ঠিত ৫টি মডেল টেস্ট পরীক্ষায় অসামান্য ফলাফল অর্জন করেছেন এবং অনন্য উপস্থিতির ধারাবাহিকতা বজায় রেখে ${scoreDescription}
      </p>
    </div>

    <!-- Badge breakdown -->
    <div class="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex justify-around text-xs max-w-sm mx-auto text-slate-600 shadow-xs">
      <div class="text-center">
        <span class="block font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">উপস্থিতির হার</span>
        <span class="font-black text-slate-800 text-sm">${selectedCertStudent.attendanceRate.toFixed(0)}%</span>
      </div>
      <div class="border-r border-amber-200"></div>
      <div class="text-center">
        <span class="block font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">মডেল টেস্ট গড়</span>
        <span class="font-black text-slate-800 text-sm">${selectedCertStudent.avgMark.toFixed(1)}</span>
      </div>
      <div class="border-r border-amber-200"></div>
      <div class="text-center">
        <span class="block font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">মোট স্কোর</span>
        <span class="font-black text-amber-600 text-sm">${selectedCertStudent.totalScore.toFixed(1)} / ১০০</span>
      </div>
    </div>

    <!-- Signatures -->
    <div class="flex justify-between items-end text-xs text-slate-500 pt-10 px-6">
      <div class="text-center">
        <div class="border-t border-slate-300 pt-1.5 w-28 mx-auto font-black text-slate-700">শ্রেণী শিক্ষক</div>
      </div>
      <div class="text-center">
        <svg class="h-10 w-10 text-amber-500 mx-auto opacity-70 mb-0.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"/>
        </svg>
        <span class="text-[9px] text-amber-600 block font-black tracking-widest">SMS PRO</span>
      </div>
      <div class="text-center">
        <div class="border-t border-slate-300 pt-1.5 w-28 mx-auto font-black text-slate-700">প্রধান পরিচালক</div>
      </div>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('পপআপ উইন্ডো খুলতে পারেনি! অনুগ্রহ করে আপনার ব্রাউজারের পপআপ ব্লকার নিষ্ক্রিয় করুন এবং পুনরায় চেষ্টা করুন।');
      return;
    }

    const currentBatchObj = batches.find((b) => b.id === selectedBatch);
    const batchNameText = selectedBatch === 'all' ? 'সব ব্যাচ একত্রে' : currentBatchObj?.name || '';

    const tableRows = leaderboard.map((item) => {
      let rankBadge = '';
      if (item.rank === 1) {
        rankBadge = '<span class="text-amber-600 font-bold">🥇 ১</span>';
      } else if (item.rank === 2) {
        rankBadge = '<span class="text-slate-500 font-bold">🥈 ২</span>';
      } else if (item.rank === 3) {
        rankBadge = '<span class="text-amber-700 font-bold">🥉 ৩</span>';
      } else {
        rankBadge = `<span class="text-slate-600 font-semibold">${item.rank}</span>`;
      }

      return `
        <tr class="border-b border-slate-150 hover:bg-slate-50 text-slate-700 text-center text-xs">
          <td class="py-3 px-4 text-center font-bold">${rankBadge}</td>
          <td class="py-3 px-4 text-left">
            <div class="font-bold text-slate-900">${item.student.name}</div>
            <div class="text-[10px] text-slate-500 font-mono">রোল: ${item.student.roll}</div>
          </td>
          <td class="py-3 px-4 text-center font-medium">${item.batchName}</td>
          <td class="py-3 px-4 text-center font-semibold">${item.attendanceRate.toFixed(1)}%</td>
          <td class="py-3 px-4 text-center font-semibold">${item.avgMark.toFixed(1)}</td>
          <td class="py-3 px-4 text-center font-black text-indigo-700">${item.totalScore.toFixed(1)}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>মাসিক সেরা ছাত্র/ছাত্রীর রিপোর্ট - ${selectedMonth}</title>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <style>
    body {
      font-family: 'Noto Sans Bengali', 'Inter', sans-serif;
      background-color: #ffffff;
      margin: 0;
      padding: 30px;
    }
    @media print {
      body {
        padding: 0;
        margin: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body class="bg-white">
  <!-- Print controls for browser preview -->
  <div class="no-print flex justify-end gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
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

  <!-- Report Header -->
  <div class="border-b-2 border-slate-200 pb-5 mb-6 flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">মাসিক সেরা ছাত্র/ছাত্রীর তালিকা (Leaderboard)</h1>
      <p class="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
        মাস: <span class="text-indigo-600">${selectedMonth}</span> | ব্যাচ: <span class="text-indigo-600">${batchNameText}</span>
      </p>
    </div>
    <div class="text-right">
      <div class="text-lg font-black text-indigo-600">SMS PRO</div>
      <div class="text-[10px] text-slate-400 font-mono">তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
    </div>
  </div>

  <!-- Leaderboard Table -->
  <table class="w-full text-left border-collapse border border-slate-200">
    <thead>
      <tr class="bg-slate-50 border-b border-slate-200 text-slate-800 text-xs font-extrabold uppercase tracking-wider text-center">
        <th class="py-3 px-4 text-center border-r border-slate-200 w-16">র‌্যাঙ্ক</th>
        <th class="py-3 px-4 text-left border-r border-slate-200">নাম ও রোল</th>
        <th class="py-3 px-4 text-center border-r border-slate-200">ব্যাচ</th>
        <th class="py-3 px-4 text-center border-r border-slate-200">উপস্থিতির হার</th>
        <th class="py-3 px-4 text-center border-r border-slate-200">পরীক্ষার গড়</th>
        <th class="py-3 px-4 text-center bg-indigo-50 text-indigo-950 font-bold">মোট স্কোর</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100">
      ${tableRows.length > 0 ? tableRows : `
        <tr>
          <td colspan="6" class="text-center py-12 text-slate-400 font-bold text-sm">কোনো রেকর্ড খুঁজে পাওয়া যায়নি।</td>
        </tr>
      `}
    </tbody>
  </table>

  <!-- Signature section -->
  <div class="flex justify-between items-end text-xs text-slate-500 mt-20 px-4">
    <div class="text-center">
      <div class="border-t border-slate-300 pt-1.5 w-28 mx-auto font-bold text-slate-700">শ্রেণী শিক্ষক</div>
    </div>
    <div class="text-center">
      <div class="border-t border-slate-300 pt-1.5 w-28 mx-auto font-bold text-slate-700">প্রধান পরিচালক</div>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Compute stats for all students in the selected month/batch
  const leaderboard = useMemo(() => {
    const rawList = students
      .filter((s) => selectedBatch === 'all' || s.batchId === selectedBatch)
      .map((student) => {
        const batch = batches.find((b) => b.id === student.batchId);

        // 1. Calculate Attendance Percentage
        const studentAttendance = attendance.filter(
          (a) => a.studentId === student.id && a.date.startsWith(selectedMonth) && !isFriday(a.date)
        );
        const totalDays = studentAttendance.length;
        const presentDays = studentAttendance.filter((a) => a.status === 'Present').length;
        const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
        const attendanceWeight = attendanceRate * 0.4; // 40% weight

        // 2. Calculate Model Test Average
        const testMark = modelTests.find(
          (m) => m.studentId === student.id && m.month === selectedMonth
        );
        let avgMark = 0;
        if (testMark) {
          const scores = [
            testMark.test1,
            testMark.test2,
            testMark.test3,
            testMark.test4,
            testMark.test5,
          ].filter((score) => score !== -1 && score !== undefined);
          avgMark = scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0;
        }
        const testWeight = avgMark * 0.6; // 60% weight

        // 3. Final Score (max 100)
        const totalScore = attendanceWeight + testWeight;

        return {
          student,
          batchName: batch ? batch.name.split(' - ')[0] : 'অজানা ব্যাচ',
          attendanceRate,
          avgMark,
          attendanceWeight,
          testWeight,
          totalScore,
          testMarkDetails: testMark,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);

    let currentRank = 0;
    let lastScoreStr = '';
    return rawList.map((item) => {
      const scoreStr = item.totalScore.toFixed(1);
      if (scoreStr !== lastScoreStr) {
        currentRank++;
        lastScoreStr = scoreStr;
      }
      return {
        ...item,
        rank: currentRank,
      };
    });
  }, [students, batches, attendance, modelTests, selectedMonth, selectedBatch]);

  const bestStudent = leaderboard[0];

  const itemsPerPage = 10;
  const paginatedLeaderboard = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return leaderboard.slice(startIndex, startIndex + itemsPerPage);
  }, [leaderboard, currentPage]);

  const totalPages = Math.ceil(leaderboard.length / itemsPerPage);

  return (
    <div id="best-student-module" className="space-y-6">
      {/* Header card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-slate-900 font-display flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500 stroke-[2.5px]" />
            বেস্ট স্টুডেন্ট অফ দ্যা মান্থ (Best Student of the Month)
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            মডেল টেস্ট পরীক্ষার নম্বর (৬০% ওয়েট) এবং উপস্থিতির (৪০% ওয়েট) ভিত্তিতে রিপোর্ট বের করুন।
          </p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm items-end">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">মাস নির্বাচন করুন</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-black text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">ব্যাচ ফিল্টার</label>
          <select
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-bold text-xs"
          >
            <option value="all">সব ব্যাচ একত্রে</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrintReport}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs uppercase tracking-wider px-4 py-3 rounded-lg transition"
          >
            <Printer className="h-4 w-4" /> রিপোর্ট প্রিন্ট
          </button>
          {bestStudent && bestStudent.totalScore > 0 && (
            <button
              onClick={() => {
                setCertificateStudent(bestStudent);
                setShowCertificate(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider px-4 py-3 rounded-lg transition shadow-md shadow-amber-500/10"
            >
              <Award className="h-4 w-4" /> সার্টিফিকেট
            </button>
          )}
        </div>
      </div>

      {/* Top Banner for Best Student */}
      {bestStudent && bestStudent.totalScore > 0 ? (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-1 rounded-2xl shadow-md">
          <div className="bg-white p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-amber-50 p-4 rounded-full border border-amber-200 text-amber-500">
                  <Crown className="h-10 w-10 animate-bounce" />
                </div>
                <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  #১
                </div>
              </div>

              <div>
                <span className="text-amber-600 text-xs font-bold uppercase tracking-wider block">
                  Best Student of the Month ({selectedMonth})
                </span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{bestStudent.student.name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  রোল নম্বর: <strong>{bestStudent.student.roll}</strong> | ব্যাচ: <strong>{bestStudent.batchName}</strong>
                </p>
              </div>
            </div>

            {/* Scores block */}
            <div className="grid grid-cols-3 gap-6 text-center border-l border-slate-100 pl-6">
              <div>
                <span className="text-xs text-slate-400 block font-medium">উপস্থিতি (৪০%)</span>
                <span className="text-base font-bold text-slate-700">{bestStudent.attendanceRate.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">({bestStudent.attendanceWeight.toFixed(1)} পয়েন্ট)</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">মডেল টেস্ট গড় (৬০%)</span>
                <span className="text-base font-bold text-slate-700">{bestStudent.avgMark.toFixed(1)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">({bestStudent.testWeight.toFixed(1)} পয়েন্ট)</span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                <span className="text-xs text-amber-700 block font-bold">মোট স্কোর (১০০)</span>
                <span className="text-xl font-black text-amber-600">{bestStudent.totalScore.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 p-8 text-center rounded-2xl border border-slate-200 text-slate-500">
          এই মাসের জন্য এখনো কোনো পর্যাপ্ত অ্যাটেনডেন্স বা মডেল টেস্টের নম্বর পাওয়া যায়নি।
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h4 className="font-black text-slate-900 font-display flex items-center gap-1.5 text-sm uppercase tracking-wider">
            <Medal className="h-5 w-5 text-blue-600 stroke-[2.5px]" />
            মাসিক সেরা ছাত্র/ছাত্রীর তালিকা (Leaderboard)
          </h4>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">মোট পরীক্ষার্থী: {leaderboard.length} জন</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider text-center">
                <th className="py-4 px-6 text-left w-16">র‌্যাঙ্ক</th>
                <th className="py-4 px-6 text-left">নাম ও রোল</th>
                <th className="py-4 px-6 text-left">ব্যাচ</th>
                <th className="py-4 px-3">উপস্থিতির হার</th>
                <th className="py-4 px-3">পরীক্ষার গড় (৫টি টেস্ট)</th>
                <th className="py-4 px-4 bg-blue-50 text-blue-900 w-28 font-bold">মোট স্কোর</th>
                <th className="py-4 px-4 text-center w-28">প্রশংসাপত্র</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
              {paginatedLeaderboard.length > 0 ? (
                paginatedLeaderboard.map((item, index) => {
                  return (
                    <tr key={item.student.id} className={`hover:bg-slate-50/50 transition text-center ${item.rank === 1 ? 'bg-amber-50/20 font-medium' : ''}`}>
                      <td className="py-3.5 px-6 text-left font-bold">
                        {item.rank === 1 ? (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Crown className="h-4 w-4" /> ১
                          </div>
                        ) : item.rank === 2 ? (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Medal className="h-4 w-4" /> ২
                          </div>
                        ) : item.rank === 3 ? (
                          <div className="flex items-center gap-1 text-amber-600">
                            <Medal className="h-4 w-4" /> ৩
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">{item.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-left">
                        <div className="font-semibold text-slate-900">{item.student.name}</div>
                        <div className="text-xs text-slate-400 font-mono">রোল নম্বর: {item.student.roll}</div>
                      </td>
                      <td className="py-3.5 px-6 text-left">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                          {item.batchName}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {item.attendanceRate.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {item.avgMark.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-4 bg-blue-50/50 text-blue-700 font-black text-base">
                        {item.totalScore.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.rank <= 3 ? (
                          <button
                            onClick={() => {
                              setCertificateStudent(item);
                              setShowCertificate(true);
                            }}
                            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black px-2.5 py-1.5 rounded-lg transition shadow-xs cursor-pointer border-0"
                          >
                            <Printer className="h-3.5 w-3.5" /> প্রিন্ট
                          </button>
                        ) : (
                          <span className="text-slate-300 text-xs font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    কোন রেকর্ড খুঁজে পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-150 flex flex-col sm:flex-row items-center justify-between bg-slate-50 gap-4">
            <div className="text-xs font-bold text-slate-500">
              পৃষ্ঠা <span className="text-indigo-600">{currentPage}</span> / <span className="text-slate-700">{totalPages}</span> (মোট {leaderboard.length} জন শিক্ষার্থীর মধ্যে { (currentPage - 1) * itemsPerPage + 1 } - { Math.min(currentPage * itemsPerPage, leaderboard.length) } দেখানো হচ্ছে)
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-xs flex items-center gap-1 font-bold"
              >
                <ChevronLeft className="h-4 w-4" /> পূর্ববর্তী
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer text-xs flex items-center gap-1 font-bold"
              >
                পরবর্তী <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Certificate Modal Overlay */}
      {showCertificate && (certificateStudent || bestStudent) && (() => {
        const selectedCertStudent = certificateStudent || bestStudent;
        let rankText = `র‌্যাঙ্ক ${toBengaliNumber(selectedCertStudent.rank)}`;
        let rankBadgeStyle = 'bg-slate-100 border-slate-200 text-slate-600';
        if (selectedCertStudent.rank === 1) {
          rankText = 'র‌্যাঙ্ক ১ (প্রথম স্থান)';
          rankBadgeStyle = 'bg-amber-100 border-amber-300 text-amber-600';
        } else if (selectedCertStudent.rank === 2) {
          rankText = 'র‌্যাঙ্ক ২ (দ্বিতীয় স্থান)';
          rankBadgeStyle = 'bg-slate-100 border-slate-300 text-slate-600';
        } else if (selectedCertStudent.rank === 3) {
          rankText = 'র‌্যাঙ্ক ৩ (তৃতীয় স্থান)';
          rankBadgeStyle = 'bg-amber-50 border-amber-200 text-amber-700';
        }

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  সম্মাননা প্রশংসাপত্র (Award Certificate)
                </h3>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition border-0 cursor-pointer"
                >
                  <Star className="h-5 w-5" />
                </button>
              </div>

              {/* Certificate Printable Body */}
              <div id="printable-certificate" className="p-8 bg-amber-50/30 border-8 border-amber-200 m-4 rounded-xl text-center space-y-6 relative overflow-hidden">
                {/* Background design elements */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-amber-500 rounded-tl-lg opacity-40"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-amber-500 rounded-tr-lg opacity-40"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-amber-500 rounded-bl-lg opacity-40"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-amber-500 rounded-br-lg opacity-40"></div>

                {/* Certificate Logo */}
                <div className="flex justify-center flex-col items-center gap-2">
                  <Crown className="h-16 w-16 text-amber-500 animate-pulse" />
                  <span className={`inline-flex px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${rankBadgeStyle}`}>
                    {rankText}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold text-slate-900 font-serif tracking-wide uppercase">Certificate of Excellence</h1>
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">মাসিক সেরা ছাত্র/ছাত্রী সম্মাননা স্মারক</p>
                </div>

                <div className="py-4 space-y-4">
                  <p className="text-sm text-slate-500 italic">এই প্রশংসাপত্রটি অত্যন্ত গৌরবের সাথে প্রদান করা হচ্ছে:</p>
                  <h2 className="text-3xl font-black text-slate-800 underline decoration-amber-400 decoration-wavy underline-offset-8">
                    {selectedCertStudent.student.name}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mt-4">
                    যিনি <strong className="text-slate-800">{selectedCertStudent.batchName}</strong> ব্যাচে 
                    <strong className="text-slate-800"> {selectedMonth}</strong> মাসে অনুষ্ঠিত ৫টি মডেল টেস্ট পরীক্ষায় অসামান্য ফলাফল অর্জন করেছেন এবং অনন্য উপস্থিতির ধারাবাহিকতা বজায় রেখে {
                      selectedCertStudent.rank === 1
                        ? <>প্রতিষ্ঠানের সর্বোচ্চ <strong className="text-amber-600">{selectedCertStudent.totalScore.toFixed(1)}</strong> স্কোর অর্জন করে <strong className="text-amber-600">র‌্যাঙ্ক ১ (প্রথম স্থান)</strong> অর্জন করেছেন।</>
                        : selectedCertStudent.rank === 2
                        ? <>প্রতিষ্ঠানের অসামান্য <strong className="text-slate-600">{selectedCertStudent.totalScore.toFixed(1)}</strong> স্কোর অর্জন করে <strong className="text-slate-600">র‌্যাঙ্ক ২ (দ্বিতীয় স্থান)</strong> অর্জন করেছেন।</>
                        : selectedCertStudent.rank === 3
                        ? <>প্রতিষ্ঠানের গৌরবময় <strong className="text-amber-700">{selectedCertStudent.totalScore.toFixed(1)}</strong> স্কোর অর্জন করে <strong class="text-amber-700">র‌্যাঙ্ক ৩ (তৃতীয় স্থান)</strong> অর্জন করেছেন।</>
                        : <>প্রতিষ্ঠানের গৌরবময় <strong className="text-slate-700">{selectedCertStudent.totalScore.toFixed(1)}</strong> স্কোর অর্জন করে <strong class="text-slate-700">র‌্যাঙ্ক {toBengaliNumber(selectedCertStudent.rank)}</strong> অর্জন করেছেন।</>
                    }
                  </p>
                </div>

                {/* Score breakdown on certificate */}
                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-amber-100 flex justify-around text-xs max-w-xs mx-auto text-slate-600">
                  <div>
                    <span className="block font-semibold">উপস্থিতি হার</span>
                    <span className="font-bold text-slate-800">{selectedCertStudent.attendanceRate.toFixed(0)}%</span>
                  </div>
                  <div className="border-r border-slate-200"></div>
                  <div>
                    <span className="block font-semibold">মডেল টেস্ট গড়</span>
                    <span className="font-bold text-slate-800">{selectedCertStudent.avgMark.toFixed(1)}</span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between items-end text-xs text-slate-500 pt-8 max-w-lg mx-auto">
                  <div className="text-center">
                    <div className="border-t border-slate-300 pt-1 w-28 mx-auto font-semibold">শ্রেণী শিক্ষক</div>
                  </div>
                  <div className="text-center">
                    <Award className="h-10 w-10 text-amber-500 mx-auto opacity-70" />
                    <span className="text-[10px] text-amber-600 block font-bold">SMS PRO</span>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-slate-300 pt-1 w-28 mx-auto font-semibold">প্রধান পরিচালক</div>
                  </div>
                </div>
              </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={handleDownloadCertificate}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition shadow-md shadow-amber-600/10 cursor-pointer"
              >
                <Download className="h-4 w-4 stroke-[3px]" /> ডাউনলোড ও প্রিন্ট
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-white transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
