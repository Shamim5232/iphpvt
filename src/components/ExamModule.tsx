import React, { useState, useEffect } from 'react';
import { Student, Batch } from '../types';
import { 
  FileSpreadsheet, 
  Trash2, 
  Check, 
  AlertCircle, 
  Search, 
  Printer, 
  Download, 
  UserPlus, 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Layers,
  Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';

interface ExamCandidate {
  id: string; // studentId
  name: string;
  roll: string;
  batchId: string;
  batchName: string;
  session: string;
  class: string;
  examFee: number;
  status: 'Paid' | 'Due';
}

interface ExamModuleProps {
  students: Student[];
  batches: Batch[];
}

export default function ExamModule({ students, batches }: ExamModuleProps) {
  // Config States
  const [examName, setExamName] = useState('মডেল টেস্ট পরীক্ষা ২০২৬');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [defaultFee, setDefaultFee] = useState<number>(300);
  
  // Search and filters
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  
  // Active exam candidates
  const [candidates, setCandidates] = useState<ExamCandidate[]>([]);
  
  // Lists of available sessions
  const [sessions, setSessions] = useState<string[]>([]);

  // Get dynamic sessions from students
  useEffect(() => {
    const uniqueSessions = Array.from(
      new Set(
        students
          .map((s) => s.session?.trim())
          .filter((s): s is string => Boolean(s))
      )
    ).sort();
    
    setSessions(uniqueSessions);
    
    // Set default session to the latest one if available
    if (uniqueSessions.length > 0 && !selectedSession) {
      setSelectedSession(uniqueSessions[uniqueSessions.length - 1]);
    }
  }, [students]);

  // Load existing candidates for the selected exam/session from localStorage
  useEffect(() => {
    setSelectedBatchId('');
    const storageKey = `sms_exam_candidates_${selectedSession || 'all'}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setCandidates(JSON.parse(stored));
      } catch (e) {
        setCandidates([]);
      }
    } else {
      setCandidates([]);
    }
    
    // Also check if there's a stored exam name
    const storedExamName = localStorage.getItem(`sms_exam_name_${selectedSession || 'all'}`);
    if (storedExamName) {
      setExamName(storedExamName);
    } else {
      setExamName(`মডেল টেস্ট পরীক্ষা ২০২৬`);
    }

    const storedFee = localStorage.getItem(`sms_exam_default_fee_${selectedSession || 'all'}`);
    if (storedFee) {
      setDefaultFee(Number(storedFee));
    } else {
      setDefaultFee(300);
    }
  }, [selectedSession]);

  // Save candidates helper
  const saveCandidates = (updatedList: ExamCandidate[], newExamName?: string, newFee?: number) => {
    const key = `sms_exam_candidates_${selectedSession || 'all'}`;
    localStorage.setItem(key, JSON.stringify(updatedList));
    setCandidates(updatedList);

    if (newExamName !== undefined) {
      localStorage.setItem(`sms_exam_name_${selectedSession || 'all'}`, newExamName);
    }
    if (newFee !== undefined) {
      localStorage.setItem(`sms_exam_default_fee_${selectedSession || 'all'}`, String(newFee));
    }
  };

  // Filter students based on selected session, batch & search query
  const eligibleStudents = students.filter((s) => {
    const matchesSession = selectedSession ? s.session === selectedSession : true;
    const matchesBatch = selectedBatchId ? s.batchId === selectedBatchId : true;
    const matchesSearch = studentSearchQuery.trim() === '' || 
      s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.roll.toLowerCase().includes(studentSearchQuery.toLowerCase());
    return matchesSession && matchesBatch && matchesSearch;
  });

  // Toggle student inclusion in candidate list
  const handleToggleCandidate = (student: Student) => {
    const isAlreadyCandidate = candidates.some((c) => c.id === student.id);
    
    if (isAlreadyCandidate) {
      // Remove
      const updated = candidates.filter((c) => c.id !== student.id);
      saveCandidates(updated);
    } else {
      // Add
      const batchObj = batches.find((b) => b.id === student.batchId);
      const newCandidate: ExamCandidate = {
        id: student.id,
        name: student.name,
        roll: student.roll,
        batchId: student.batchId,
        batchName: batchObj?.name || 'অনির্ধারিত ব্যাচ',
        session: student.session || selectedSession || 'N/A',
        class: student.class || 'Inter 1st Year',
        examFee: defaultFee,
        status: 'Due'
      };
      const updated = [...candidates, newCandidate];
      saveCandidates(updated);
    }
  };

  // Add all eligible students
  const handleAddAllEligible = () => {
    const missingStudents = eligibleStudents.filter(
      (es) => !candidates.some((c) => c.id === es.id)
    );

    if (missingStudents.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'সবাই অন্তর্ভুক্ত!',
        text: 'নির্বাচিত সেশনের সকল ছাত্র/ছাত্রী ইতিপূর্বে তালিকায় অন্তর্ভুক্ত করা হয়েছে।',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const newCandidates: ExamCandidate[] = missingStudents.map((student) => {
      const batchObj = batches.find((b) => b.id === student.batchId);
      return {
        id: student.id,
        name: student.name,
        roll: student.roll,
        batchId: student.batchId,
        batchName: batchObj?.name || 'অনির্ধারিত ব্যাচ',
        session: student.session || selectedSession || 'N/A',
        class: student.class || 'Inter 1st Year',
        examFee: defaultFee,
        status: 'Due'
      };
    });

    const updated = [...candidates, ...newCandidates];
    saveCandidates(updated);

    Swal.fire({
      icon: 'success',
      title: 'সফলভাবে যুক্ত হয়েছে',
      text: `নতুন ${newCandidates.length} জন শিক্ষার্থীকে পরীক্ষা ফি ও তালিকায় অন্তর্ভুক্ত করা হয়েছে।`,
      confirmButtonColor: '#2563eb',
      timer: 2000,
      toast: true,
      position: 'top-end',
      showConfirmButton: false
    });
  };

  // Update specific candidate fee
  const handleUpdateCandidateFee = (studentId: string, feeStr: string) => {
    const parsed = parseInt(feeStr, 10);
    const fee = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    
    const updated = candidates.map((c) => {
      if (c.id === studentId) {
        return { ...c, examFee: fee };
      }
      return c;
    });
    saveCandidates(updated);
  };

  // Toggle specific candidate payment status
  const handleToggleStatus = (studentId: string) => {
    const updated = candidates.map((c) => {
      if (c.id === studentId) {
        return { ...c, status: c.status === 'Paid' ? 'Due' : 'Paid' as const };
      }
      return c;
    });
    saveCandidates(updated);
  };

  // Mark all candidates as Paid
  const handleMarkAllPaid = () => {
    if (candidates.length === 0) return;
    
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'তালিকার সকল পরীক্ষার্থীর ফি পরিশোধিত হিসেবে চিহ্নিত করা হবে!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'হ্যাঁ, পরিশোধিত করুন!',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = candidates.map((c) => ({ ...c, status: 'Paid' as const }));
        saveCandidates(updated);
        Swal.fire({
          icon: 'success',
          title: 'সবাই পরিশোধিত!',
          text: 'সকল পরীক্ষার্থীর পেমেন্ট স্ট্যাটাস পরিশোধিত করা হয়েছে।',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  };

  // Delete / Clear list
  const handleClearExamList = () => {
    Swal.fire({
      title: 'পরীক্ষার্থী তালিকা মুছবেন?',
      text: 'পরীক্ষা শেষ হয়ে গেলে আপনি এই তালিকাটি সম্পূর্ণ মুছে ফেলতে পারেন। এই অ্যাকশনটি রিভার্স করা যাবে না!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'হ্যাঁ, তালিকা মুছুন!',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        saveCandidates([]);
        localStorage.removeItem(`sms_exam_name_${selectedSession || 'all'}`);
        localStorage.removeItem(`sms_exam_default_fee_${selectedSession || 'all'}`);
        setExamName('মডেল টেস্ট পরীক্ষা ২০২৬');
        setDefaultFee(300);
        
        Swal.fire({
          icon: 'success',
          title: 'তালিকা মুছে ফেলা হয়েছে!',
          text: 'পরীক্ষার্থী তালিকা এবং পরীক্ষা সংক্রান্ত সকল তথ্য সফলভাবে মুছে ফেলা হয়েছে।',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  };

  // Download list as CSV
  const handleDownloadCSV = () => {
    if (candidates.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'তালিকা খালি!',
        text: 'ডাউনলোড করার জন্য তালিকায় কোনো পরীক্ষার্থী নেই।',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    const headers = ['Roll', 'Name', 'Batch', 'Class', 'Session', 'Exam Fee (BDT)', 'Payment Status'];
    const rows = candidates.map((c) => [
      c.roll,
      c.name,
      c.batchName,
      c.class,
      c.session,
      c.examFee,
      c.status === 'Paid' ? 'Paid (Paid)' : 'Due (Due)'
    ]);

    const csvContent = 
      '\uFEFF' + // UTF-8 BOM for Excel Bengali rendering
      [headers.join(','), ...rows.map((e) => e.map(val => `"${val}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Exam_Candidates_${examName.replace(/\s+/g, '_')}_${selectedSession}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Live browser printing
  const handlePrintList = () => {
    if (candidates.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'তালিকা খালি!',
        text: 'প্রিন্ট করার জন্য তালিকায় কোনো পরীক্ষার্থী নেই।',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalPaid = candidates.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.examFee, 0);
    const totalDue = candidates.filter(c => c.status === 'Due').reduce((sum, c) => sum + c.examFee, 0);
    const totalCollected = totalPaid + totalDue;

    const rowsHtml = candidates.map((c, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; text-align: center;">
        <td style="padding: 10px; font-weight: bold;">${idx + 1}</td>
        <td style="padding: 10px; font-weight: bold;">${c.roll}</td>
        <td style="padding: 10px; text-align: left;">${c.name}</td>
        <td style="padding: 10px;">${c.batchName}</td>
        <td style="padding: 10px;">${c.class}</td>
        <td style="padding: 10px; font-family: monospace; font-weight: bold;">${c.examFee} ৳</td>
        <td style="padding: 10px; font-weight: bold; color: ${c.status === 'Paid' ? '#10b981' : '#f43f5e'}">
          ${c.status === 'Paid' ? 'পরিশোধিত' : 'বাকি'}
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${examName} - পরীক্ষার্থী তালিকা</title>
          <style>
            body { font-family: 'Aria', 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #1e293b; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .coaching-title { font-size: 24px; font-weight: 900; color: #1d4ed8; text-align: center; margin: 0; }
            .coaching-sub { font-size: 12px; font-weight: bold; text-align: center; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-top: 5px; }
            .doc-title { font-size: 18px; font-weight: 800; text-align: center; margin-top: 25px; margin-bottom: 5px; color: #0f172a; text-decoration: underline; }
            .meta-info { width: 100%; margin-bottom: 20px; font-size: 13px; font-weight: bold; }
            .meta-info td { padding: 4px 0; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            .data-table th { background-color: #f1f5f9; padding: 12px 10px; border: 1px solid #cbd5e1; font-weight: bold; }
            .data-table td { border: 1px solid #cbd5e1; }
            .footer-grid { width: 100%; margin-top: 80px; font-size: 13px; font-weight: bold; }
            .footer-line { border-top: 1px dashed #94a3b8; width: 150px; margin: 0 auto 5px auto; text-align: center; }
            .summary-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-top: 25px; display: inline-block; width: 100%; box-sizing: border-box; }
            .summary-item { float: left; width: 33%; text-align: center; font-size: 13px; font-weight: bold; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print();" style="padding: 10px 20px; background-color: #2563eb; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer;">প্রিন্ট করুন</button>
            <button onclick="window.close();" style="padding: 10px 20px; background-color: #64748b; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer; margin-left: 10px;">বন্ধ করুন</button>
          </div>

          <table class="header-table">
            <tr>
              <td>
                <h1 class="coaching-title">SMS ACADEMIC & ICT CARE</h1>
                <div class="coaching-sub">The Gateway to Quality Education & Technological Excellence</div>
                <div class="doc-title">${examName} - অফিস কপি ও ফি তালিকা</div>
              </td>
            </tr>
          </table>

          <table class="meta-info">
            <tr>
              <td style="width: 50%;"><strong>সেশন:</strong> ${selectedSession || 'সকল সেশন'}</td>
              <td style="width: 50%; text-align: right;"><strong>প্রিন্টের তারিখ:</strong> ${new Date().toLocaleDateString('bn-BD')}</td>
            </tr>
            <tr>
              <td><strong>মোট পরীক্ষার্থী:</strong> ${candidates.length} জন</td>
              <td style="text-align: right;"><strong>পরীক্ষার ধরণ:</strong> লিখিত ও এমসিকিউ</td>
            </tr>
          </table>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 5%;">নং</th>
                <th style="width: 10%;">রোল নং</th>
                <th style="width: 30%; text-align: left;">শিক্ষার্থীর নাম</th>
                <th style="width: 18%;">ব্যাচ</th>
                <th style="width: 15%;">শ্রেণী</th>
                <th style="width: 12%;">পরীক্ষা ফি</th>
                <th style="width: 10%;">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="summary-card">
            <div class="summary-item">মোট ফি: <span style="font-family: monospace;">${totalCollected} ৳</span></div>
            <div class="summary-item" style="color: #10b981;">সংগৃহীত: <span style="font-family: monospace;">${totalPaid} ৳</span></div>
            <div class="summary-item" style="color: #f43f5e;">বাকি: <span style="font-family: monospace;">${totalDue} ৳</span></div>
          </div>

          <table class="footer-grid">
            <tr>
              <td style="width: 50%; text-align: center;">
                <div class="footer-line"></div>
                অফিস সহকারী স্বাক্ষর
              </td>
              <td style="width: 50%; text-align: center;">
                <div class="footer-line"></div>
                প্রধান পরিচালক স্বাক্ষর
              </td>
            </tr>
          </table>

          <script>
            window.onload = function() {
              // Option to trigger automatically in standard browser exports
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Summary Metrics
  const totalCandidates = candidates.length;
  const totalAmount = candidates.reduce((sum, c) => sum + c.examFee, 0);
  const totalPaid = candidates.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.examFee, 0);
  const totalDue = candidates.filter(c => c.status === 'Due').reduce((sum, c) => sum + c.examFee, 0);

  // Filtered lists for rendering
  const filteredCandidates = candidates.filter((c) => {
    const query = candidateSearchQuery.trim().toLowerCase();
    return query === '' || 
      c.name.toLowerCase().includes(query) || 
      c.roll.toLowerCase().includes(query) ||
      c.batchName.toLowerCase().includes(query);
  });

  return (
    <div id="exam-module" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 shadow-sm">
            <FileSpreadsheet className="h-6.5 w-6.5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">পরীক্ষা ফি ও পরীক্ষার্থী মডিউল</h1>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mt-0.5">
              যেকোনো সেশনের শিক্ষার্থীদের তালিকা তৈরি, পরীক্ষা ফি নির্ধারণ, ফি স্ট্যাটাস ট্র্যাকিং এবং পরীক্ষার্থী তালিকা ডাউনলোড করুন।
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs items-end">
        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-blue-500" /> সেশন নির্বাচন করুন <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-700 transition"
          >
            <option value="">সকল সেশন</option>
            {sessions.map((s) => (
              <option key={s} value={s}>
                সেশন: {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-indigo-500" /> ব্যাচ নির্বাচন করুন
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-700 transition"
          >
            <option value="">সকল ব্যাচ</option>
            {batches
              .filter((b) => {
                if (!selectedSession) return true;
                // Only show batches that have students in the selected session
                return students.some((s) => s.session === selectedSession && s.batchId === b.id);
              })
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
            পরীক্ষার নাম (Exam Title)
          </label>
          <input
            type="text"
            value={examName}
            onChange={(e) => {
              setExamName(e.target.value);
              localStorage.setItem(`sms_exam_name_${selectedSession || 'all'}`, e.target.value);
            }}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-700 transition font-sans"
            placeholder="যেমন: ১ম সাময়িক পরীক্ষা ২০২৬"
          />
        </div>

        <div>
          <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-emerald-500" /> ডিফল্ট ফি (BDT)
          </label>
          <input
            type="number"
            value={defaultFee}
            onChange={(e) => {
              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
              setDefaultFee(val);
              localStorage.setItem(`sms_exam_default_fee_${selectedSession || 'all'}`, String(val));
            }}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-700 transition font-sans"
            placeholder="যেমন: ৩০০"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddAllEligible}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> সবাইকে যুক্ত করুন
          </button>
          
          {candidates.length > 0 && (
            <button
              type="button"
              onClick={handleClearExamList}
              className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-100 transition cursor-pointer"
              title="তালিকা মুছুন ও পরীক্ষা সম্পন্ন করুন"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">মোট পরীক্ষার্থী</span>
            <span className="text-lg md:text-xl font-black text-slate-800 font-sans mt-0.5 block">
              {totalCandidates} জন
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">মোট দাবিযোগ্য ফি</span>
            <span className="text-lg md:text-xl font-black text-slate-800 font-sans mt-0.5 block">
              {totalAmount} ৳
            </span>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">মোট আদায়কৃত</span>
            <span className="text-lg md:text-xl font-black text-emerald-700 font-sans mt-0.5 block">
              {totalPaid} ৳
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider block">মোট বকেয়া / বাকি</span>
            <span className="text-lg md:text-xl font-black text-rose-700 font-sans mt-0.5 block">
              {totalDue} ৳
            </span>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Student Source Selector (Left) vs. Exam Candidate Sheet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Session Student Directory */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-blue-600" />
              <h3 className="text-xs font-black text-slate-800">শিক্ষার্থী ডিরেক্টরি ({eligibleStudents.length} জন)</h3>
            </div>
            <span className="text-[9px] font-bold text-slate-400">সেশন ভিত্তিক ডাটা</span>
          </div>

          {/* Directory Search */}
          <div className="p-3 bg-slate-50 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                placeholder="রোল বা নাম দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-xs font-semibold focus:outline-none transition font-sans"
              />
            </div>
          </div>

          {/* Directory list container */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {eligibleStudents.length > 0 ? (
              eligibleStudents.map((student) => {
                const isSelected = candidates.some((c) => c.id === student.id);
                return (
                  <div 
                    key={student.id} 
                    onClick={() => handleToggleCandidate(student)}
                    className={`p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition cursor-pointer select-none ${
                      isSelected ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {student.roll}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold text-slate-800 truncate">{student.name}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          {student.class || 'Inter 1st Year'} • s:{student.session}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black ${
                        isSelected 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {isSelected ? 'তালিকায় আছে' : 'যোগ করুন'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-24 text-slate-400 text-xs font-bold space-y-1">
                <AlertCircle className="h-6 w-6 mx-auto text-slate-300" />
                <p>কোনো শিক্ষার্থী খুঁজে পাওয়া যায়নি।</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Exam Candidates Table & Fee Management */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
              <h3 className="text-xs font-black text-slate-800 truncate">পরীক্ষার্থী তালিকা ও ফি ({candidates.length} জন)</h3>
            </div>
            
            {candidates.length > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllPaid}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  সবাই পরিশোধিত
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition cursor-pointer"
                  title="CSV এক্সপোর্ট করুন"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handlePrintList}
                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition cursor-pointer"
                  title="তালিকা প্রিন্ট করুন"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Candidate Search */}
          <div className="p-3 bg-slate-50 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={candidateSearchQuery}
                onChange={(e) => setCandidateSearchQuery(e.target.value)}
                placeholder="রোল বা নাম দিয়ে তালিকা ফিল্টার করুন..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-xs font-semibold focus:outline-none transition font-sans"
              />
            </div>
          </div>

          {/* Candidates Sheet Container */}
          <div className="flex-1 overflow-auto">
            {filteredCandidates.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse font-sans min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-center uppercase tracking-wider">
                    <th className="py-2.5 px-3 text-left w-12">রোল</th>
                    <th className="py-2.5 px-3 text-left">শিক্ষার্থী</th>
                    <th className="py-2.5 px-3 w-28">পরীক্ষা ফি</th>
                    <th className="py-2.5 px-3 w-24">স্ট্যাটাস</th>
                    <th className="py-2.5 px-3 w-12">মুছুন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                  {filteredCandidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{c.roll}</td>
                      <td className="py-2.5 px-3 min-w-0 text-left">
                        <div className="truncate font-extrabold text-slate-850">{c.name}</div>
                        <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                          {c.batchName} • {c.class}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 max-w-[100px] mx-auto">
                          <input
                            type="number"
                            value={c.examFee}
                            onChange={(e) => handleUpdateCandidateFee(c.id, e.target.value)}
                            className="w-full bg-transparent font-mono font-bold text-slate-800 focus:outline-none text-center"
                          />
                          <span className="text-[10px] text-slate-400 font-bold">৳</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c.id)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-black border transition cursor-pointer select-none inline-block w-20 text-center ${
                            c.status === 'Paid' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                          }`}
                        >
                          {c.status === 'Paid' ? 'পরিশোধিত' : 'বাকি'}
                        </button>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = candidates.filter((cand) => cand.id !== c.id);
                            saveCandidates(updated);
                          }}
                          className="text-slate-400 hover:text-rose-600 transition p-1.5 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="তালিকা থেকে সরান"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-24 text-slate-400 text-xs font-bold space-y-1">
                <AlertCircle className="h-6 w-6 mx-auto text-slate-300" />
                <p>তালিকায় কোনো পরীক্ষার্থী নেই।</p>
                <p className="text-[10px] text-slate-400">বাম পাশের তালিকা থেকে শিক্ষার্থী যুক্ত করুন বা সবাইকে যুক্ত করুন বাটন চাপুন।</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] font-bold text-slate-400 leading-relaxed">
            স্ট্যাটাস বাটনে ক্লিক করে পেমেন্ট সম্পন্ন বা বকেয়া নির্ধারণ করুন। যেকোনো শিক্ষার্থীর পরীক্ষা ফি সরাসরি পরিবর্তন করতে পারেন।
          </div>
        </div>

      </div>
    </div>
  );
}
