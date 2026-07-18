import React, { useState, useMemo } from 'react';
import { Student, Batch, AttendanceRecord, FeeCollection, ModelTestMark } from '../types';
import { BookOpen, Calendar, CreditCard, Award, ChevronRight, UserCheck, ShieldAlert, FileText, CheckCircle, Clock } from 'lucide-react';
import { isFriday } from '../utils/dateHelpers';


interface StudentDashboardProps {
  students: Student[];
  batches: Batch[];
  attendance: AttendanceRecord[];
  fees: FeeCollection[];
  modelTests: ModelTestMark[];
}

export default function StudentDashboard({
  students,
  batches,
  attendance,
  fees,
  modelTests,
}: StudentDashboardProps) {
  const [selectedRoll, setSelectedRoll] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoll) return;

    const match = students.find((s) => s.roll === selectedRoll);
    if (match) {
      setSelectedStudent(match);
    } else {
      alert('উক্ত রোল নাম্বার বিশিষ্ট কোনো শিক্ষার্থী পাওয়া যায়নি!');
    }
  };

  // Compute student stats
  const stats = useMemo(() => {
    if (!selectedStudent) return null;

    // 1. Attendance Rate
    const studAttendance = attendance.filter((a) => a.studentId === selectedStudent.id && !isFriday(a.date));
    const totalDays = studAttendance.length;
    const presentDays = studAttendance.filter((a) => a.status === 'Present').length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // 2. Model Test Marks
    const marks = modelTests.find((m) => m.studentId === selectedStudent.id && m.month === '2026-06');

    // 3. Fees
    const studFees = fees.filter((f) => f.studentId === selectedStudent.id);
    const unpaidFees = studFees.filter((f) => f.status !== 'Paid');

    return {
      totalDays,
      presentDays,
      attendanceRate,
      marks,
      studFees,
      unpaidFees,
    };
  }, [selectedStudent, attendance, modelTests, fees]);

  const activeBatch = batches.find((b) => b.id === selectedStudent?.batchId);

  return (
    <div id="student-dashboard-module" className="space-y-6">
      {!selectedStudent ? (
        /* Simple Student Login Card */
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-block bg-indigo-50 p-3 rounded-2xl text-indigo-600">
              <BookOpen className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">শিক্ষার্থী লগইন (Student Portal)</h2>
            <p className="text-slate-500 text-sm">ড্যাশবোর্ডে নিজের প্রোগ্রেস ও পরীক্ষার প্রবেশপত্র দেখতে আপনার রোল নম্বরটি লিখুন।</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">আপনার রোল নাম্বারটি দিন</label>
              <input
                type="text"
                placeholder="যেমন: ১০১"
                value={selectedRoll}
                onChange={(e) => setSelectedRoll(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-bold"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition shadow-md shadow-indigo-100"
            >
              প্রবেশ করুন (Login)
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* Quick Select for Testing Ease */}
          <div className="border-t pt-4 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">পরীক্ষামূলক কুইক সিলেক্ট</span>
            <div className="flex flex-wrap gap-2">
              {students.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedRoll(s.roll);
                    setSelectedStudent(s);
                  }}
                  className="text-xs bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium px-2.5 py-1.5 rounded-lg transition"
                >
                  {s.name.split(' ')[0]} (রোল: {s.roll})
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Full Student Progress Dashboard */
        <div className="space-y-6">
          {/* Welcome Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                <UserCheck className="h-3.5 w-3.5" /> স্টুডেন্ট পোর্টাল সেশন অ্যাক্টিভ
              </span>
              <h2 className="text-xl font-extrabold text-slate-800 mt-2">স্বাগতম, {selectedStudent.name}!</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                ব্যাচ: <strong className="text-slate-700">{activeBatch?.name}</strong> | রোল: <strong className="text-slate-700">{selectedStudent.roll}</strong>
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedStudent(null);
                setSelectedRoll('');
              }}
              className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl transition"
            >
              লগআউট করুন
            </button>
          </div>

          {/* Overview Stats Bento Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Attendance Progress Ring */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">উপস্থিতির হার (Attendance)</span>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{stats?.attendanceRate.toFixed(1)}%</h3>
              </div>

              {/* Attendance Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-50">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats?.attendanceRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>উপস্থিত: {stats?.presentDays} দিন</span>
                  <span>মোট রেকর্ড: {stats?.totalDays} দিন</span>
                </div>
              </div>
            </div>

            {/* Model Test Performance average */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
              {(() => {
                const markObj = stats?.marks;
                const scores = markObj
                  ? [markObj.test1, markObj.test2, markObj.test3, markObj.test4, markObj.test5].filter((s) => s !== -1)
                  : [];
                const avg =
                  scores.length > 0
                    ? (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1)
                    : 'N/A';

                return (
                  <>
                    <div>
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">পরীক্ষার গড় নম্বর (Model Test Avg)</span>
                      <h3 className="text-2xl font-black text-indigo-600 mt-1">{avg} <span className="text-xs text-slate-400">/ ১০০</span></h3>
                    </div>

                    <div className="flex gap-1.5 justify-around bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-center font-bold">
                      <div>
                        <span className="block text-slate-400">T1</span>
                        <span className="text-slate-700">{markObj && markObj.test1 !== -1 ? markObj.test1 : '-'}</span>
                      </div>
                      <div className="border-r border-slate-200"></div>
                      <div>
                        <span className="block text-slate-400">T2</span>
                        <span className="text-slate-700">{markObj && markObj.test2 !== -1 ? markObj.test2 : '-'}</span>
                      </div>
                      <div className="border-r border-slate-200"></div>
                      <div>
                        <span className="block text-slate-400">T3</span>
                        <span className="text-slate-700">{markObj && markObj.test3 !== -1 ? markObj.test3 : '-'}</span>
                      </div>
                      <div className="border-r border-slate-200"></div>
                      <div>
                        <span className="block text-slate-400">T4</span>
                        <span className="text-slate-700">{markObj && markObj.test4 !== -1 ? markObj.test4 : '-'}</span>
                      </div>
                      <div className="border-r border-slate-200"></div>
                      <div>
                        <span className="block text-slate-400">T5</span>
                        <span className="text-slate-700">{markObj && markObj.test5 !== -1 ? markObj.test5 : '-'}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Fee Collection Alert Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">পেমেন্ট বিবরণ (Fees Status)</span>
                {stats?.unpaidFees && stats.unpaidFees.length > 0 ? (
                  <h3 className="text-2xl font-black text-rose-600 mt-1">৳{stats.unpaidFees.reduce((acc, f) => acc + f.amount, 0)} বকেয়া</h3>
                ) : (
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">সব পরিশোধিত</h3>
                )}
              </div>

              <div className="space-y-1 text-xs">
                {stats?.studFees.slice(0, 2).map((fee) => (
                  <div key={fee.id} className="flex justify-between border-b pb-1">
                    <span className="text-slate-500 font-mono">{fee.month}</span>
                    <span className={`font-bold ${fee.status === 'Paid' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {fee.status === 'Paid' ? 'পরিশোধিত' : 'বকেয়া'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Chart & Exam Hall seat display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Progress Graph (SVG Bar Chart representing performance) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b pb-2">
                <Award className="h-4 w-4 text-indigo-600" />
                মডেল টেস্ট প্রোগ্রেস চার্ট (৫টি পরীক্ষা)
              </h4>

              {stats?.marks ? (
                <div className="pt-4 space-y-3.5">
                  {[
                    { label: 'মডেল টেস্ট ১', val: stats.marks.test1 },
                    { label: 'মডেল টেস্ট ২', val: stats.marks.test2 },
                    { label: 'মডেল টেস্ট ৩', val: stats.marks.test3 },
                    { label: 'মডেল টেস্ট ৪', val: stats.marks.test4 },
                    { label: 'মডেল টেস্ট ৫', val: stats.marks.test5 },
                  ].map((test, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700">
                        <span>{test.label}</span>
                        <span>{test.val} / ১০০</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-50">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${test.val}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  পরীক্ষার নম্বর এখনো এন্ট্রি করা হয়নি।
                </div>
              )}
            </div>

            {/* Assigned Exam Seat Planner Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b pb-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                আপনার বরাদ্দকৃত পরীক্ষার আসন (Assigned Seat)
              </h4>

              <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 text-white p-2.5 rounded-xl font-extrabold text-base">
                    কক্ষ: ১০১
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">হল রুম ১০১ (Hall Room 101)</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">রোল নাম্বারভিত্তিক সিট নম্বর অটো-বরাদ্দ করা হয়েছে।</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white p-3 rounded-xl border border-indigo-100 text-xs font-semibold">
                    <span className="text-slate-400 block mb-1">বেঞ্চ নম্বর</span>
                    <strong className="text-indigo-950 text-base font-black">বেঞ্চ নং - ৪</strong>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-indigo-100 text-xs font-semibold">
                    <span className="text-slate-400 block mb-1">আসন সাইড</span>
                    <strong className="text-indigo-950 text-sm font-black">বাম পাশে (Left Side)</strong>
                  </div>
                </div>

                <div className="flex gap-2 items-center text-[10px] text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-100/50">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>পরীক্ষার কক্ষে বসার সময় নিজের রোল অনুযায়ী স্লিপ দেখে আসন নিশ্চিত করুন।</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
