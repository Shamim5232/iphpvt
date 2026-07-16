import React, { useState, useMemo } from 'react';
import { Student, Batch, FeeCollection } from '../types';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Printer,
  Search,
  ArrowRight,
  DollarSign,
  Briefcase,
  PieChart,
  BarChart3,
  Sparkles,
  Download,
} from 'lucide-react';

interface IncomeChartProps {
  students: Student[];
  batches: Batch[];
  fees: FeeCollection[];
}

const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const BENGALI_NUMBERS: { [key: string]: string } = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

function toBengaliNum(num: number | string): string {
  return num
    .toString()
    .split('')
    .map((char) => BENGALI_NUMBERS[char] || char)
    .join('');
}

export default function IncomeChart({ students, batches, fees }: IncomeChartProps) {
  // Extract unique years from paid fees
  const yearsList = useMemo(() => {
    const years = new Set<string>();
    fees
      .filter((f) => f.status === 'Paid')
      .forEach((f) => {
        if (f.month) {
          const y = f.month.split('-')[0];
          if (y && y.length === 4) years.add(y);
        } else if (f.paymentDate) {
          const y = f.paymentDate.split('-')[0];
          if (y && y.length === 4) years.add(y);
        }
      });
    
    // Add current year if empty
    if (years.size === 0) {
      years.add(new Date().getFullYear().toString());
    }
    
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [fees]);

  const [selectedYear, setSelectedYear] = useState<string>(yearsList[0] || '2026');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(localStorage.getItem('sms_incomechart_page') || '1');
  });
  const itemsPerPage = 10;

  // Reset page when search term or selected year changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, searchTerm]);

  React.useEffect(() => {
    localStorage.setItem('sms_incomechart_page', currentPage.toString());
  }, [currentPage]);

  // 1. Process data for the selected year (Monthly Income)
  const monthlyData = useMemo(() => {
    const monthlySum = Array(12).fill(0);
    const monthlyCount = Array(12).fill(0);

    fees
      .filter((f) => f.status === 'Paid')
      .forEach((f) => {
        const y = f.month ? f.month.split('-')[0] : f.paymentDate ? f.paymentDate.split('-')[0] : '';
        const mStr = f.month ? f.month.split('-')[1] : f.paymentDate ? f.paymentDate.split('-')[1] : '';
        
        if (y === selectedYear && mStr) {
          const mIdx = parseInt(mStr, 10) - 1;
          if (mIdx >= 0 && mIdx < 12) {
            monthlySum[mIdx] += f.amount;
            monthlyCount[mIdx] += 1;
          }
        }
      });

    return monthlySum.map((amount, idx) => ({
      monthIdx: idx,
      monthName: BENGALI_MONTHS[idx],
      amount,
      count: monthlyCount[idx],
    }));
  }, [fees, selectedYear]);

  // Max amount for scaling the custom SVG chart
  const maxMonthlyAmount = useMemo(() => {
    const max = Math.max(...monthlyData.map((d) => d.amount));
    return max > 0 ? max : 10000; // avoid divide by zero
  }, [monthlyData]);

  // Total income calculated all-time
  const totalAllTimeIncome = useMemo(() => {
    return fees
      .filter((f) => f.status === 'Paid')
      .reduce((sum, f) => sum + f.amount, 0);
  }, [fees]);

  // Selected year total income
  const selectedYearIncome = useMemo(() => {
    return monthlyData.reduce((sum, d) => sum + d.amount, 0);
  }, [monthlyData]);

  // Selected year average income
  const selectedYearAverage = useMemo(() => {
    const activeMonths = monthlyData.filter((d) => d.amount > 0).length;
    return activeMonths > 0 ? Math.round(selectedYearIncome / activeMonths) : 0;
  }, [selectedYearIncome, monthlyData]);

  // 2. Process data for yearly income summary
  const yearlyData = useMemo(() => {
    const yearlyMap: { [key: string]: number } = {};
    fees
      .filter((f) => f.status === 'Paid')
      .forEach((f) => {
        const y = f.month ? f.month.split('-')[0] : f.paymentDate ? f.paymentDate.split('-')[0] : '';
        if (y && y.length === 4) {
          yearlyMap[y] = (yearlyMap[y] || 0) + f.amount;
        }
      });

    return Object.entries(yearlyMap)
      .map(([year, amount]) => ({ year, amount }))
      .sort((a, b) => b.year.localeCompare(a.year));
  }, [fees]);

  // 3. Payment Methods Distribution
  const paymentMethodsData = useMemo(() => {
    const methods: { [key: string]: { amount: number; count: number } } = {
      'Cash': { amount: 0, count: 0 },
      'bKash': { amount: 0, count: 0 },
      'Nagad': { amount: 0, count: 0 },
      'Rocket': { amount: 0, count: 0 },
      'Bank': { amount: 0, count: 0 },
    };

    fees
      .filter((f) => f.status === 'Paid')
      .forEach((f) => {
        const y = f.month ? f.month.split('-')[0] : f.paymentDate ? f.paymentDate.split('-')[0] : '';
        if (y === selectedYear) {
          const method = f.paymentMethod || 'Cash';
          if (methods[method]) {
            methods[method].amount += f.amount;
            methods[method].count += 1;
          } else {
            methods[method] = { amount: f.amount, count: 1 };
          }
        }
      });

    return Object.entries(methods)
      .map(([method, data]) => ({
        method,
        amount: data.amount,
        count: data.count,
        percentage: selectedYearIncome > 0 ? Math.round((data.amount / selectedYearIncome) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [fees, selectedYear, selectedYearIncome]);

  // 4. Latest transactions for searchable table
  const filteredTransactions = useMemo(() => {
    return fees
      .filter((f) => f.status === 'Paid')
      .map((f) => {
        const student = students.find((s) => s.id === f.studentId);
        const batch = batches.find((b) => b.id === student?.batchId);
        return {
          ...f,
          studentName: student?.name || 'অজানা শিক্ষার্থী',
          studentRoll: student?.roll || 'N/A',
          batchName: batch ? batch.name.split(' - ')[0] : 'N/A',
          year: f.month ? f.month.split('-')[0] : '',
        };
      })
      .filter((tx) => tx.year === selectedYear)
      .filter((tx) => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
          tx.studentName.toLowerCase().includes(s) ||
          tx.studentRoll.includes(s) ||
          tx.receiptNo.toLowerCase().includes(s) ||
          tx.paymentMethod.toLowerCase().includes(s) ||
          tx.month.includes(s)
        );
      })
      .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  }, [fees, students, batches, selectedYear, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Printing the financial statement
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('পপআপ উইন্ডোটি ব্লক করা হয়েছে! দয়া করে সেটিংস থেকে অনুমতি দিন।');
      return;
    }

    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>ইনকাম স্টেটমেন্ট রিপোর্ট (${selectedYear})</title>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <style>
    body {
      font-family: 'Noto Sans Bengali', 'Inter', sans-serif;
      background-color: #ffffff;
      margin: 0;
      padding: 40px;
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
<body class="bg-white text-slate-800">
  <div class="no-print flex justify-between items-center mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-[800px] mx-auto">
    <div class="text-xs text-slate-500 font-bold uppercase">
      আর্থিক প্রতিবেদন মুদ্রণ প্রাকদর্শন (Year: ${selectedYear})
    </div>
    <div class="flex gap-2">
      <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2.5 rounded-lg text-xs tracking-wider transition cursor-pointer border-0">
        প্রিন্ট করুন / PDF ডাউনলোড
      </button>
      <button onclick="window.close()" class="bg-slate-800 hover:bg-slate-900 text-white font-black px-4 py-2.5 rounded-lg text-xs tracking-wider transition cursor-pointer border-0">
        বন্ধ করুন
      </button>
    </div>
  </div>

  <div class="max-w-[800px] mx-auto border border-slate-200 p-8 rounded-2xl shadow-xs">
    <!-- Header -->
    <div class="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
      <div>
        <h1 class="text-2xl font-black text-slate-900 leading-tight">স্মার্ট কোচিং ও একাডেমি</h1>
        <p class="text-xs text-slate-500 font-semibold mt-1">ঠিকানা: হাউজিং স্টেট রোড, কুষ্টিয়া সদর, কুষ্টিয়া</p>
        <p class="text-xs text-slate-500 font-semibold">মোবাইল: ০১৭০০-০০০০০০</p>
      </div>
      <div class="text-right">
        <span class="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider block">
          ইনকাম রিপোর্ট - ${toBengaliNum(selectedYear)}
        </span>
        <p class="text-[10px] text-slate-400 font-bold mt-2">রিপোর্ট তৈরির তারিখ: ${toBengaliNum(new Date().toLocaleDateString('bn-BD'))}</p>
      </div>
    </div>

    <!-- Stats summary grid -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="border border-slate-200 p-4 rounded-xl text-center bg-slate-50/50">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">সর্বমোট আদায় (ঐ বছর)</span>
        <strong class="text-xl font-extrabold text-slate-800">৳${toBengaliNum(selectedYearIncome)}</strong>
      </div>
      <div class="border border-slate-200 p-4 rounded-xl text-center bg-slate-50/50">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">মাসিক গড় আদায়</span>
        <strong class="text-xl font-extrabold text-indigo-700">৳${toBengaliNum(selectedYearAverage)}</strong>
      </div>
      <div class="border border-slate-200 p-4 rounded-xl text-center bg-slate-50/50">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">মোট ফি রশিদ সংখ্যা</span>
        <strong class="text-xl font-extrabold text-slate-800">${toBengaliNum(filteredTransactions.length)} টি</strong>
      </div>
    </div>

    <!-- Monthly Table -->
    <div class="mb-8">
      <h3 class="text-sm font-bold text-slate-900 mb-3 border-l-4 border-indigo-500 pl-2">মাসভিত্তিক আয় বিবরণী</h3>
      <table class="w-full text-xs text-left text-slate-600 border-collapse">
        <thead>
          <tr class="bg-slate-100 border-b border-slate-200 text-slate-700">
            <th class="py-2 px-3 text-left font-bold">মাস</th>
            <th class="py-2 px-3 text-center font-bold">মোট রশিদ সংখ্যা</th>
            <th class="py-2 px-3 text-right font-bold">আদায়ের পরিমাণ</th>
          </tr>
        </thead>
        <tbody>
          ${monthlyData.map((d) => `
            <tr class="border-b border-slate-100 hover:bg-slate-50/50">
              <td class="py-2 px-3 font-semibold">${d.monthName}</td>
              <td class="py-2 px-3 text-center font-semibold font-mono">${toBengaliNum(d.count)}</td>
              <td class="py-2 px-3 text-right font-bold font-mono text-slate-800">৳${toBengaliNum(d.amount)}</td>
            </tr>
          `).join('')}
          <tr class="bg-indigo-50/50 border-t-2 border-indigo-100 font-bold">
            <td class="py-2.5 px-3 text-indigo-900">সর্বমোট (Total)</td>
            <td class="py-2.5 px-3 text-center text-indigo-900 font-mono">${toBengaliNum(filteredTransactions.length)}</td>
            <td class="py-2.5 px-3 text-right text-indigo-950 font-mono text-base">৳${toBengaliNum(selectedYearIncome)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Payment Modes Distribution -->
    <div class="grid grid-cols-2 gap-6 mb-8">
      <div>
        <h3 class="text-sm font-bold text-slate-900 mb-3 border-l-4 border-indigo-500 pl-2">পেমেন্ট মেথড বিভাজন</h3>
        <table class="w-full text-xs text-left text-slate-600 border-collapse border border-slate-100">
          <thead>
            <tr class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <th class="py-1.5 px-2">পদ্ধতি</th>
              <th class="py-1.5 px-2 text-center">শতকরা</th>
              <th class="py-1.5 px-2 text-right">পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            ${paymentMethodsData.filter(p => p.amount > 0).map(p => `
              <tr class="border-b border-slate-100">
                <td class="py-1.5 px-2 font-semibold">${p.method === 'Cash' ? 'নগদ (Cash)' : p.method}</td>
                <td class="py-1.5 px-2 text-center font-mono">${toBengaliNum(p.percentage)}%</td>
                <td class="py-1.5 px-2 text-right font-bold">৳${toBengaliNum(p.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="flex flex-col justify-end text-right">
        <p class="text-[10px] text-slate-400 italic">"এই আর্থিক প্রতিবেদনটি স্মার্ট একাডেমি ডাটাবেজ থেকে স্বয়ংক্রিয়ভাবে জেনারেট করা হয়েছে।"</p>
        <div class="mt-12">
          <div class="inline-block border-t border-slate-400 pt-1 px-8 text-center">
            <p class="text-[10px] font-bold text-slate-600 uppercase">কর্তৃপক্ষের স্বাক্ষর</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-5.5 w-5.5 text-indigo-600" />
            আর্থিক প্রতিবেদন ও ইনকাম চার্ট
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            প্রতিটি শিক্ষাবর্ষের মাসভিত্তিক এবং বাৎসরিক আয়ের বিস্তারিত গ্রাফ ও ট্রানজেকশন ট্র্যাকার।
          </p>
        </div>

        {/* Year Filter & Download Options */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 text-sm font-bold cursor-pointer transition shadow-xs hover:border-slate-300"
            >
              {yearsList.map((yr) => (
                <option key={yr} value={yr}>
                  {toBengaliNum(yr)} শিক্ষাবর্ষ
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:shadow-indigo-600/10 transition active:scale-95 cursor-pointer"
          >
            <Printer className="h-4 w-4" /> রিপোর্ট প্রিন্ট করুন
          </button>
        </div>
      </div>

      {/* Overview Cards (3 Cards Row to align with previous grid instructions) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Income of Selected Year */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs relative overflow-hidden flex items-center gap-4.5">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100">
            <TrendingUp className="h-6.5 w-6.5 stroke-[2.5px]" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
              বছরের মোট আদায় ({toBengaliNum(selectedYear)})
            </span>
            <strong className="text-3xl font-black text-slate-900 tracking-tight font-display">
              ৳{toBengaliNum(selectedYearIncome)}
            </strong>
          </div>
          <div className="absolute right-0 bottom-0 translate-y-2 translate-x-1 opacity-5 text-emerald-600">
            <TrendingUp className="h-28 w-28" />
          </div>
        </div>

        {/* Average Monthly Income of Selected Year */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs relative overflow-hidden flex items-center gap-4.5">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl border border-indigo-100">
            <CreditCard className="h-6.5 w-6.5 stroke-[2.5px]" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
              মাসিক গড় আদায় ({toBengaliNum(selectedYear)})
            </span>
            <strong className="text-3xl font-black text-indigo-700 tracking-tight font-display">
              ৳{toBengaliNum(selectedYearAverage)}
            </strong>
          </div>
          <div className="absolute right-0 bottom-0 translate-y-2 translate-x-1 opacity-5 text-indigo-600">
            <CreditCard className="h-28 w-28" />
          </div>
        </div>

        {/* Total All-Time Income */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs relative overflow-hidden flex items-center gap-4.5">
          <div className="bg-amber-50 text-amber-600 p-4 rounded-xl border border-amber-100">
            <Sparkles className="h-6.5 w-6.5 stroke-[2.5px]" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
              সর্বমোট অল-টাইম ইনকাম
            </span>
            <strong className="text-3xl font-black text-slate-900 tracking-tight font-display">
              ৳{toBengaliNum(totalAllTimeIncome)}
            </strong>
          </div>
          <div className="absolute right-0 bottom-0 translate-y-2 translate-x-1 opacity-5 text-amber-600">
            <Sparkles className="h-28 w-28" />
          </div>
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Monthly Income bar chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              মাসভিত্তিক ইনকাম গ্রাফ ({toBengaliNum(selectedYear)})
            </h3>
            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
              ৳ সর্বোচ্চ: ৳{toBengaliNum(maxMonthlyAmount)}
            </span>
          </div>

          {/* Custom SVG Bar Chart with Motion Tooltip */}
          <div className="pt-6 relative">
            <div className="h-64 w-full flex items-end gap-1.5 sm:gap-3.5 border-b border-l border-slate-200 pb-2 pl-2">
              {monthlyData.map((d, idx) => {
                // Compute height percentage
                const heightPercent = maxMonthlyAmount > 0 ? (d.amount / maxMonthlyAmount) * 100 : 0;
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={d.monthIdx}
                    className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Tooltip on Top */}
                    {isHovered && d.amount > 0 && (
                      <div className="absolute z-10 -top-12 bg-slate-900 text-white p-2.5 rounded-lg text-[10px] font-black shadow-lg text-center leading-normal animate-fade-in border border-slate-800 min-w-[100px] pointer-events-none">
                        <div className="text-slate-400 text-[8px] uppercase">{d.monthName}</div>
                        <div className="text-indigo-400 text-xs">৳{toBengaliNum(d.amount)}</div>
                        <div className="text-[8px] text-slate-300">রশিদ সংখ্যা: {toBengaliNum(d.count)} টি</div>
                      </div>
                    )}

                    {/* Bar representation */}
                    <div className="w-full relative h-full flex items-end">
                      <motion.div
                        className={`w-full rounded-t-md transition-all ${
                          d.amount === 0
                            ? 'bg-slate-50 border-t border-dashed border-slate-200'
                            : isHovered
                            ? 'bg-indigo-600 shadow-md shadow-indigo-600/20'
                            : 'bg-indigo-500/80 hover:bg-indigo-600'
                        }`}
                        style={{ height: `${Math.max(heightPercent, 2)}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: idx * 0.03 }}
                      />
                    </div>

                    {/* Short Month Name */}
                    <span className="text-[9px] font-bold text-slate-500 mt-2 rotate-12 sm:rotate-0 tracking-tight block">
                      {d.monthName.substring(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Empty state disclaimer */}
            {selectedYearIncome === 0 && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
                <span className="bg-slate-100 text-slate-400 p-3 rounded-full mb-2">
                  <BarChart3 className="h-6 w-6" />
                </span>
                <p className="text-xs font-bold text-slate-500">এই শিক্ষাবর্ষে কোনো ইনকাম ডাটা পাওয়া যায়নি।</p>
                <p className="text-[10px] text-slate-400 mt-0.5">ফি কালেকশন থেকে ফি আদায় করলে এখানে আপডেট হবে।</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Yearly Comparison & Payment Breakdown */}
        <div className="space-y-6">
          {/* Yearly comparisons list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b pb-2">
              <Calendar className="h-4 w-4 text-emerald-600" />
              বছরের তুলনা (Yearly Income Comparison)
            </h3>

            <div className="space-y-3.5">
              {yearlyData.map((item) => {
                const isCurrent = item.year === selectedYear;
                return (
                  <div
                    key={item.year}
                    onClick={() => setSelectedYear(item.year)}
                    className={`p-3 rounded-xl border transition duration-150 cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{toBengaliNum(item.year)} সাল</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Yearly Total</span>
                    </div>
                    <div className="text-right">
                      <strong className={`text-base font-black ${isCurrent ? 'text-indigo-700' : 'text-slate-800'}`}>
                        ৳{toBengaliNum(item.amount)}
                      </strong>
                    </div>
                  </div>
                );
              })}

              {yearlyData.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">কোনো বাৎসরিক ডাটা নেই।</p>
              )}
            </div>
          </div>

          {/* Payment Method Distribution Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b pb-2">
              <PieChart className="h-4 w-4 text-amber-600" />
              পেমেন্ট মাধ্যম বিভাজন ({toBengaliNum(selectedYear)})
            </h3>

            <div className="space-y-3.5">
              {paymentMethodsData.map((p) => {
                if (selectedYearIncome === 0 && p.amount === 0) return null;
                return (
                  <div key={p.method} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{p.method === 'Cash' ? 'নগদ (Cash)' : p.method}</span>
                      <span className="text-slate-500">{toBengaliNum(p.percentage)}% (৳{toBengaliNum(p.amount)})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          p.method === 'Cash'
                            ? 'bg-emerald-500'
                            : p.method === 'bKash'
                            ? 'bg-pink-500'
                            : p.method === 'Nagad'
                            ? 'bg-orange-500'
                            : p.method === 'Rocket'
                            ? 'bg-indigo-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${p.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {selectedYearIncome === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">কোনো পেমেন্ট মেথড বিবরণী পাওয়া যায়নি।</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Database Search Log Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Search className="h-4 w-4 text-indigo-600" />
              আদায়কৃত ফি রশিদ ট্র্যাকার ({toBengaliNum(selectedYear)})
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">রোল, রিসিট নম্বর বা শিক্ষার্থীর নাম লিখে সার্চ করুন।</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="সার্চ করুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-semibold"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3">রশিদ নং</th>
                <th className="py-2.5 px-3">শিক্ষার্থী</th>
                <th className="py-2.5 px-3">রোল</th>
                <th className="py-2.5 px-3">ব্যাচ</th>
                <th className="py-2.5 px-3">বেতন মাস</th>
                <th className="py-2.5 px-3">পেমেন্ট মাধ্যম</th>
                <th className="py-2.5 px-3">তারিখ</th>
                <th className="py-2.5 px-3 text-right">আদায়ের পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{tx.receiptNo}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{tx.studentName}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold">{toBengaliNum(tx.studentRoll)}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-600">{tx.batchName}</td>
                  <td className="py-2.5 px-3 font-semibold">
                    {toBengaliNum(tx.month.split('-')[0])} - {BENGALI_MONTHS[parseInt(tx.month.split('-')[1], 10) - 1] || tx.month}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${
                        tx.paymentMethod === 'Cash'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : tx.paymentMethod === 'bKash'
                          ? 'bg-pink-50 text-pink-700 border-pink-100'
                          : tx.paymentMethod === 'Nagad'
                          ? 'bg-orange-50 text-orange-700 border-orange-100'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}
                    >
                      {tx.paymentMethod === 'Cash' ? 'Cash' : tx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium">{toBengaliNum(tx.paymentDate)}</td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900 font-display">৳{toBengaliNum(tx.amount)}</td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    কোনো আদায় ট্রানজেকশন তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredTransactions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
            <div>
              সর্বমোট <strong>{toBengaliNum(filteredTransactions.length)}</strong> টি রশিদের মধ্যে{' '}
              <strong>{toBengaliNum(Math.min((currentPage - 1) * itemsPerPage + 1, filteredTransactions.length))}</strong> থেকে{' '}
              <strong>{toBengaliNum(Math.min(currentPage * itemsPerPage, filteredTransactions.length))}</strong> দেখা যাচ্ছে।
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg border text-xs transition font-bold select-none cursor-pointer ${
                  currentPage === 1
                    ? 'bg-slate-50 border-slate-100 text-slate-300 pointer-events-none'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                পূর্ববর্তী
              </button>

              {/* Generate Page Numbers nicely */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // To keep it clean if there are too many pages
                if (
                  totalPages > 5 &&
                  page !== 1 &&
                  page !== totalPages &&
                  Math.abs(page - currentPage) > 1
                ) {
                  if (page === 2 || page === totalPages - 1) {
                    return <span key={page} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs transition border select-none cursor-pointer ${
                      currentPage === page
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {toBengaliNum(page)}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg border text-xs transition font-bold select-none cursor-pointer ${
                  currentPage === totalPages
                    ? 'bg-slate-50 border-slate-100 text-slate-300 pointer-events-none'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                পরবর্তী
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
