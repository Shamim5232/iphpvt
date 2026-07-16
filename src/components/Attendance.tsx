import React, { useState } from 'react';
import { Student, Batch, AttendanceRecord } from '../types';
import { ClipboardList, Calendar, Users, Check, X, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

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

  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(getLocalTodayString());
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

  return (
    <div id="attendance-module" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-black tracking-tighter text-slate-900 font-display flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-blue-600 stroke-[2.5px]" />
          দৈনিক ব্যাচ-ভিত্তিক অ্যাটেনডেন্স (Attendance)
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-1">
          নির্দিষ্ট ব্যাচ সিলেক্ট করে ছাত্র/ছাত্রীদের উপস্থিতি/অনুপস্থিতি নির্ধারণ করুন।
        </p>
      </div>

      {/* Selectors panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm items-end">
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

        {/* Date Selection */}
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

        {/* Batch Status Info */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">ব্যাচ স্ট্যাটাস</label>
          <div className="bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 flex items-center justify-between text-xs font-bold text-slate-600 h-[46px] select-none">
            <span className="flex items-center gap-1.5 text-slate-500 font-bold">
              <Users className="h-4 w-4 text-blue-500 stroke-[2.5px]" /> মোট শিক্ষার্থী:
            </span>
            <span className="font-black font-display text-blue-600 text-sm">
              {students.filter((s) => s.batchId === selectedBatch).length} জন
            </span>
          </div>
        </div>
      </div>

      {isLoaded && (
        <div className="space-y-4">
          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">মোট শিক্ষার্থী</span>
                <span className="text-xl font-black text-slate-800 font-display mt-1 block">
                  {batchStudents.length} জন
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
                  {presentCount} জন
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
                  {absentCount} জন
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
                তারিখ: <strong className="text-slate-900 font-black">{selectedDate}</strong>
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
                className="text-xs font-black bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-lg transition-all uppercase tracking-wider"
              >
                সবাই উপস্থিত (Present All)
              </button>
              <button
                onClick={() => setAllStatus('Absent')}
                className="text-xs font-black bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 px-3.5 py-2 rounded-lg transition-all uppercase tracking-wider"
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
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">রোল নম্বর: {student.roll}</p>
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
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-lg font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/10 transition-all"
              >
                <Check className="h-4.5 w-4.5 stroke-[3px]" />
                উপস্থিতি সংরক্ষণ করুন
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
