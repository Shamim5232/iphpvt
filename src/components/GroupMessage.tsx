import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  MessageSquare,
  Send,
  Users,
  Search,
  Filter,
  CheckSquare,
  Square,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  BookOpen,
  Info
} from 'lucide-react';
import { Student, Batch, SchoolClass } from '../types';

interface GroupMessageProps {
  students?: Student[];
  batches?: Batch[];
  classes?: SchoolClass[];
  sessions?: string[];
}

export default function GroupMessage({
  students = [],
  batches = [],
  classes = [],
  sessions = []
}: GroupMessageProps) {
  // Filter States
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selection States
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  // Message States
  const [messageText, setMessageText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendingProgress, setSendingProgress] = useState<number>(0);
  const [sendingTotal, setSendingTotal] = useState<number>(0);

  // SMS settings loaded from localStorage
  const [smsEnabled, setSmsEnabled] = useState<boolean>(false);
  const [smsGateway, setSmsGateway] = useState<'bulksmsbd' | 'greenweb' | 'custom'>('bulksmsbd');
  const [smsApiKey, setSmsApiKey] = useState<string>('');
  const [smsSenderId, setSmsSenderId] = useState<string>('');
  const [smsUsername, setSmsUsername] = useState<string>('');
  const [smsCustomUrl, setSmsCustomUrl] = useState<string>('');
  const [smsUseXamppProxy, setSmsUseXamppProxy] = useState<boolean>(false);

  // Templates
  const templates = [
    {
      id: 'general',
      title: 'সাধারণ নোটিশ (General Notice)',
      text: 'প্রিয় {name}, আপনাকে জানানো যাচ্ছে যে, আগামীকাল আমাদের প্রতিষ্ঠান সরকারি ছুটি উপলক্ষে বন্ধ থাকবে। ধন্যবাদ।'
    },
    {
      id: 'absent',
      title: 'অনুপস্থিতি নোটিশ (Absent Notice)',
      text: 'অভিভাবক মহোদয়, আপনার সন্তান {name} (রোল: {roll}) আজকে ক্লাসে উপস্থিত হয়নি। কোনো সমস্যা থাকলে যোগাযোগ করুন।'
    },
    {
      id: 'due',
      title: 'বেতন পরিশোধের তাগাদা (Due Reminder)',
      text: 'প্রিয় অভিভাবক, {name}-এর চলতি মাসের টিউশন ফি বকেয়া রয়েছে। অনুগ্রহ করে দ্রুত পরিশোধ করুন। ধন্যবাদ।'
    },
    {
      id: 'exam',
      title: 'পরীক্ষার নোটিশ (Exam Schedule)',
      text: 'প্রিয় শিক্ষার্থী {name}, আগামী সপ্তাহে আমাদের ৩য় মডেল টেস্ট অনুষ্ঠিত হবে। পরীক্ষার রুটিন অফিস রুমে সংগ্রহ করার জন্য অনুরোধ করা হলো।'
    }
  ];

  // Load SMS settings from localStorage on mount
  useEffect(() => {
    setSmsEnabled(localStorage.getItem('sms_enabled') === 'true');
    setSmsGateway((localStorage.getItem('sms_gateway') || 'bulksmsbd') as 'bulksmsbd' | 'greenweb' | 'custom');
    setSmsApiKey(localStorage.getItem('sms_api_key') || '');
    setSmsSenderId(localStorage.getItem('sms_sender_id') || '');
    setSmsUsername(localStorage.getItem('sms_username') || '');
    setSmsCustomUrl(localStorage.getItem('sms_custom_url') || 'https://bulksmsbd.net/api/smsapi?api_key={api_key}&type=text&number={phone}&senderid={sender_id}&message={message}');
    setSmsUseXamppProxy(localStorage.getItem('sms_use_xampp_proxy') === 'true');
  }, []);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll.includes(searchQuery) ||
      s.phone.includes(searchQuery);
    
    // Default fallback class is 'Inter 1st Year'
    const studentClass = s.class || 'Inter 1st Year';
    const matchesClass = selectedClass === 'all' || studentClass === selectedClass;
    const matchesSession = selectedSession === 'all' || (s.session || '') === selectedSession;
    const matchesBatch = selectedBatch === 'all' || s.batchId === selectedBatch;

    return matchesSearch && matchesClass && matchesSession && matchesBatch;
  });

  // Handle individual selection toggle
  const toggleStudentSelection = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((stdId) => stdId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  // Handle master check/uncheck
  const toggleSelectAll = () => {
    const filteredIds = filteredStudents.map((s) => s.id);
    const allSelected = filteredIds.every((id) => selectedStudentIds.includes(id));

    if (allSelected) {
      // Remove all filtered students from selection
      setSelectedStudentIds(selectedStudentIds.filter((id) => !filteredIds.includes(id)));
    } else {
      // Add all filtered students to selection without duplicating
      const newSelection = Array.from(new Set([...selectedStudentIds, ...filteredIds]));
      setSelectedStudentIds(newSelection);
    }
  };

  // Clear selections
  const clearSelection = () => {
    setSelectedStudentIds([]);
  };

  // Apply template
  const applyTemplate = (text: string) => {
    setMessageText(text);
  };

  // Character and SMS count calculation
  const hasUnicode = (text: string): boolean => {
    // Check if there are any non-ASCII characters (e.g. Bangla letters)
    return /[^\u0000-\u007F]/.test(text);
  };

  const calculateSmsParts = (text: string): { chars: number; parts: number; isBangla: boolean; limit: number } => {
    const chars = text.length;
    const isBangla = hasUnicode(text);
    
    let limit = 160;
    let concatLimit = 153;
    
    if (isBangla) {
      limit = 70;
      concatLimit = 67;
    }

    if (chars === 0) {
      return { chars: 0, parts: 0, isBangla, limit };
    }

    if (chars <= limit) {
      return { chars, parts: 1, isBangla, limit };
    }

    const parts = Math.ceil(chars / concatLimit);
    return { chars, parts, isBangla, limit: concatLimit };
  };

  const smsMeta = calculateSmsParts(messageText);

  // Helper to replace placeholders
  const getPersonalizedMessage = (student: Student, rawText: string): string => {
    const batchName = batches.find((b) => b.id === student.batchId)?.name || 'N/A';
    const cleanBatchName = batchName.split(' - ')[0]; // E.g., remove schedule
    
    return rawText
      .replace(/{name}/g, student.name)
      .replace(/{roll}/g, student.roll)
      .replace(/{phone}/g, student.phone)
      .replace(/{class}/g, student.class || 'Inter 1st Year')
      .replace(/{batch}/g, cleanBatchName);
  };

  // Number to Bengali digits helper
  const toBengaliNum = (num: number | string): string => {
    const banglaDigits: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return num.toString().replace(/\d/g, (d) => banglaDigits[d] || d);
  };

  // Main send action
  const handleSendMessage = async () => {
    if (selectedStudentIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'শিক্ষার্থী নির্বাচন করুন',
        text: 'বার্তা পাঠাতে কমপক্ষে একজন শিক্ষার্থীকে তালিকা থেকে টিক দিন।',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    if (!messageText.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'বার্তা লিখুন',
        text: 'অনুগ্রহ করে শিক্ষার্থীদের জন্য কোনো একটি নোটিশ বা বার্তা টাইপ করুন।',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    // Prepare list of recipients
    const recipients = students.filter((s) => selectedStudentIds.includes(s.id));

    // Prompt user with send summary details
    const result = await Swal.fire({
      title: 'গ্রুপ মেসেজ পাঠাতে চান?',
      html: `
        <div class="text-left font-sans text-xs space-y-2 mt-2">
          <p><b>মোট প্রাপক সংখ্যা:</b> <span class="text-blue-600 font-bold font-mono">${recipients.length} জন</span></p>
          <p><b>এসএমএস টাইপ:</b> <span class="${smsMeta.isBangla ? 'text-orange-600' : 'text-emerald-600'} font-bold">${smsMeta.isBangla ? 'বাংলা (Unicode)' : 'ইংরেজি (Plain Text)'}</span></p>
          <p><b>চরিত্র সংখ্যা:</b> <span class="font-bold">${smsMeta.chars}টি</span> (প্রতিটি বার্তা প্রায় <span class="text-indigo-600 font-bold">${smsMeta.parts}টি</span> এসএমএস পার্ট খরচ করবে)</p>
          <p class="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            ${smsEnabled 
              ? '✅ <b>গেটওয়ে মোড:</b> এপিআই কনফিগার করা আছে। রিয়েল টাইম এসএমএস সরাসরি প্রেরিত হবে।' 
              : '⚠️ <b>ডেমো মোড:</b> এসএমএস গেটওয়ে বন্ধ বা আন-কনফিগার করা আছে। ডাটাবেজে প্রেরণ সম্পন্ন দেখিয়ে ডেমো হিস্ট্রি লগ তৈরি করা হবে।'}
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'হ্যাঁ, পাঠান!',
      cancelButtonText: 'বাতিল'
    });

    if (!result.isConfirmed) return;

    setIsSending(true);
    setSendingTotal(recipients.length);
    setSendingProgress(0);

    let successCount = 0;
    let failedCount = 0;
    const historyLogsToSave: any[] = [];

    // Trigger sweetalert loading status with custom HTML
    Swal.fire({
      title: 'বার্তা পাঠানো হচ্ছে...',
      html: `<div class="space-y-3 font-sans text-xs">
        <p class="font-semibold text-slate-600" id="sms-progress-text">০ / ${recipients.length} জন শিক্ষার্থীকে পাঠানো হচ্ছে...</p>
        <div class="w-full bg-slate-150 h-3.5 rounded-full overflow-hidden border border-slate-200">
          <div id="sms-progress-bar" class="bg-blue-600 h-full transition-all duration-300 rounded-full" style="width: 0%"></div>
        </div>
        <p class="text-[10px] text-slate-400">অনুগ্রহ করে পেজটি রিফ্রেশ বা বন্ধ করবেন না।</p>
      </div>`,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Execute bulk send loop
    for (let i = 0; i < recipients.length; i++) {
      const student = recipients[i];
      const personalizedMsg = getPersonalizedMessage(student, messageText);
      const recipientPhone = student.phone.trim();

      // Update progress states
      setSendingProgress(i + 1);
      
      // Update Swal dialog
      const progressPercent = Math.round(((i + 1) / recipients.length) * 100);
      const progressBarEl = document.getElementById('sms-progress-bar');
      const progressTextEl = document.getElementById('sms-progress-text');
      
      if (progressBarEl) progressBarEl.style.width = `${progressPercent}%`;
      if (progressTextEl) progressTextEl.innerText = `${toBengaliNum(i + 1)} / ${toBengaliNum(recipients.length)} জন শিক্ষার্থীকে পাঠানো হচ্ছে (${toBengaliNum(progressPercent)}%)`;

      // Log blueprint for SMS
      const logId = 'sms_' + Date.now() + '_' + i;
      const logEntry = {
        id: logId,
        timestamp: new Date().toISOString(),
        phone: recipientPhone,
        studentName: student.name,
        message: personalizedMsg,
        status: 'Pending' as 'Pending' | 'Success' | 'Failed',
        apiResponse: ''
      };

      if (smsEnabled && recipientPhone) {
        // Build API request URL
        let gatewayUrl = '';
        if (smsGateway === 'bulksmsbd') {
          gatewayUrl = `https://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(smsApiKey)}&type=text&number=${encodeURIComponent(recipientPhone)}&senderid=${encodeURIComponent(smsSenderId)}&message=${encodeURIComponent(personalizedMsg)}`;
        } else if (smsGateway === 'greenweb') {
          gatewayUrl = `https://api.greenweb.com.bd/api.php?token=${encodeURIComponent(smsApiKey)}&to=${encodeURIComponent(recipientPhone)}&message=${encodeURIComponent(personalizedMsg)}`;
        } else if (smsGateway === 'custom') {
          gatewayUrl = smsCustomUrl
            .replace(/{api_key}/g, encodeURIComponent(smsApiKey))
            .replace(/{sender_id}/g, encodeURIComponent(smsSenderId))
            .replace(/{username}/g, encodeURIComponent(smsUsername))
            .replace(/{phone}/g, encodeURIComponent(recipientPhone))
            .replace(/{message}/g, encodeURIComponent(personalizedMsg));
        }

        try {
          if (smsUseXamppProxy) {
            // Send via PHP api.php proxy script
            const xamppApi = localStorage.getItem('sms_xampp_api_url') || 'http://localhost/student-app/api.php';
            const response = await fetch(`${xamppApi}${xamppApi.includes('?') ? '&' : '?'}action=send_sms`, {
              method: 'POST',
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                to: recipientPhone,
                message: personalizedMsg,
                url: gatewayUrl,
                gateway: smsGateway,
                api_key: smsApiKey,
                sender_id: smsSenderId
              })
            });

            if (response.ok) {
              const resData = await response.json();
              if (resData.status === 'success') {
                logEntry.status = 'Success';
                logEntry.apiResponse = resData.message || 'Success';
                successCount++;
              } else {
                logEntry.status = 'Failed';
                logEntry.apiResponse = resData.message || 'Failed';
                failedCount++;
              }
            } else {
              logEntry.status = 'Failed';
              logEntry.apiResponse = `Proxy Error Status Code: ${response.status}`;
              failedCount++;
            }
          } else {
            // Direct browser send (using no-cors)
            await fetch(gatewayUrl, { method: 'GET', mode: 'no-cors' });
            logEntry.status = 'Success';
            logEntry.apiResponse = 'Direct browser GET (No-CORS mode).';
            successCount++;
          }
        } catch (apiError: any) {
          logEntry.status = 'Failed';
          logEntry.apiResponse = apiError.message || String(apiError);
          failedCount++;
        }
      } else {
        // Mock send mode (Sms disabled or phone empty)
        await new Promise((resolve) => setTimeout(resolve, 80)); // Little aesthetic delay
        if (recipientPhone) {
          logEntry.status = 'Success';
          logEntry.apiResponse = 'Simulated/Demo send success (SMS disabled in settings)';
          successCount++;
        } else {
          logEntry.status = 'Failed';
          logEntry.apiResponse = 'Failed: Phone number is empty';
          failedCount++;
        }
      }

      historyLogsToSave.push(logEntry);
    }

    // Save logs to localStorage `sms_history_logs`
    const oldHistory = JSON.parse(localStorage.getItem('sms_history_logs') || '[]');
    const newHistory = [...historyLogsToSave, ...oldHistory].slice(0, 500); // Store up to 500 logs
    localStorage.setItem('sms_history_logs', JSON.stringify(newHistory));

    setIsSending(false);

    // Show completion alert
    Swal.fire({
      icon: failedCount === 0 ? 'success' : 'warning',
      title: 'মেসেজ প্রেরণ সম্পন্ন!',
      text: `${successCount} জন শিক্ষার্থীকে সফলভাবে নোটিশ পাঠানো হয়েছে। ${failedCount > 0 ? `${failedCount} জন ব্যর্থ হয়েছে।` : ''}`,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'ঠিক আছে'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 shadow-sm shrink-0">
            <MessageSquare className="h-6.5 w-6.5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">গ্রুপ মেসেজ ও নোটিশ (Notice & Group SMS)</h1>
            <p className="text-slate-400 text-xs font-semibold mt-0.5 leading-relaxed">
              শ্রেণী, সেশন ও ব্যাচ ফিল্টার করে এক ক্লিকে নির্দিষ্ট শিক্ষার্থীদের মোবাইল ফোনে নোটিশ এবং কাস্টম এসএমএস পাঠান।
            </p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-semibold text-slate-500 self-start md:self-auto">
          <Users className="h-4.5 w-4.5 text-blue-500" />
          <span>মোট শিক্ষার্থী: <span className="font-extrabold text-slate-800 font-mono text-sm">{toBengaliNum(students.length)}</span> জন</span>
        </div>
      </div>

      {/* Main Grid: Student List & Message Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Filter and Student Table (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Filtering Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-black text-xs uppercase tracking-wider pb-3 border-b border-slate-100">
              <Filter className="h-4 w-4 text-blue-500" />
              <span>ফিল্টার অপশন (Search & Filters)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">শ্রেণী নির্বাচন (Class)</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    clearSelection();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none transition cursor-pointer text-slate-700"
                >
                  <option value="all">সকল শ্রেণী (All)</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                  {/* Handle cases where some legacy static classes exist */}
                  {!classes.some(c => c.name === 'Inter 1st Year') && (
                    <option value="Inter 1st Year">Inter 1st Year</option>
                  )}
                  {!classes.some(c => c.name === 'Inter 2nd Year') && (
                    <option value="Inter 2nd Year">Inter 2nd Year</option>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">সেশন নির্বাচন (Session)</label>
                <select
                  value={selectedSession}
                  onChange={(e) => {
                    setSelectedSession(e.target.value);
                    clearSelection();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none transition cursor-pointer text-slate-700"
                >
                  <option value="all">সকল সেশন (All)</option>
                  {sessions.map((ses) => (
                    <option key={ses} value={ses}>{ses}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">ব্যাচ নির্বাচন (Batch)</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    clearSelection();
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none transition cursor-pointer text-slate-700"
                >
                  <option value="all">সকল ব্যাচ (All)</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name.split(' - ')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="রোল, নাম বা মোবাইল নম্বর দিয়ে সার্চ করুন..."
                className="w-full bg-slate-50 hover:bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none transition text-slate-700"
              />
            </div>
          </div>

          {/* Student Table Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  শিক্ষার্থী তালিকা ({toBengaliNum(filteredStudents.length)} জন পাওয়া গেছে)
                </h3>
              </div>
              
              {/* Table Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-extrabold transition flex items-center gap-1.5 border-0 cursor-pointer"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  {filteredStudents.every(s => selectedStudentIds.includes(s.id)) && filteredStudents.length > 0
                    ? 'সব আন-টিক করুন'
                    : 'সব টিক দিন'}
                </button>
                {selectedStudentIds.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[11px] font-extrabold transition flex items-center gap-1 border-0 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    রিসেট ({toBengaliNum(selectedStudentIds.length)})
                  </button>
                )}
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 border-b border-slate-150 text-[11px] font-bold text-slate-600">
                    <th className="py-3 px-4 text-center w-12">নির্বাচন</th>
                    <th className="py-3 px-3 text-center w-16">রোল</th>
                    <th className="py-3 px-4 text-left">শিক্ষার্থীর নাম</th>
                    <th className="py-3 px-3 text-center">শ্রেণী</th>
                    <th className="py-3 px-3 text-center">সেশন</th>
                    <th className="py-3 px-4 text-left">ব্যাচ</th>
                    <th className="py-3 px-4 text-center">মোবাইল</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-semibold">
                        <Users className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                        এই ফিল্টার অনুযায়ী কোনো শিক্ষার্থীর রেকর্ড খুঁজে পাওয়া যায়নি!
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const isSelected = selectedStudentIds.includes(s.id);
                      const batch = batches.find((b) => b.id === s.batchId);
                      return (
                        <tr
                          key={s.id}
                          onClick={() => toggleStudentSelection(s.id)}
                          className={`border-b border-slate-100 hover:bg-slate-50/70 text-slate-700 text-xs transition cursor-pointer ${
                            isSelected ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => toggleStudentSelection(s.id)}
                              className="text-slate-400 hover:text-blue-600 transition"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4.5 w-4.5 text-blue-600 fill-blue-50" />
                              ) : (
                                <Square className="h-4.5 w-4.5" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center font-bold font-mono text-slate-600">
                            {s.roll}
                          </td>
                          <td className="py-3 px-4 text-left font-black text-slate-800">
                            {s.name}
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-500">
                            {s.class || 'Inter 1st Year'}
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-500">
                            {s.session || '-'}
                          </td>
                          <td className="py-3 px-4 text-left font-semibold text-slate-600">
                            {batch ? batch.name.split(' - ')[0] : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-500 font-mono">
                            {s.phone}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-slate-500 gap-2">
              <span>
                ফিল্টারকৃত মোট শিক্ষার্থী: <b className="text-slate-800 font-mono font-black">{toBengaliNum(filteredStudents.length)}</b> জন
              </span>
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="h-4 w-4" />
                নির্বাচিত করা হয়েছে: <b className="font-mono font-black">{toBengaliNum(selectedStudentIds.length)}</b> জন
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Message Editor, Templates, and Placeholders (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Templates Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-slate-700 font-black text-xs uppercase tracking-wider">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span>বার্তা টেমপ্লেট (Templates)</span>
            </div>
            
            <div className="space-y-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => applyTemplate(tmpl.text)}
                  className="w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl p-3 text-xs transition flex flex-col gap-1 cursor-pointer"
                >
                  <span className="font-black text-slate-800 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    {tmpl.title}
                  </span>
                  <p className="text-slate-500 text-[11px] leading-relaxed truncate w-full">
                    {tmpl.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Placeholders helper card */}
          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-5 rounded-2xl border border-blue-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-black text-xs uppercase tracking-wider">
              <Info className="h-4 w-4 text-blue-600" />
              <span>ডায়নামিক ট্যাগ (Personalization Tags)</span>
            </div>
            <p className="text-slate-600 text-[11px] font-medium leading-relaxed">
              আপনার বার্তার মধ্যে নিচের ট্যাগগুলো ব্যবহার করলে সেগুলো প্রতি শিক্ষার্থীর নিজস্ব তথ্য দিয়ে স্বয়ংক্রিয়ভাবে পরিবর্তিত হয়ে যাবে:
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="bg-white px-2.5 py-1.5 rounded-lg border border-blue-150/60 flex flex-col">
                <span className="text-blue-700 font-black">{`{name}`}</span>
                <span className="text-slate-400">শিক্ষার্থীর নাম</span>
              </div>
              <div className="bg-white px-2.5 py-1.5 rounded-lg border border-blue-150/60 flex flex-col">
                <span className="text-blue-700 font-black">{`{roll}`}</span>
                <span className="text-slate-400">শিক্ষার্থীর রোল</span>
              </div>
              <div className="bg-white px-2.5 py-1.5 rounded-lg border border-blue-150/60 flex flex-col">
                <span className="text-blue-700 font-black">{`{class}`}</span>
                <span className="text-slate-400">শ্রেণী</span>
              </div>
              <div className="bg-white px-2.5 py-1.5 rounded-lg border border-blue-150/60 flex flex-col">
                <span className="text-blue-700 font-black">{`{batch}`}</span>
                <span className="text-slate-400">ব্যাচের নাম</span>
              </div>
            </div>
          </div>

          {/* Message Editor Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-700 font-black text-xs uppercase tracking-wider">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span>বার্তা লিখুন (Compose Message)</span>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                smsMeta.isBangla ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}>
                {smsMeta.isBangla ? 'Bangla (Unicode)' : 'English'}
              </span>
            </div>

            <div className="space-y-2 font-sans">
              <label className="text-xs font-bold text-slate-700 block">বার্তার বিষয়বস্তু (Message Body)</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={6}
                placeholder="এখানে আপনার নোটিশ বা বার্তা লিখুন..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl p-3.5 text-xs font-medium focus:outline-none transition text-slate-800 placeholder-slate-400 resize-none leading-relaxed"
              ></textarea>
            </div>

            {/* SMS metadata footer */}
            <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-500 border border-slate-100 font-mono">
              <span>অক্ষর সংখ্যা: <b className="text-slate-800">{smsMeta.chars}</b></span>
              <span>এসএমএস পার্ট: <b className="text-slate-800">{smsMeta.parts}টি</b></span>
              <span>পরবর্তী লিমিট: <b className="text-slate-800">{smsMeta.limit * smsMeta.parts - smsMeta.chars}</b> অক্ষর</span>
            </div>

            {/* Warning if demo mode */}
            {!smsEnabled && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-2.5 text-amber-800">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-600 mt-0.5" />
                <div className="text-[11px] font-medium leading-normal">
                  <p className="font-extrabold text-amber-900">এসএমএস গেটওয়ে নিষ্ক্রিয়!</p>
                  <p className="mt-0.5 text-amber-700">এসএমএস সেটিংস পেজে এপিআই কী সক্রিয় নেই। এটি ডেমো মোডে চলবে এবং ডাটাবেজে সফল হিস্ট্রি লগ তৈরি করবে।</p>
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isSending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-blue-600/10 transition flex items-center justify-center gap-2 border-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              মেসেজ পাঠান (Send SMS Notice)
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
