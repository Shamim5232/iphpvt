import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { Student, Batch, AttendanceRecord, FeeCollection, ModelTestMark, Note, Course, SchoolClass } from './types';
import {
  initialStudents,
  initialBatches,
  initialAttendance,
  initialFees,
  initialModelTests,
  initialClasses,
  initialCourses,
} from './data/mockData';

// Component Imports
import Dashboard from './components/Dashboard';
import Admission from './components/Admission';
import Attendance from './components/Attendance';
import Fees from './components/Fees';
import IncomeChart from './components/IncomeChart';
import Notes from './components/Notes';
import ModelTests from './components/ModelTests';
import BestStudent from './components/BestStudent';
import AdmitCard from './components/AdmitCard';
import SeatPlan from './components/SeatPlan';
import StudentDashboard from './components/StudentDashboard';
import XamppExport from './components/XamppExport';
import Login from './components/Login';
import SystemSettings from './components/System Settings';
import ExamModule from './components/ExamModule';
import GroupMessage from './components/GroupMessage';
import { Language, translations } from './utils/translations';

// Icons
import {
  LayoutDashboard,
  UserPlus,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Award,
  Trophy,
  FileBadge,
  Grid,
  UserCheck,
  Server,
  BookOpen,
  StickyNote,
  Menu,
  X,
  LogOut,
  Settings,
  FileSpreadsheet,
  MessageSquare,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('sms_active_tab') || 'dashboard';
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('sms_language') || 'bn') as Language;
  });

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('sms_language', newLang);
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Core States
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [fees, setFees] = useState<FeeCollection[]>([]);
  const [modelTests, setModelTests] = useState<ModelTestMark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // XAMPP Connection & Sync States
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('sms_xampp_api_url') || 'http://localhost/student-app/api.php';
  });
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isOfflineBannerDismissed, setIsOfflineBannerDismissed] = useState(() => {
    return sessionStorage.getItem('sms_offline_banner_dismissed') === 'true';
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check authentication state on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem('sms_is_authenticated') === 'true';
    setIsAuthenticated(isAuth);
  }, []);

  // Persist activeTab when it changes
  useEffect(() => {
    localStorage.setItem('sms_active_tab', activeTab);
  }, [activeTab]);

  const handleLogout = () => {
    sessionStorage.removeItem('sms_is_authenticated');
    setIsAuthenticated(false);
  };

  // Function to load entire backup payload directly from XAMPP Server database
  const loadDataFromXampp = async (customUrl?: string, isManualClick = false) => {
    const url = customUrl || localStorage.getItem('sms_xampp_api_url') || apiUrl;
    if (!url) return;
    setIsConnecting(true);
    
    if (isManualClick) {
      setIsOfflineBannerDismissed(false);
      sessionStorage.removeItem('sms_offline_banner_dismissed');
      sessionStorage.removeItem('sms_offline_alerted');
    }
    
    try {
      const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}action=export_backup&_t=${Date.now()}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const responseText = await response.text();
      let res;
      let isJson = false;
      try {
        res = JSON.parse(responseText);
        isJson = true;
      } catch (e) {
        // Not JSON format
      }

      // If server returned a valid error JSON (even if status code is 200 or 500)
      if (isJson && res && res.status === 'error') {
        throw new Error(res.message || 'XAMPP Server Error');
      }

      if (!response.ok) {
        if (isJson && res && res.message) {
          throw new Error(res.message);
        }
        throw new Error(`HTTP Error Status: ${response.status} ${response.statusText}`);
      }

      if (isJson && res && (res.students !== undefined || res.batches !== undefined)) {
        setStudents(res.students || []);
        setBatches(res.batches || []);
        setClasses(res.classes && res.classes.length > 0 ? res.classes : initialClasses);
        setCourses(res.courses && res.courses.length > 0 ? res.courses : initialCourses);
        if (res.sessions !== undefined && Array.isArray(res.sessions)) {
          setSessions(res.sessions);
        }
        setAttendance(res.attendance || []);
        setFees(res.fees || []);
        setModelTests(res.modelTests || []);
        setNotes(res.notes || []);
        setIsServerOffline(false);
        setServerError(null);
        // Clear session storage if successfully connected
        sessionStorage.removeItem('sms_offline_banner_dismissed');
        sessionStorage.removeItem('sms_offline_alerted');
      } else if (isJson && res) {
        if (res.status === 'info' || (res.usage !== undefined)) {
          throw new Error('আউটডেটেড API স্ক্রিপ্ট! আপনার api.php ফাইলটি পুরোনো। অনুগ্রহ করে "XAMPP Sync" ট্যাব থেকে নতুন সম্পূর্ণ PHP কোডটি কপি করে আপনার htdocs/student-app/api.php ফাইলে পুনরায় সেভ করুন।');
        }
        throw new Error(`Invalid database format: JSON response does not contain student or batch data keys. Received: ${JSON.stringify(res).slice(0, 150)}`);
      } else {
        if (responseText.trim().startsWith('<') || responseText.includes('<b>') || responseText.includes('<br')) {
          const cleanText = responseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          throw new Error(`PHP Error/Warning: ${cleanText.slice(0, 300)}...`);
        } else {
          throw new Error(`Invalid JSON format: ${responseText.slice(0, 150)}`);
        }
      }
    } catch (e: any) {
      console.warn('XAMPP server offline or unconfigured on start:', e);
      setIsServerOffline(true);
      setServerError(e.message || String(e));
      
      if (isManualClick) {
        setIsOfflineBannerDismissed(true);
        sessionStorage.setItem('sms_offline_banner_dismissed', 'true');
        sessionStorage.setItem('sms_offline_alerted', 'true');
        Swal.fire({
          icon: 'warning',
          title: 'লোকাল সার্ভার অফলাইন',
          text: 'লোকাল সার্ভার সংযোগ করা যায়নি। তবে আপনি অফলাইন মোডে নিশ্চিন্তে আপনার কাজ চালিয়ে যেতে পারেন। পরবর্তীতে ডাটাবেজ অন হলে তা অটো-সিঙ্ক হয়ে যাবে।',
          confirmButtonColor: '#2563eb'
        });
      }
      
      // Load from localStorage backup if available
      const localStudentsStr = localStorage.getItem('sms_students');
      if (localStudentsStr) {
        try {
          const s = JSON.parse(localStudentsStr);
          const b = JSON.parse(localStorage.getItem('sms_batches') || '[]');
          const c_list = JSON.parse(localStorage.getItem('sms_classes') || '[]');
          const co_list = JSON.parse(localStorage.getItem('sms_courses') || '[]');
          const ses = JSON.parse(localStorage.getItem('sms_sessions') || '[]');
          const att = JSON.parse(localStorage.getItem('sms_attendance') || '[]');
          const f = JSON.parse(localStorage.getItem('sms_fees') || '[]');
          const mt = JSON.parse(localStorage.getItem('sms_model_tests') || '[]');
          const nt = JSON.parse(localStorage.getItem('sms_notes') || '[]');
          
          setStudents(s);
          setBatches(b);
          setClasses(c_list.length > 0 ? c_list : initialClasses);
          setCourses(co_list.length > 0 ? co_list : initialCourses);
          setSessions(ses);
          setAttendance(att);
          setFees(f);
          setModelTests(mt);
          setNotes(nt);

          const hasAlerted = sessionStorage.getItem('sms_offline_alerted_backup') === 'true';
          if (!hasAlerted) {
            sessionStorage.setItem('sms_offline_alerted_backup', 'true');
            setTimeout(() => {
              Swal.fire({
                title: 'অফলাইন মোড সক্রিয়!',
                text: 'XAMPP লোকাল সার্ভার অফলাইন থাকায় ব্রাউজার অটো-ব্যাকআপ থেকে শেষ সংরক্ষিত ডাটা সফলভাবে লোড করা হয়েছে।',
                icon: 'info',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 6000,
                timerProgressBar: true,
              });
            }, 1000);
          }
        } catch (parseErr) {
          console.error('Error parsing offline local storage backups:', parseErr);
          setStudents(initialStudents);
          setBatches(initialBatches);
          setClasses(initialClasses);
          setCourses(initialCourses);
          setAttendance(initialAttendance);
          setFees(initialFees);
          setModelTests(initialModelTests);
          setNotes([]);
        }
      } else {
        // Fallback to initial mockData so that the user never starts with an empty screen on first try
        setStudents(initialStudents);
        setBatches(initialBatches);
        setClasses(initialClasses);
        setCourses(initialCourses);
        setAttendance(initialAttendance);
        setFees(initialFees);
        setModelTests(initialModelTests);
        setNotes([]);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Try to load on mount and when API URL changes
  useEffect(() => {
    loadDataFromXampp();
  }, [apiUrl]);

  // Unified State Sync Handler to push changes exclusively to XAMPP MySQL database
  const handleStateChange = async (
    updater: {
      students?: Student[];
      batches?: Batch[];
      classes?: SchoolClass[];
      courses?: Course[];
      sessions?: string[];
      attendance?: AttendanceRecord[];
      fees?: FeeCollection[];
      modelTests?: ModelTestMark[];
      notes?: Note[];
    }
  ): Promise<boolean> => {
    const nextStudents = updater.students !== undefined ? updater.students : students;
    const nextBatches = updater.batches !== undefined ? updater.batches : batches;
    const nextClasses = updater.classes !== undefined ? updater.classes : classes;
    const nextCourses = updater.courses !== undefined ? updater.courses : courses;
    const nextSessions = updater.sessions !== undefined ? updater.sessions : sessions;
    const nextAttendance = updater.attendance !== undefined ? updater.attendance : attendance;
    const nextFees = updater.fees !== undefined ? updater.fees : fees;
    const nextModelTests = updater.modelTests !== undefined ? updater.modelTests : modelTests;
    const nextNotes = updater.notes !== undefined ? updater.notes : notes;

    // Commit state updates in-memory and write to local fallback storage immediately
    if (updater.students !== undefined) {
      setStudents(nextStudents);
      localStorage.setItem('sms_students', JSON.stringify(nextStudents));
    }
    if (updater.batches !== undefined) {
      setBatches(nextBatches);
      localStorage.setItem('sms_batches', JSON.stringify(nextBatches));
    }
    if (updater.classes !== undefined) {
      setClasses(nextClasses);
      localStorage.setItem('sms_classes', JSON.stringify(nextClasses));
    }
    if (updater.courses !== undefined) {
      setCourses(nextCourses);
      localStorage.setItem('sms_courses', JSON.stringify(nextCourses));
    }
    if (updater.sessions !== undefined) {
      setSessions(nextSessions);
      localStorage.setItem('sms_sessions', JSON.stringify(nextSessions));
    }
    if (updater.attendance !== undefined) {
      setAttendance(nextAttendance);
      localStorage.setItem('sms_attendance', JSON.stringify(nextAttendance));
    }
    if (updater.fees !== undefined) {
      setFees(nextFees);
      localStorage.setItem('sms_fees', JSON.stringify(nextFees));
    }
    if (updater.modelTests !== undefined) {
      setModelTests(nextModelTests);
      localStorage.setItem('sms_model_tests', JSON.stringify(nextModelTests));
    }
    if (updater.notes !== undefined) {
      setNotes(nextNotes);
      localStorage.setItem('sms_notes', JSON.stringify(nextNotes));
    }

    // Save to Auto-Backup History in localStorage (keep last 10 records)
    try {
      const getActionDescription = () => {
        if (updater.students !== undefined) {
          if (updater.students.length > students.length) return "নতুন শিক্ষার্থী ভর্তি";
          if (updater.students.length < students.length) return "শিক্ষার্থী তথ্য মুছে ফেলা";
          return "শিক্ষার্থীর তথ্য সংশোধন";
        }
        if (updater.batches !== undefined) {
          if (updater.batches.length > batches.length) return "নতুন ব্যাচ খোলা";
          if (updater.batches.length < batches.length) return "ব্যাচ মুছে ফেলা";
          return "ব্যাচের তথ্য সংশোধন";
        }
        if (updater.attendance !== undefined) return "উপস্থিতি রেকর্ড সংরক্ষণ";
        if (updater.fees !== undefined) {
          if (updater.fees.length > fees.length) return "নতুন ফি রসিদ তৈরি";
          return "ফি রসিদের অবস্থা সংশোধন";
        }
        if (updater.modelTests !== undefined) return "মডেল টেস্টের নম্বর সেভ";
        if (updater.classes !== undefined) return "শ্রেণী তালিকা আপডেট";
        if (updater.courses !== undefined) return "কোর্স তালিকা আপডেট";
        if (updater.notes !== undefined) return "নোটবুক মেমোরি আপডেট";
        if (updater.sessions !== undefined) return "সেশন তালিকা আপডেট";
        return "ডাটাবেজ অটো-ব্যাকআপ";
      };

      const actionName = getActionDescription();
      const prevBackupsStr = localStorage.getItem('sms_auto_backups') || '[]';
      let prevBackups = [];
      try {
        prevBackups = JSON.parse(prevBackupsStr);
        if (!Array.isArray(prevBackups)) prevBackups = [];
      } catch (e) {
        prevBackups = [];
      }

      const newBackup = {
        id: 'ab_' + Date.now(),
        timestamp: new Date().toISOString(),
        action: actionName,
        counts: {
          students: nextStudents.length,
          batches: nextBatches.length,
          classes: nextClasses.length,
          courses: nextCourses.length,
          attendance: nextAttendance.length,
          fees: nextFees.length,
          notes: nextNotes.length
        },
        data: {
          students: nextStudents,
          batches: nextBatches,
          classes: nextClasses,
          courses: nextCourses,
          sessions: nextSessions,
          attendance: nextAttendance,
          fees: nextFees,
          modelTests: nextModelTests,
          notes: nextNotes
        }
      };

      const nextBackups = [newBackup, ...prevBackups].slice(0, 10);
      localStorage.setItem('sms_auto_backups', JSON.stringify(nextBackups));
    } catch (err) {
      console.warn('Error saving auto backup snapshot:', err);
    }

    const url = localStorage.getItem('sms_xampp_api_url') || apiUrl;
    try {
      const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}action=bulk_sync`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          app: 'Student Management System',
          backupVersion: '2.0.0',
          exportedAt: new Date().toISOString(),
          students: nextStudents,
          batches: nextBatches,
          classes: nextClasses,
          courses: nextCourses,
          sessions: nextSessions,
          attendance: nextAttendance,
          fees: nextFees,
          modelTests: nextModelTests,
          notes: nextNotes
        })
      });

      const responseText = await response.text();
      let resData;
      try {
        resData = JSON.parse(responseText);
      } catch (jsonErr) {
        throw new Error('Invalid server JSON response');
      }

      if (resData.status === 'success') {
        const timeString = new Date().toLocaleTimeString();
        localStorage.setItem('sms_last_synced_time', timeString);
        setIsServerOffline(false);
        setServerError(null);
        sessionStorage.removeItem('sms_offline_alerted'); // Reset warning tracker on successful sync
        sessionStorage.removeItem('sms_offline_banner_dismissed');
        return true;
      } else {
        throw new Error(resData.message || 'Server sync failed');
      }
    } catch (e: any) {
      setIsServerOffline(true);
      setServerError(e.message || String(e));
      return false;
    }
  };

  // Student Actions
  const handleAddStudent = (newStudent: Omit<Student, 'id'>) => {
    const student: Student = {
      ...newStudent,
      id: 'st_' + Date.now(),
    };
    const updated = [...students, student];
    return handleStateChange({ students: updated });
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    return handleStateChange({ students: updated });
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    return handleStateChange({ students: updated });
  };

  const handleTransferStudent = (studentId: string, newBatchId: string) => {
    const updatedStudents = students.map((s) => (s.id === studentId ? { ...s, batchId: newBatchId } : s));
    const updatedAttendance = attendance.map((a) => (a.studentId === studentId ? { ...a, batchId: newBatchId } : a));
    return handleStateChange({
      students: updatedStudents,
      attendance: updatedAttendance,
    });
  };

  // Batch Actions
  const handleAddBatch = (newBatch: Omit<Batch, 'id'>) => {
    const batch: Batch = {
      ...newBatch,
      id: 'b_' + Date.now(),
    };
    const updated = [...batches, batch];
    return handleStateChange({ batches: updated });
  };

  const handleDeleteBatch = (id: string) => {
    const updated = batches.filter((b) => b.id !== id);
    return handleStateChange({ batches: updated });
  };

  const handleUpdateBatch = (updatedBatch: Batch) => {
    const updated = batches.map((b) => (b.id === updatedBatch.id ? updatedBatch : b));
    return handleStateChange({ batches: updated });
  };

  // Session Actions
  const handleAddSession = (newSession: string) => {
    if (sessions.includes(newSession)) return Promise.resolve(true);
    const updated = [...sessions, newSession];
    return handleStateChange({ sessions: updated });
  };

  const handleDeleteSession = (sessionToDelete: string) => {
    const updated = sessions.filter((s) => s !== sessionToDelete);
    return handleStateChange({ sessions: updated });
  };

  const handleRestoreData = (restoredData: {
    students?: Student[];
    batches?: Batch[];
    classes?: SchoolClass[];
    courses?: Course[];
    sessions?: string[];
    attendance?: AttendanceRecord[];
    fees?: FeeCollection[];
    modelTests?: ModelTestMark[];
    notes?: Note[];
  }) => {
    handleStateChange(restoredData);
  };

  // Attendance Actions
  const handleSaveAttendance = (date: string, records: Omit<AttendanceRecord, 'date'>[]) => {
    // Remove existing records for this date and batch
    const filtered = attendance.filter(
      (a) => !(a.date === date && a.batchId === records[0]?.batchId)
    );

    const newRecords = records.map((r) => ({ ...r, date }));
    const updated = [...filtered, ...newRecords];
    handleStateChange({ attendance: updated });
  };

  // SMS Payment Notification Trigger Helper
  const triggerPaymentSms = async (fee: FeeCollection) => {
    const isSmsEnabled = localStorage.getItem('sms_enabled') === 'true';
    if (!isSmsEnabled) return { status: 'Disabled' };

    const student = students.find((s) => s.id === fee.studentId);
    if (!student || !student.phone) {
      console.warn('SMS failed: student or phone not found for ID', fee.studentId);
      return { status: 'NoPhone' };
    }

    const gateway = localStorage.getItem('sms_gateway') || 'bulksmsbd';
    const apiKey = localStorage.getItem('sms_api_key') || '';
    const senderId = localStorage.getItem('sms_sender_id') || '';
    const username = localStorage.getItem('sms_username') || '';
    const customUrl = localStorage.getItem('sms_custom_url') || '';
    const useXamppProxy = localStorage.getItem('sms_use_xampp_proxy') === 'true';
    const template = localStorage.getItem('sms_template') || 'রশিদ নং: {receipt_no}। প্রিয় {name}, আপনার {month} মাসের ফি বাবদ {amount} টাকা সফলভাবে জমা হয়েছে। ধন্যবাদ!';

    const formatMonth = (monthStr: string) => {
      const parts = monthStr.split('-');
      if (parts.length === 2) {
        const monthsInBengali = [
          'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
          'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
        ];
        const monthIndex = parseInt(parts[1], 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${monthsInBengali[monthIndex]} ${parts[0]}`;
        }
      }
      return monthStr;
    };

    const msg = template
      .replace(/{name}/g, student.name)
      .replace(/{phone}/g, student.phone)
      .replace(/{amount}/g, fee.amount.toString())
      .replace(/{month}/g, formatMonth(fee.month))
      .replace(/{receipt_no}/g, fee.receiptNo)
      .replace(/{date}/g, new Date(fee.paymentDate || Date.now()).toLocaleDateString('bn-BD'));

    let url = '';
    if (gateway === 'bulksmsbd') {
      url = `https://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(apiKey)}&type=text&number=${encodeURIComponent(student.phone)}&senderid=${encodeURIComponent(senderId)}&message=${encodeURIComponent(msg)}`;
    } else if (gateway === 'greenweb') {
      url = `https://api.greenweb.com.bd/api.php?token=${encodeURIComponent(apiKey)}&to=${encodeURIComponent(student.phone)}&message=${encodeURIComponent(msg)}`;
    } else if (gateway === 'custom') {
      url = customUrl
        .replace(/{api_key}/g, encodeURIComponent(apiKey))
        .replace(/{sender_id}/g, encodeURIComponent(senderId))
        .replace(/{username}/g, encodeURIComponent(username))
        .replace(/{phone}/g, encodeURIComponent(student.phone))
        .replace(/{message}/g, encodeURIComponent(msg));
    }

    const logId = 'sms_' + Date.now();
    const newLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      phone: student.phone,
      studentName: student.name,
      message: msg,
      status: 'Pending' as 'Pending' | 'Success' | 'Failed',
      apiResponse: '',
    };

    // Save log
    const existingLogs = JSON.parse(localStorage.getItem('sms_history_logs') || '[]');
    localStorage.setItem('sms_history_logs', JSON.stringify([newLog, ...existingLogs].slice(0, 100)));

    if (useXamppProxy) {
      const apiUrl = localStorage.getItem('sms_xampp_api_url') || 'http://localhost/student-app/api.php';
      try {
        const response = await fetch(`${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=send_sms`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            to: student.phone,
            message: msg,
            url: url,
            gateway: gateway,
            api_key: apiKey,
            sender_id: senderId,
          }),
        });

        if (response.ok) {
          const res = await response.json();
          newLog.status = res.status === 'success' ? 'Success' : 'Failed';
          newLog.apiResponse = res.message || JSON.stringify(res);
        } else {
          newLog.status = 'Failed';
          newLog.apiResponse = `XAMPP Server returned HTTP ${response.status}`;
        }
      } catch (e: any) {
        newLog.status = 'Failed';
        newLog.apiResponse = `XAMPP proxy error: ${e.message || e}. Attempting direct browser fallback...`;
        
        // Fallback to direct send
        try {
          await fetch(url, { method: 'GET', mode: 'no-cors' });
          newLog.status = 'Success';
          newLog.apiResponse = 'Sent via browser direct fallback GET (No-CORS mode).';
        } catch (fallbackErr: any) {
          newLog.apiResponse += ` | Fallback error: ${fallbackErr.message || fallbackErr}`;
        }
      }
    } else {
      // Direct send (Try no-cors GET request which triggers sms sending)
      try {
        await fetch(url, { method: 'GET', mode: 'no-cors' });
        newLog.status = 'Success';
        newLog.apiResponse = 'Sent via browser direct GET (No-CORS mode).';
      } catch (err: any) {
        newLog.status = 'Failed';
        newLog.apiResponse = err.message || 'Direct browser send failed.';
      }
    }

    // Save final status log
    const updatedLogs = JSON.parse(localStorage.getItem('sms_history_logs') || '[]')
      .map((l: any) => l.id === logId ? newLog : l);
    localStorage.setItem('sms_history_logs', JSON.stringify(updatedLogs));

    return {
      status: newLog.status,
      apiResponse: newLog.apiResponse,
    };
  };

  // Fees Actions
  const handleAddFee = async (newFee: Omit<FeeCollection, 'id' | 'receiptNo'>) => {
    const fee: FeeCollection = {
      ...newFee,
      id: 'f_' + Date.now(),
      receiptNo: 'REC-' + new Date().toISOString().split('T')[0].replace(/-/g, '') + '-' + Math.floor(Math.random() * 90 + 10),
    };
    const updated = [...fees, fee];

    // Show loading SweetAlert immediately
    Swal.fire({
      title: 'পেমেন্ট সেভ হচ্ছে...',
      text: 'অনুগ্রহ করে অপেক্ষা করুন, ডাটা লোকাল ডাটাবেজে সংরক্ষণ করা হচ্ছে...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // First, update and sync state to MySQL
      await handleStateChange({ fees: updated });

      // Send SMS automatically if payment is completed
      if (fee.status === 'Paid') {
        Swal.fire({
          title: 'এসএমএস পাঠানো হচ্ছে...',
          text: 'পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে। শিক্ষার্থীর মোবাইলে নিশ্চিতকরণ এসএমএস পাঠানো হচ্ছে...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const smsRes = await triggerPaymentSms(fee);
        
        if (smsRes && smsRes.status === 'Success') {
          Swal.fire({
            icon: 'success',
            title: 'পেমেন্ট ও এসএমএস সফল!',
            html: `ফি কালেকশন সফলভাবে সম্পন্ন হয়েছে এবং লোকাল ডাটাবেজে সংরক্ষিত হয়েছে।<br><small class="text-emerald-600 font-bold font-sans">শিক্ষার্থীর মোবাইলে নিশ্চিতকরণ এসএমএস পাঠানো হয়েছে।</small>`,
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#2563eb',
          });
        } else if (smsRes && smsRes.status === 'Failed') {
          const isDnsError = smsRes.apiResponse && (
            smsRes.apiResponse.includes('Could not resolve host') || 
            smsRes.apiResponse.includes('Host resolution') ||
            smsRes.apiResponse.includes('Failed to connect')
          );
          
          let errorMsg = smsRes.apiResponse || 'অজানা ত্রুটি';
          if (isDnsError) {
            errorMsg = `ইন্টারনেট সংযোগ বিভ্রাট বা ডোমেন রেজল্যুশন সমস্যা (${smsRes.apiResponse})। অনুগ্রহ করে চেক করুন আপনার পিসিতে ইন্টারনেট সচল রয়েছে কিনা।`;
          }

          Swal.fire({
            icon: 'warning',
            title: 'পেমেন্ট সেভ হয়েছে কিন্তু এসএমএস যায়নি!',
            html: `ফি কালেকশন সফলভাবে সম্পন্ন হয়েছে, কিন্তু এসএমএস পাঠানো সম্ভব হয়নি।<br><br><span class="text-rose-600 text-xs font-semibold block bg-rose-50 p-2.5 rounded border border-rose-100 text-left font-mono">SMS Error: ${errorMsg}</span>`,
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#e0a800',
          });
        } else {
          // SMS Disabled or No Phone
          Swal.fire({
            icon: 'success',
            title: 'পেমেন্ট সফল!',
            text: 'ফি কালেকশন সফলভাবে সম্পন্ন হয়েছে ও লোকাল ডাটাবেজে সংরক্ষিত হয়েছে।',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#2563eb',
          });
        }
      } else {
        Swal.fire({
          icon: 'success',
          title: 'পেমেন্ট সেভ হয়েছে!',
          text: `ফি স্ট্যাটাস সফলভাবে '${fee.status === 'Pending' ? 'অপেক্ষমান' : 'অপরিশোধিত'}' হিসেবে সংরক্ষণ করা হয়েছে।`,
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
        });
      }
    } catch (error: any) {
      console.error("Failed to save fee: ", error);
      Swal.fire({
        icon: 'error',
        title: 'সংরক্ষণ ব্যর্থ হয়েছে!',
        text: `পেমেন্ট সেভ করার সময় ত্রুটি ঘটেছে: ${error.message || error}`,
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleUpdateFeeStatus = async (id: string, status: 'Paid' | 'Pending' | 'Unpaid', paymentDate?: string) => {
    const targetFee = fees.find((f) => f.id === id);
    const updated = fees.map((f) =>
      f.id === id ? { ...f, status, paymentDate: paymentDate || f.paymentDate } : f
    );

    // Show loading SweetAlert immediately
    Swal.fire({
      title: 'আপডেট হচ্ছে...',
      text: 'অনুগ্রহ করে অপেক্ষা করুন, ডাটা আপডেট করা হচ্ছে...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await handleStateChange({ fees: updated });

      // Send SMS automatically if status changed to Paid
      if (status === 'Paid' && targetFee && targetFee.status !== 'Paid') {
        Swal.fire({
          title: 'এসএমএস পাঠানো হচ্ছে...',
          text: 'পেমেন্ট স্ট্যাটাস আপডেট হয়েছে, নিশ্চিতকরণ এসএমএস পাঠানো হচ্ছে...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const smsRes = await triggerPaymentSms({ ...targetFee, status, paymentDate: paymentDate || targetFee.paymentDate });
        
        if (smsRes && smsRes.status === 'Success') {
          Swal.fire({
            icon: 'success',
            title: 'স্ট্যাটাস আপডেট সফল!',
            html: `ফি স্ট্যাটাস সফলভাবে 'Paid' করা হয়েছে।<br><small class="text-emerald-600 font-bold font-sans">শিক্ষার্থীর মোবাইলে নিশ্চিতকরণ এসএমএস পাঠানো হয়েছে।</small>`,
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#2563eb',
          });
        } else if (smsRes && smsRes.status === 'Failed') {
          const isDnsError = smsRes.apiResponse && (
            smsRes.apiResponse.includes('Could not resolve host') || 
            smsRes.apiResponse.includes('Host resolution') ||
            smsRes.apiResponse.includes('Failed to connect')
          );
          
          let errorMsg = smsRes.apiResponse || 'অজানা ত্রুটি';
          if (isDnsError) {
            errorMsg = `ইন্টারনেট সংযোগ বিভ্রাট বা ডোমেন রেজল্যুশন সমস্যা (${smsRes.apiResponse})। অনুগ্রহ করে চেক করুন আপনার পিসিতে ইন্টারনেট সচল রয়েছে কিনা।`;
          }

          Swal.fire({
            icon: 'warning',
            title: 'স্ট্যাটাস আপডেট হয়েছে কিন্তু এসএমএস যায়নি!',
            html: `ফি স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে, কিন্তু এসএমএস পাঠানো সম্ভব হয়নি।<br><br><span class="text-rose-600 text-xs font-semibold block bg-rose-50 p-2.5 rounded border border-rose-100 text-left font-mono">SMS Error: ${errorMsg}</span>`,
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#e0a800',
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'স্ট্যাটাস আপডেট সফল!',
            text: `ফি স্ট্যাটাস সফলভাবে 'Paid' করা হয়েছে।`,
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#2563eb',
          });
        }
      } else {
        Swal.fire({
          icon: 'success',
          title: 'স্ট্যাটাস আপডেট সফল!',
          text: `ফি স্ট্যাটাস সফলভাবে '${status === 'Paid' ? 'পরিশোধিত' : status === 'Pending' ? 'অপেক্ষমান' : 'অপরিশোধিত'}' করা হয়েছে।`,
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#2563eb',
        });
      }
    } catch (error: any) {
      console.error("Failed to update fee status: ", error);
      Swal.fire({
        icon: 'error',
        title: 'আপডেট ব্যর্থ হয়েছে!',
        text: `ফি স্ট্যাটাস পরিবর্তন করার সময় ত্রুটি ঘটেছে: ${error.message || error}`,
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  // Model Test Actions
  const handleSaveMarks = (newMarks: ModelTestMark[]) => {
    // Filter out existing student marks for this month
    const targetMonth = newMarks[0]?.month;
    const studentIds = newMarks.map((m) => m.studentId);

    const filtered = modelTests.filter(
      (m) => !(m.month === targetMonth && studentIds.includes(m.studentId))
    );

    const updated = [...filtered, ...newMarks];
    handleStateChange({ modelTests: updated });
  };

  const menuItems = [
    { id: 'dashboard', label: translations[lang].tab_dashboard, icon: LayoutDashboard },
    { id: 'admission', label: translations[lang].tab_admission, icon: UserPlus },
    { id: 'attendance', label: translations[lang].tab_attendance, icon: CalendarCheck },
    { id: 'fees', label: translations[lang].tab_fees, icon: CreditCard },
    { id: 'income_chart', label: translations[lang].tab_income_chart, icon: BarChart3 },
    { id: 'notes', label: translations[lang].tab_notes, icon: StickyNote },
    { id: 'model_tests', label: translations[lang].tab_model_tests, icon: Award },
    { id: 'best_student', label: translations[lang].tab_best_student, icon: Trophy },
    { id: 'admit_card', label: translations[lang].tab_admit_card, icon: FileBadge },
    { id: 'seat_plan', label: translations[lang].tab_seat_plan, icon: Grid },
    { id: 'exam_module', label: translations[lang].tab_exam_module, icon: FileSpreadsheet },
    { id: 'group_message', label: translations[lang].tab_group_message, icon: MessageSquare },
    { id: 'student_portal', label: translations[lang].tab_student_portal, icon: UserCheck },
    { id: 'xampp', label: translations[lang].tab_xampp, icon: Server },
    { id: 'settings', label: translations[lang].tab_settings, icon: Settings },
  ];

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans flex text-slate-800">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 shrink-0">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-blue-400 font-display">IPH <span className="text-white">PVT</span></h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{translations[lang].tagline}</p>
          
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl gap-1 border border-slate-800">
            <button
              onClick={() => handleLanguageChange('bn')}
              className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black tracking-wider transition cursor-pointer ${
                lang === 'bn' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা (BN)
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black tracking-wider transition cursor-pointer ${
                lang === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ENGLISH (EN)
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-2 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            {translations[lang].logout}
          </button>
        </div>

        {/* Info Footer */}
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center font-bold uppercase tracking-wider">
          {translations[lang].copyright}
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/40 backdrop-blur-xs">
          <div className="w-64 bg-slate-900 text-white flex flex-col h-full animate-slide-in shadow-xl">
            <div className="p-6 border-b border-slate-800 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  <span className="text-xl font-black tracking-tighter text-blue-400 font-display">IPH <span className="text-white">PVT</span></span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl gap-1 border border-slate-800">
                <button
                  onClick={() => handleLanguageChange('bn')}
                  className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black tracking-wider transition cursor-pointer ${
                    lang === 'bn' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  বাংলা (BN)
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black tracking-wider transition cursor-pointer ${
                    lang === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ENGLISH (EN)
                </button>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                      isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Logout Button */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
                {translations[lang].logout}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Navbar Header */}
        <header className="lg:hidden bg-slate-900 text-slate-300 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5.5 w-5.5 text-blue-400" />
            <span className="text-xl font-black tracking-tighter text-blue-400 font-display">IPH <span className="text-white">PVT</span></span>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick Lang Pill on Mobile Header */}
            <button
              onClick={() => handleLanguageChange(lang === 'bn' ? 'en' : 'bn')}
              className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-black text-blue-400 hover:text-white transition cursor-pointer"
            >
              {lang === 'bn' ? 'ENGLISH' : 'বাংলা'}
            </button>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-800 rounded-xl"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>
          </div>
        </header>

        {/* Core Screen Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div key={lang} className="max-w-7xl mx-auto space-y-6">
            {isServerOffline && !isOfflineBannerDismissed && (
              <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-250 relative pr-12">
                <button
                  type="button"
                  onClick={() => {
                    setIsOfflineBannerDismissed(true);
                    sessionStorage.setItem('sms_offline_banner_dismissed', 'true');
                    sessionStorage.setItem('sms_offline_alerted', 'true');
                  }}
                  className="absolute top-4 right-4 p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition border-0 cursor-pointer bg-transparent"
                  title="বন্ধ করুন"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="bg-rose-100 p-2.5 rounded-xl text-rose-600 shrink-0">
                      <Server className="h-5.5 w-5.5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-rose-900 tracking-tight">লোকাল XAMPP MySQL সার্ভার অফলাইন!</h4>
                      <p className="text-rose-700 text-[11px] font-medium leading-relaxed mt-0.5">
                        ডাটাবেজে কোনো সংযোগ পাওয়া যায়নি। ডাটা লোড ও সেভ করতে অনুগ্রহ করে আপনার কম্পিউটারে <b>XAMPP Control Panel</b> থেকে <b>Apache</b> এবং <b>MySQL</b> চালু করুন।
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadDataFromXampp(undefined, true)}
                    disabled={isConnecting}
                    className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-extrabold px-4.5 py-2.5 rounded-xl text-xs transition shrink-0 shadow-sm border-0 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    {isConnecting ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        সংযোগ করা হচ্ছে...
                      </>
                    ) : (
                      'সার্ভার সংযোগ করুন / রিফ্রেশ'
                    )}
                  </button>
                </div>

                {serverError && (
                  <div className="text-[11px] font-semibold text-rose-800 bg-rose-100/40 p-3.5 rounded-xl border border-rose-150 space-y-2">
                    <p className="font-extrabold text-rose-900">
                      <span className="bg-rose-200/60 px-2 py-0.5 rounded text-[10px] mr-1">Error Logs</span> 
                      {serverError}
                    </p>
                    {serverError.includes('Failed to fetch') && (
                      <div className="text-rose-700 font-medium space-y-1.5 border-t border-rose-200/55 pt-2 mt-2">
                        <p className="font-extrabold text-rose-900 text-xs">সমাধানের উপায় (Mixed Content বা CORS ব্লকের সমাধান):</p>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                          <li>
                            <b>১. ইনসিকিউর কন্টেন্ট অনুমতি দিন (সবচেয়ে সহজ ও ১০০% কার্যকরী সমাধান):</b> 
                            <br />
                            ব্রাউজারের ওপরের এড্রেস বারের বাম পাশে তালা (Lock) বা সেটিংস আইকনে ক্লিক করে <b>Site settings</b> এ যান। সেখানে নিচে স্ক্রোল করে <b>Insecure content</b> খুঁজে "Block (default)" থেকে পরিবর্তন করে <b>Allow</b> বা <b>অনুমতি দিন</b> সেট করুন। তারপর এই পেজটি রিফ্রেশ (F5 বা Reload) দিন।
                          </li>
                          <li>
                            <b>২. HTTPS টানেল ব্যবহার করুন (Ngrok বা LocalTunnel):</b> 
                            <br />
                            আপনার লোকাল XAMPP Apache সার্ভারকে HTTPS টানেলে রান করান (যেমন: <code>lt --port 80</code> বা <code>ngrok http 80</code>) এবং প্রাপ্ত HTTPS ইউআরএলটি এই অ্যাপের XAMPP ট্যাপে গিয়ে API URL বক্সে পেস্ট করুন।
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                students={students}
                batches={batches}
                attendance={attendance}
                fees={fees}
                modelTests={modelTests}
                setActiveTab={setActiveTab}
                lang={lang}
              />
            )}

            {activeTab === 'admission' && (
              <Admission
                students={students}
                batches={batches}
                classes={classes}
                courses={courses}
                sessions={sessions}
                fees={fees}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onTransferStudent={handleTransferStudent}
                onAddBatch={handleAddBatch}
                onUpdateBatch={handleUpdateBatch}
                onDeleteBatch={handleDeleteBatch}
                onAddSession={handleAddSession}
                onDeleteSession={handleDeleteSession}
                onUpdateClasses={(updatedClasses) => handleStateChange({ classes: updatedClasses })}
                onUpdateCourses={(updatedCourses) => handleStateChange({ courses: updatedCourses })}
              />
            )}

            {activeTab === 'attendance' && (
              <Attendance
                students={students}
                batches={batches}
                attendance={attendance}
                onSaveAttendance={handleSaveAttendance}
              />
            )}

            {activeTab === 'fees' && (
              <Fees
                students={students}
                batches={batches}
                fees={fees}
                onAddFee={handleAddFee}
                onUpdateFeeStatus={handleUpdateFeeStatus}
              />
            )}

            {activeTab === 'income_chart' && (
              <IncomeChart
                students={students}
                batches={batches}
                fees={fees}
              />
            )}

            {activeTab === 'notes' && (
              <Notes
                notes={notes}
                onSaveNotes={(updatedNotes) => handleStateChange({ notes: updatedNotes })}
              />
            )}

            {activeTab === 'model_tests' && (
              <ModelTests
                students={students}
                batches={batches}
                modelTests={modelTests}
                onSaveMarks={handleSaveMarks}
              />
            )}

            {activeTab === 'best_student' && (
              <BestStudent
                students={students}
                batches={batches}
                attendance={attendance}
                modelTests={modelTests}
              />
            )}

            {activeTab === 'admit_card' && (
              <AdmitCard students={students} batches={batches} sessions={sessions} />
            )}

            {activeTab === 'seat_plan' && (
              <SeatPlan students={students} batches={batches} sessions={sessions} />
            )}

            {activeTab === 'student_portal' && (
              <StudentDashboard
                students={students}
                batches={batches}
                attendance={attendance}
                fees={fees}
                modelTests={modelTests}
              />
            )}

            {activeTab === 'group_message' && (
              <GroupMessage
                students={students}
                batches={batches}
                classes={classes}
                sessions={sessions}
              />
            )}

            {activeTab === 'xampp' && (
              <XamppExport
                students={students}
                batches={batches}
                classes={classes}
                courses={courses}
                sessions={sessions}
                attendance={attendance}
                fees={fees}
                modelTests={modelTests}
                apiUrl={apiUrl}
                onApiUrlChange={(newUrl) => {
                  setApiUrl(newUrl);
                  localStorage.setItem('sms_xampp_api_url', newUrl);
                }}
                onRestore={handleRestoreData}
              />
            )}

            {activeTab === 'settings' && (
              <SystemSettings />
            )}

            {activeTab === 'exam_module' && (
              <ExamModule students={students} batches={batches} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
