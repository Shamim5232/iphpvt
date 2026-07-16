import React, { useState, useEffect } from 'react';
import { Student, Batch, FeeCollection } from '../types';
import { CreditCard, Plus, Receipt, Search, CheckCircle, Clock, AlertCircle, Printer, Download, X } from 'lucide-react';

interface FeesProps {
  students: Student[];
  batches: Batch[];
  fees: FeeCollection[];
  onAddFee: (fee: Omit<FeeCollection, 'id' | 'receiptNo'>) => void;
  onUpdateFeeStatus: (id: string, status: 'Paid' | 'Pending' | 'Unpaid', paymentDate?: string) => void;
}

export default function Fees({
  students,
  batches,
  fees,
  onAddFee,
  onUpdateFeeStatus,
}: FeesProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('2026-06');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState<FeeCollection | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(localStorage.getItem('sms_fees_page') || '1');
  });
  const itemsPerPage = 10;

  useEffect(() => {
    localStorage.setItem('sms_fees_page', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterMonth, filterStatus]);

  const getLocalTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form states
  const [studentId, setStudentId] = useState('');
  const [formSearchQuery, setFormSearchQuery] = useState('');
  const [month, setMonth] = useState('2026-06');
  const [paymentDate, setPaymentDate] = useState(getLocalTodayString());
  const [amount, setAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank'>('Cash');
  const [status, setStatus] = useState<'Paid' | 'Pending' | 'Unpaid'>('Paid');

  const resetForm = () => {
    setStudentId('');
    setFormSearchQuery('');
    setMonth('2026-06');
    setPaymentDate(getLocalTodayString());
    setAmount('0');
    setPaymentMethod('Cash');
    setStatus('Paid');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !month || !amount) {
      alert('সব প্রয়োজনীয় তথ্য দিন!');
      return;
    }

    onAddFee({
      studentId,
      month,
      amount: Number(amount),
      paymentDate: status === 'Paid' ? paymentDate : '',
      paymentMethod,
      status,
    });

    resetForm();
    setIsFormOpen(false);
  };

  const handlePrintReceipt = (receipt: FeeCollection) => {
    setSelectedReceipt(receipt);
  };

  const handlePrintReceiptIndividual = (receipt: FeeCollection) => {
    const student = students.find((s) => s.id === receipt.studentId);
    const batch = batches.find((b) => b.id === student?.batchId);
    if (!student) {
      alert('শিক্ষার্থীর তথ্য পাওয়া যায়নি!');
      return;
    }

    const totalPaid = fees
      .filter((fee) => fee.studentId === student.id && fee.status === 'Paid')
      .reduce((sum, fee) => sum + fee.amount, 0);
    const sCourseFee = student.courseFee || 0;
    const dueAmount = sCourseFee - totalPaid;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('পপআপ উইন্ডো খুলতে পারেনি! অনুগ্রহ করে আপনার ব্রাউজারের পপআপ ব্লকার নিষ্ক্রিয় করুন এবং পুনরায় চেষ্টা করুন।');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>মানি রসিদ - ${receipt.receiptNo}</title>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
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
        padding: 20px;
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
  <div class="no-print flex justify-end gap-3 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-[600px] mx-auto">
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

  <!-- Receipt Container -->
  <div class="border border-slate-300 p-8 rounded-2xl shadow-sm space-y-6 max-w-[600px] mx-auto bg-white relative">
    <!-- Decorative side strip for professional look -->
    <div class="absolute left-0 top-0 bottom-0 w-2 bg-indigo-600 rounded-l-2xl"></div>

    <!-- Header -->
    <div class="text-center space-y-1.5 border-b border-slate-200 pb-5">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">স্মার্ট কোচিং ও একাডেমি</h1>
      <p class="text-xs font-semibold text-slate-500">ঢাকা, বাংলাদেশ | ফোন: ০১৮১২৩৪৫৬৭৮</p>
      <div class="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-black uppercase tracking-wider text-indigo-700 mt-2">
        অফিস / শিক্ষার্থী কপি (MONEY RECEIPT)
      </div>
    </div>

    <!-- Receipt Info Grid -->
    <div class="bg-slate-50 p-4 rounded-xl border border-slate-150 grid grid-cols-2 gap-y-2 text-xs text-slate-600">
      <div>রসিদ নম্বর: <strong class="font-mono text-slate-900 font-bold">${receipt.receiptNo}</strong></div>
      <div class="text-right">তারিখ: <strong class="text-slate-900 font-bold">${receipt.paymentDate || 'N/A'}</strong></div>
      <div>মাস: <strong class="text-slate-900 font-bold">${receipt.month}</strong></div>
      <div class="text-right">পেমেন্ট মাধ্যম: <strong class="text-slate-900 font-bold">${receipt.paymentMethod}</strong></div>
    </div>

    <!-- Student Details -->
    <div class="border border-slate-200 rounded-xl p-5 space-y-3.5 bg-white">
      <h3 class="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">শিক্ষার্থীর বিবরণ</h3>
      <div class="grid grid-cols-2 gap-y-2.5 text-xs text-slate-700">
        <div class="text-slate-500">নাম:</div>
        <div class="font-bold text-slate-900 text-right">${student.name}</div>

        <div class="text-slate-500">রোল নম্বর:</div>
        <div class="font-semibold font-mono text-slate-900 text-right">${student.roll}</div>

        <div class="text-slate-500">ব্যাচ/ক্লাস:</div>
        <div class="font-semibold text-slate-900 text-right">${batch ? batch.name.split(' - ')[0] : 'N/A'}</div>

        <div class="text-slate-500">মোবাইল:</div>
        <div class="font-semibold font-mono text-slate-900 text-right">${student.phone}</div>
      </div>
    </div>

    <!-- Payment Breakdown -->
    <div class="space-y-3.5 pt-2">
      <div class="flex justify-between items-center text-xs text-slate-600">
        <span>মোট কোর্স ফি:</span>
        <span class="font-mono font-bold text-slate-800">${sCourseFee} ৳</span>
      </div>
      <div class="flex justify-between items-center text-xs text-slate-600">
        <span>মোট পরিশোধিত ফি (পূর্বে সহ):</span>
        <span class="font-mono font-bold text-slate-800">${totalPaid} ৳</span>
      </div>
      
      <div class="border-t border-dashed border-slate-200 my-2"></div>

      <div class="flex justify-between items-center text-sm font-black">
        <span class="text-slate-900">পরিশোধিত টাকা (Paid Amount):</span>
        <span class="text-indigo-600 text-base font-black font-mono">${receipt.amount} ৳</span>
      </div>

      <div class="flex justify-between items-center text-xs font-bold">
        <span class="text-slate-500">বাকি বকেয়া (Remaining Due):</span>
        <span class="font-mono ${dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}">${dueAmount} ৳</span>
      </div>
    </div>

    <!-- Footer Seal / Status -->
    <div class="pt-2 flex justify-center">
      <span class="inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${receipt.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : receipt.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
        ${receipt.status === 'Paid' ? '✓ PAID (পরিশোধিত)' : receipt.status === 'Pending' ? '◷ PENDING (পেন্ডিং)' : '✗ UNPAID (অপরিশোধিত)'}
      </span>
    </div>

    <!-- Signatures -->
    <div class="flex justify-between text-[10px] text-slate-500 pt-10 font-bold">
      <div class="text-center border-t border-slate-200 pt-1.5 w-24">আদায়কারী</div>
      <div class="text-center border-t border-slate-200 pt-1.5 w-24">অভিভাবক</div>
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

  const filteredFees = fees.filter((f) => {
    const student = students.find((s) => s.id === f.studentId);
    if (!student) return false;

    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll.includes(searchQuery);
    const matchesMonth = !filterMonth || f.month === filterMonth;
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;

    return matchesSearch && matchesMonth && matchesStatus;
  });

  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
  const paginatedFees = filteredFees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formFilteredStudents = students.filter((s) => {
    if (!formSearchQuery) return true;
    const q = formSearchQuery.toLowerCase();
    const batch = batches.find((b) => b.id === s.batchId);
    const batchName = batch ? batch.name.toLowerCase() : '';
    return (
      s.name.toLowerCase().includes(q) ||
      s.roll.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      batchName.includes(q)
    );
  });

  const getStatusBadge = (status: 'Paid' | 'Pending' | 'Unpaid') => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3.5 w-3.5 stroke-[2.5px]" /> পরিশোধিত
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="h-3.5 w-3.5 stroke-[2.5px]" /> অপেক্ষমান
          </span>
        );
      case 'Unpaid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="h-3.5 w-3.5 stroke-[2.5px]" /> অপরিশোধিত
          </span>
        );
    }
  };

  return (
    <div id="fees-module" className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-slate-900 font-display flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-600 stroke-[2.5px]" />
            স্টুডেন্ট ফি কালেকশন ও রসিদ
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">ছাত্র/ছাত্রীদের ভর্তি ফি, মাসিক বেতন, ও অন্যান্য ফি সংগ্রহ করুন।</p>
        </div>
        <button
          id="btn-toggle-fee-form"
          onClick={() => {
            resetForm();
            setIsFormOpen(!isFormOpen);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-lg transition duration-200 shadow-md shadow-blue-600/10 self-start md:self-auto text-xs uppercase tracking-wider"
        >
          <Plus className="h-4.5 w-4.5 stroke-[3px]" />
          {isFormOpen ? 'ফি তালিকা দেখুন' : 'নতুন ফি কালেকশন'}
        </button>
      </div>

      {isFormOpen ? (
        /* Fees Entry Form */
        <form id="fees-form" onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-xl font-black text-slate-900 font-display">নতুন ফি পেমেন্ট এন্ট্রি</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">ছাত্র/ছাত্রী নির্বাচন করে পেমেন্ট বিবরণ পূরণ করুন।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Student Selector with Dynamic Search */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">ছাত্র/ছাত্রী নির্বাচন করুন *</label>
                {formSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setFormSearchQuery('')}
                    className="text-[10px] text-rose-600 hover:underline font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    ফিল্টার মুছুন (Clear)
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Search Input within Form */}
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="নাম, রোল বা মোবাইল দিয়ে খুঁজুন..."
                    value={formSearchQuery}
                    onChange={(e) => {
                      setFormSearchQuery(e.target.value);
                      // Auto-select if there's exactly one match
                      const matched = students.filter((s) => {
                        const q = e.target.value.toLowerCase();
                        if (!q) return false;
                        const batch = batches.find((b) => b.id === s.batchId);
                        const batchName = batch ? batch.name.toLowerCase() : '';
                        return (
                          s.name.toLowerCase().includes(q) ||
                          s.roll.toLowerCase().includes(q) ||
                          (s.phone && s.phone.includes(q)) ||
                          batchName.includes(q)
                        );
                      });
                      if (matched.length === 1) {
                        setStudentId(matched[0].id);
                      }
                    }}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition text-slate-700 font-semibold text-xs"
                  />
                </div>

                {/* Dropdown containing matching students */}
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-xs cursor-pointer"
                  required
                >
                  <option value="">
                    {formSearchQuery 
                      ? `খোঁজা হচ্ছে (${formFilteredStudents.length} জন পাওয়া গেছে)` 
                      : 'ছাত্র/ছাত্রী নির্বাচন করুন'}
                  </option>
                  {formFilteredStudents.map((s) => {
                    const b = batches.find((batch) => batch.id === s.batchId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} - রোল: {s.roll} ({b ? b.name.split(' - ')[0] : ''})
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {formSearchQuery && formFilteredStudents.length === 0 && (
                <p className="text-[11px] text-rose-500 font-semibold">কোনো ছাত্র/ছাত্রী খুঁজে পাওয়া যায়নি। দয়া করে আবার খুঁজুন।</p>
              )}

              {studentId && (() => {
                const s = students.find((st) => st.id === studentId);
                if (!s) return null;
                const totalPaid = fees
                  .filter((f) => f.studentId === s.id && f.status === 'Paid')
                  .reduce((sum, f) => sum + f.amount, 0);
                const sCourseFee = s.courseFee || 0;
                const currentDue = sCourseFee - totalPaid;
                const payingAmount = Number(amount || 0);
                const remainingDueAfterThis = currentDue - (status === 'Paid' ? payingAmount : 0);
                
                return (
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-700 mt-3 col-span-1 sm:col-span-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">মোট কোর্স ফি:</span>
                      <span className="font-bold text-slate-950 font-mono">{sCourseFee} ৳</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">পূর্বে পরিশোধিত:</span>
                      <span className="font-bold text-emerald-600 font-mono">{totalPaid} ৳</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">বর্তমান বকেয়া (বাকি):</span>
                      <span className="font-bold text-rose-600 font-mono">{currentDue} ৳</span>
                    </div>
                    <div className="bg-blue-50/50 p-1.5 rounded-lg border border-blue-100">
                      <span className="text-[10px] text-blue-600 font-bold block">পেমেন্ট পরবর্তী বাকি:</span>
                      <span className={`font-black font-mono ${remainingDueAfterThis > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {remainingDueAfterThis} ৳
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Payment Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">পেমেন্ট তারিখ *</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm"
                required
              />
            </div>

            {/* Month Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">কোন মাসের বেতন? *</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm"
                required
              />
            </div>

            {/* Fee Amount */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">টাকার পরিমাণ (টাকা) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="যেমন: ১৫০০"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm"
                required
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">পেমেন্ট মাধ্যম</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-semibold text-sm"
              >
                <option value="Cash">ক্যাশ (Cash)</option>
                <option value="bKash">বিকাশ (bKash)</option>
                <option value="Nagad">নগদ (Nagad)</option>
                <option value="Rocket">রকেট (Rocket)</option>
                <option value="Bank">ব্যাংক ব্যাংক (Bank)</option>
              </select>
            </div>

            {/* Fee Status */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">পেমেন্ট স্ট্যাটাস</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-semibold text-sm"
              >
                <option value="Paid">পরিশোধিত (Paid)</option>
                <option value="Pending">অপেক্ষমান (Pending)</option>
                <option value="Unpaid">অপরিশোধিত (Unpaid)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(false);
              }}
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-blue-600/10"
            >
              পেমেন্ট সেভ করুন
            </button>
          </div>
        </form>
      ) : (
        /* Fees List */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="ছাত্রের নাম বা রোল দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition text-slate-700"
              />
            </div>

            <div>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-700"
              />
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-700"
              >
                <option value="all">সব পেমেন্ট স্ট্যাটাস</option>
                <option value="Paid">পরিশোধিত</option>
                <option value="Pending">অপেক্ষমান</option>
                <option value="Unpaid">অপরিশোধিত</option>
              </select>
            </div>
          </div>

          {/* Fees Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
                    <th className="py-4 px-6">রসিদ নম্বর</th>
                    <th className="py-4 px-6">ছাত্র/ছাত্রী</th>
                    <th className="py-4 px-6">পেমেন্ট তারিখ</th>
                    <th className="py-4 px-6">মাস</th>
                    <th className="py-4 px-6">টাকার পরিমাণ</th>
                    <th className="py-4 px-6">পেমেন্ট মাধ্যম</th>
                    <th className="py-4 px-6">বাকি</th>
                    <th className="py-4 px-6">স্ট্যাটাস</th>
                    <th className="py-4 px-6 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                  {paginatedFees.length > 0 ? (
                    paginatedFees.map((f) => {
                      const student = students.find((s) => s.id === f.studentId);
                      return (
                        <tr key={f.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-6 font-mono font-medium text-slate-500">
                            {f.receiptNo}
                          </td>
                          <td className="py-3.5 px-6">
                            {student ? (
                              <div>
                                <div className="font-semibold text-slate-900">{student.name}</div>
                                <div className="text-xs text-slate-400">রোল: {student.roll}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400">অজানা ছাত্র</span>
                            )}
                          </td>
                          <td className="py-3.5 px-6 font-mono text-xs font-bold text-slate-600">
                            {f.paymentDate || <span className="text-slate-400 font-normal">N/A</span>}
                          </td>
                          <td className="py-3.5 px-6 font-mono text-slate-600">{f.month}</td>
                          <td className="py-3.5 px-6 font-black text-blue-600">৳{f.amount}</td>
                          <td className="py-3.5 px-6">
                            <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {f.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-xs font-bold">
                            {(() => {
                              const s = student;
                              if (!s) return <span className="text-slate-300">-</span>;
                              const totalPaid = fees
                                .filter((fee) => fee.studentId === s.id && fee.status === 'Paid')
                                .reduce((sum, fee) => sum + fee.amount, 0);
                              const sCourseFee = s.courseFee || 0;
                              const dueAmount = sCourseFee - totalPaid;
                              return dueAmount > 0 ? (
                                <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 font-black">
                                  {dueAmount} ৳
                                </span>
                              ) : (
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 font-black">
                                  ০ ৳
                                </span>
                              );
                            })()}
                          </td>
                          <td className="py-3.5 px-6">
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(f.status)}
                              {f.status !== 'Paid' && (
                                <button
                                  onClick={() =>
                                    onUpdateFeeStatus(
                                      f.id,
                                      'Paid',
                                      new Date().toISOString().split('T')[0]
                                    )
                                  }
                                  className="text-[10px] text-blue-600 hover:underline font-bold text-left uppercase tracking-wider mt-1"
                                >
                                  পরিশোধিত করুন
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handlePrintReceipt(f)}
                                className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition cursor-pointer"
                                title="মানি রসিদ দেখুন"
                              >
                                <Receipt className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handlePrintReceiptIndividual(f)}
                                className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition cursor-pointer"
                                title="সরাসরি রসিদ প্রিন্ট করুন"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        উক্ত ফিল্টার অনুযায়ী কোন ফি ডাটা পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Total Fees Counter & Pagination */}
            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-bold">
              <span>মোট ট্রানজেকশন: {filteredFees.length} টি</span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-2.5 py-1.5 rounded-md border ${
                      currentPage === 1
                        ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                    } transition`}
                  >
                    পূর্ববর্তী
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-2.5 py-1.5 rounded-md border ${
                      currentPage === totalPages
                        ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                    } transition`}
                  >
                    পরবর্তী
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fee Receipt Modal Overlay */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-black text-slate-900 font-display flex items-center gap-2 uppercase tracking-wider text-sm">
                <Receipt className="h-5 w-5 text-blue-600 stroke-[2.5px]" />
                পেমেন্ট রসিদ (Money Receipt)
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Receipt Content */}
            <div id="printable-receipt" className="p-6 space-y-6">
              {/* Institution Header */}
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">স্মার্ট কোচিং ও একাডেমি</h1>
                <p className="text-xs font-semibold text-slate-500">ঢাকা, বাংলাদেশ | ফোন: ০১৮১২৩৪৫৬৭৮</p>
                <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-100 rounded text-xs font-bold text-blue-700 mt-2">
                  অফিস কপি (Office/Student Copy)
                </div>
              </div>

              {/* Receipt Details Block */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>রসিদ নম্বর: <strong className="font-mono font-bold text-slate-900">{selectedReceipt.receiptNo}</strong></span>
                  <span>তারিখ: <strong className="font-bold text-slate-900">{selectedReceipt.paymentDate || 'N/A'}</strong></span>
                </div>
                <div className="flex justify-between">
                  <span>মাস: <strong className="font-bold text-slate-900">{selectedReceipt.month}</strong></span>
                  <span>মাধ্যম: <strong className="font-bold text-slate-900">{selectedReceipt.paymentMethod}</strong></span>
                </div>
              </div>

              {/* Student details */}
              {(() => {
                const s = students.find((st) => st.id === selectedReceipt.studentId);
                const b = batches.find((bt) => bt.id === s?.batchId);
                return s ? (
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-slate-500">ছাত্র/ছাত্রীর নাম:</div>
                      <div className="font-bold text-slate-950 text-right">{s.name}</div>

                      <div className="text-slate-500">রোল নম্বর:</div>
                      <div className="font-bold text-slate-900 text-right">{s.roll}</div>

                      <div className="text-slate-500">ব্যাচ:</div>
                      <div className="font-bold text-slate-900 text-right">
                        {b ? b.name.split(' - ')[0] : 'N/A'}
                      </div>

                      <div className="text-slate-500">মোবাইল নম্বর:</div>
                      <div className="font-mono font-bold text-slate-900 text-right">{s.phone}</div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Payment Row */}
              <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center text-base font-black uppercase tracking-tight">
                <span className="text-slate-800">মোট পরিশোধিত টাকা (Paid Amount):</span>
                <span className="text-blue-600 text-xl font-black">৳{selectedReceipt.amount}</span>
              </div>

              {/* Due Row */}
              {(() => {
                const s = students.find((st) => st.id === selectedReceipt.studentId);
                if (!s) return null;
                const totalPaid = fees
                  .filter((fee) => fee.studentId === s.id && fee.status === 'Paid')
                  .reduce((sum, fee) => sum + fee.amount, 0);
                const sCourseFee = s.courseFee || 0;
                const dueAmount = sCourseFee - totalPaid;
                return (
                  <div className="border-b border-dashed border-slate-200 pb-3 flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-600">বাকি টাকা (Remaining Due):</span>
                    <span className={`font-mono font-black ${dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ৳{dueAmount}
                    </span>
                  </div>
                );
              })()}

              {/* Signatures */}
              <div className="flex justify-between text-xs text-slate-500 pt-8 font-semibold">
                <div className="text-center border-t border-slate-200 pt-1 w-24">আদায়কারী</div>
                <div className="text-center border-t border-slate-200 pt-1 w-24">অভিভাবক</div>
              </div>
            </div>

            {/* Modal Footer (Actions) */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  handlePrintReceiptIndividual(selectedReceipt);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Printer className="h-4 w-4" /> প্রিন্ট করুন
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 uppercase tracking-wider hover:bg-white transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
