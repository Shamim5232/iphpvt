import React, { useState } from 'react';
import { Student, Batch } from '../types';
import { CreditCard, Printer, User, ShieldAlert, Upload, X, Plus, Trash2 } from 'lucide-react';

interface AdmitCardProps {
  students: Student[];
  batches: Batch[];
  sessions?: string[];
}

export default function AdmitCard({ students, batches, sessions = [] }: AdmitCardProps) {
  // Configuration State
  const [activeTab, setActiveTab] = useState<'basic' | 'student' | 'routine' | 'instructions'>('basic');
  
  // Filters for student dropdown selection
  const [filterSession, setFilterSession] = useState('all');
  const [filterBatch, setFilterBatch] = useState('all');
  
  // Basic Info States
  const [academyName, setAcademyName] = useState('আইসিটি প্রাইভেট হোম');
  const [academyContact, setAcademyContact] = useState('নাচোল থানা গেইট, নাচোল | ফোন: 01319-365232');
  const [admitCardTitle, setAdmitCardTitle] = useState('প্রবেশপত্র (ADMIT CARD)');
  const [examName, setExamName] = useState('মাসিক মডেল টেস্ট মূল্যায়ন পরীক্ষা - ২০২৬');
  const [session, setSession] = useState('২০২৬-২০২৭');
  const [examCenter, setExamCenter] = useState('কক্ষ নং ১০১, ১০২ ও ১০৩ (মূল ভবন)');

  // Student States (Default values for demo, overwritable by selection)
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentName, setStudentName] = useState('মো: আব্দুর রহমান');
  const [studentRoll, setStudentRoll] = useState('১০১২');
  const [studentBatch, setStudentBatch] = useState('Batch A (Morning)');
  const [studentPhone, setStudentPhone] = useState('০১৭১২৩৪৫৬৭৮');
  const [studentPhoto, setStudentPhoto] = useState<string>('');

  // Routine States
  const [examRoutine, setExamRoutine] = useState([
    { subject: 'মডেল টেস্ট - ০১ (বাংলা ও ইংরেজি)', date: '০৫ জুলাই ২০২৬', time: '০৯:০০ AM - ১০:৩০ AM' },
    { subject: 'মডেল টেস্ট - ০২ (গণিত)', date: '০৮ জুলাই ২০২৬', time: '০৯:০০ AM - ১০:৩০ AM' },
    { subject: 'মডেল টেস্ট - ০৩ (পদার্থ/রসায়ন/বিজ্ঞান)', date: '১০ জুলাই ২০২৬', time: '০৯:০০ AM - ১০:৩০ AM' },
  ]);
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Instructions States
  const [instructions, setInstructions] = useState([
    'পরীক্ষা শুরুর কমপক্ষে ১৫ মিনিট পূর্বে অবশ্যই হলে আসন গ্রহণ করতে হবে।',
    'প্রবেশপত্রটি পরীক্ষা কক্ষে অবশ্যই সঙ্গে নিয়ে আসতে হবে।',
    'পরীক্ষার হলে কোন প্রকার মোবাইল ফোন, স্মার্টওয়াচ বা ইলেকট্রনিক ডিভাইস আনা সম্পূর্ণ নিষিদ্ধ।',
    'সদাচার ভঙ্গকারী ও অসদুপায় অবলম্বনকারী পরীক্ষার্থীর খাতা বাতিল বলে গণ্য হবে।',
  ]);
  const [newInstruction, setNewInstruction] = useState('');

  // Image Upload States
  const [isDragging, setIsDragging] = useState(false);

  // Sync Student Selection
  React.useEffect(() => {
    if (selectedStudentId) {
      const student = students.find((s) => s.id === selectedStudentId);
      if (student) {
        setStudentName(student.name || '');
        setStudentRoll(student.roll || '');
        const batch = batches.find((b) => b.id === student.batchId);
        setStudentBatch(batch ? batch.name.split(' - ')[0] : '');
        setStudentPhone(student.phone || '');
        if (student.session) {
          setSession(student.session);
        }
      }
    }
  }, [selectedStudentId, students, batches]);

  // Image upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Routine Handlers
  const addRoutineRow = () => {
    if (!newSubject.trim() || !newDate.trim() || !newTime.trim()) return;
    setExamRoutine([...examRoutine, { subject: newSubject.trim(), date: newDate.trim(), time: newTime.trim() }]);
    setNewSubject('');
    setNewDate('');
    setNewTime('');
  };

  const deleteRoutineRow = (index: number) => {
    setExamRoutine(examRoutine.filter((_, idx) => idx !== index));
  };

  const updateRoutineRow = (index: number, key: 'subject' | 'date' | 'time', value: string) => {
    const updated = [...examRoutine];
    updated[index][key] = value;
    setExamRoutine(updated);
  };

  // Instructions Handlers
  const addInstruction = () => {
    if (!newInstruction.trim()) return;
    setInstructions([...instructions, newInstruction.trim()]);
    setNewInstruction('');
  };

  const deleteInstruction = (index: number) => {
    setInstructions(instructions.filter((_, idx) => idx !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleDownloadOrPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('পপআপ উইন্ডো খুলতে পারেনি! অনুগ্রহ করে আপনার ব্রাউজারের পপআপ ব্লকার নিষ্ক্রিয় করুন এবং পুনরায় চেষ্টা করুন।');
      return;
    }

    const routineRows = examRoutine.map(item => `
      <tr class="border-b border-slate-200">
        <td class="py-2.5 px-3 font-bold text-slate-800 text-left">${item.subject}</td>
        <td class="py-2.5 px-3 font-semibold text-slate-600 text-left">${item.date}</td>
        <td class="py-2.5 px-3 font-mono font-semibold text-slate-600 text-left">${item.time}</td>
      </tr>
    `).join('');

    const instructionItems = instructions.map((inst) => `
      <li class="py-1 border-b border-rose-100 last:border-0">${inst}</li>
    `).join('');

    const photoHtml = studentPhoto 
      ? `<img src="${studentPhoto}" class="h-32 w-28 object-cover border-2 border-slate-300 rounded-lg shadow-sm" />`
      : `<div class="h-32 w-28 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 p-2 text-center text-[10px] font-bold">
          <svg class="h-8 w-8 text-slate-300 mb-1.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          সদ্য তোলা রঙিন ছবি এখানে সংযুক্ত করুন
         </div>`;

    const instructionsHtml = instructions.length > 0 
      ? `<div class="bg-rose-50/70 p-5 rounded-2xl border-2 border-rose-200/60 text-xs text-rose-800 space-y-2">
          <div class="font-black flex items-center gap-1.5 uppercase tracking-wider text-rose-900 text-sm">
            <svg class="h-4.5 w-4.5 stroke-[2.5px] inline text-rose-700" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            পরীক্ষার্থীদের জন্য নির্দেশনাবলী:
          </div>
          <ol class="list-decimal pl-5 space-y-1 font-bold text-left leading-relaxed text-rose-900/90">
            ${instructionItems}
          </ol>
         </div>`
      : '';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>প্রবেশপত্র - ${studentName}</title>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <style>
    body {
      font-family: 'Noto Sans Bengali', 'Inter', sans-serif;
      background-color: #f1f5f9;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
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
      #print-card {
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body class="bg-slate-100 flex items-center justify-center min-h-screen">
  <div class="no-print fixed top-5 right-5 z-50 flex gap-3">
    <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer border-0">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
      মুদ্রণ করুন / PDF ডাউনলোড
    </button>
    <button onclick="window.close()" class="bg-slate-800 hover:bg-slate-900 text-white font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer border-0">
      বন্ধ করুন
    </button>
  </div>

  <div id="print-card" class="bg-white border-2 border-slate-300 p-8 rounded-2xl shadow-sm space-y-6 relative overflow-hidden w-full max-w-[700px] mx-auto">
    <!-- Header branding -->
    <div class="text-center space-y-1.5 border-b pb-4.5 border-slate-200">
      <h1 class="text-2xl font-black text-slate-900 tracking-tight">${academyName}</h1>
      <p class="text-xs font-semibold text-slate-500">${academyContact}</p>
      <div class="inline-block bg-blue-600 text-white font-black text-xs px-6 py-2.5 rounded-lg uppercase tracking-widest mt-3.5">
        ${admitCardTitle}
      </div>
    </div>

    <!-- Exam metadata -->
    <div class="text-center">
      <h2 class="text-lg font-black text-slate-900">${examName}</h2>
      <p class="text-xs font-bold text-slate-500 mt-1">শিক্ষাবর্ষ: ${session}</p>
    </div>

    <!-- Student Details -->
    <div class="grid grid-cols-4 gap-6 items-center py-2">
      <!-- Photo -->
      <div class="col-span-1 flex justify-center">
        ${photoHtml}
      </div>

      <!-- Details -->
      <div class="col-span-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-slate-600">
        <div>
          <span class="font-bold text-slate-400">ছাত্র/ছাত্রীর নাম:</span>
          <strong class="block text-sm font-bold text-slate-900 mt-0.5">${studentName || 'নেই'}</strong>
        </div>
        <div>
          <span class="font-bold text-slate-400">রোল নম্বর:</span>
          <strong class="block text-sm font-black text-slate-900 mt-0.5">${studentRoll || 'নেই'}</strong>
        </div>
        <div>
          <span class="font-bold text-slate-400">ব্যাচ:</span>
          <strong class="block text-sm font-bold text-slate-900 mt-0.5">${studentBatch || 'নেই'}</strong>
        </div>
        <div>
          <span class="font-bold text-slate-400">মোবাইল নম্বর:</span>
          <strong class="block text-sm font-bold text-slate-900 mt-0.5">${studentPhone || 'নেই'}</strong>
        </div>
        <div class="col-span-2">
          <span class="font-bold text-slate-400">পরীক্ষা কেন্দ্র:</span>
          <strong class="block text-sm font-bold text-slate-900 mt-0.5">${examCenter || 'নেই'}</strong>
        </div>
      </div>
    </div>

    <!-- Routine -->
    <div class="border-t border-b border-slate-200 py-4.5">
      <h3 class="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">পরীক্ষার সময়সূচী (Routine)</h3>
      <div class="overflow-hidden border border-slate-200 rounded-xl">
        <table class="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr class="bg-slate-50 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <th class="py-2.5 px-3 text-left">পরীক্ষার বিষয়</th>
              <th class="py-2.5 px-3 text-left">তারিখ</th>
              <th class="py-2.5 px-3 text-left">সময়</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            ${routineRows}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Instructions -->
    ${instructionsHtml}

    <!-- Signatures -->
    <div class="flex justify-between items-end text-[11px] text-slate-400 pt-10">
      <div class="text-center border-t border-slate-300 pt-1 w-24 font-bold">শিক্ষার্থীর স্বাক্ষর</div>
      <div class="text-center border-t border-slate-300 pt-1 w-24 font-bold">কন্ট্রোলার সিগনেচার</div>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      // Give Tailwind play CDN a moment to parse classes
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

  return (
    <div id="admit-card-module" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Global CSS style block for printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide everything except the printable-admit-card */
          body * {
            visibility: hidden !important;
          }
          #printable-admit-card, #printable-admit-card * {
            visibility: visible !important;
          }
          #printable-admit-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0px !important;
            margin: 0px !important;
          }
          /* Hide headers and footers that browsers usually add */
          @page {
            margin: 1.5cm;
          }
        }
      `}} />

      {/* Configuration Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 h-fit lg:col-span-5 print:hidden">
        <div>
          <h3 className="text-xl font-black text-slate-900 font-display flex items-center gap-1.5 uppercase tracking-wider">
            <CreditCard className="h-5.5 w-5.5 text-blue-600 stroke-[2.5px]" />
            প্রবেশপত্র জেনারেটর
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            প্রবেশপত্রের সকল তথ্য এখান থেকে পছন্দমত পরিবর্তন করুন। ডানপাশে সরাসরি পরিবর্তনগুলো দেখতে পাবেন।
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border border-slate-100 bg-slate-50 p-1 rounded-xl">
          {(
            [
              { id: 'basic', label: 'বেসিক তথ্য' },
              { id: 'student', label: 'শিক্ষার্থী ও ছবি' },
              { id: 'routine', label: 'সময়সূচী' },
              { id: 'instructions', label: 'নির্দেশনা' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-center text-[11px] font-black rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-4 pt-1 min-h-[300px]">
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Institution Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">প্রতিষ্ঠানের নাম</label>
                <input
                  type="text"
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  placeholder="যেমন: আইসিটি প্রাইভেট হোম"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                />
              </div>

              {/* Institution Contact/Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">যোগাযোগ ও ঠিকানা</label>
                <input
                  type="text"
                  value={academyContact}
                  onChange={(e) => setAcademyContact(e.target.value)}
                  placeholder="যেমন: নাচোল থানা গেইট, নাচোল | ফোন: 01319-365232"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                />
              </div>

              {/* Admit Card Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">প্রবেশপত্রের শিরোনাম</label>
                <input
                  type="text"
                  value={admitCardTitle}
                  onChange={(e) => setAdmitCardTitle(e.target.value)}
                  placeholder="যেমন: প্রবেশপত্র (ADMIT CARD)"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold font-display"
                />
              </div>

              {/* Exam Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">পরীক্ষার নাম</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="যেমন: বার্ষিক মূল্যায়ন পরীক্ষা"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                />
              </div>

              {/* Session */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">শিক্ষাবর্ষ (Session)</label>
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={sessions.includes(session) ? session : 'custom'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'custom') {
                          setSession(val);
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      <option value="custom">ম্যানুয়ালি লিখুন / অন্যান্য</option>
                      {sessions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {(!sessions.includes(session) || session === '') && (
                      <input
                        type="text"
                        value={session}
                        onChange={(e) => setSession(e.target.value)}
                        placeholder="ম্যানুয়ালি সেশন লিখুন (যেমন: ২০২৬-২০২৭)"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    placeholder="যেমন: ২০২৬-২০২৭"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                  />
                )}
              </div>

              {/* Exam Center */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">পরীক্ষা কেন্দ্র (Center)</label>
                <input
                  type="text"
                  value={examCenter}
                  onChange={(e) => setExamCenter(e.target.value)}
                  placeholder="যেমন: কক্ষ নং ১০১ (মূল ভবন)"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {activeTab === 'student' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Filters for Student Selector */}
              <div className="grid grid-cols-2 gap-3.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">সেশন ফিল্টার</label>
                  <select
                    value={filterSession}
                    onChange={(e) => {
                      setFilterSession(e.target.value);
                      setSelectedStudentId('');
                    }}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <option value="all">সকল সেশন</option>
                    {sessions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ব্যাচ ফিল্টার</label>
                  <select
                    value={filterBatch}
                    onChange={(e) => {
                      setFilterBatch(e.target.value);
                      setSelectedStudentId('');
                    }}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <option value="all">সকল ব্যাচ</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name.split(' - ')[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Dropdown Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">শিক্ষার্থী নির্বাচন (সিস্টেম থেকে)</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                >
                  <option value="">নির্বাচন করুন (অথবা নিচে ম্যানুয়ালি লিখুন)</option>
                  {students
                    .filter((s) => {
                      const matchSession = filterSession === 'all' || (s.session || '') === filterSession;
                      const matchBatch = filterBatch === 'all' || s.batchId === filterBatch;
                      return matchSession && matchBatch;
                    })
                    .map((s) => {
                      const b = batches.find((bt) => bt.id === s.batchId);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} (রোল: {s.roll}) {s.session ? `[${s.session}]` : ''}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Student Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">ছাত্র/ছাত্রীর নাম</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="যেমন: মো: আব্দুর রহমান"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                />
              </div>

              {/* Roll Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">রোল নম্বর</label>
                <input
                  type="text"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  placeholder="যেমন: ১০১২"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                />
              </div>

              {/* Batch */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">ব্যাচ</label>
                <input
                  type="text"
                  value={studentBatch}
                  onChange={(e) => setStudentBatch(e.target.value)}
                  placeholder="যেমন: Batch A (Morning)"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="যেমন: ০১৭১২..."
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                />
              </div>

              {/* Photo Upload Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">শিক্ষার্থীর ছবি আপলোড</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[120px] ${
                    isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-400 bg-slate-50/50'
                  }`}
                  onClick={() => document.getElementById('photo-upload-input')?.click()}
                >
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  {studentPhoto ? (
                    <div className="relative group flex justify-center items-center">
                      <img src={studentPhoto} alt="Preview" className="h-24 w-20 object-cover rounded-md border border-slate-200 shadow-sm" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudentPhoto('');
                        }}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full hover:bg-rose-600 transition shadow"
                        title="ছবি মুছুন"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-slate-400 mb-1.5" />
                      <p className="text-xs text-slate-600 font-bold">এখানে ড্র্যাগ করে ছাড়ুন অথবা ক্লিক করুন</p>
                      <p className="text-[10px] text-slate-400 mt-1">PNG, JPG (সর্বোচ্চ ২MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'routine' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">পরীক্ষার রুটিন পরিবর্তন করুন</label>
              
              {/* Routine list */}
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {examRoutine.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 relative group">
                    <button
                      type="button"
                      onClick={() => deleteRoutineRow(idx)}
                      className="absolute top-2 right-2 p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md transition"
                      title="মুছুন"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">বিষয় {idx + 1}</span>
                      <input
                        type="text"
                        value={item.subject}
                        onChange={(e) => updateRoutineRow(idx, 'subject', e.target.value)}
                        placeholder="বিষয়"
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">তারিখ</span>
                        <input
                          type="text"
                          value={item.date}
                          onChange={(e) => updateRoutineRow(idx, 'date', e.target.value)}
                          placeholder="তারিখ"
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">সময়</span>
                        <input
                          type="text"
                          value={item.time}
                          onChange={(e) => updateRoutineRow(idx, 'time', e.target.value)}
                          placeholder="সময়"
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add routine item */}
              <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2.5">
                <span className="text-xs font-black text-blue-800 block">নতুন বিষয় যোগ করুন</span>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="পরীক্ষার বিষয় (যেমন: গণিত)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="তারিখ (যেমন: ০৮ জুলাই ২০২৬)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="সময় (যেমন: ০৯:০০ AM)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={addRoutineRow}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> সময়সূচী যুক্ত করুন
                </button>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">পরীক্ষার্থীদের জন্য নির্দেশনাবলী</label>
              
              {/* Instructions list */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {instructions.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl p-2.5 relative group">
                    <span className="text-xs font-black text-slate-400 shrink-0 w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateInstruction(idx, e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => deleteInstruction(idx)}
                      className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md transition shrink-0"
                      title="মুছুন"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add instruction item */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder="নতুন নির্দেশনা লিখুন..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addInstruction}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black transition flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> যোগ করুন
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <button
          onClick={handleDownloadOrPrint}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md shadow-blue-600/10 cursor-pointer mt-2"
        >
          <Printer className="h-4 w-4 stroke-[3px]" />
          প্রবেশপত্র ডাউনলোড/মুদ্রণ (Print)
        </button>
      </div>

      {/* Admit Card Preview */}
      <div className="lg:col-span-7 space-y-4">
        <div id="printable-admit-card" className="bg-white border-2 border-slate-300 p-8 rounded-2xl shadow-sm space-y-6 relative overflow-hidden max-w-[700px] mx-auto">
          {/* Header branding */}
          <div className="text-center space-y-1 border-b pb-4 border-slate-200">
            <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">{academyName}</h1>
            <p className="text-xs font-semibold text-slate-500">{academyContact}</p>
            <div className="inline-block bg-blue-600 text-white font-black text-xs px-6 py-2 rounded-lg uppercase tracking-widest mt-3">
              {admitCardTitle}
            </div>
          </div>

          {/* Exam metadata */}
          <div className="text-center">
            <h2 className="text-lg font-black text-slate-900 font-display">{examName}</h2>
            <p className="text-xs font-bold text-slate-500 mt-1">শিক্ষাবর্ষ: {session}</p>
          </div>

          {/* Student Grid and info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Photo placeholder */}
            <div className="md:col-span-1 flex justify-center">
              {studentPhoto ? (
                <div className="relative group">
                  <img src={studentPhoto} alt={studentName} className="h-32 w-28 object-cover border border-slate-300 rounded-lg shadow-sm" />
                  <button
                    type="button"
                    onClick={() => setStudentPhoto('')}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white p-1 rounded-full hover:bg-rose-600 transition shadow print:hidden"
                    title="ছবি মুছুন"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-32 w-28 bg-slate-50 border border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 p-2 text-center text-[10px] font-bold">
                  <User className="h-10 w-10 text-slate-300 mb-1" />
                  সদ্য তোলা রঙিন ছবি এখানে সংযুক্ত করুন
                </div>
              )}
            </div>

            {/* Student details */}
            <div className="md:col-span-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-500">ছাত্র/ছাত্রীর নাম:</span>
                <strong className="block text-sm font-bold text-slate-900 mt-0.5">{studentName || 'নেই'}</strong>
              </div>
              <div>
                <span className="font-semibold text-slate-500">রোল নম্বর:</span>
                <strong className="block text-sm font-black text-slate-900 mt-0.5 font-mono">{studentRoll || 'নেই'}</strong>
              </div>
              <div>
                <span className="font-semibold text-slate-500">ব্যাচ:</span>
                <strong className="block text-sm font-bold text-slate-900 mt-0.5">{studentBatch || 'নেই'}</strong>
              </div>
              <div>
                <span className="font-semibold text-slate-500">মোবাইল নম্বর:</span>
                <strong className="block text-sm font-bold text-slate-900 mt-0.5 font-mono">{studentPhone || 'নেই'}</strong>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-slate-500">পরীক্ষা কেন্দ্র:</span>
                <strong className="block text-sm font-bold text-slate-900 mt-0.5">{examCenter || 'নেই'}</strong>
              </div>
            </div>
          </div>

          {/* Routine details */}
          <div className="border-t border-b border-slate-200 py-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2.5 font-display">পরীক্ষার সময়সূচী (Routine)</h3>
            <div className="overflow-hidden border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">পরীক্ষার বিষয়</th>
                    <th className="py-2.5 px-3">তারিখ</th>
                    <th className="py-2.5 px-3">সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {examRoutine.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{item.subject}</td>
                      <td className="py-2.5 px-3 font-semibold">{item.date}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instruction Footer */}
          {instructions.length > 0 && (
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-[10px] text-rose-800 space-y-1">
              <div className="font-black flex items-center gap-1 uppercase tracking-wider text-rose-900">
                <ShieldAlert className="h-3.5 w-3.5 stroke-[2.5px]" /> পরীক্ষার্থীদের জন্য নির্দেশনাবলী:
              </div>
              <ol className="list-decimal pl-4 space-y-0.5 mt-1 font-semibold">
                {instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Signatures */}
          <div className="flex justify-between items-end text-[11px] text-slate-500 pt-8">
            <div className="text-center border-t border-slate-300 pt-1 w-24 font-bold">শিক্ষার্থীর স্বাক্ষর</div>
            <div className="text-center border-t border-slate-300 pt-1 w-24 font-bold">কন্ট্রোলার সিগনেচার</div>
          </div>
        </div>
      </div>
    </div>
  );
}
