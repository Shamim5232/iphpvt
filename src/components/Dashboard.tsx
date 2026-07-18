import React, { useMemo, useState, useEffect } from 'react';
import { Student, Batch, AttendanceRecord, FeeCollection, ModelTestMark } from '../types';
import { Language, translations } from '../utils/translations';
import { getMonthsDifference, isFriday } from '../utils/dateHelpers';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  Users,
  CreditCard,
  Award,
  CalendarCheck,
  TrendingUp,
  Sparkles,
  Plus,
  Star,
  AlertCircle,
  Phone,
  Search,
  Bell,
  Coins,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  ShieldCheck
} from 'lucide-react';

interface DashboardProps {
  students: Student[];
  batches: Batch[];
  attendance: AttendanceRecord[];
  fees: FeeCollection[];
  modelTests: ModelTestMark[];
  setActiveTab: (tab: string) => void;
  lang: Language;
}

export default function Dashboard({
  students,
  batches,
  attendance,
  fees,
  modelTests,
  setActiveTab,
  lang,
}: DashboardProps) {

  const t = translations[lang];

  const [unpaidSearch, setUnpaidSearch] = useState('');

  // Credentials Management State
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [credError, setCredError] = useState('');
  const [credSuccess, setCredSuccess] = useState('');

  // Load current User ID on mount
  useEffect(() => {
    const currentUserId = localStorage.getItem('sms_admin_user_id') || 'admin';
    setNewUserId(currentUserId);
  }, []);

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError('');
    setCredSuccess('');

    if (!newUserId.trim()) {
      setCredError('ইউজার আইডি খালি হতে পারে না!');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 4) {
        setCredError('পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে!');
        return;
      }
      if (newPassword !== confirmPassword) {
        setCredError('নিশ্চিতকরণ পাসওয়ার্ডটি মেলেনি!');
        return;
      }
    }

    localStorage.setItem('sms_admin_user_id', newUserId.trim());
    if (newPassword) {
      localStorage.setItem('sms_admin_password', newPassword);
    }

    setCredSuccess('লগইন ক্রেডেনশিয়াল সফলভাবে পরিবর্তন করা হয়েছে!');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      setCredSuccess('');
    }, 4000);
  };

  const unpaidStudents = useMemo(() => {
    const currentMonth = '2026-06';
    return students
      .map((student) => {
        const studentFee = fees.find(
          (f) => f.studentId === student.id && f.month === currentMonth
        );
        const batch = batches.find((b) => b.id === student.batchId);
        return {
          student,
          batchName: batch ? batch.name.split(' - ')[0] : 'অজানা',
          fee: studentFee,
          isUnpaid: !studentFee || studentFee.status !== 'Paid',
        };
      })
      .filter((item) => {
        if (!item.isUnpaid) return false;
        if (!unpaidSearch) return true;
        const query = unpaidSearch.toLowerCase();
        return (
          item.student.name.toLowerCase().includes(query) ||
          item.student.roll.includes(query) ||
          item.student.phone.includes(query)
        );
      });
  }, [students, fees, batches, unpaidSearch]);

  // Count total unpaid students (without search filter applied) for the main badge
  const totalUnpaidCount = useMemo(() => {
    const currentMonth = '2026-06';
    return students.filter((student) => {
      const studentFee = fees.find(
        (f) => f.studentId === student.id && f.month === currentMonth
      );
      return !studentFee || studentFee.status !== 'Paid';
    }).length;
  }, [students, fees]);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalBatches = batches.length;

    // Total fees collected across all time (Total Income)
    const paidFees = fees.filter((f) => f.status === 'Paid');
    const totalEarnings = paidFees.reduce((acc, curr) => acc + curr.amount, 0);

    // Current month paid fees (June 2026)
    const currentMonth = '2026-06';
    const paidFeesCurrentMonth = fees.filter((f) => f.status === 'Paid' && f.month === currentMonth);
    const currentMonthEarnings = paidFeesCurrentMonth.reduce((acc, curr) => acc + curr.amount, 0);

    // Total outstanding due across all students
    const totalDue = students.reduce((sum, student) => {
      const studentPaid = fees
        .filter((f) => f.studentId === student.id && f.status === 'Paid')
        .reduce((acc, curr) => acc + curr.amount, 0);
      const sCourseFee = student.paymentType === 'Monthly'
        ? (student.courseFee || 0) * getMonthsDifference(student.admissionDate)
        : (student.courseFee || 0);
      const studentDue = Math.max(sCourseFee - studentPaid, 0);
      return sum + studentDue;
    }, 0);

    // General Attendance Rate
    const nonFridayAttendance = attendance.filter((a) => !isFriday(a.date));
    const totalAttRecords = nonFridayAttendance.length;
    const presentCount = nonFridayAttendance.filter((a) => a.status === 'Present').length;
    const averageAttendance = totalAttRecords > 0 ? (presentCount / totalAttRecords) * 100 : 0;

    return {
      totalStudents,
      totalBatches,
      totalEarnings,
      currentMonthEarnings,
      totalDue,
      averageAttendance,
    };
  }, [students, batches, attendance, fees]);

  // Compute best student of the month (June 2026) for the dashboard widget
  const dashboardBestStudent = useMemo(() => {
    if (students.length === 0) return null;

    const leaderBoard = students
      .map((student) => {
        const studentAttendance = attendance.filter(
          (a) => a.studentId === student.id && a.date.startsWith('2026-06') && !isFriday(a.date)
        );
        const totalDays = studentAttendance.length;
        const presentDays = studentAttendance.filter((a) => a.status === 'Present').length;
        const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

        const testMark = modelTests.find(
          (m) => m.studentId === student.id && m.month === '2026-06'
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

        const totalScore = attendanceRate * 0.4 + avgMark * 0.6;

        return {
          student,
          totalScore,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);

    return leaderBoard[0]?.totalScore > 0 ? leaderBoard[0] : null;
  }, [students, attendance, modelTests]);

  // Helper to convert numbers to Bengali characters based on language
  const toBengaliNum = (num: number | string): string => {
    if (lang === 'bn') {
      const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return num.toString().replace(/\d/g, (d) => banglaDigits[Number(d)] || d);
    }
    return num.toString();
  };

  // Helper to get today's date in proper format dynamically based on language
  const getBengaliTodayDate = (): string => {
    const today = new Date();
    if (lang === 'bn') {
      const day = today.getDate();
      const monthIndex = today.getMonth();
      const year = today.getFullYear();
      const monthsBn = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
      ];
      return `${toBengaliNum(day)} ${monthsBn[monthIndex]}, ${toBengaliNum(year)}`;
    } else {
      return today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  // last 7 days attendance trend calculation
  const last7DaysAttendance = useMemo(() => {
    // Group attendance records by date
    const grouped: { [date: string]: { present: number; total: number } } = {};
    
    attendance.forEach((rec) => {
      if (!grouped[rec.date]) {
        grouped[rec.date] = { present: 0, total: 0 };
      }
      grouped[rec.date].total += 1;
      if (rec.status === 'Present') {
        grouped[rec.date].present += 1;
      }
    });

    // Convert to array and sort chronologically (alphabetic YYYY-MM-DD sorting is correct chronological)
    const datesArray = Object.keys(grouped).sort();
    
    // Get last 7 unique dates
    const last7Dates = datesArray.slice(-7);

    const monthNamesBn: { [key: string]: string } = {
      '01': 'জানুয়ারি', '02': 'ফেব্রুয়ারি', '03': 'মার্চ', '04': 'এপ্রিল',
      '05': 'মে', '06': 'জুন', '07': 'জুলাই', '08': 'আগস্ট',
      '09': 'সেপ্টেম্বর', '10': 'অক্টোবর', '11': 'নভেম্বর', '12': 'ডিসেম্বর'
    };

    const monthNamesEn: { [key: string]: string } = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
      '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
      '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
    };

    const formatBnDate = (dateStr: string) => {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        const month = parts[1];
        if (lang === 'bn') {
          return `${toBengaliNum(day)} ${monthNamesBn[month] || month}`;
        } else {
          return `${day} ${monthNamesEn[month] || month}`;
        }
      }
      return dateStr;
    };

    return last7Dates.map((date) => {
      const { present, total } = grouped[date];
      const rate = total > 0 ? (present / total) * 100 : 0;
      return {
        date,
        formattedDate: formatBnDate(date),
        rate: parseFloat(rate.toFixed(1)),
        rateLabel: `${toBengaliNum(rate.toFixed(1))}%`,
        present,
        total,
      };
    });
  }, [attendance, lang]);

  return (
    <div id="dashboard-module" className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-slate-900/10">
        <div className="space-y-2 relative z-10">
          <span className="bg-blue-600 text-[10px] font-black tracking-widest px-3 py-1 rounded-md uppercase">
            {lang === 'bn' ? 'সহজ ও প্রফেশনাল ম্যানেজমেন্ট পোর্টাল' : 'Simple & Professional Management Portal'}
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter font-display leading-tight">
            {lang === 'bn' ? 'স্মার্ট কোচিং ও একাডেমি সফটওয়্যার' : 'Smart Academy Management Software'}
          </h1>
          <p className="text-slate-300 font-medium text-xs md:text-sm">
            {lang === 'bn' 
              ? `আজকের দিন: ${getBengaliTodayDate()} | সকল শিক্ষার্থী ভর্তি, বেতন কালেকশন, রেজাল্ট এবং সিট প্ল্যান এখন এক জায়গায়।` 
              : `Today: ${getBengaliTodayDate()} | All student admissions, fees, test results, and seat plans are now in one place.`}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('admission')}
          className="bg-white hover:bg-slate-100 text-slate-900 font-black px-6 py-3 rounded-lg transition-all text-xs md:text-sm flex items-center gap-2 self-stretch md:self-auto text-center justify-center relative z-10 shrink-0"
        >
          <Plus className="h-4.5 w-4.5 stroke-[3px]" /> {lang === 'bn' ? 'নতুন ছাত্র ভর্তি' : 'New Admission'}
        </button>

        {/* Dynamic Theme Glow Blobs */}
        <div className="w-40 h-40 bg-blue-600 rounded-full blur-[80px] absolute -right-10 -bottom-10 opacity-60"></div>
        <div className="w-32 h-32 bg-indigo-500 rounded-full blur-[60px] absolute right-20 -top-10 opacity-30"></div>
      </div>

      {/* Analytical Counters (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Students */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex items-center gap-4 hover:border-slate-300 transition duration-150">
          <div className="bg-blue-50 p-3.5 rounded-lg text-blue-600">
            <Users className="h-6 w-6 stroke-[2.5px]" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">{t.dash_total_students}</span>
            <strong className="text-3xl font-black text-slate-900 tracking-tight font-display">
              {toBengaliNum(stats.totalStudents)} <span className="text-xs font-bold text-slate-400">{lang === 'bn' ? 'জন' : ''}</span>
            </strong>
          </div>
        </div>

        {/* Total Batches */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex items-center gap-4 hover:border-slate-300 transition duration-150">
          <div className="bg-emerald-50 p-3.5 rounded-lg text-emerald-600">
            <TrendingUp className="h-6 w-6 stroke-[2.5px]" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">{t.dash_active_batches}</span>
            <strong className="text-3xl font-black text-slate-900 tracking-tight font-display">
              {toBengaliNum(stats.totalBatches)} <span className="text-xs font-bold text-slate-400">{lang === 'bn' ? 'টি' : ''}</span>
            </strong>
          </div>
        </div>

        {/* Current Month Fee Collected */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex items-center gap-4 hover:border-slate-300 transition duration-150">
          <div className="bg-indigo-50 p-3.5 rounded-lg text-indigo-600">
            <CreditCard className="h-6 w-6 stroke-[2.5px]" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
              {lang === 'bn' ? 'চলতি মাসের আদায়' : 'Current Month Collected'}
            </span>
            <strong className="text-3xl font-black text-slate-900 tracking-tight font-display">
              {lang === 'bn' ? '৳' : 'BDT '}{toBengaliNum(stats.currentMonthEarnings)}
            </strong>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex items-center gap-4 hover:border-slate-300 transition duration-150">
          <div className="bg-amber-50 p-3.5 rounded-lg text-amber-600">
            <Coins className="h-6 w-6 stroke-[2.5px]" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
              {lang === 'bn' ? 'সর্বমোট আদায় (ইনকাম)' : 'Total Collections (All Time)'}
            </span>
            <strong className="text-3xl font-black text-slate-900 tracking-tight font-display">
              {lang === 'bn' ? '৳' : 'BDT '}{toBengaliNum(stats.totalEarnings)}
            </strong>
          </div>
        </div>

        {/* Total Due */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex items-center gap-4 hover:border-slate-300 transition duration-150 relative overflow-visible">
          <div className="bg-rose-50 p-3.5 rounded-lg text-rose-600">
            <AlertCircle className="h-6 w-6 stroke-[2.5px]" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
              {lang === 'bn' ? 'সর্বমোট বকেয়া (Due)' : 'Total Outstanding Due'}
            </span>
            <strong className="text-3xl font-black text-rose-600 tracking-tight font-display">
              {lang === 'bn' ? '৳' : 'BDT '}{toBengaliNum(stats.totalDue)}
            </strong>
          </div>
          {totalUnpaidCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white animate-pulse"
              title={lang === 'bn' ? `${toBengaliNum(totalUnpaidCount)} জনের বেতন বকেয়া রয়েছে` : `${totalUnpaidCount} students have dues`}
            >
              {toBengaliNum(totalUnpaidCount)}
            </span>
          )}
        </div>

        {/* Attendance Rate */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex items-center gap-4 hover:border-slate-300 transition duration-150">
          <div className="bg-teal-50 p-3.5 rounded-lg text-teal-600">
            <CalendarCheck className="h-6 w-6 stroke-[2.5px]" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
              {lang === 'bn' ? 'গড় উপস্থিতি হার' : 'Avg Attendance Rate'}
            </span>
            <strong className="text-3xl font-black text-slate-900 tracking-tight font-display">
              {toBengaliNum(stats.averageAttendance.toFixed(1))}%
            </strong>
          </div>
        </div>
      </div>

      {/* Main dashboard widgets columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Students & Fee Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fee Due Notification Card */}
          {totalUnpaidCount > 0 && (
            <div className="bg-white p-6 border border-rose-100 rounded-2xl shadow-sm shadow-rose-500/5 space-y-4 relative overflow-hidden">
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500 rounded-l-2xl"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-3 pl-2">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-50 p-2 rounded-xl text-rose-500">
                    <Bell className="h-5 w-5 animate-bounce stroke-[2.5px]" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg font-display flex items-center gap-2">
                      {lang === 'bn' ? 'বেতন বকেয়া নোটিফিকেশন' : 'Fee Dues Notification'}{' '}
                      <span className="text-[10px] font-mono tracking-widest bg-rose-500 text-white px-2 py-0.5 rounded-md font-bold">DUE ALERT</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'bn' 
                        ? `চলতি মাস (জুন ২০২৬)-এর জন্য বকেয়া বেতন থাকা শিক্ষার্থীর তালিকা`
                        : `Students with outstanding fees for the current month (June 2026)`}
                    </p>
                  </div>
                </div>
                <span className="bg-rose-100 text-rose-800 text-xs px-3 py-1.5 rounded-full font-black self-start sm:self-auto shadow-sm">
                  {lang === 'bn' ? `${toBengaliNum(totalUnpaidCount)} জন বকেয়া` : `${totalUnpaidCount} Due`}
                </span>
              </div>

              {/* Search Bar inside widget */}
              <div className="relative pl-2">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.dash_search_placeholder}
                  value={unpaidSearch}
                  onChange={(e) => setUnpaidSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-700 font-bold transition-all bg-slate-50/50"
                />
              </div>

              {/* Scrollable list of unpaid students */}
              <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto pr-1 pl-2 space-y-0.5">
                {unpaidStudents.length > 0 ? (
                  unpaidStudents.map(({ student, batchName, fee }) => (
                    <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3 first:pt-0 last:pb-0 hover:bg-slate-50/40 px-2 rounded-lg transition duration-150">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                          <span className="text-[10px] font-semibold font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {batchName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                          <span>{lang === 'bn' ? 'রোল:' : 'Roll:'} <strong className="text-slate-700">{toBengaliNum(student.roll)}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <a href={`tel:${student.phone}`} className="hover:underline font-mono text-slate-600 font-semibold">{student.phone}</a>
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Status Badge */}
                        {fee?.status === 'Pending' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-100">
                            {lang === 'bn' ? 'পেন্ডিং (Pending)' : 'Pending'}
                          </span>
                        ) : fee?.status === 'Unpaid' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-100">
                            {lang === 'bn' ? 'অপরিশোধিত (Unpaid)' : 'Unpaid'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase bg-slate-50 text-slate-600 border border-slate-100">
                            {lang === 'bn' ? 'কোনো এন্ট্রি নেই (No Entry)' : 'No Entry'}
                          </span>
                        )}

                        <button
                          onClick={() => setActiveTab('fees')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-sm shadow-indigo-600/10"
                        >
                          {lang === 'bn' ? 'বেতন আপডেট' : 'Update Fees'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 font-bold text-xs">
                    {lang === 'bn' ? 'কোনো বকেয়া শিক্ষার্থী পাওয়া যায়নি।' : 'No outstanding students found.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attendance Trend Line Chart Card */}
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg font-display flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-teal-600 stroke-[2.5px]" />
                  {lang === 'bn' ? 'উপস্থিতি হার বিশ্লেষণ (Attendance Rate Trend)' : 'Attendance Trend Analysis'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'bn' 
                    ? 'বিগত ৭টি কার্যদিবসে শিক্ষার্থীদের গড় উপস্থিতির ধারাবাহিক পরিবর্তন ও ট্রেন্ড'
                    : 'Average daily attendance trend of students for the last 7 active sessions'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-[10px] text-teal-800 font-extrabold uppercase tracking-wider">
                  {lang === 'bn' ? 'রিয়েল-টাইম ট্রেন্ড' : 'Live Trend'}
                </span>
              </div>
            </div>

            {/* Recharts Line Chart Container */}
            <div className="w-full h-[280px] pt-4 pr-2 font-sans text-xs">
              {last7DaysAttendance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={last7DaysAttendance}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="formattedDate"
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(val) => `${toBengaliNum(val)}%`}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-950/95 text-white p-3.5 rounded-xl border border-slate-800 text-xs shadow-xl backdrop-blur-xs font-sans space-y-1">
                              <p className="font-bold text-slate-300">{data.formattedDate}</p>
                              <p className="flex items-center gap-1.5 font-bold text-sm">
                                <span className="h-2 w-2 rounded-full bg-teal-400"></span>
                                {lang === 'bn' ? 'গড় উপস্থিতি:' : 'Avg Attendance:'}{' '}
                                <span className="text-teal-400 font-black">{data.rateLabel}</span>
                              </p>
                              <div className="border-t border-slate-800 my-1 pt-1 text-[10px] text-slate-400 font-medium space-y-0.5">
                                <p>{lang === 'bn' ? 'উপস্থিত:' : 'Present:'} {toBengaliNum(data.present)} {lang === 'bn' ? 'জন' : ''}</p>
                                <p>{lang === 'bn' ? 'মোট রেকর্ড:' : 'Total Records:'} {toBengaliNum(data.total)} {lang === 'bn' ? 'জন' : ''}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#0d9488"
                      strokeWidth={3.5}
                      dot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#0d9488' }}
                      activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 2, fill: '#0d9488' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 font-semibold gap-2 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <AlertCircle className="h-8 w-8 text-slate-300" />
                  <span>{lang === 'bn' ? 'ট্রেন্ড দেখানোর মতো পর্যাপ্ত উপস্থিতির তথ্য নেই!' : 'Insufficient attendance data to calculate trend!'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Admissions */}
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg font-display flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> {lang === 'bn' ? 'সাম্প্রতিক ভর্তি' : 'Recent Admissions'}
              </h3>
              <button
                onClick={() => setActiveTab('admission')}
                className="text-xs text-blue-600 hover:text-blue-800 font-black tracking-tight"
              >
                {lang === 'bn' ? 'সব দেখুন →' : 'View All →'}
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {students.slice(-4).reverse().map((student) => {
                const b = batches.find((batch) => batch.id === student.batchId);
                return (
                  <div key={student.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lang === 'bn' ? 'রোল:' : 'Roll:'} {toBengaliNum(student.roll)} | {lang === 'bn' ? 'ব্যাচ:' : 'Batch:'}{' '}
                        <span className="font-bold text-slate-700">{b ? b.name.split(' - ')[0] : (lang === 'bn' ? 'অজানা' : 'Unknown')}</span>
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 border border-slate-100 rounded font-semibold">
                      {toBengaliNum(student.admissionDate)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-lg font-display border-b border-slate-100 pb-3">
              {lang === 'bn' ? 'কুইক অ্যাকশন নেভিগেশন' : 'Quick Actions'}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: lang === 'bn' ? 'হাজিরা' : 'Attendance', tab: 'attendance', color: 'bg-blue-50 border border-blue-100 hover:border-blue-200 text-blue-700' },
                { label: lang === 'bn' ? 'মডেল টেস্ট' : 'Model Tests', tab: 'model_tests', color: 'bg-emerald-50 border border-emerald-100 hover:border-emerald-200 text-emerald-700' },
                { label: lang === 'bn' ? 'সেরা ছাত্র' : 'Best Student', tab: 'best_student', color: 'bg-amber-50 border border-amber-100 hover:border-amber-200 text-amber-700' },
                { label: lang === 'bn' ? 'প্রবেশপত্র' : 'Admit Card', tab: 'admit_card', color: 'bg-purple-50 border border-purple-100 hover:border-purple-200 text-purple-700' },
              ].map((act, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(act.tab)}
                  className={`p-4 rounded-xl text-xs font-bold ${act.color} text-center active:scale-95 transition-all cursor-pointer`}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Best Student widget & stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Best Student widget */}
          {dashboardBestStudent && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl text-center space-y-4 relative overflow-hidden">
              {/* Gold design glow */}
              <div className="w-32 h-32 bg-amber-500 rounded-full blur-[60px] absolute -right-6 -top-6 opacity-30"></div>
              
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500 text-slate-950 px-2.5 py-1 rounded-md inline-block">
                  {lang === 'bn' ? 'চলতি মাসের সেরা শিক্ষার্থী' : 'Student of the Month'}
                </span>
                <h4 className="text-xl font-black mt-2 font-display text-amber-400">BEST STUDENT OF THE MONTH</h4>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-2 relative z-10">
                <h3 className="text-2xl font-black font-display text-white">{dashboardBestStudent.student.name}</h3>
                <p className="text-xs text-slate-400">{lang === 'bn' ? 'রোল:' : 'Roll:'} <span className="font-bold text-slate-200">{toBengaliNum(dashboardBestStudent.student.roll)}</span></p>
                <div className="inline-block bg-amber-500/10 text-amber-400 text-xs px-3 py-1 border border-amber-500/20 rounded font-black mt-1">
                  {lang === 'bn' ? 'মোট স্কোর:' : 'Performance Score:'} {toBengaliNum(dashboardBestStudent.totalScore.toFixed(1))} / ১০০
                </div>
              </div>

              <button
                onClick={() => setActiveTab('best_student')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-lg text-xs transition duration-150 shadow-lg shadow-amber-500/10 relative z-10 uppercase tracking-wider cursor-pointer"
              >
                {lang === 'bn' ? 'সার্টিফিকেট ও রিপোর্ট দেখুন' : 'View Certificate & Reports'}
              </button>
            </div>
          )}

          {/* Quick Stats overview of fee collection channels */}
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-black text-slate-900 text-lg font-display border-b border-slate-100 pb-3">
              {lang === 'bn' ? 'ফি আদায় মাধ্যম বিশ্লেষণ' : 'Fee Channels Analysis'}
            </h4>

            <div className="space-y-4">
              {[
                { label: lang === 'bn' ? 'বিকাশ (bKash)' : 'bKash', count: fees.filter((f) => f.paymentMethod === 'bKash' && f.status === 'Paid').length, color: 'bg-pink-500' },
                { label: lang === 'bn' ? 'ক্যাশ (Cash)' : 'Cash', count: fees.filter((f) => f.paymentMethod === 'Cash' && f.status === 'Paid').length, color: 'bg-emerald-500' },
                { label: lang === 'bn' ? 'নগদ (Nagad)' : 'Nagad', count: fees.filter((f) => f.paymentMethod === 'Nagad' && f.status === 'Paid').length, color: 'bg-orange-500' },
                { label: lang === 'bn' ? 'অন্যান্য মাধ্যম' : 'Other Channels', count: fees.filter((f) => !['bKash', 'Cash', 'Nagad'].includes(f.paymentMethod) && f.status === 'Paid').length, color: 'bg-blue-500' },
              ].map((channel, index) => {
                const totalPaid = fees.filter((f) => f.status === 'Paid').length;
                const percentage = totalPaid > 0 ? (channel.count / totalPaid) * 100 : 0;

                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{channel.label}</span>
                      <span className="font-mono text-slate-500">
                        {toBengaliNum(channel.count)} {lang === 'bn' ? 'টি পেমেন্ট' : ' payments'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${channel.color} h-full rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Credentials Changer Widget */}
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">{lang === 'bn' ? 'অ্যাডমিন সিকিউরিটি সেটিংস' : 'Admin Security'}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Update Login Credentials</p>
              </div>
            </div>

            {credError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-2.5 rounded-xl text-xs font-bold">
                {credError}
              </div>
            )}

            {credSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Check className="h-4 w-4 stroke-[3px] text-emerald-600" />
                {credSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateCredentials} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600">{lang === 'bn' ? 'ইউজার আইডি (User ID)' : 'User ID'}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-800 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600">{lang === 'bn' ? 'নতুন পাসওয়ার্ড (New Password)' : 'New Password'}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder={lang === 'bn' ? 'অপরিবর্তিত রাখতে খালি রাখুন' : 'Leave blank to keep unchanged'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-800 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {newPassword && (
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-600">{lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)' : 'Confirm Password'}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      placeholder={lang === 'bn' ? 'পাসওয়ার্ডটি আবার লিখুন' : 'Re-type password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-800 transition"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-2 rounded-xl text-xs transition cursor-pointer active:scale-98 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="h-4 w-4" />
                {lang === 'bn' ? 'তথ্য সংরক্ষণ করুন' : 'Update Credentials'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Developer Credit Footer */}
      <div className="pt-8 pb-4 border-t border-slate-200/60 text-center">
        <p className="text-xs text-slate-400 font-semibold tracking-wide">
          Developed By <span className="font-extrabold text-blue-600">ICT PVT HOME (Shamim)</span>
        </p>
      </div>
    </div>
  );
}
