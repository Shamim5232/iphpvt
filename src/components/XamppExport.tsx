import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  Server,
  Database,
  Code2,
  Download,
  Copy,
  Check,
  FileCode,
  CheckCircle2,
  HelpCircle,
  Activity,
  Globe,
  Wifi,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Layers,
  ArrowRight,
  Settings,
  XCircle,
  BookOpen,
  Trash2,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { Student, Batch, AttendanceRecord, FeeCollection, ModelTestMark, SchoolClass, Course } from '../types';

interface XamppExportProps {
  students?: Student[];
  batches?: Batch[];
  classes?: SchoolClass[];
  courses?: Course[];
  sessions?: string[];
  attendance?: AttendanceRecord[];
  fees?: FeeCollection[];
  modelTests?: ModelTestMark[];
  apiUrl?: string;
  onApiUrlChange?: (url: string) => void;
  onRestore?: (data: {
    students?: Student[];
    batches?: Batch[];
    classes?: SchoolClass[];
    courses?: Course[];
    sessions?: string[];
    attendance?: AttendanceRecord[];
    fees?: FeeCollection[];
    modelTests?: ModelTestMark[];
  }) => void;
}

export default function XamppExport({
  students = [],
  batches = [],
  classes = [],
  courses = [],
  sessions = [],
  attendance = [],
  fees = [],
  modelTests = [],
  apiUrl: propApiUrl,
  onApiUrlChange,
  onRestore
}: XamppExportProps) {
  const [activeTab, setActiveTab] = useState<'instructions' | 'sql' | 'php' | 'sync_tool' | 'troubleshoot'>('sync_tool');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPhp, setCopiedPhp] = useState(false);
  
  // Backup & Restore States
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [restoreMessage, setRestoreMessage] = useState('');

  // Live Sync Tool States
  const [localApiUrl, setLocalApiUrl] = useState('http://localhost/student-app/api.php');
  const apiUrl = propApiUrl !== undefined ? propApiUrl : localApiUrl;
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  // Live Sync Automatic Controller States
  const [isLiveSync, setIsLiveSync] = useState<boolean>(() => {
    return localStorage.getItem('sms_live_sync') === 'true';
  });
  const [liveSyncCheckStatus, setLiveSyncCheckStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(() => {
    return localStorage.getItem('sms_last_synced_time');
  });

  // Accordion state for Troubleshooting
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // --- AUTOMATIC DATABASE BACKUP MANAGER STATES & ACTIONS ---
  const [autoBackups, setAutoBackups] = useState<any[]>([]);

  useEffect(() => {
    const loadAutoBackups = () => {
      try {
        const backups = JSON.parse(localStorage.getItem('sms_auto_backups') || '[]');
        if (Array.isArray(backups)) {
          setAutoBackups(backups);
        }
      } catch (e) {
        setAutoBackups([]);
      }
    };
    loadAutoBackups();
    const interval = setInterval(loadAutoBackups, 3000);
    return () => clearInterval(interval);
  }, []);

  const createManualBackup = () => {
    try {
      const backupStudents = students.length > 0 ? students : JSON.parse(localStorage.getItem('sms_students') || '[]');
      const backupBatches = batches.length > 0 ? batches : JSON.parse(localStorage.getItem('sms_batches') || '[]');
      const backupSessions = sessions.length > 0 ? sessions : JSON.parse(localStorage.getItem('sms_sessions') || '[]');
      const backupAttendance = attendance.length > 0 ? attendance : JSON.parse(localStorage.getItem('sms_attendance') || '[]');
      const backupFees = fees.length > 0 ? fees : JSON.parse(localStorage.getItem('sms_fees') || '[]');
      const backupModelTests = modelTests.length > 0 ? modelTests : JSON.parse(localStorage.getItem('sms_model_tests') || '[]');
      const backupNotes = JSON.parse(localStorage.getItem('sms_notes') || '[]');

      const newBackup = {
        id: 'ab_' + Date.now(),
        timestamp: new Date().toISOString(),
        action: "ম্যানুয়াল স্ন্যাপশট",
        counts: {
          students: backupStudents.length,
          batches: backupBatches.length,
          attendance: backupAttendance.length,
          fees: backupFees.length,
          notes: backupNotes.length
        },
        data: {
          students: backupStudents,
          batches: backupBatches,
          sessions: backupSessions,
          attendance: backupAttendance,
          fees: backupFees,
          modelTests: backupModelTests,
          notes: backupNotes
        }
      };

      const backups = JSON.parse(localStorage.getItem('sms_auto_backups') || '[]');
      const nextBackups = [newBackup, ...backups].slice(0, 10);
      localStorage.setItem('sms_auto_backups', JSON.stringify(nextBackups));
      setAutoBackups(nextBackups);

      // Save as latest state fallbacks as well
      localStorage.setItem('sms_students', JSON.stringify(backupStudents));
      localStorage.setItem('sms_batches', JSON.stringify(backupBatches));
      localStorage.setItem('sms_sessions', JSON.stringify(backupSessions));
      localStorage.setItem('sms_attendance', JSON.stringify(backupAttendance));
      localStorage.setItem('sms_fees', JSON.stringify(backupFees));
      localStorage.setItem('sms_model_tests', JSON.stringify(backupModelTests));
      localStorage.setItem('sms_notes', JSON.stringify(backupNotes));

      Swal.fire({
        icon: 'success',
        title: 'সফল স্ন্যাপশট!',
        text: 'আপনার ব্রাউজার লোকালস্টোরেজে ডাটাবেজের একটি সফল স্ন্যাপশট নেওয়া হয়েছে।',
        confirmButtonColor: '#4f46e5',
        timer: 3000,
        timerProgressBar: true
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'স্ন্যাপশট তৈরি করতে সমস্যা হয়েছে।',
        confirmButtonColor: '#e11d48'
      });
    }
  };

  const restoreAutoBackup = (backupItem: any) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      html: `আপনি কি সত্যিই <b>"${backupItem.action}"</b> স্ন্যাপশটটি রিস্টোর করতে চান?<br/><br/><span class="text-rose-600 font-extrabold text-xs">সতর্কতা: এর ফলে আপনার বর্তমান সমস্ত ডাটা মুছে যাবে এবং এই স্ন্যাপশটের ডাটা দ্বারা প্রতিস্থাপিত হবে!</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'হ্যাঁ, রিস্টোর করুন',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        const d = backupItem.data;
        if (onRestore) {
          onRestore({
            students: d.students || [],
            batches: d.batches || [],
            sessions: d.sessions || [],
            attendance: d.attendance || [],
            fees: d.fees || [],
            modelTests: d.modelTests || []
          });

          // Restore notes
          localStorage.setItem('sms_notes', JSON.stringify(d.notes || []));
          
          // Force update local storage for all tables immediately as well
          localStorage.setItem('sms_students', JSON.stringify(d.students || []));
          localStorage.setItem('sms_batches', JSON.stringify(d.batches || []));
          localStorage.setItem('sms_sessions', JSON.stringify(d.sessions || []));
          localStorage.setItem('sms_attendance', JSON.stringify(d.attendance || []));
          localStorage.setItem('sms_fees', JSON.stringify(d.fees || []));
          localStorage.setItem('sms_model_tests', JSON.stringify(d.modelTests || []));

          Swal.fire({
            icon: 'success',
            title: 'রিস্টোর সম্পন্ন হয়েছে!',
            text: 'স্ন্যাপশট থেকে সফলভাবে ডাটা রিস্টোর করা হয়েছে।',
            confirmButtonColor: '#4f46e5'
          });
        }
      }
    });
  };

  const deleteAutoBackup = (backupId: string) => {
    Swal.fire({
      title: 'স্ন্যাপশট মুছবেন?',
      text: 'এই স্ন্যাপশট ব্যাকআপটি স্থায়ীভাবে মুছে ফেলা হবে। আপনি কি নিশ্চিত?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        const backups = JSON.parse(localStorage.getItem('sms_auto_backups') || '[]');
        const filtered = backups.filter((b: any) => b.id !== backupId);
        localStorage.setItem('sms_auto_backups', JSON.stringify(filtered));
        setAutoBackups(filtered);
        Swal.fire({
          icon: 'success',
          title: 'মুছে ফেলা হয়েছে!',
          text: 'স্ন্যাপশটটি সফলভাবে মুছে ফেলা হয়েছে।',
          confirmButtonColor: '#e11d48',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const downloadSingleSnapshot = (backupItem: any) => {
    const jsonString = JSON.stringify(backupItem.data, null, 2);
    const dateStr = backupItem.timestamp.split('T')[0];
    const timeStr = new Date(backupItem.timestamp).toLocaleTimeString().replace(/:/g, '-');
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sms_snapshot_${backupItem.action.replace(/\s+/g, '_')}_${dateStr}_${timeStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllAutoBackups = () => {
    Swal.fire({
      title: 'সব স্ন্যাপশট মুছবেন?',
      text: 'আপনার ব্রাউজারে সংরক্ষিত সকল অটোমেটিক ব্যাকআপ স্ন্যাপশট স্থায়ীভাবে মুছে ফেলা হবে! আপনি কি নিশ্চিত?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'হ্যাঁ, সব মুছুন',
      cancelButtonText: 'বাতিল'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('sms_auto_backups');
        setAutoBackups([]);
        Swal.fire({
          icon: 'success',
          title: 'সব মুছে ফেলা হয়েছে!',
          text: 'সকল অটো-ব্যাকআপ স্ন্যাপশট সফলভাবে মুছে ফেলা হয়েছে।',
          confirmButtonColor: '#e11d48',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };
  // ------------------------------------------------------------

  // Load saved API URL on mount
  useEffect(() => {
    if (propApiUrl === undefined) {
      const savedUrl = localStorage.getItem('sms_xampp_api_url');
      if (savedUrl) {
        setLocalApiUrl(savedUrl);
      }
    }
  }, [propApiUrl]);

  const handleApiUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onApiUrlChange) {
      onApiUrlChange(val);
    } else {
      setLocalApiUrl(val);
    }
    localStorage.setItem('sms_xampp_api_url', val);
  };

  // Check connection state silently
  const checkConnectionSilently = async (urlToCheck = apiUrl) => {
    if (!urlToCheck) return false;
    try {
      const testUrl = `${urlToCheck}${urlToCheck.includes('?') ? '&' : '?'}action=test&_t=${Date.now()}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for auto checks

      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);
      const responseText = await response.text();
      const resData = JSON.parse(responseText);
      return resData.status === 'success' || resData.status === 'info';
    } catch (e) {
      return false;
    }
  };

  // Periodically check server and perform sync if live sync is enabled
  useEffect(() => {
    if (!isLiveSync) {
      setLiveSyncCheckStatus('idle');
      return;
    }

    let isSubscribed = true;
    setLiveSyncCheckStatus('checking');

    const performInitialCheckAndSync = async () => {
      const isOnline = await checkConnectionSilently(apiUrl);
      if (!isSubscribed) return;
      if (isOnline) {
        setLiveSyncCheckStatus('online');
        await handleBulkSync(true);
      } else {
        setLiveSyncCheckStatus('offline');
      }
    };

    performInitialCheckAndSync();

    // Check every 12 seconds in the background
    const interval = setInterval(async () => {
      const isOnline = await checkConnectionSilently(apiUrl);
      if (!isSubscribed) return;
      if (isOnline) {
        setLiveSyncCheckStatus('online');
        // Auto-sync
        await handleBulkSync(true);
      } else {
        setLiveSyncCheckStatus('offline');
      }
    }, 12000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isLiveSync, apiUrl, students, batches, attendance, fees, modelTests]);


  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (!json || typeof json !== 'object') {
          throw new Error('ভুল ফরম্যাট! অনুগ্রহ করে একটি সঠিক JSON ফাইল আপলোড করুন।');
        }

        if (json.app !== 'Student Management System' && !json.students && !json.batches) {
          throw new Error('এটি কোনো বৈধ ব্যাকআপ ফাইল নয় অথবা ডাটা ফরম্যাট সঠিক নয়।');
        }

        const confirmRestore = window.confirm(
          'সতর্কতা: এই ব্যাকআপটি রিস্টোর করলে আপনার বর্তমান সকল ডাটা মুছে যাবে এবং ব্যাকআপ ফাইলের ডাটা দ্বারা প্রতিস্থাপিত হবে। আপনি কি নিশ্চিতভাবে এগিয়ে যেতে চান?'
        );

        if (confirmRestore) {
          if (onRestore) {
            onRestore({
              students: json.students || [],
              batches: json.batches || [],
              classes: json.classes || [],
              courses: json.courses || [],
              sessions: json.sessions || [],
              attendance: json.attendance || [],
              fees: json.fees || [],
              modelTests: json.modelTests || []
            });
            
            // Also restore notes if available in backup
            if (json.notes && Array.isArray(json.notes)) {
              localStorage.setItem('sms_notes', JSON.stringify(json.notes));
            }

            // Also restore admin credentials if available in backup
            if (json.adminUsers && Array.isArray(json.adminUsers) && json.adminUsers.length > 0) {
              const mainAdmin = json.adminUsers[0];
              if (mainAdmin.username && mainAdmin.password) {
                localStorage.setItem('sms_admin_user_id', mainAdmin.username);
                localStorage.setItem('sms_admin_password', mainAdmin.password);
              }
            }

            setRestoreStatus('success');
            setRestoreMessage('অভিনন্দন! আপনার ব্যাকআপ ডাটা সফলভাবে ব্রাউজারে রিস্টোর হয়েছে।');

            // If local server is online, sync restored data there too
            const checkAndSyncRestore = async () => {
              try {
                const isOnline = await checkConnectionSilently(apiUrl);
                if (isOnline) {
                  const syncUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=bulk_sync`;
                  await fetch(syncUrl, {
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
                      students: json.students || [],
                      batches: json.batches || [],
                      classes: json.classes || [],
                      courses: json.courses || [],
                      sessions: json.sessions || [],
                      attendance: json.attendance || [],
                      fees: json.fees || [],
                      modelTests: json.modelTests || [],
                      notes: json.notes || [],
                      adminUsers: json.adminUsers || []
                    })
                  });
                  setRestoreMessage('অভিনন্দন! আপনার ব্যাকআপ ডাটা সফলভাবে ব্রাউজারে এবং লোকাল XAMPP MySQL সার্ভারে রিস্টোর হয়েছে।');
                  alert('অভিনন্দন! ব্রাউজার এবং লোকাল XAMPP MySQL সার্ভারে সফলভাবে ডাটা রিস্টোর হয়েছে।');
                } else {
                  alert('অভিনন্দন! আপনার ব্যাকআপ ডাটা সফলভাবে ব্রাউজারে রিস্টোর হয়েছে। (লোকাল সার্ভার অফলাইন থাকায় সার্ভারে সিঙ্ক করা হয়নি)');
                }
              } catch (e) {
                alert('অভিনন্দন! আপনার ব্যাকআপ ডাটা ব্রাউজারে রিস্টোর হয়েছে। তবে লোকাল XAMPP সার্ভারে অটো-সিঙ্ক করা যায়নি।');
              }
            };
            checkAndSyncRestore();
          } else {
            throw new Error('সিস্টেম রিস্টোর ফাংশন উপলব্ধ নেই।');
          }
        }
      } catch (err: any) {
        setRestoreStatus('error');
        setRestoreMessage(err.message || 'ফাইলটি প্রসেস করতে ত্রুটি হয়েছে।');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const downloadBackup = () => {
    const backupStudents = students.length > 0 ? students : JSON.parse(localStorage.getItem('sms_students') || '[]');
    const backupBatches = batches.length > 0 ? batches : JSON.parse(localStorage.getItem('sms_batches') || '[]');
    const backupClasses = classes.length > 0 ? classes : JSON.parse(localStorage.getItem('sms_classes') || '[]');
    const backupCourses = courses.length > 0 ? courses : JSON.parse(localStorage.getItem('sms_courses') || '[]');
    const backupSessions = sessions.length > 0 ? sessions : JSON.parse(localStorage.getItem('sms_sessions') || '[]');
    const backupAttendance = attendance.length > 0 ? attendance : JSON.parse(localStorage.getItem('sms_attendance') || '[]');
    const backupFees = fees.length > 0 ? fees : JSON.parse(localStorage.getItem('sms_fees') || '[]');
    const backupModelTests = modelTests.length > 0 ? modelTests : JSON.parse(localStorage.getItem('sms_model_tests') || '[]');
    const backupNotes = JSON.parse(localStorage.getItem('sms_notes') || '[]');

    const backupData = {
      app: 'Student Management System',
      backupVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      students: backupStudents,
      batches: backupBatches,
      classes: backupClasses,
      courses: backupCourses,
      sessions: backupSessions,
      attendance: backupAttendance,
      fees: backupFees,
      modelTests: backupModelTests,
      notes: backupNotes
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sms_full_database_backup_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sqlSchema = `-- -------------------------------------------------------------
-- SQL Database Schema for XAMPP (Local MySQL Server)
-- Create a database named 'student_management' in phpMyAdmin
-- -------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS \`student_management\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`student_management\`;

-- 1. Batches Table (ব্যাচ সমূহ)
CREATE TABLE IF NOT EXISTS \`batches\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(100) NOT NULL,
  \`schedule\` varchar(100) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.1. School Classes Table (শ্রেণী সমূহ)
CREATE TABLE IF NOT EXISTS \`school_classes\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(100) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.2. School Courses Table (কোর্স সমূহ)
CREATE TABLE IF NOT EXISTS \`school_courses\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(100) NOT NULL,
  \`fee\` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.5. Sessions Table (সেশন তালিকা)
CREATE TABLE IF NOT EXISTS \`sessions\` (
  \`name\` varchar(50) NOT NULL,
  PRIMARY KEY (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Students Table (শিক্ষার্থী তালিকা)
CREATE TABLE IF NOT EXISTS \`students\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(100) NOT NULL,
  \`roll\` varchar(20) NOT NULL,
  \`batch_id\` varchar(50) NOT NULL,
  \`session\` varchar(50) DEFAULT NULL,
  \`phone\` varchar(20) NOT NULL,
  \`email\` varchar(100) DEFAULT NULL,
  \`gender\` enum('Male','Female','Other') DEFAULT 'Male',
  \`admission_date\` date NOT NULL,
  \`father_name\` varchar(100) DEFAULT NULL,
  \`mother_name\` varchar(100) DEFAULT NULL,
  \`address\` varchar(255) DEFAULT NULL,
  \`course\` varchar(100) DEFAULT 'ICT Academic',
  \`class\` varchar(100) DEFAULT 'Inter 1st Year',
  \`course_fee\` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (\`id\`),
  KEY \`fk_students_batch\` (\`batch_id\`),
  CONSTRAINT \`fk_students_batch\` FOREIGN KEY (\`batch_id\`) REFERENCES \`batches\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Attendance Table (উপস্থিতি ট্র্যাকার)
CREATE TABLE IF NOT EXISTS \`attendance\` (
  \`date\` date NOT NULL,
  \`student_id\` varchar(50) NOT NULL,
  \`batch_id\` varchar(50) NOT NULL,
  \`status\` enum('Present','Absent') NOT NULL,
  PRIMARY KEY (\`date\`,\`student_id\`),
  KEY \`fk_attendance_student\` (\`student_id\`),
  CONSTRAINT \`fk_attendance_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Fees Table (ফি আদায় ও রসিদ)
CREATE TABLE IF NOT EXISTS \`fees\` (
  \`id\` varchar(50) NOT NULL,
  \`student_id\` varchar(50) NOT NULL,
  \`month\` varchar(10) NOT NULL,
  \`amount\` decimal(10,2) NOT NULL,
  \`payment_date\` date DEFAULT NULL,
  \`payment_method\` varchar(50) NOT NULL,
  \`status\` enum('Paid','Pending','Unpaid') NOT NULL,
  \`receipt_no\` varchar(50) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`fk_fees_student\` (\`student_id\`),
  CONSTRAINT \`fk_fees_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Model Tests Table (মডেল টেস্টের নম্বর)
CREATE TABLE IF NOT EXISTS \`model_tests\` (
  \`student_id\` varchar(50) NOT NULL,
  \`month\` varchar(10) NOT NULL,
  \`test1\` int(3) DEFAULT 0,
  \`test2\` int(3) DEFAULT 0,
  \`test3\` int(3) DEFAULT 0,
  \`test4\` int(3) DEFAULT 0,
  \`test5\` int(3) DEFAULT 0,
  PRIMARY KEY (\`student_id\`,\`month\`),
  CONSTRAINT \`fk_model_tests_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Notes Table (অ্যাডমিন পার্সোনাল নোটবুক)
CREATE TABLE IF NOT EXISTS \`notes\` (
  \`id\` varchar(50) NOT NULL,
  \`title\` varchar(255) NOT NULL,
  \`content\` text DEFAULT NULL,
  \`category\` varchar(100) DEFAULT NULL,
  \`color\` varchar(50) DEFAULT NULL,
  \`is_pinned\` tinyint(1) DEFAULT 0,
  \`created_at\` varchar(50) DEFAULT NULL,
  \`updated_at\` varchar(50) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Admin Users Table (অ্যাডমিন আইডি ও পাসওয়ার্ড)
CREATE TABLE IF NOT EXISTS \`admin_users\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`username\` varchar(50) NOT NULL,
  \`password\` varchar(255) NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uniq_username\` (\`username\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user if table is empty (ডিফল্ট অ্যাডমিন ইউজার)
INSERT INTO \`admin_users\` (\`id\`, \`username\`, \`password\`) VALUES
(1, 'admin', 'password')
ON DUPLICATE KEY UPDATE \`username\`=\`username\`;

-- Seed Default Batches for test (ঐচ্ছিক ডেমো ব্যাচ)
INSERT INTO \`batches\` (\`id\`, \`name\`, \`schedule\`) VALUES
('b1', 'Batch Crimson (Science) - 09:00 AM', 'Sat, Mon, Wed'),
('b2', 'Batch Emerald (Commerce) - 11:30 AM', 'Sun, Tue, Thu'),
('b3', 'Batch Sapphire (Arts) - 03:00 PM', 'Sat, Mon, Wed')
ON DUPLICATE KEY UPDATE \`name\`=\`name\`;

-- Seed Default School Classes (ঐচ্ছিক ডেমো শ্রেণী)
INSERT INTO \`school_classes\` (\`id\`, \`name\`) VALUES
('c1', 'Inter 1st Year'),
('c2', 'Inter 2nd Year')
ON DUPLICATE KEY UPDATE \`name\`=\`name\`;

-- Seed Default School Courses (ঐচ্ছিক ডেমো কোর্স)
INSERT INTO \`school_courses\` (\`id\`, \`name\`, \`fee\`) VALUES
('co1', 'ICT Academic', 1000.00),
('co2', 'Revision Batch', 1500.00)
ON DUPLICATE KEY UPDATE \`name\`=\`name\`;
`;

  const phpApi = `<?php
/**
 * Advanced PHP Sync API for XAMPP (Localhost Server)
 * Save this file as 'api.php' inside your 'xampp/htdocs/student-app/' directory.
 * No need to create database manually, this script does it automatically!
 */

// 1. Force error reporting to return JSON instead of HTML
ini_set('display_errors', 0);
error_reporting(E_ALL);

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) {
        return false;
    }
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "PHP Internal Error [$errno]: $errstr in $errfile on line $errline"
    ));
    exit();
});

set_exception_handler(function($exception) {
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "Uncaught PHP Exception: " . $exception->getMessage()
    ));
    exit();
});

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_COMPILE_ERROR || $error['type'] === E_CORE_ERROR)) {
        http_response_code(500);
        echo json_encode(array(
            "status" => "error",
            "message" => "PHP Fatal Error: " . $error['message'] . " in " . $error['file'] . " on line " . $error['line']
        ));
    }
});

// Enable Cross-Origin Resource Sharing (CORS) to prevent browser blocks
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle browser preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_name = "student_management";
$username = "root";
$password = ""; // Default XAMPP password is empty

try {
    // Attempt connection via IPv4 127.0.0.1 first (most reliable for XAMPP to bypass IPv6 ::1 issues)
    try {
        $conn = new PDO("mysql:host=127.0.0.1;charset=utf8mb4", $username, $password);
    } catch (PDOException $e) {
        // Fallback to localhost if 127.0.0.1 is blocked or has different binding
        $conn = new PDO("mysql:host=localhost;charset=utf8mb4", $username, $password);
    }
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if not exists using single quotes to avoid PHP backtick shell execution
    $conn->exec('CREATE DATABASE IF NOT EXISTS ' . $db_name . ' DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    $conn->exec('USE ' . $db_name . ';');
    
    // Auto-create Tables
    $conn->exec("CREATE TABLE IF NOT EXISTS batches (
      id varchar(50) NOT NULL,
      name varchar(100) NOT NULL,
      schedule varchar(100) DEFAULT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $conn->exec("CREATE TABLE IF NOT EXISTS school_classes (
      id varchar(50) NOT NULL,
      name varchar(100) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $conn->exec("CREATE TABLE IF NOT EXISTS school_courses (
      id varchar(50) NOT NULL,
      name varchar(100) NOT NULL,
      fee decimal(10,2) DEFAULT 0.00,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $conn->exec("CREATE TABLE IF NOT EXISTS students (
      id varchar(50) NOT NULL,
      name varchar(100) NOT NULL,
      roll varchar(20) NOT NULL,
      batch_id varchar(50) NOT NULL,
      session varchar(50) DEFAULT NULL,
      phone varchar(20) NOT NULL,
      email varchar(100) DEFAULT NULL,
      gender enum('Male','Female','Other') DEFAULT 'Male',
      admission_date date NOT NULL,
      father_name varchar(100) DEFAULT NULL,
      mother_name varchar(100) DEFAULT NULL,
      address varchar(255) DEFAULT NULL,
      course varchar(100) DEFAULT 'ICT Academic',
      class varchar(100) DEFAULT 'Inter 1st Year',
      course_fee decimal(10,2) DEFAULT 0.00,
      PRIMARY KEY (id),
      KEY fk_students_batch (batch_id),
      CONSTRAINT fk_students_batch FOREIGN KEY (batch_id) REFERENCES batches (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Safe migration to add session column for existing tables
    try {
        $conn->exec("ALTER TABLE students ADD COLUMN session varchar(50) DEFAULT NULL;");
    } catch(PDOException $e) {
        // Column may already exist
    }

    $conn->exec("CREATE TABLE IF NOT EXISTS sessions (
      name varchar(50) NOT NULL,
      PRIMARY KEY (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $conn->exec("CREATE TABLE IF NOT EXISTS attendance (
      date date NOT NULL,
      student_id varchar(50) NOT NULL,
      batch_id varchar(50) NOT NULL,
      status enum('Present','Absent') NOT NULL,
      PRIMARY KEY (date,student_id),
      KEY fk_attendance_student (student_id),
      CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $conn->exec("CREATE TABLE IF NOT EXISTS fees (
      id varchar(50) NOT NULL,
      student_id varchar(50) NOT NULL,
      month varchar(10) NOT NULL,
      amount decimal(10,2) NOT NULL,
      payment_date date DEFAULT NULL,
      payment_method varchar(50) NOT NULL,
      status enum('Paid','Pending','Unpaid') NOT NULL,
      receipt_no varchar(50) NOT NULL,
      PRIMARY KEY (id),
      KEY fk_fees_student (student_id),
      CONSTRAINT fk_fees_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $conn->exec("CREATE TABLE IF NOT EXISTS model_tests (
      student_id varchar(50) NOT NULL,
      month varchar(10) NOT NULL,
      test1 int(3) DEFAULT 0,
      test2 int(3) DEFAULT 0,
      test3 int(3) DEFAULT 0,
      test4 int(3) DEFAULT 0,
      test5 int(3) DEFAULT 0,
      PRIMARY KEY (student_id,month),
      CONSTRAINT fk_model_tests_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $conn->exec("CREATE TABLE IF NOT EXISTS notes (
      id varchar(50) NOT NULL,
      title varchar(255) NOT NULL,
      content text DEFAULT NULL,
      category varchar(100) DEFAULT NULL,
      color varchar(50) DEFAULT NULL,
      is_pinned tinyint(1) DEFAULT 0,
      created_at varchar(50) DEFAULT NULL,
      updated_at varchar(50) DEFAULT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $conn->exec("CREATE TABLE IF NOT EXISTS admin_users (
      id int(11) NOT NULL AUTO_INCREMENT,
      username varchar(50) NOT NULL,
      password varchar(255) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Insert default admin user if empty
    $count = $conn->query("SELECT COUNT(*) FROM admin_users")->fetchColumn();
    if ($count == 0) {
        $conn->exec("INSERT INTO admin_users (username, password) VALUES ('admin', 'password');");
    }

} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => "MySQL Connection/Setup Failed: " . $exception->getMessage()));
    exit();
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch($action) {
    case 'test':
        echo json_encode(array(
            "status" => "success", 
            "message" => "XAMPP MySQL database connected and auto-configured successfully!",
            "server" => $_SERVER['SERVER_SOFTWARE'],
            "php_version" => phpversion()
        ));
        break;

    case 'login':
        $raw_input = file_get_contents("php://input");
        $data = json_decode($raw_input);
        $user = isset($data->username) ? trim($data->username) : '';
        $pass = isset($data->password) ? $data->password : '';
        
        $stmt = $conn->prepare("SELECT * FROM admin_users WHERE username = :username LIMIT 1");
        $stmt->execute([':username' => $user]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row && $row['password'] === $pass) {
            echo json_encode(array("status" => "success", "message" => "Login successful"));
        } else {
            http_response_code(401);
            echo json_encode(array("status" => "error", "message" => "ভুল ইউজার আইডি অথবা পাসওয়ার্ড!"));
        }
        break;

    case 'update_credentials':
        $raw_input = file_get_contents("php://input");
        $data = json_decode($raw_input);
        $user = isset($data->username) ? trim($data->username) : '';
        $pass = isset($data->password) ? $data->password : '';
        
        if (empty($user) || empty($pass)) {
            http_response_code(400);
            echo json_encode(array("status" => "error", "message" => "Username and password cannot be empty."));
            exit();
        }
        
        try {
            // We empty the table and insert the new single admin
            $conn->exec("DELETE FROM admin_users;");
            $stmt = $conn->prepare("INSERT INTO admin_users (username, password) VALUES (:username, :password)");
            $stmt->execute([':username' => $user, ':password' => $pass]);
            echo json_encode(array("status" => "success", "message" => "Credentials updated successfully"));
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(array("status" => "error", "message" => "Failed to update credentials: " . $e->getMessage()));
        }
        break;

    case 'send_sms':
        $raw_input = file_get_contents("php://input");
        $data = json_decode($raw_input);
        $sms_url = isset($data->url) ? $data->url : '';
        
        if (empty($sms_url)) {
            http_response_code(400);
            echo json_encode(array("status" => "error", "message" => "SMS API URL cannot be empty."));
            exit();
        }

        // Send SMS via PHP curl (which runs server-side and has no CORS limitations!)
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $sms_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Ignore SSL errors on older XAMPP setups
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);

        // --- SELF-HEALING DNS FALLBACK LOGIC ---
        // If the URL contains "bulksmsbd.net" and fails to resolve the host, try alternate domains
        if ($response === false && (!empty($curl_error) && (strpos($curl_error, "Could not resolve host") !== false || strpos($curl_error, "Host resolution") !== false || strpos($curl_error, "resolve") !== false))) {
            if (strpos($sms_url, "bulksmsbd.net") !== false) {
                // Try substituting with bulksmsbd.com
                $fallback_url = str_replace("bulksmsbd.net", "bulksmsbd.com", $sms_url);
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $fallback_url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 15);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                $response = curl_exec($ch);
                $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $curl_error = curl_error($ch);
                curl_close($ch);
                
                // If it still fails, try substituting with api.bulksmsbd.com
                if ($response === false) {
                    $fallback_url = str_replace("bulksmsbd.net", "api.bulksmsbd.com", $sms_url);
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $fallback_url);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                    $response = curl_exec($ch);
                    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    $curl_error = curl_error($ch);
                    curl_close($ch);
                }
            }
        }

        if ($response === false) {
            echo json_encode(array(
                "status" => "failed",
                "message" => "CURL Error: " . $curl_error
            ));
        } else {
            // We return success and pass through the original provider response
            echo json_encode(array(
                "status" => "success",
                "message" => "SMS Request dispatched successfully via proxy.",
                "api_response" => $response,
                "http_code" => $http_code
            ));
        }
        break;

    case 'bulk_sync':
        $raw_input = file_get_contents("php://input");
        $data = json_decode($raw_input);
        
        if(!$data || !isset($data->students) || !isset($data->batches)) {
            http_response_code(400);
            echo json_encode(array("status" => "error", "message" => "Invalid JSON payload or incomplete datasets."));
            exit();
        }

        try {
            $conn->beginTransaction();

            // Disable Foreign Key checks to safely clear existing data and insert new data
            $conn->exec('SET FOREIGN_KEY_CHECKS = 0;');
            
            $conn->exec('DELETE FROM model_tests;');
            $conn->exec('DELETE FROM fees;');
            $conn->exec('DELETE FROM attendance;');
            $conn->exec('DELETE FROM students;');
            $conn->exec('DELETE FROM batches;');
            $conn->exec('DELETE FROM school_classes;');
            $conn->exec('DELETE FROM school_courses;');
            $conn->exec('DELETE FROM notes;');
            $conn->exec('DELETE FROM sessions;');
            $conn->exec('DELETE FROM admin_users;');

            // 1. Insert Batches
            if(!empty($data->batches)) {
                $stmt = $conn->prepare("INSERT INTO batches (id, name, schedule) VALUES (:id, :name, :schedule)");
                foreach($data->batches as $b) {
                    $stmt->execute([
                        ':id' => $b->id ?? '',
                        ':name' => $b->name ?? '',
                        ':schedule' => $b->schedule ?? null
                    ]);
                }
            }

            // 1.1. Insert School Classes
            if(!empty($data->classes)) {
                $stmt = $conn->prepare("INSERT INTO school_classes (id, name) VALUES (:id, :name)");
                foreach($data->classes as $c) {
                    $stmt->execute([
                        ':id' => $c->id ?? '',
                        ':name' => $c->name ?? ''
                    ]);
                }
            }

            // 1.2. Insert School Courses
            if(!empty($data->courses)) {
                $stmt = $conn->prepare("INSERT INTO school_courses (id, name, fee) VALUES (:id, :name, :fee)");
                foreach($data->courses as $co) {
                    $stmt->execute([
                        ':id' => $co->id ?? '',
                        ':name' => $co->name ?? '',
                        ':fee' => isset($co->fee) ? (float)$co->fee : 0.00
                    ]);
                }
            }

            // 1.5. Insert Sessions
            if(!empty($data->sessions)) {
                $stmt = $conn->prepare("INSERT INTO sessions (name) VALUES (:name)");
                foreach($data->sessions as $sess) {
                    if (is_string($sess) && trim($sess) !== '') {
                        $stmt->execute([':name' => trim($sess)]);
                    }
                }
            }

            // 2. Insert Students
            if(!empty($data->students)) {
                $stmt = $conn->prepare("INSERT INTO students (id, name, roll, batch_id, session, phone, email, gender, admission_date, father_name, mother_name, address, course, class, course_fee) 
                                        VALUES (:id, :name, :roll, :batch_id, :session, :phone, :email, :gender, :admission_date, :father_name, :mother_name, :address, :course, :class, :course_fee)");
                foreach($data->students as $s) {
                    $stmt->execute([
                        ':id' => $s->id ?? '',
                        ':name' => $s->name ?? '',
                        ':roll' => $s->roll ?? '',
                        ':batch_id' => $s->batchId ?? '',
                        ':session' => $s->session ?? null,
                        ':phone' => $s->phone ?? '',
                        ':email' => $s->email ?? null,
                        ':gender' => $s->gender ?? 'Male',
                        ':admission_date' => $s->admissionDate ?? date('Y-m-d'),
                        ':father_name' => $s->fatherName ?? null,
                        ':mother_name' => $s->motherName ?? null,
                        ':address' => $s->address ?? null,
                        ':course' => $s->course ?? 'ICT Academic',
                        ':class' => $s->class ?? 'Inter 1st Year',
                        ':course_fee' => isset($s->courseFee) ? (float)$s->courseFee : 0.00
                    ]);
                }
            }

            // 3. Insert Attendance Record
            if(!empty($data->attendance)) {
                $stmt = $conn->prepare("INSERT INTO attendance (date, student_id, batch_id, status) VALUES (:date, :student_id, :batch_id, :status)");
                foreach($data->attendance as $att) {
                    $stmt->execute([
                        ':date' => $att->date ?? '',
                        ':student_id' => $att->studentId ?? '',
                        ':batch_id' => $att->batchId ?? '',
                        ':status' => $att->status ?? 'Present'
                    ]);
                }
            }

            // 4. Insert Fees Paid Records
            if(!empty($data->fees)) {
                $stmt = $conn->prepare("INSERT INTO fees (id, student_id, month, amount, payment_date, payment_method, status, receipt_no) 
                                        VALUES (:id, :student_id, :month, :amount, :payment_date, :payment_method, :status, :receipt_no)");
                foreach($data->fees as $fee) {
                    $stmt->execute([
                        ':id' => $fee->id ?? '',
                        ':student_id' => $fee->studentId ?? '',
                        ':month' => $fee->month ?? '',
                        ':amount' => isset($fee->amount) ? (float)$fee->amount : 0.00,
                        ':payment_date' => $fee->paymentDate ?? null,
                        ':payment_method' => $fee->paymentMethod ?? 'Cash',
                        ':status' => $fee->status ?? 'Paid',
                        ':receipt_no' => $fee->receiptNo ?? ''
                    ]);
                }
            }

            // 5. Insert Model Test marks
            if(!empty($data->modelTests)) {
                $stmt = $conn->prepare("INSERT INTO model_tests (student_id, month, test1, test2, test3, test4, test5) 
                                        VALUES (:student_id, :month, :test1, :test2, :test3, :test4, :test5)");
                foreach($data->modelTests as $mt) {
                    $stmt->execute([
                        ':student_id' => $mt->studentId ?? '',
                        ':month' => $mt->month ?? '',
                        ':test1' => isset($mt->test1) ? (int)$mt->test1 : 0,
                        ':test2' => isset($mt->test2) ? (int)$mt->test2 : 0,
                        ':test3' => isset($mt->test3) ? (int)$mt->test3 : 0,
                        ':test4' => isset($mt->test4) ? (int)$mt->test4 : 0,
                        ':test5' => isset($mt->test5) ? (int)$mt->test5 : 0
                    ]);
                }
            }

            // 6. Insert Personal Notes
            if(!empty($data->notes)) {
                $stmt = $conn->prepare("INSERT INTO notes (id, title, content, category, color, is_pinned, created_at, updated_at) 
                                         VALUES (:id, :title, :content, :category, :color, :is_pinned, :created_at, :updated_at)");
                foreach($data->notes as $note) {
                    $stmt->execute([
                        ':id' => $note->id ?? '',
                        ':title' => $note->title ?? '',
                        ':content' => $note->content ?? null,
                        ':category' => $note->category ?? null,
                        ':color' => $note->color ?? null,
                        ':is_pinned' => !empty($note->isPinned) ? 1 : 0,
                        ':created_at' => $note->createdAt ?? null,
                        ':updated_at' => $note->updatedAt ?? null
                    ]);
                }
            }

            // 7. Insert Admin Users
            if(!empty($data->adminUsers)) {
                $stmt = $conn->prepare("INSERT INTO admin_users (username, password) VALUES (:username, :password)");
                foreach($data->adminUsers as $au) {
                    $stmt->execute([
                        ':username' => $au->username ?? 'admin',
                        ':password' => $au->password ?? 'password'
                    ]);
                }
            } else {
                $conn->exec("INSERT INTO admin_users (username, password) VALUES ('admin', 'password');");
            }

            // Re-enable Foreign Key checks at the very end
            $conn->exec('SET FOREIGN_KEY_CHECKS = 1;');

            $conn->commit();
            
            $summary = array(
                "batches" => count($data->batches),
                "classes" => isset($data->classes) ? count($data->classes) : 0,
                "courses" => isset($data->courses) ? count($data->courses) : 0,
                "students" => count($data->students),
                "sessions" => isset($data->sessions) ? count($data->sessions) : 0,
                "attendance" => count($data->attendance),
                "fees" => count($data->fees),
                "modelTests" => count($data->modelTests),
                "notes" => isset($data->notes) ? count($data->notes) : 0
            );

            echo json_encode(array(
                "status" => "success", 
                "message" => "লোকাল MySQL ডাটাবেজ সফলভাবে সিঙ্ক্রোনাইজ করা হয়েছে!",
                "synced_counts" => $summary
            ));

        } catch(PDOException $e) {
            if ($conn->inTransaction()) {
                $conn->rollBack();
            }
            // Ensure foreign key checks are re-enabled even on failure
            try {
                $conn->exec('SET FOREIGN_KEY_CHECKS = 1;');
            } catch(PDOException $ex) {}
            
            http_response_code(500);
            echo json_encode(array("status" => "error", "message" => "Sync transaction failed: " . $e->getMessage()));
        }
        break;

    case 'export_backup':
        try {
            $batches = $conn->query("SELECT * FROM batches")->fetchAll(PDO::FETCH_ASSOC);
            $school_classes = $conn->query("SELECT * FROM school_classes")->fetchAll(PDO::FETCH_ASSOC);
            $school_courses = $conn->query("SELECT * FROM school_courses")->fetchAll(PDO::FETCH_ASSOC);
            $students = $conn->query("SELECT * FROM students")->fetchAll(PDO::FETCH_ASSOC);
            $sessions = $conn->query("SELECT * FROM sessions")->fetchAll(PDO::FETCH_ASSOC);
            $attendance = $conn->query("SELECT * FROM attendance")->fetchAll(PDO::FETCH_ASSOC);
            $fees = $conn->query("SELECT * FROM fees")->fetchAll(PDO::FETCH_ASSOC);
            $model_tests = $conn->query("SELECT * FROM model_tests")->fetchAll(PDO::FETCH_ASSOC);
            $notes = $conn->query("SELECT * FROM notes")->fetchAll(PDO::FETCH_ASSOC);
            $admin_users = $conn->query("SELECT * FROM admin_users")->fetchAll(PDO::FETCH_ASSOC);

            $session_names = array_column($sessions, 'name');

            $mapped_classes = array_map(function($c) {
                return array(
                    "id" => $c['id'],
                    "name" => $c['name']
                );
            }, $school_classes);

            $mapped_courses = array_map(function($co) {
                return array(
                    "id" => $co['id'],
                    "name" => $co['name'],
                    "fee" => (float)$co['fee']
                );
            }, $school_courses);

            $mapped_students = array_map(function($s) {
                return array(
                    "id" => $s['id'],
                    "name" => $s['name'],
                    "roll" => $s['roll'],
                    "batchId" => $s['batch_id'],
                    "session" => $s['session'] ?? null,
                    "phone" => $s['phone'],
                    "email" => $s['email'],
                    "gender" => $s['gender'],
                    "admissionDate" => $s['admission_date'],
                    "fatherName" => $s['father_name'],
                    "motherName" => $s['mother_name'],
                    "address" => $s['address'],
                    "course" => $s['course'],
                    "class" => $s['class'],
                    "courseFee" => (float)$s['course_fee']
                );
            }, $students);

            $mapped_attendance = array_map(function($a) {
                return array(
                    "date" => $a['date'],
                    "studentId" => $a['student_id'],
                    "batchId" => $a['batch_id'],
                    "status" => $a['status']
                );
            }, $attendance);

            $mapped_fees = array_map(function($f) {
                return array(
                    "id" => $f['id'],
                    "studentId" => $f['student_id'],
                    "month" => $f['month'],
                    "amount" => (float)$f['amount'],
                    "paymentDate" => $f['payment_date'],
                    "paymentMethod" => $f['payment_method'],
                    "status" => $f['status'],
                    "receiptNo" => $f['receipt_no']
                );
            }, $fees);

            $mapped_model_tests = array_map(function($m) {
                return array(
                    "studentId" => $m['student_id'],
                    "month" => $m['month'],
                    "test1" => (int)$m['test1'],
                    "test2" => (int)$m['test2'],
                    "test3" => (int)$m['test3'],
                    "test4" => (int)$m['test4'],
                    "test5" => (int)$m['test5']
                );
            }, $model_tests);

            $mapped_notes = array_map(function($n) {
                return array(
                    "id" => $n['id'],
                    "title" => $n['title'],
                    "content" => $n['content'],
                    "category" => $n['category'],
                    "color" => $n['color'],
                    "isPinned" => (bool)$n['is_pinned'],
                    "createdAt" => $n['created_at'],
                    "updatedAt" => $n['updated_at']
                );
            }, $notes);

            $mapped_admin_users = array_map(function($au) {
                return array(
                    "username" => $au['username'],
                    "password" => $au['password']
                );
            }, $admin_users);

            echo json_encode(array(
                "app" => "Student Management System",
                "backupVersion" => "2.0.0",
                "exportedAt" => date('c'),
                "source" => "XAMPP MySQL Server",
                "students" => $mapped_students,
                "batches" => $batches,
                "classes" => $mapped_classes,
                "courses" => $mapped_courses,
                "sessions" => $session_names,
                "attendance" => $mapped_attendance,
                "fees" => $mapped_fees,
                "modelTests" => $mapped_model_tests,
                "notes" => $mapped_notes,
                "adminUsers" => $mapped_admin_users
            ));
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("status" => "error", "message" => "Export failed: " . $e->getMessage()));
        }
        break;

    case 'get_students':
        $stmt = $conn->prepare("SELECT s.*, b.name as batch_name FROM students s LEFT JOIN batches b ON s.batch_id = b.id ORDER BY s.roll ASC");
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
        break;

    default:
        echo json_encode(array(
            "status" => "info",
            "app" => "Student Management System PHP Sync Utility",
            "usage" => "Append ?action=test or ?action=bulk_sync to the URL endpoints."
        ));
        break;
}
?>`;

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Perform Connection Test via Fetch API
  const handleTestConnection = async () => {
    setTestStatus('loading');
    setTestMessage('');
    try {
      // Append timestamp to prevent caching
      const testUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=test&_t=${Date.now()}`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();
      let resData;
      try {
        resData = JSON.parse(responseText);
      } catch (jsonErr) {
        if (responseText.trim().startsWith('<') || responseText.includes('<b>') || responseText.includes('<br')) {
          const cleanText = responseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          throw new Error(`PHP Error: ${cleanText.slice(0, 300)}... (আপনার PHP স্ক্রিপ্টে বা ডাটাবেজ সংযোগে কোনো সমস্যা রয়েছে। অনুগ্রহ করে FAQ ট্যাব দেখুন)`);
        } else {
          throw new Error(`সার্ভার থেকে অবৈধ রেসপন্স এসেছে: ${responseText.slice(0, 200)}`);
        }
      }

      if (resData.status === 'success') {
        setTestStatus('success');
        setTestMessage(resData.message || 'সংযোগ সফল হয়েছে!');
      } else {
        setTestStatus('error');
        setTestMessage(resData.message || 'কানেকশন টেস্ট ব্যর্থ হয়েছে!');
      }
    } catch (err: any) {
      setTestStatus('error');
      // Look for indicators to give smart debug advice
      let msg = err.message || 'সংযোগ করা যায়নি।';
      if (msg.includes('Failed to fetch')) {
        msg = 'Failed to fetch! এটি সাধারণত Mixed Content বা CORS ব্লকের কারণে ঘটে। ব্রাউজারে ইনসিকিউর কনটেন্ট চালু করুন অথবা লোকাল টানেল ব্যবহার করুন।';
      }
      setTestMessage(msg);
    }
  };

  // Synchronize entire client state to localhost PHP MySQL API
  const handleBulkSync = async (isSilent: boolean = false) => {
    if (!isSilent) {
      setSyncStatus('loading');
      setSyncMessage('');
    } else {
      setLiveSyncCheckStatus('checking');
    }
    try {
      const backupStudents = students.length > 0 ? students : JSON.parse(localStorage.getItem('sms_students') || '[]');
      const backupBatches = batches.length > 0 ? batches : JSON.parse(localStorage.getItem('sms_batches') || '[]');
      const backupClasses = classes.length > 0 ? classes : JSON.parse(localStorage.getItem('sms_classes') || '[]');
      const backupCourses = courses.length > 0 ? courses : JSON.parse(localStorage.getItem('sms_courses') || '[]');
      const backupSessions = sessions.length > 0 ? sessions : JSON.parse(localStorage.getItem('sms_sessions') || '[]');
      const backupAttendance = attendance.length > 0 ? attendance : JSON.parse(localStorage.getItem('sms_attendance') || '[]');
      const backupFees = fees.length > 0 ? fees : JSON.parse(localStorage.getItem('sms_fees') || '[]');
      const backupModelTests = modelTests.length > 0 ? modelTests : JSON.parse(localStorage.getItem('sms_model_tests') || '[]');
      const backupNotes = JSON.parse(localStorage.getItem('sms_notes') || '[]');
      
      const storedUser = localStorage.getItem('sms_admin_user_id') || 'admin';
      const storedPass = localStorage.getItem('sms_admin_password') || 'password';
      const adminUsers = [{ username: storedUser, password: storedPass }];

      const payload = {
        app: 'Student Management System',
        backupVersion: '2.0.0',
        exportedAt: new Date().toISOString(),
        students: backupStudents,
        batches: backupBatches,
        classes: backupClasses,
        courses: backupCourses,
        sessions: backupSessions,
        attendance: backupAttendance,
        fees: backupFees,
        modelTests: backupModelTests,
        notes: backupNotes,
        adminUsers: adminUsers
      };

      const syncUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=bulk_sync`;

      const response = await fetch(syncUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let resData;
      try {
        resData = JSON.parse(responseText);
      } catch (jsonErr) {
        if (responseText.trim().startsWith('<') || responseText.includes('<b>') || responseText.includes('<br')) {
          const cleanText = responseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          throw new Error(`PHP Error: ${cleanText.slice(0, 300)}... (আপনার PHP স্ক্রিপ্টে বা ডাটাবেজ সংযোগে কোনো সমস্যা রয়েছে। অনুগ্রহ করে নতুন api.php কোডটি কপি করে সেভ করুন)`);
        } else {
          throw new Error(`সার্ভার থেকে অবৈধ রেসপন্স এসেছে: ${responseText.slice(0, 200)}`);
        }
      }

      if (resData.status === 'success') {
        const timeString = new Date().toLocaleTimeString();
        setLastSyncedTime(timeString);
        localStorage.setItem('sms_last_synced_time', timeString);
        setLiveSyncCheckStatus('online');

        if (!isSilent) {
          setSyncStatus('success');
          const counts = resData.synced_counts || {};
          setSyncMessage(`সফলভাবে সিঙ্ক হয়েছে! ${counts.students || 0} জন শিক্ষার্থী, ${counts.batches || 0} টি ব্যাচ, ${counts.classes || 0} টি শ্রেণী, ${counts.courses || 0} টি কোর্স, ${counts.attendance || 0} টি উপস্থিতি, ${counts.fees || 0} টি ফি রসিদ এবং ${counts.notes || 0} টি নোটস লোকাল MySQL ডাটাবেজে রেকর্ড করা হয়েছে।`);
        } else {
          // If silent/background sync succeeds, show success on panel too
          setSyncStatus('success');
          setSyncMessage(`অটো-সিঙ্ক সফল হয়েছে! শেষ সিঙ্ক সময়: ${timeString}`);
        }
      } else {
        if (!isSilent) {
          setSyncStatus('error');
          setSyncMessage(resData.message || 'সিঙ্ক্রোনাইজেশন ব্যর্থ হয়েছে!');
        }
        setLiveSyncCheckStatus('offline');
      }
    } catch (err: any) {
      if (!isSilent) {
        setSyncStatus('error');
        let msg = err.message || 'সিঙ্ক করতে ত্রুটি হয়েছে।';
        if (msg.includes('Failed to fetch')) {
          msg = 'Failed to fetch! আপনার api.php তে CORS হেডার চালু না থাকলে বা Mixed Content ব্লক হলে সিঙ্ক করা যাবে না। অনুগ্রহ করে FAQ ট্যাব দেখুন।';
        }
        setSyncMessage(msg);
      }
      setLiveSyncCheckStatus('offline');
    }
  };

  const [localServerBackupStatus, setLocalServerBackupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [localServerBackupMessage, setLocalServerBackupMessage] = useState('');
  const [localServerRestoreStatus, setLocalServerRestoreStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [localServerRestoreMessage, setLocalServerRestoreMessage] = useState('');

  const downloadBackupFromLocalServer = async () => {
    setLocalServerBackupStatus('loading');
    setLocalServerBackupMessage('');
    try {
      const exportUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=export_backup&_t=${Date.now()}`;
      const response = await fetch(exportUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();
      let resData;
      try {
        resData = JSON.parse(responseText);
      } catch (jsonErr) {
        if (responseText.trim().startsWith('<') || responseText.includes('<b>') || responseText.includes('<br')) {
          const cleanText = responseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          throw new Error(`PHP Error: ${cleanText.slice(0, 300)}...`);
        } else {
          throw new Error(`সার্ভার থেকে অবৈধ রেসপন্স এসেছে: ${responseText.slice(0, 200)}`);
        }
      }

      if (resData && (resData.students || resData.batches)) {
        const jsonString = JSON.stringify(resData, null, 2);
        const dateStr = new Date().toISOString().split('T')[0];
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sms_xampp_server_backup_${dateStr}.json`;
        link.click();
        URL.revokeObjectURL(url);

        setLocalServerBackupStatus('success');
        setLocalServerBackupMessage('সফলভাবে লোকাল XAMPP MySQL সার্ভার ডাটাবেজ থেকে ব্যাকআপ ডাউনলোড করা হয়েছে!');
      } else {
        throw new Error(resData.message || 'সার্ভার ব্যাকআপ ডাটা রিকভার করতে পারেনি।');
      }
    } catch (err: any) {
      setLocalServerBackupStatus('error');
      let msg = err.message || 'সার্ভার ব্যাকআপ ডাউনলোড করতে ত্রুটি হয়েছে।';
      if (msg.includes('Failed to fetch')) {
        msg = 'Failed to fetch! আপনার api.php কানেকশন বা CORS সেটিংসে সমস্যা রয়েছে। অথবা আপনার api.php টি ৩য় ট্যাব থেকে আপডেট করা নেই।';
      }
      setLocalServerBackupMessage(msg);
    }
  };

  const handleRestoreToLocalServer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      setLocalServerRestoreStatus('loading');
      setLocalServerRestoreMessage('');
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (!json || typeof json !== 'object') {
          throw new Error('ভুল ফরম্যাট! অনুগ্রহ করে একটি সঠিক JSON ফাইল আপলোড করুন।');
        }

        if (json.app !== 'Student Management System' && !json.students && !json.batches) {
          throw new Error('এটি কোনো বৈধ ব্যাকআপ ফাইল নয় অথবা ডাটা ফরম্যাট সঠিক নয়।');
        }

        const confirmRestore = window.confirm(
          'সতর্কতা: এই ব্যাকআপটি রিস্টোর করলে আপনার ব্রাউজার এবং লোকাল XAMPP MySQL ডাটাবেজের সকল বর্তমান ডাটা মুছে যাবে এবং এই ব্যাকআপ ফাইলটির ডাটা দ্বারা প্রতিস্থাপিত হবে। আপনি কি নিশ্চিতভাবে এগিয়ে যেতে চান?'
        );

        if (confirmRestore) {
          if (onRestore) {
            onRestore({
              students: json.students || [],
              batches: json.batches || [],
              sessions: json.sessions || [],
              attendance: json.attendance || [],
              fees: json.fees || [],
              modelTests: json.modelTests || []
            });
            
            if (json.notes && Array.isArray(json.notes)) {
              localStorage.setItem('sms_notes', JSON.stringify(json.notes));
            }
          }

          const syncUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=bulk_sync`;
          const response = await fetch(syncUrl, {
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
              students: json.students || [],
              batches: json.batches || [],
              sessions: json.sessions || [],
              attendance: json.attendance || [],
              fees: json.fees || [],
              modelTests: json.modelTests || [],
              notes: json.notes || []
            })
          });

          const responseText = await response.text();
          let resData;
          try {
            resData = JSON.parse(responseText);
          } catch (jsonErr) {
            throw new Error(`রিস্টোর ডাটা সার্ভারে সেভ করতে সমস্যা হয়েছে। ব্রাউজারে ডাটা রিস্টোর হয়েছে কিন্তু সার্ভার ডাটাবেজে হয়নি।`);
          }

          if (resData.status === 'success') {
            const timeString = new Date().toLocaleTimeString();
            setLastSyncedTime(timeString);
            localStorage.setItem('sms_last_synced_time', timeString);
            
            setLocalServerRestoreStatus('success');
            setLocalServerRestoreMessage('অভিনন্দন! আপনার ব্যাকআপ ডাটা ব্রাউজার এবং লোকাল XAMPP MySQL ডাটাবেজে সফলভাবে রিস্টোর হয়েছে।');
            alert('অভিনন্দন! ব্রাউজার এবং লোকাল XAMPP MySQL সার্ভারে সফলভাবে ডাটা রিস্টোর হয়েছে।');
          } else {
            throw new Error(resData.message || 'সার্ভারে রিস্টোর কমান্ড সফল হয়নি।');
          }
        } else {
          setLocalServerRestoreStatus('idle');
        }
      } catch (err: any) {
        setLocalServerRestoreStatus('error');
        setLocalServerRestoreMessage(err.message || 'ফাইলটি রিস্টোর করতে ত্রুটি হয়েছে।');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const faqs = [
    {
      q: "ডেটাবেজে সিংক করার পর 'Unexpected token \"<\", ... is not valid JSON' এরর দেখালে কি করব?",
      a: "এই এররটি ঘটার মানে হচ্ছে আপনার api.php স্ক্রিপ্টটি রান করার সময় কোনো পিএইচপি ওয়ার্নিং, নোটিশ বা ডাটাবেজ কানেকশন সংক্রান্ত ত্রুটি ঘটেছে, যার ফলে এটি JSON ডাটার পরিবর্তে HTML ফরম্যাটের এরর কোড ব্রাউজারে রিটার্ন করেছে। সমাধান করতে: ১. নিশ্চিত হোন আপনার XAMPP Control Panel-এ Apache এবং MySQL সচল (Start) আছে কিনা। ২. আপনার api.php তে ডাটাবেজ ইউজার 'root' এবং পাসওয়ার্ড খালি ('') আছে কিনা চেক করুন। ৩. আমাদের নতুন এবং আপগ্রেডেড ৩য় ট্যাবের 'পিএইচপি সিঙ্ক স্ক্রিপ্ট' এর কোডটি কপি করে আবার api.php ফাইলে সেভ করুন। নতুন কোডটিতে বিল্ট-ইন অটো-ডাটাবেজ ও টেবিল ক্রিয়েশন এবং উন্নত এরর-হ্যান্ডলার যুক্ত করা হয়েছে, যা নিজে থেকেই ডাটাবেজ তৈরি করে নেবে এবং কোনো এরর ঘটলে তার বিস্তারিত বিবরণ আমাদের অ্যাপের মধ্যেই লাল বাক্সে সুন্দরভাবে ফুটিয়ে তুলবে।"
    },
    {
      q: "ব্রাউজারে Mixed Content / Failed to Fetch এর লাল এরর দেখাচ্ছে কেন?",
      a: "আমাদের এই অ্যাপ্লিকেশনটি নিরাপদ HTTPS সার্ভার থেকে চলে, কিন্তু আপনার লোকাল XAMPP সাধারণত HTTP (অসুরক্ষিত) প্রোটোকলে চলে। ব্রাউজার সিকিউরিটি প্রোটোকল অনুযায়ী HTTPS থেকে HTTP তে সরাসরি রিকোয়েস্ট ব্লক করে (যাকে Mixed Content বলে)। এটি সমাধান করতে ব্রাউজার এড্রেস বারের ডানে ছোট একটি শিল্ড আইকন অথবা সাইট সেটিংসে গিয়ে 'Insecure content' বা 'অসুরক্ষিত কনটেন্ট অনুমতি দিন' (Allow Insecure Content) এ ক্লিক করে পেজটি রিলোড দিন। অথবা একটি ফ্রি লোকাল টানেল (যেমন: Ngrok, Localtunnel) ব্যবহার করে আপনার লোকাল সার্ভারকে HTTPS এড্রেস দিয়ে সিঙ্ক করতে পারেন।"
    },
    {
      q: "আমার api.php ফাইলে CORS (Cross-Origin Resource Sharing) ত্রুটি দেখাচ্ছে, কি করব?",
      a: "ক্রস-অরিজিন ব্লক এড়াতে পিএইচপি ফাইলের একদম উপরে CORS হেডার থাকা আবশ্যক। আমাদের এই গাইডে দেওয়া PHP Sync Script (api.php) কোডে ইতিমধ্যেই `header('Access-Control-Allow-Origin: *');` যুক্ত করা রয়েছে। আপনি হুবহু ডান পাশে দেওয়া কোডটি কপি করে api.php ফাইলে পেস্ট করলে এই সমস্যার সমাধান হয়ে যাবে।"
    },
    {
      q: "XAMPP এ Apache অথবা MySQL স্টার্ট হচ্ছে না কেন?",
      a: "সাধারনত পোর্ট ব্লক হওয়ার কারণে এমন হয়। আপনার পিসিতে Skype, VMware বা IIS ইনস্টল করা থাকলে Apache এর ডিফল্ট ৮০ নম্বর পোর্ট ব্লক হয়ে যেতে পারে। সমাধান করতে XAMPP Control Panel এর Apache লাইনের Config বাটনে ক্লিক করে httpd.conf ওপেন করুন, এবং Listen 80 পরিবর্তন করে Listen 8080 বা অন্য কোনো খালি পোর্ট দিয়ে সেভ করুন। এরপর ব্রাউজারে 'localhost:8080/student-app/api.php' লিখে চেষ্টা করুন।"
    },
    {
      q: "MySQL এর ইউজারনেম ও পাসওয়ার্ড পরিবর্তন করতে চাইলে কি করব?",
      a: "XAMPP এর ডিফল্ট ইউজারনেম 'root' থাকে এবং কোনো পাসওয়ার্ড থাকে না (খালি থাকে)। আপনার যদি কাস্টম ডাটাবেজ ইউজার সেট করা থাকে, তবে api.php ফাইলের ২২ এবং ২৩ নম্বর লাইনে যথাক্রমে `$username = 'আপনার_ইউজার'` এবং `$password = 'আপনার_পাসওয়ার্ড'` লিখে পরিবর্তন করে নিন।"
    },
    {
      q: "ডাটা সিঙ্ক করলে কি আগের ডাটা ডিলিট হয়ে যাবে?",
      a: "হ্যাঁ, 'লাইভ সিঙ্ক' এর মাধ্যমে ডাটা পাঠালে লোকাল MySQL ডাটাবেজটিকে এই ব্রাউজার অ্যাপ্লিকেশনের অবিকল ক্লোন করতে আগের ডাটা ট্রাঙ্কেট (মুছে) ফেলা হয় এবং একদম নতুনভাবে ইনসার্ট করা হয়। ফলে লোকাল ডাটাবেজে ডুপ্লিকেট রোল বা জটলা তৈরি হয় না।"
    }
  ];

  return (
    <div id="xampp-export-module" className="space-y-6 font-sans">
      
      {/* Dynamic Header Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="bg-indigo-50 p-2 rounded-2xl">
              <Server className="h-6 w-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
              Local Hosting Utility
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            লোকাল সার্ভার (XAMPP & MySQL) কানেকশন গাইড
          </h2>
          <p className="text-slate-400 text-xs font-medium">
            আপনার কম্পিউটারের লোকাল XAMPP ডাটাবেজ সেটআপ করুন এবং ব্রাউজারের ডাটা সরাসরি লোকাল MySQL এ সিঙ্ক করুন।
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={downloadBackup}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4.5 py-3 rounded-2xl text-xs transition shadow-md shadow-indigo-600/15 cursor-pointer border-0"
          >
            <Download className="h-4 w-4 stroke-[3px]" /> ব্যাকআপ ডাউনলোড (JSON)
          </button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
              id="header-restore-file"
            />
            <label
              htmlFor="header-restore-file"
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 font-bold px-4.5 py-3 rounded-2xl text-xs transition cursor-pointer"
            >
              <FileCode className="h-4 w-4 text-slate-500 stroke-[2.5px]" /> ব্যাকআপ রিস্টোর
            </label>
          </div>
        </div>
      </div>

      {/* Manual Backup Upload Restore Message Box */}
      {restoreStatus !== 'idle' && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-150 ${
          restoreStatus === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {restoreStatus === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <p className="font-extrabold">{restoreStatus === 'success' ? 'রিস্টোর সম্পন্ন হয়েছে!' : 'রিস্টোর ব্যর্থ হয়েছে!'}</p>
            <p className="text-[11px] leading-relaxed opacity-90">{restoreMessage}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/50">
        {[
          { id: 'instructions', label: '১. সেটআপ নির্দেশিকা', icon: BookOpen },
          { id: 'sql', label: '২. ডাটাবেজ স্কিমা (SQL)', icon: Database },
          { id: 'php', label: '৩. পিএইচপি সিঙ্ক স্ক্রিপ্ট', icon: Code2 },
          { id: 'sync_tool', label: '৪. লাইভ সিঙ্ক টুল (Live Sync)', icon: Activity },
          { id: 'troubleshoot', label: '৫. সমস্যা সমাধান (FAQ)', icon: HelpCircle },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer border-0 ${
                isSelected
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
              }`}
            >
              <IconComp className={`h-4 w-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels Contents */}
      <div className="grid grid-cols-1 gap-6">

        {/* 1. Step-By-Step Instructions Tab */}
        {activeTab === 'instructions' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                ধাপ-ভিত্তিক XAMPP সার্ভার কানেকশন গাইড
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                আপনার পিসির লোকাল MySQL ডাটাবেজে ৫টি সহজ ধাপে সম্পূর্ণ অ্যাপ্লিকেশনটি চালু করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Step 1 */}
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-3 relative overflow-hidden">
                <span className="absolute right-3 top-3 text-4xl font-black text-slate-100 select-none">০১</span>
                <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl w-fit">
                  <Server className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-xs">XAMPP ইনস্টল ও স্টার্ট</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  আপনার কম্পিউটারে XAMPP ডাউনলোড ও ইনস্টল করে কন্ট্রোল প্যানেল থেকে <span className="font-bold text-slate-700">Apache</span> এবং <span className="font-bold text-slate-700">MySQL</span> সার্ভিস দুটি <span className="text-emerald-600 font-bold">Start</span> করুন।
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-3 relative overflow-hidden">
                <span className="absolute right-3 top-3 text-4xl font-black text-slate-100 select-none">০২</span>
                <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl w-fit">
                  <Database className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-xs">ডাটাবেজ তৈরি করুন</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  আপনার ব্রাউজার থেকে <a href="http://localhost/phpmyadmin" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">localhost/phpmyadmin</a> লিংকে যান এবং <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-bold">student_management</span> নামে একটি নতুন ডাটাবেজ তৈরি করুন।
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-3 relative overflow-hidden">
                <span className="absolute right-3 top-3 text-4xl font-black text-slate-100 select-none">০৩</span>
                <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl w-fit">
                  <FileCode className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-xs">SQL টেবিলসমূহ ইমপোর্ট</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  আমাদের ২য় ট্যাব <span className="font-bold text-slate-700">"ডাটাবেজ স্কিমা (SQL)"</span> থেকে SQL কোডটি কপি করে phpMyAdmin-এর SQL কনসোলে রান (Go) করে টেবিলগুলো ইমপোর্ট করুন।
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-3 relative overflow-hidden">
                <span className="absolute right-3 top-3 text-4xl font-black text-slate-100 select-none">০৪</span>
                <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl w-fit">
                  <Code2 className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-xs">PHP API ফাইল সেভ</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  আপনার কম্পিউটারের <span className="font-mono text-slate-700 font-semibold bg-slate-100 p-0.5 rounded">C:/xampp/htdocs/</span> ডিরেক্টরিতে <span className="font-bold text-indigo-600">student-app</span> নামে একটি ফোল্ডার তৈরি করে তার ভেতর <span className="font-bold text-slate-800">api.php</span> নামে ৩য় ট্যাবের কোডটি সেভ করুন।
                </p>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100 space-y-3 relative overflow-hidden">
                <span className="absolute right-3 top-3 text-4xl font-black text-slate-100 select-none">০৫</span>
                <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl w-fit">
                  <Activity className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-xs">লাইভ সিঙ্ক চালু করুন</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  আমাদের ৪র্থ ট্যাব <span className="font-bold text-slate-700">"লাইভ সিঙ্ক টুল"</span> এ যান এবং আপনার URL টি দিয়ে টেস্ট করে লাইভ সিঙ্ক সম্পন্ন করুন। ব্রাউজারের সকল ডাটা লোকাল MySQL এ জমা হবে।
                </p>
              </div>

            </div>
          </div>
        )}

        {/* 2. Database Schema SQL Tab */}
        {activeTab === 'sql' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-600" />
                  লোকাল ডাটাবেজ স্কিমা (SQL Database Schema)
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  এই SQL কোডটি phpMyAdmin-এ রান করে আপনার লোকাল MySQL ডাটাবেজে প্রয়োজনীয় সকল টেবিল তৈরি করুন।
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(sqlSchema, setCopiedSql)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer border-0"
                >
                  {copiedSql ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600 stroke-[3px]" /> কপি হয়েছে
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> কপি করুন
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('database_schema.sql', sqlSchema)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer border-0"
                >
                  <Download className="h-4 w-4" /> ডাউনলোড করুন
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-slate-950 text-slate-200 p-5 rounded-2xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[480px] border border-slate-800 shadow-inner">
                <code>{sqlSchema}</code>
              </pre>
            </div>
          </div>
        )}

        {/* 3. PHP Sync Script Tab */}
        {activeTab === 'php' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-indigo-600" />
                  লোকাল পিএইচপি সিঙ্ক স্ক্রিপ্ট (api.php)
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  আপনার htdocs ফোল্ডারে <code>student-app/api.php</code> তৈরি করে এই কোডটি হুবহু পেস্ট করুন।
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(phpApi, setCopiedPhp)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer border-0"
                >
                  {copiedPhp ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600 stroke-[3px]" /> কপি হয়েছে
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> কপি করুন
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('api.php', phpApi)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer border-0"
                >
                  <Download className="h-4 w-4" /> ডাউনলোড করুন
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-slate-950 text-slate-200 p-5 rounded-2xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[480px] border border-slate-800 shadow-inner">
                <code>{phpApi}</code>
              </pre>
            </div>
          </div>
        )}

        {/* 4. Live Sync Tool Tab */}
        {activeTab === 'sync_tool' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600 animate-pulse" />
                লাইভ লোকালহোস্ট সিঙ্ক কন্ট্রোলার (Live Sync Tool)
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                আপনার ব্রাউজার অ্যাপ্লিকেশনের সমস্ত বর্তমান ডাটা এক ক্লিকে বা অটোমেটিক উপায়ে লোকাল MySQL ডাটাবেজে পাঠিয়ে সিঙ্ক করে নিন।
              </p>
            </div>

            {/* Live Sync Controller Panel */}
            <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    AUTOMATIC SYNC ENGINE
                  </span>
                  <h4 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 mt-1">
                    <Activity className={`h-4 w-4 text-indigo-500 ${isLiveSync && liveSyncCheckStatus === 'online' ? 'animate-pulse' : ''}`} />
                    স্বয়ংক্রিয় লাইভ সিঙ্ক কন্ট্রোলার (Auto Sync Control)
                  </h4>
                  <p className="text-slate-400 text-[11px] font-medium leading-relaxed">
                    এই মোড চালু থাকলে, XAMPP সার্ভার অন হওয়া মাত্রই ডাটা কানেক্ট হয়ে যাবে এবং ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে লোকাল MySQL এ সিঙ্ক হবে।
                  </p>
                </div>

                {/* IOS Style Switch Toggle */}
                <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs w-fit">
                  <span className="text-[11px] font-black text-slate-700">
                    {isLiveSync ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !isLiveSync;
                      setIsLiveSync(nextState);
                      localStorage.setItem('sms_live_sync', String(nextState));
                      if (nextState) {
                        setSyncMessage('লাইভ অটো-সিঙ্ক চালু করা হয়েছে। XAMPP সার্ভার সচল হওয়া মাত্রই অটো সিঙ্ক হয়ে যাবে...');
                      } else {
                        setSyncMessage('');
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                      isLiveSync ? 'bg-indigo-600' : 'bg-slate-250'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isLiveSync ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Server State Monitor */}
              {isLiveSync && (
                <div className="pt-4 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                    liveSyncCheckStatus === 'checking' ? 'bg-amber-50/40 border-amber-100 text-amber-800' :
                    liveSyncCheckStatus === 'online' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' :
                    'bg-rose-50/50 border-rose-100 text-rose-800'
                  }`}>
                    <div className="mt-1">
                      {liveSyncCheckStatus === 'checking' && (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-amber-600 border-t-transparent rounded-full shrink-0" />
                      )}
                      {liveSyncCheckStatus === 'online' && (
                        <div className="relative flex h-3 w-3 shrink-0 mt-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </div>
                      )}
                      {liveSyncCheckStatus === 'offline' && (
                        <div className="h-3 w-3 bg-rose-500 rounded-full shrink-0 mt-0.5 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-extrabold text-slate-800 block">লোকাল সার্ভার সংযোগ অবস্থা:</span>
                      {liveSyncCheckStatus === 'checking' && 'সংযোগ পরীক্ষা করা হচ্ছে...'}
                      {liveSyncCheckStatus === 'online' && '🟢 XAMPP সার্ভার সচল ও কানেক্টেড রয়েছে।'}
                      {liveSyncCheckStatus === 'offline' && (
                        <span className="text-rose-700">
                          🔴 <strong>সার্ভার অফলাইন!</strong> দয়া করে XAMPP কন্ট্রোল প্যানেল থেকে Apache ও MySQL স্টার্ট করুন। সার্ভার অন হবামাত্র অটো-সিঙ্ক হয়ে যাবে।
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed text-slate-600">
                      <span className="font-extrabold text-slate-800 block">সর্বশেষ সফল সিঙ্ক্রোনাইজেশন:</span>
                      {lastSyncedTime ? (
                        <>
                          <span className="text-indigo-600 font-black">{lastSyncedTime}</span> মিনিটে সফলভাবে ডাটা সিঙ্ক করা হয়েছে।
                        </>
                      ) : (
                        'এখনো লাইভ ডাটা সিঙ্ক করা হয়নি।'
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* URL Input Form Card */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Settings className="h-4 w-4 text-slate-500 stroke-[2.2]" />
                  লোকাল API URL (Local Server API Address)
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-indigo-500" />
                    <input
                      type="url"
                      required
                      placeholder="যেমন: http://localhost/student-app/api.php"
                      value={apiUrl}
                      onChange={handleApiUrlChange}
                      className="w-full pl-10.5 pr-4 py-3 bg-white border border-slate-250 focus:border-indigo-500 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-slate-800 transition shadow-xs"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testStatus === 'loading' || syncStatus === 'loading'}
                      className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {testStatus === 'loading' ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          টেস্ট হচ্ছে...
                        </>
                      ) : (
                        <>
                          <Wifi className="h-4 w-4" />
                          ম্যানুয়াল কানেকশন টেস্ট
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBulkSync(false)}
                      disabled={testStatus === 'loading' || syncStatus === 'loading'}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 cursor-pointer disabled:opacity-50 border-0"
                    >
                      {syncStatus === 'loading' ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          সিঙ্ক হচ্ছে...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          ম্যানুয়াল ডাটাবেজ সিঙ্ক
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Display Messages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-slate-150">
                
                {/* Connection Status Panel */}
                <div className={`p-4 rounded-xl border flex gap-3 ${
                  testStatus === 'idle' ? 'bg-white border-slate-200 text-slate-500' :
                  testStatus === 'loading' ? 'bg-blue-50/50 border-blue-100 text-blue-600' :
                  testStatus === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                  'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                  <div className="mt-0.5">
                    {testStatus === 'success' ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" /> :
                     testStatus === 'error' ? <XCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" /> :
                     <Wifi className="h-4.5 w-4.5 text-slate-400 shrink-0" />}
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    <p className="font-extrabold text-xs">সার্ভার সংযোগ টেস্ট স্টেটাস:</p>
                    <p className="opacity-95">{testMessage || 'সার্ভার সংযোগ পরীক্ষা করতে কন্টোলার বাটনে ক্লিক করুন।'}</p>
                  </div>
                </div>

                {/* Synchronization Status Panel */}
                <div className={`p-4 rounded-xl border flex gap-3 ${
                  syncStatus === 'idle' ? 'bg-white border-slate-200 text-slate-500' :
                  syncStatus === 'loading' ? 'bg-blue-50/50 border-blue-100 text-blue-600' :
                  syncStatus === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                  'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                  <div className="mt-0.5">
                    {syncStatus === 'success' ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" /> :
                     syncStatus === 'error' ? <XCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" /> :
                     <RefreshCw className="h-4.5 w-4.5 text-slate-400 shrink-0" />}
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    <p className="font-extrabold text-xs">ডাটাবেজ সিঙ্ক স্টেটাস:</p>
                    <p className="opacity-95">{syncMessage || 'সিঙ্ক বাটন ক্লিক করলে আপনার বর্তমান ব্রাউজার মেমোরির সকল ডাটা MySQL এ ওভাররাইট হবে।'}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* 💾 XAMPP Server Backup & Restore Panel */}
            <div className="bg-gradient-to-r from-indigo-50/50 to-slate-50 border border-indigo-100 p-6 rounded-2xl space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  Database Server Tools
                </span>
                <h4 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 mt-1.5">
                  <Database className="h-4 w-4 text-indigo-600" />
                  XAMPP লোকাল ডাটাবেজ ব্যাকআপ ও রিস্টোর (Local Server Backup & Restore)
                </h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  আপনার লোকাল XAMPP MySQL সার্ভারে সংরক্ষিত ডাটার পূর্ণাঙ্গ ব্যাকআপ নিন এবং রিস্টোর ফাইল আপলোড করে এক ক্লিকে লোকাল MySQL সার্ভারে রিস্টোর বা রিস্টার্ট করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Download Backup Card */}
                <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Download className="h-4 w-4 text-indigo-600" />
                      লোকাল সার্ভার থেকে ব্যাকআপ ডাউনলোড
                    </p>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      লোকাল MySQL ডাটাবেজ থেকে সরাসরি সম্পূর্ণ ডাটা ডাউনলোড করে JSON ফাইল হিসেবে আপনার কম্পিউটারে সংরক্ষণ করুন।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={downloadBackupFromLocalServer}
                    disabled={localServerBackupStatus === 'loading'}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border-0 shadow-sm"
                  >
                    {localServerBackupStatus === 'loading' ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ডাউনলোড হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        সার্ভার থেকে ব্যাকআপ নিন
                      </>
                    )}
                  </button>
                </div>

                {/* Upload & Restore Card */}
                <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <RefreshCw className="h-4 w-4 text-emerald-600" />
                      লোকাল সার্ভারে ব্যাকআপ রিস্টোর
                    </p>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      আপনার কম্পিউটারে সংরক্ষিত ব্যাকআপ JSON ফাইল সিলেক্ট করে ব্রাউজার এবং লোকাল XAMPP সার্ভারে একসাথে রিস্টোর করুন।
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreToLocalServer}
                      className="hidden"
                      id="local-server-restore-file"
                      disabled={localServerRestoreStatus === 'loading'}
                    />
                    <label
                      htmlFor="local-server-restore-file"
                      className={`w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                        localServerRestoreStatus === 'loading' ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {localServerRestoreStatus === 'loading' ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          রিস্টোর হচ্ছে...
                        </>
                      ) : (
                        <>
                          <FileCode className="h-3.5 w-3.5" />
                          ফাইল রিস্টোর করুন
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Status Message Logs */}
              {(localServerBackupStatus !== 'idle' || localServerRestoreStatus !== 'idle') && (
                <div className="pt-2 border-t border-indigo-50 space-y-2">
                  {localServerBackupStatus !== 'idle' && (
                    <div className={`p-3.5 rounded-xl border flex gap-2 text-[11px] leading-relaxed ${
                      localServerBackupStatus === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                      localServerBackupStatus === 'loading' ? 'bg-indigo-50/50 border-indigo-100 text-indigo-800' :
                      'bg-rose-50 border-rose-100 text-rose-800'
                    }`}>
                      <div>
                        {localServerBackupStatus === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> :
                         localServerBackupStatus === 'error' ? <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" /> :
                         <Activity className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />}
                      </div>
                      <div>
                        <p className="font-extrabold">সার্ভার ব্যাকআপ অবস্থা:</p>
                        <p className="opacity-95">{localServerBackupMessage || 'ব্যাকআপ ফাইল প্রস্তুত করা হচ্ছে...'}</p>
                      </div>
                    </div>
                  )}

                  {localServerRestoreStatus !== 'idle' && (
                    <div className={`p-3.5 rounded-xl border flex gap-2 text-[11px] leading-relaxed ${
                      localServerRestoreStatus === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                      localServerRestoreStatus === 'loading' ? 'bg-indigo-50/50 border-indigo-100 text-indigo-800' :
                      'bg-rose-50 border-rose-100 text-rose-800'
                    }`}>
                      <div>
                        {localServerRestoreStatus === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> :
                         localServerRestoreStatus === 'error' ? <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" /> :
                         <RefreshCw className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5 animate-spin" />}
                      </div>
                      <div>
                        <p className="font-extrabold">সার্ভার রিস্টোর অবস্থা:</p>
                        <p className="opacity-95">{localServerRestoreMessage || 'সার্ভার ডাটাবেজে ব্যাকআপ ডাটা আপলোড ও রিস্টোর করা হচ্ছে...'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 🛡️ Browser Auto-Backup & Snapshot Manager Panel */}
            <div className="bg-gradient-to-r from-emerald-50/60 to-slate-50/40 border border-emerald-100 p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Auto-Backup Engine Active
                  </span>
                  <h4 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 mt-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    ব্রাউজার অটো-ব্যাকআপ ও স্ন্যাপশট ম্যানেজার (Browser Auto-Backups)
                  </h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    অ্যাপের যেকোনো ডাটা পরিবর্তন হলে তা সাথে সাথে ব্রাউজারের অফলাইন মেমোরিতে ব্যাকআপ হয়ে যায়। এছাড়াও আপনি যেকোনো সময় ম্যানুয়াল স্ন্যাপশট নিতে পারেন এবং এক ক্লিকে রিস্টোর করতে পারেন।
                  </p>
                </div>

                <div className="flex gap-2 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={createManualBackup}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl text-[11px] transition cursor-pointer border-0 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" /> এখনই স্ন্যাপশট নিন
                  </button>
                  {autoBackups.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllAutoBackups}
                      className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-black px-4 py-2.5 rounded-xl text-[11px] transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> সব মুছুন
                    </button>
                  )}
                </div>
              </div>

              {/* Backups List */}
              <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
                {autoBackups.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="bg-slate-50 p-3 rounded-full w-fit mx-auto text-slate-400">
                      <Database className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-extrabold text-slate-500">কোনো অটো-ব্যাকআপ স্ন্যাপশট পাওয়া যায়নি</p>
                    <p className="text-slate-400 text-[10px]">ডাটাবেজে পরিবর্তন আনলে অথবা ম্যানুয়ালি স্ন্যাপশট নিলে এখানে স্বয়ংক্রিয়ভাবে তালিকা তৈরি হবে।</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                          <th className="px-4 py-3">তারিখ ও সময়</th>
                          <th className="px-4 py-3">পরিবর্তনের বিবরণ (Action)</th>
                          <th className="px-4 py-3 text-center">ডাটা রেকর্ড পরিমাণ</th>
                          <th className="px-4 py-3 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {autoBackups.map((backup: any, idx: number) => {
                          const dateObj = new Date(backup.timestamp);
                          const formattedDate = dateObj.toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                          const formattedTime = dateObj.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });

                          return (
                            <tr key={backup.id} className="hover:bg-slate-50/50 transition">
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700 whitespace-nowrap space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{formattedDate}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono ml-5">{formattedTime}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    backup.action === 'ম্যানুয়াল স্ন্যাপশট'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  }`}>
                                    {backup.action}
                                  </span>
                                  {idx === 0 && (
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md animate-pulse">LATEST</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center font-mono text-[11px] font-bold text-slate-600 whitespace-nowrap">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px]">
                                  S: {backup.counts?.students || 0} | B: {backup.counts?.batches || 0} | A: {backup.counts?.attendance || 0} | F: {backup.counts?.fees || 0} | N: {backup.counts?.notes || 0}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => restoreAutoBackup(backup)}
                                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black rounded-lg text-[10px] transition cursor-pointer border-0"
                                    title="রিস্টোর করুন"
                                  >
                                    রিস্টোর
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => downloadSingleSnapshot(backup)}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                    title="ডাউনলোড JSON"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteAutoBackup(backup.id)}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Current Payload Preview Widget */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-700 flex items-center gap-1">
                <Layers className="h-4 w-4 text-slate-500" />
                সিঙ্কের জন্য প্রস্তুত বর্তমান ডাটা সেট (Local State Summary):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {[
                  { label: 'মোট শিক্ষার্থী', val: students.length > 0 ? students.length : JSON.parse(localStorage.getItem('sms_students') || '[]').length },
                  { label: 'মোট ব্যাচ', val: batches.length > 0 ? batches.length : JSON.parse(localStorage.getItem('sms_batches') || '[]').length },
                  { label: 'উপস্থিতি লগ', val: attendance.length > 0 ? attendance.length : JSON.parse(localStorage.getItem('sms_attendance') || '[]').length },
                  { label: 'টাকা আদায় রেকর্ড', val: fees.length > 0 ? fees.length : JSON.parse(localStorage.getItem('sms_fees') || '[]').length },
                  { label: 'অ্যাডমিন নোটস', val: JSON.parse(localStorage.getItem('sms_notes') || '[]').length },
                ].map((item, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-center space-y-1">
                    <p className="text-[10px] text-slate-400 font-extrabold">{item.label}</p>
                    <p className="text-lg font-black text-slate-800 font-mono">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. Troubleshooting Accordions Tab */}
        {activeTab === 'troubleshoot' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-600" />
                লোকাল কানেকশন সমস্যা ও তার সমাধান (XAMPP FAQ)
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                MySQL ও PHP সিঙ্ক্রোনাইজেশনের ক্ষেত্রে সাধারণ সমস্যাগুলোর সহজতম গাইড।
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full text-left p-4 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="text-xs font-black text-slate-800 leading-snug flex items-center gap-2">
                        <span className="h-5 w-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-mono shrink-0">
                          {index + 1}
                        </span>
                        {faq.q}
                      </span>
                      <span className="text-slate-400 font-black text-sm shrink-0">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="p-4.5 bg-white border-t border-slate-50 text-slate-500 text-xs leading-relaxed space-y-2 animate-in slide-in-from-top duration-200">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
