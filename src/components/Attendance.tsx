import React, { useState } from 'react';
import { Student, Batch, AttendanceRecord } from '../types';
import { ClipboardList, Calendar, Users, Check, X, AlertCircle, FileSpreadsheet, Printer, Download, ListChecks } from 'lucide-react';
import Swal from 'sweetalert2';
import { isFriday } from '../utils/dateHelpers';


interface AttendanceProps {
  students: Student[];
  batches: Batch[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (date: string, records: Omit<AttendanceRecord, 'date'>[]) => void;
}

export default function Attendance({
  students,
  batches,
  attendance,
  onSaveAttendance,
}: AttendanceProps) {
  const getLocalTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getLocalCurrentMonthString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const getFridaysOfMonth = (monthStr: string): string[] => {
    const parts = monthStr.split('-');
    if (parts.length !== 2) return [];
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed month
    
    const fridays: string[] = [];
    const d = new Date(year, month, 1);
    const todayStr = getLocalTodayString();
    
    while (d.getMonth() === month) {
      if (d.getDay() === 5) { // 5 is Friday
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        if (dateStr <= todayStr) {
          fridays.push(dateStr);
        }
      }
      d.setDate(d.getDate() + 1);
    }
    return fridays;
  };

  const toBengaliNum = (num: number | string): string => {
    const banglaDigits: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '.': '.'
    };
    return String(num).split('').map(char => banglaDigits[char] || char).join('');
  };

  const [activeSubTab, setActiveSubTab] = useState<'take' | 'report'>('take');
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(getLocalTodayString());
  const [selectedMonth, setSelectedMonth] = useState(getLocalCurrentMonthString());
  const [currentRecords, setCurrentRecords] = useState<Record<string, 'Present' | 'Absent'>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync selectedBatch when batches load
  React.useEffect(() => {
    if (!selectedBatch && batches.length > 0) {
      setSelectedBatch(batches[0].id);
    }
  }, [batches, selectedBatch]);

  // Automatically load existing attendance for this date and batch, or default to all Present
  React.useEffect(() => {
    if (!selectedBatch || !selectedDate) {
      setIsLoaded(false);
      return;
    }

    const filteredStudents = students.filter((s) => s.batchId === selectedBatch);
    const existingRecords = attendance.filter(
      (a) => a.date === selectedDate && a.batchId === selectedBatch
    );

    const initialRecordsState: Record<string, 'Present' | 'Absent'> = {};

    filteredStudents.forEach((student) => {
      const match = existingRecords.find((r) => r.studentId === student.id);
      initialRecordsState[student.id] = match ? match.status : 'Present';
    });

    setCurrentRecords(initialRecordsState);
    setIsLoaded(true);
  }, [selectedBatch, selectedDate, students, attendance]);

  const toggleStatus = (studentId: string) => {
    setCurrentRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  const setAllStatus = (status: 'Present' | 'Absent') => {
    const updated: Record<string, 'Present' | 'Absent'> = {};
    Object.keys(currentRecords).forEach((key) => {
      updated[key] = status;
    });
    setCurrentRecords(updated);
  };

  const handleSave = () => {
    const recordList = Object.keys(currentRecords).map((studentId) => ({
      studentId,
      batchId: selectedBatch,
      status: currentRecords[studentId] as 'Present' | 'Absent',
    }));

    onSaveAttendance(selectedDate, recordList);
    Swal.fire({
      icon: 'success',
      title: 'উপস্থিতি সংরক্ষিত!',
      text: 'উপস্থিতি সফলভাবে সংরক্ষণ করা হয়েছে।',
      confirmButtonColor: '#3B82F6',
      confirmButtonText: 'ঠিক আছে'
    });
  };

  const batchStudents = students.filter((s) => s.batchId === selectedBatch);
  const activeBatch = batches.find((b) => b.id === selectedBatch);

  // Check if attendance already recorded in overall list
  const hasSavedRecords = attendance.some(
    (a) => a.date === selectedDate && a.batchId === selectedBatch
  );

  const presentCount = Object.values(currentRecords).filter((status) => status === 'Present').length;
  const absentCount = Object.values(currentRecords).filter((status) => status === 'Absent').length;

  // Report logic helper
  const reportDates = React.useMemo(() => {
    const actualDates = attendance
      .filter((a) => a.batchId === selectedBatch && a.date.startsWith(selectedMonth))
      .map((a) => a.date);

    const passedFridays = getFridaysOfMonth(selectedMonth);

    return Array.from(new Set([...actualDates, ...passedFridays])).sort();
  }, [attendance, selectedBatch, selectedMonth]);

  // Excel/CSV download helper
  const handleDownloadCSV = () => {
    if (batchStudents.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'ডাউনলোড ব্যর্থ!',
        text: 'এই ব্যাচে কোনো শিক্ষার্থী নেই।',
        confirmButtonColor: '#3B82F6',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }

    let csvContent = '\ufeff'; // UTF-8 BOM to display Bengali characters correctly in Excel
    csvContent += `"উপস্থিতি বিবরণী রিপোর্ট (Attendance Report)"\n`;
    csvContent += `"ব্যাচ:","${activeBatch?.name || ''}"\n`;
    csvContent += `"মাস:","${selectedMonth}"\n\n`;

    // Headers
    const headers = ['রোল নম্বর', 'শিক্ষার্থীর নাম'];
    reportDates.forEach(date => {
      const day = date.split('-')[2];
      headers.push(`${day} তারিখ`);
    });
    headers.push('উপস্থিত', 'অনুপস্থিত', 'উপস্থিতির হার (%)');

    csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

    // Rows
    batchStudents.forEach(student => {
      const row = [student.roll, student.name];
      let present = 0;
      let absent = 0;

      reportDates.forEach(date => {
        if (isFriday(date)) {
          row.push('ছুটি');
          return;
        }

        const match = attendance.find(a => a.studentId === student.id && a.date === date && a.batchId === selectedBatch);
        if (match) {
          if (match.status === 'Present') {
            present++;
            row.push('P');
          } else {
            absent++;
            row.push('A');
          }
        } else {
          row.push('-');
        }
      });

      const total = present + absent;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;

      row.push(present.toString());
      row.push(absent.toString());
      row.push(`${rate}%`);

      csvContent += row.map(r => `"${r}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Report_${activeBatch?.name.split(' - ')[0] || 'Batch'}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Month formatter helper (Bengali)
  const formatMonthBengali = (monthStr: string) => {
    const parts = monthStr.split('-');
    if (parts.length === 2) {
      const monthsInBengali = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
      ];
      const monthIdx = parseInt(parts[1], 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${monthsInBengali[monthIdx]} ${toBengaliNum(parts[0])}`;
      }
    }
    return toBengaliNum(monthStr);
  };

  return (
    <div id="attendance-module" className="space-y-6">
      {/* Header - Hidden on Print */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <h2 className="text-2xl font-black tracking-tighter text-slate-900 font-display flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-blue-600 stroke-[2.5px]" />
          দৈনিক ও মাসিক অ্যাটেনডেন্স ব্যবস্থাপনা
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-1">
          নির্দিষ্ট ব্যাচ সিলেক্ট করে ছাত্র/ছাত্রীদের দৈনিক উপস্থিতি নির্ধারণ করুন এবং মাসিক রিপোর্ট দেখুন ও ডাউনলোড করুন।
        </p>
      </div>

      {/* Sub Tab Switcher - Hidden on Print */}
      <div className="flex border-b border-slate-200 bg-white px-2 rounded-xl shadow-xs border print:hidden">
        <button
          onClick={() => setActiveSubTab('take')}
          className={`px-5 py-3.5 border-b-2 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'take'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <ListChecks className="h-4.5 w-4.5 stroke-[2.5px]" />
          হাজিরা দিন (Take Attendance)
        </button>
        <button
          onClick={() => setActiveSubTab('report')}
          className={`px-5 py-3.5 border-b-2 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'report'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <FileSpreadsheet className="h-4.5 w-4.5 stroke-[2.5px]" />
          উপস্থিতি রিপোর্ট (Attendance Report)
        </button>
      </div>

      {/* Selectors panel - Hidden on Print */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm items-end print:hidden">
        {/* Batch Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">ব্যাচ নির্বাচন করুন *</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-semibold text-sm"
          >
            <option value="">নির্বাচন করুন</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection for taking attendance or Month Selection for Report */}
        {activeSubTab === 'take' ? (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">তারিখ নির্বাচন করুন</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-semibold text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">মাস নির্বাচন করুন</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-semibold text-sm"
              />
            </div>
          </div>
        )}

        {/* Batch Status Info */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">ব্যাচ স্ট্যাটাস</label>
          <div className="bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 flex items-center justify-between text-xs font-bold text-slate-600 h-[46px] select-none">
            <span className="flex items-center gap-1.5 text-slate-500 font-bold">
              <Users className="h-4 w-4 text-blue-500 stroke-[2.5px]" /> মোট শিক্ষার্থী:
            </span>
            <span className="font-black font-display text-blue-600 text-sm">
              {toBengaliNum(students.filter((s) => s.batchId === selectedBatch).length)} জন
            </span>
          </div>
        </div>
      </div>

      {/* ==================== TAKE ATTENDANCE SUB-TAB ==================== */}
      {activeSubTab === 'take' && isLoaded && (
        <div className="space-y-4 print:hidden">
          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">মোট শিক্ষার্থী</span>
                <span className="text-xl font-black text-slate-800 font-display mt-1 block">
                  {toBengaliNum(batchStudents.length)} জন
                </span>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">মোট উপস্থিত</span>
                <span className="text-xl font-black text-emerald-700 font-display mt-1 block">
                  {toBengaliNum(presentCount)} জন
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Check className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">মোট অনুপস্থিত</span>
                <span className="text-xl font-black text-rose-700 font-display mt-1 block">
                  {toBengaliNum(absentCount)} জন
                </span>
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                <X className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Preset Buttons & Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                ব্যাচ: <strong className="text-slate-900 font-black">{activeBatch?.name.split(' - ')[0]}</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                তারিখ: <strong className="text-slate-900 font-black">{toBengaliNum(selectedDate)}</strong>
              </span>
              {hasSavedRecords && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Check className="h-3.5 w-3.5 stroke-[3px]" /> সংরক্ষিত তথ্য
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAllStatus('Present')}
                className="text-xs font-black bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-lg transition-all uppercase tracking-wider cursor-pointer"
              >
                সবাই উপস্থিত (Present All)
              </button>
              <button
                onClick={() => setAllStatus('Absent')}
                className="text-xs font-black bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 px-3.5 py-2 rounded-lg transition-all uppercase tracking-wider cursor-pointer"
              >
                সবাই অনুপস্থিত (Absent All)
              </button>
            </div>
          </div>

          {/* Student Grid for Attendance */}
          {batchStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batchStudents.map((student) => {
                const status = currentRecords[student.id] || 'Present';
                return (
                  <div
                    key={student.id}
                    onClick={() => toggleStatus(student.id)}
                    className={`p-4 rounded-xl border cursor-pointer select-none transition flex items-center justify-between shadow-xs ${
                      status === 'Present'
                        ? 'bg-emerald-50/30 border-2 border-emerald-300 hover:bg-emerald-50/50'
                        : 'bg-rose-50/30 border-2 border-rose-300 hover:bg-rose-50/50'
                    }`}
                  >
                    <div>
                      <h4 className="font-black text-slate-900 text-sm font-display">{student.name}</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">রোল নম্বর: {toBengaliNum(student.roll)}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {status === 'Present' ? (
                        <div className="h-8 w-20 flex items-center justify-center gap-1 rounded-md bg-emerald-600 text-white font-black text-xs uppercase tracking-wider transition">
                          <Check className="h-3.5 w-3.5 stroke-[3px]" /> উপস্থিত
                        </div>
                      ) : (
                        <div className="h-8 w-20 flex items-center justify-center gap-1 rounded-md bg-rose-600 text-white font-black text-xs uppercase tracking-wider transition">
                          <X className="h-3.5 w-3.5 stroke-[3px]" /> অনুপস্থিত
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm text-slate-400 flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-slate-300" />
              এই ব্যাচে এখনো কোনো ছাত্র/ছাত্রী ভর্তি করা হয়নি।
            </div>
          )}

          {/* Save Button */}
          {batchStudents.length > 0 && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-lg font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/10 transition-all cursor-pointer"
              >
                <Check className="h-4.5 w-4.5 stroke-[3px]" />
                উপস্থিতি সংরক্ষণ করুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== ATTENDANCE REPORT SUB-TAB ==================== */}
      {activeSubTab === 'report' && (
        <div className="space-y-6 print:hidden">
          {/* Action Control Panel */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="text-xs text-slate-600 font-bold">
              ব্যাচ: <strong className="text-blue-700 font-black">{activeBatch?.name || 'সিলেক্ট করুন'}</strong> | মাস: <strong className="text-blue-700 font-black">{formatMonthBengali(selectedMonth)}</strong>
              {reportDates.length > 0 && (
                <span className="block sm:inline sm:ml-2 text-slate-400 font-normal">
                  (এই মাসে মোট {toBengaliNum(reportDates.length)} দিন হাজিরা নেওয়া হয়েছে)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                <Download className="h-4 w-4" />
                Excel / CSV ডাউনলোড
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-indigo-600/10"
              >
                <Printer className="h-4 w-4" />
                রিপোর্ট প্রিন্ট করুন
              </button>
            </div>
          </div>

          {/* Detailed Attendance Grid */}
          {batchStudents.length > 0 ? (
            reportDates.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-3 px-4 text-xs font-black text-slate-700 border-r border-slate-150 sticky left-0 bg-slate-50 z-10 w-[70px]">রোল</th>
                        <th className="py-3 px-4 text-xs font-black text-slate-700 border-r border-slate-150 sticky left-[70px] bg-slate-50 z-10 min-w-[150px]">শিক্ষার্থীর নাম</th>
                        
                        {/* Day headers */}
                        {reportDates.map((date) => {
                          const day = date.split('-')[2];
                          const isFri = isFriday(date);
                          return (
                            <th key={date} className={`py-3 px-2 text-xs font-black border-r border-slate-150 text-center min-w-[45px] hover:bg-slate-100 transition-colors ${isFri ? 'text-amber-700 bg-amber-50/50' : 'text-slate-600'}`} title={`${toBengaliNum(date)}${isFri ? ' (শুক্রবার - ছুটি)' : ''}`}>
                              {toBengaliNum(day)}
                            </th>
                          );
                        })}

                        <th className="py-3 px-3 text-xs font-black text-emerald-700 text-center min-w-[70px]">উপস্থিত</th>
                        <th className="py-3 px-3 text-xs font-black text-rose-700 text-center min-w-[70px]">অনুপস্থিত</th>
                        <th className="py-3 px-4 text-xs font-black text-indigo-700 text-right min-w-[90px]">হার (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {batchStudents.map((student) => {
                        let presentCount = 0;
                        let absentCount = 0;

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 text-xs font-bold font-mono text-slate-600 border-r border-slate-150 sticky left-0 bg-white group-hover:bg-slate-50">{toBengaliNum(student.roll)}</td>
                            <td className="py-3.5 px-4 text-xs font-black text-slate-900 border-r border-slate-150 sticky left-[70px] bg-white group-hover:bg-slate-50">{student.name}</td>
                            
                            {/* Days status cells */}
                            {reportDates.map((date) => {
                              if (isFriday(date)) {
                                return (
                                  <td key={date} className="py-3.5 px-2 text-center border-r border-slate-150 bg-amber-50/20">
                                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]" title={`${toBengaliNum(date)}: শুক্রবার (ছুটি)`}>
                                      ছুটি
                                    </span>
                                  </td>
                                );
                              }

                              const match = attendance.find(
                                (a) => a.studentId === student.id && a.date === date && a.batchId === selectedBatch
                              );
                              
                              if (match) {
                                if (match.status === 'Present') {
                                  presentCount++;
                                  return (
                                    <td key={date} className="py-3.5 px-2 text-center border-r border-slate-150">
                                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs" title={`${toBengaliNum(date)}: উপস্থিত`}>
                                        ✓
                                      </span>
                                    </td>
                                  );
                                } else {
                                  absentCount++;
                                  return (
                                    <td key={date} className="py-3.5 px-2 text-center border-r border-slate-150">
                                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-50 text-rose-600 font-bold text-xs" title={`${toBengaliNum(date)}: অনুপস্থিত`}>
                                        ✗
                                      </span>
                                    </td>
                                  );
                                }
                              } else {
                                return (
                                  <td key={date} className="py-3.5 px-2 text-center text-slate-300 border-r border-slate-150">
                                    -
                                  </td>
                                );
                              }
                            })}

                            <td className="py-3.5 px-3 text-center text-xs font-black text-emerald-700 bg-emerald-50/20">{toBengaliNum(presentCount)} দিন</td>
                            <td className="py-3.5 px-3 text-center text-xs font-black text-rose-700 bg-rose-50/20">{toBengaliNum(absentCount)} দিন</td>
                            
                            <td className="py-3.5 px-4 text-right text-xs font-black text-slate-800">
                              {(() => {
                                const total = presentCount + absentCount;
                                const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;
                                return (
                                  <span className={`px-2 py-0.5 rounded font-mono ${
                                    rate >= 80 ? 'bg-emerald-100 text-emerald-800' :
                                    rate >= 50 ? 'bg-amber-100 text-amber-800' :
                                    'bg-rose-100 text-rose-800'
                                  }`}>
                                    {toBengaliNum(rate)}%
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm text-slate-400 flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-slate-300" />
                এই মাসে কোনো উপস্থিতির রেকর্ড খুঁজে পাওয়া যায়নি। তারিখ নির্বাচন করে আগে হাজিরা প্রদান করুন।
              </div>
            )
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm text-slate-400 flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-slate-300" />
              এই ব্যাচে কোনো ছাত্র/ছাত্রী এখনো ভর্তি করা হয়নি।
            </div>
          )}
        </div>
      )}

      {/* ==================== PRINTABLE ATTENDANCE REPORT AREA ==================== */}
      {/* Hidden on Screen, Visible on Print */}
      <div id="printable-attendance-report" className="hidden print:block text-black bg-white p-6 font-sans w-full">
        {/* Header Title */}
        <div className="text-center space-y-2 pb-6 border-b-2 border-slate-300 mb-6">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">আইপিএইচ প্রাইভেট প্রোগ্রাম (IPH Private)</h1>
          <h2 className="text-md font-bold text-slate-700 uppercase tracking-wide">মাসিক উপস্থিতি প্রতিবেদন (Monthly Attendance Report)</h2>
          <div className="text-xs font-bold text-slate-600 flex justify-center gap-6 pt-1">
            <span>ব্যাচ: <b>{activeBatch?.name || 'N/A'}</b></span>
            <span>মাস: <b>{formatMonthBengali(selectedMonth)}</b></span>
            <span>রিপোর্ট তৈরির তারিখ: <b>{toBengaliNum(new Date().toLocaleDateString('bn-BD'))}</b></span>
          </div>
        </div>

        {/* Attendance Table */}
        {batchStudents.length > 0 && reportDates.length > 0 ? (
          <table className="w-full border-collapse border border-slate-400 text-xs">
            <thead>
              <tr className="bg-slate-100 border border-slate-400">
                <th className="border border-slate-400 py-2 px-2 text-center font-bold w-[60px]">রোল</th>
                <th className="border border-slate-400 py-2 px-3 text-left font-bold min-w-[140px]">শিক্ষার্থীর নাম</th>
                {reportDates.map(date => {
                  const day = date.split('-')[2];
                  const isFri = isFriday(date);
                  return (
                    <th key={date} className={`border border-slate-400 py-2 px-1 text-center font-bold ${isFri ? 'bg-slate-200 text-slate-800' : ''}`}>
                      {toBengaliNum(day)}
                    </th>
                  );
                })}
                <th className="border border-slate-400 py-2 px-2 text-center font-bold">উপস্থিত</th>
                <th className="border border-slate-400 py-2 px-2 text-center font-bold">অনুপস্থিত</th>
                <th className="border border-slate-400 py-2 px-2 text-center font-bold">হার (%)</th>
              </tr>
            </thead>
            <tbody>
              {batchStudents.map(student => {
                let presentCount = 0;
                let absentCount = 0;

                return (
                  <tr key={student.id} className="border border-slate-400">
                    <td className="border border-slate-400 py-2 px-2 text-center font-mono font-bold">{toBengaliNum(student.roll)}</td>
                    <td className="border border-slate-400 py-2 px-3 font-bold">{student.name}</td>
                    
                    {reportDates.map(date => {
                      if (isFriday(date)) {
                        return <td key={date} className="border border-slate-400 py-2 px-1 text-center font-bold text-amber-700 bg-slate-100">ছুটি</td>;
                      }

                      const match = attendance.find(a => a.studentId === student.id && a.date === date && a.batchId === selectedBatch);
                      if (match) {
                        if (match.status === 'Present') {
                          presentCount++;
                          return <td key={date} className="border border-slate-400 py-2 px-1 text-center font-bold text-emerald-700">✓</td>;
                        } else {
                          absentCount++;
                          return <td key={date} className="border border-slate-400 py-2 px-1 text-center font-bold text-rose-700">✗</td>;
                        }
                      } else {
                        return <td key={date} className="border border-slate-400 py-2 px-1 text-center text-slate-300">-</td>;
                      }
                    })}

                    <td className="border border-slate-400 py-2 px-2 text-center font-bold text-emerald-800">{toBengaliNum(presentCount)} দিন</td>
                    <td className="border border-slate-400 py-2 px-2 text-center font-bold text-rose-800">{toBengaliNum(absentCount)} দিন</td>
                    <td className="border border-slate-400 py-2 px-2 text-center font-bold font-mono">
                      {(() => {
                        const total = presentCount + absentCount;
                        return total > 0 ? `${toBengaliNum(Math.round((presentCount / total) * 100))}%` : '০%';
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-slate-500 font-bold border border-slate-400 rounded">
            এই ব্যাচে বা মাসে কোনো উপস্থিতির তথ্য নেই।
          </div>
        )}

        {/* Signatures/Footer for print */}
        <div className="pt-24 flex justify-between items-center text-xs text-slate-700 font-bold px-12">
          <div className="border-t border-slate-400 pt-1.5 px-4 text-center">
            প্রস্তুতকারীর স্বাক্ষর
          </div>
          <div className="border-t border-slate-400 pt-1.5 px-4 text-center">
            পরিচালকের স্বাক্ষর
          </div>
        </div>
      </div>
    </div>
  );
}

