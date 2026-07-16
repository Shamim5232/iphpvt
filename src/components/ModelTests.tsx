import React, { useState } from 'react';
import { Student, Batch, ModelTestMark } from '../types';
import { Award, Check, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';

interface ModelTestsProps {
  students: Student[];
  batches: Batch[];
  modelTests: ModelTestMark[];
  onSaveMarks: (marks: ModelTestMark[]) => void;
}

export default function ModelTests({
  students,
  batches,
  modelTests,
  onSaveMarks,
}: ModelTestsProps) {
  const getLocalMonthString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState(getLocalMonthString());
  const [isLoaded, setIsLoaded] = useState(false);
  const [showConfirmDemo, setShowConfirmDemo] = useState(false);
  const [editedMarks, setEditedMarks] = useState<Record<string, {
    test1: string;
    test2: string;
    test3: string;
    test4: string;
    test5: string;
  }>>({});

  // Sync selectedBatch when batches load
  React.useEffect(() => {
    if (!selectedBatch && batches.length > 0) {
      setSelectedBatch(batches[0].id);
    }
  }, [batches, selectedBatch]);

  const handleLoadMarks = () => {
    if (!selectedBatch || !selectedMonth) return;

    const filteredStudents = students.filter((s) => s.batchId === selectedBatch);
    const tempMarks: typeof editedMarks = {};

    filteredStudents.forEach((student) => {
      const match = modelTests.find(
        (m) => m.studentId === student.id && m.month === selectedMonth
      );
      tempMarks[student.id] = {
        test1: match && match.test1 !== -1 ? String(match.test1) : '',
        test2: match && match.test2 !== -1 ? String(match.test2) : '',
        test3: match && match.test3 !== -1 ? String(match.test3) : '',
        test4: match && match.test4 !== -1 ? String(match.test4) : '',
        test5: match && match.test5 !== -1 ? String(match.test5) : '',
      };
    });

    setEditedMarks(tempMarks);
    setIsLoaded(true);
  };

  const handleInputChange = (studentId: string, testKey: 'test1' | 'test2' | 'test3' | 'test4' | 'test5', value: string) => {
    // Restrict score to 0-100 or empty
    const num = parseInt(value, 10);
    if (value !== '' && (isNaN(num) || num < 0 || num > 100)) return;

    setEditedMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [testKey]: value,
      },
    }));
  };

  const handleSaveAll = () => {
    const updatedRecords: ModelTestMark[] = Object.keys(editedMarks).map((studentId) => {
      const tests = editedMarks[studentId];
      return {
        studentId,
        month: selectedMonth,
        test1: tests.test1 !== '' ? parseInt(tests.test1, 10) : -1,
        test2: tests.test2 !== '' ? parseInt(tests.test2, 10) : -1,
        test3: tests.test3 !== '' ? parseInt(tests.test3, 10) : -1,
        test4: tests.test4 !== '' ? parseInt(tests.test4, 10) : -1,
        test5: tests.test5 !== '' ? parseInt(tests.test5, 10) : -1,
      };
    });

    onSaveMarks(updatedRecords);
    Swal.fire({
      icon: 'success',
      title: 'মার্কস সংরক্ষিত!',
      text: 'সকল মডেল টেস্টের মার্কস সফলভাবে সংরক্ষণ করা হয়েছে।',
      confirmButtonColor: '#3B82F6',
      confirmButtonText: 'ঠিক আছে'
    });
  };

  const fillRandomMarks = () => {
    const randomized: typeof editedMarks = {};
    Object.keys(editedMarks).forEach((studentId) => {
      randomized[studentId] = {
        test1: String(Math.floor(Math.random() * 30) + 70), // 70 to 100
        test2: String(Math.floor(Math.random() * 30) + 70),
        test3: String(Math.floor(Math.random() * 30) + 70),
        test4: String(Math.floor(Math.random() * 30) + 70),
        test5: String(Math.floor(Math.random() * 30) + 70),
      };
    });
    setEditedMarks(randomized);
  };

  const batchStudents = students.filter((s) => s.batchId === selectedBatch);

  return (
    <div id="model-tests-module" className="space-y-6">
      {/* Title block */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Award className="h-6 w-6 text-indigo-600" />
            মডেল টেস্ট পরীক্ষার মার্কস শিট
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            প্রতি মাসে অনুষ্ঠিত ৫টি মডেল টেস্টের নম্বর আলাদা আলাদাভাবে সংরক্ষণ করুন।
          </p>
        </div>
        {isLoaded && batchStudents.length > 0 && (
          <button
            onClick={() => setShowConfirmDemo(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition duration-150"
            title="পরীক্ষামূলক ডেমো ডাটা তৈরি"
          >
            <Sparkles className="h-4 w-4" /> ডেমো নম্বর দিয়ে পূরণ করুন
          </button>
        )}
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm items-end">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">ব্যাচ নির্বাচন করুন</label>
          <select
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setIsLoaded(false);
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
          >
            <option value="">নির্বাচন করুন</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">মাস নির্বাচন করুন</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setIsLoaded(false);
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
          />
        </div>

        <button
          onClick={handleLoadMarks}
          disabled={!selectedBatch}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition"
        >
          <RefreshCw className="h-4 w-4" />
          মার্কস শিট লোড করুন
        </button>
      </div>

      {/* Grading Sheet Grid */}
      {isLoaded && (
        <div className="space-y-4">
          {batchStudents.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider text-center">
                      <th className="py-4 px-6 text-left w-12">রোল</th>
                      <th className="py-4 px-6 text-left">ছাত্র/ছাত্রী</th>
                      <th className="py-4 px-3 w-24">মডেল টেস্ট ১</th>
                      <th className="py-4 px-3 w-24">মডেল টেস্ট ২</th>
                      <th className="py-4 px-3 w-24">মডেল টেস্ট ৩</th>
                      <th className="py-4 px-3 w-24">মডেল টেস্ট ৪</th>
                      <th className="py-4 px-3 w-24">মডেল টেস্ট ৫</th>
                      <th className="py-4 px-4 w-28 bg-slate-50/50">গড় নম্বর (Avg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                    {batchStudents.map((s) => {
                      const studentMarks = editedMarks[s.id] || {
                        test1: '',
                        test2: '',
                        test3: '',
                        test4: '',
                        test5: '',
                      };

                      // Calculate average dynamically
                      const scores = [
                        parseInt(studentMarks.test1, 10),
                        parseInt(studentMarks.test2, 10),
                        parseInt(studentMarks.test3, 10),
                        parseInt(studentMarks.test4, 10),
                        parseInt(studentMarks.test5, 10),
                      ].filter((score) => !isNaN(score));

                      const avg =
                        scores.length > 0
                          ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
                          : '0.0';

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/30 transition text-center">
                          <td className="py-3 px-6 text-left font-semibold text-slate-800">
                            {s.roll}
                          </td>
                          <td className="py-3 px-6 text-left font-medium text-slate-900">
                            {s.name}
                          </td>

                          {/* Test 1 */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={studentMarks.test1}
                              onChange={(e) => handleInputChange(s.id, 'test1', e.target.value)}
                              placeholder="0"
                              className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                            />
                          </td>

                          {/* Test 2 */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={studentMarks.test2}
                              onChange={(e) => handleInputChange(s.id, 'test2', e.target.value)}
                              placeholder="0"
                              className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                            />
                          </td>

                          {/* Test 3 */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={studentMarks.test3}
                              onChange={(e) => handleInputChange(s.id, 'test3', e.target.value)}
                              placeholder="0"
                              className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                            />
                          </td>

                          {/* Test 4 */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={studentMarks.test4}
                              onChange={(e) => handleInputChange(s.id, 'test4', e.target.value)}
                              placeholder="0"
                              className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                            />
                          </td>

                          {/* Test 5 */}
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={studentMarks.test5}
                              onChange={(e) => handleInputChange(s.id, 'test5', e.target.value)}
                              placeholder="0"
                              className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                            />
                          </td>

                          {/* Average Display */}
                          <td className="py-2 px-4 bg-slate-50/50 font-bold text-slate-800 text-sm">
                            {avg} <span className="text-[10px] text-slate-400">/ 100</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm text-slate-400 flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-slate-300" />
              এই ব্যাচে কোনো ছাত্র/ছাত্রী খুঁজে পাওয়া যায়নি।
            </div>
          )}

          {/* Action Buttons */}
          {batchStudents.length > 0 && (
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleSaveAll}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-emerald-100 transition"
              >
                <Check className="h-5 w-5" />
                মার্কস সংরক্ষণ করুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150 text-left">
            <div className="p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 text-center font-display">
                কনফার্ম করুন
              </h3>
              <p className="text-sm text-slate-500 font-semibold text-center mt-2 leading-relaxed">
                আপনি কি এই ব্যাচের ছাত্র/ছাত্রীদের জন্য ডেমো মার্কস জেনারেট করতে চান? এটি বিদ্যমান অসংরক্ষিত ডাটা ওভাররাইট করতে পারে।
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  fillRandomMarks();
                  setShowConfirmDemo(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
              >
                জেনারেট করুন
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDemo(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
