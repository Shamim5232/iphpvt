import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { Student, Batch, FeeCollection, SchoolClass, Course } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  GraduationCap, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  BookOpen, 
  Clock, 
  Tag, 
  Users,
  ShieldAlert,
  CalendarDays,
  MapPin,
  Layers,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  X,
  Printer,
  Download,
  ArrowLeftRight
} from 'lucide-react';

interface AdmissionProps {
  students: Student[];
  batches: Batch[];
  classes: SchoolClass[];
  courses: Course[];
  sessions: string[];
  fees?: FeeCollection[];
  onAddStudent: (student: Omit<Student, 'id'>) => Promise<boolean>;
  onUpdateStudent: (student: Student) => Promise<boolean>;
  onDeleteStudent: (id: string) => Promise<boolean>;
  onTransferStudent?: (studentId: string, newBatchId: string) => Promise<boolean>;
  onAddBatch: (batch: Omit<Batch, 'id'>) => Promise<boolean>;
  onUpdateBatch: (batch: Batch) => Promise<boolean>;
  onDeleteBatch: (id: string) => Promise<boolean>;
  onAddSession: (session: string) => Promise<boolean>;
  onDeleteSession: (session: string) => Promise<boolean>;
  onUpdateClasses: (updatedClasses: SchoolClass[]) => Promise<boolean>;
  onUpdateCourses: (updatedCourses: Course[]) => Promise<boolean>;
}

export default function Admission({
  students,
  batches,
  classes = [],
  courses = [],
  sessions,
  fees = [],
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onTransferStudent,
  onAddBatch,
  onUpdateBatch,
  onDeleteBatch,
  onAddSession,
  onDeleteSession,
  onUpdateClasses,
  onUpdateCourses,
}: AdmissionProps) {
  // Navigation states
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'batches' | 'sessions' | 'classes_courses'>('students');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [historyTab, setHistoryTab] = useState<'list' | 'grouped'>('grouped');
  
  // Student Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBatch, setFilterBatch] = useState('all');
  const [filterSession, setFilterSession] = useState('all');
  const [filterClass, setFilterClass] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(localStorage.getItem('sms_admission_page') || '1');
  });
  const itemsPerPage = 10;

  useEffect(() => {
    localStorage.setItem('sms_admission_page', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterBatch, filterSession, filterClass]);

  // Student Form states
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [batchId, setBatchId] = useState('');
  const [session, setSession] = useState(sessions[0] || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [address, setAddress] = useState('');
  const [course, setCourse] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [courseFee, setCourseFee] = useState('1500');

  useEffect(() => {
    if (!course && courses.length > 0) {
      setCourse(courses[0].name);
      setCourseFee(courses[0].fee.toString());
    }
  }, [courses, course]);

  useEffect(() => {
    if (!studentClass && classes.length > 0) {
      setStudentClass(classes[0].name);
    }
  }, [classes, studentClass]);

  // Batch Form states
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchSchedule, setNewBatchSchedule] = useState('');
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [editingBatchName, setEditingBatchName] = useState('');
  const [editingBatchSchedule, setEditingBatchSchedule] = useState('');

  // Session Form states
  const [newSessionName, setNewSessionName] = useState('');

  // Class & Course management states
  const [newClassName, setNewClassName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseFeeAmount, setNewCourseFeeAmount] = useState('');

  // Delete Confirmation States
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'student' | 'batch' | 'session' | 'class' | 'course';
    id: string;
    title: string;
  } | null>(null);

  const [customAlert, setCustomAlert] = useState<string | null>(null);

  const generateAutoRoll = (targetBatchId: string, targetSession: string) => {
    if (!targetSession) return '';
    const sessionStudents = students.filter(
      (s) => (s.session || '') === targetSession
    );
    if (sessionStudents.length === 0) {
      return '30101';
    }
    const rolls = sessionStudents
      .map((s) => parseInt(s.roll, 10))
      .filter((r) => !isNaN(r));
    if (rolls.length === 0) {
      return '30101';
    }
    const maxRoll = Math.max(...rolls);
    const startRoll = 30101;
    const nextRoll = maxRoll < startRoll ? startRoll : maxRoll + 1;
    return nextRoll.toString();
  };

  const resetForm = () => {
    const initialBatch = batches[0]?.id || '';
    const initialSession = sessions[0] || '';
    setName('');
    setBatchId(initialBatch);
    setSession(initialSession);
    setRoll(generateAutoRoll(initialBatch, initialSession));
    setPhone('');
    setEmail('');
    setGender('Male');
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setFatherName('');
    setMotherName('');
    setAddress('');
    setCourse(courses[0]?.name || '');
    setStudentClass(classes[0]?.name || '');
    setCourseFee(courses[0]?.fee ? courses[0]?.fee.toString() : '0');
    setEditingStudent(null);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setRoll(student.roll);
    setBatchId(student.batchId);
    setSession(student.session || sessions[0] || '');
    setPhone(student.phone);
    setEmail(student.email || '');
    setGender(student.gender);
    setAdmissionDate(student.admissionDate);
    setFatherName(student.fatherName || '');
    setMotherName(student.motherName || '');
    setAddress(student.address || '');
    setCourse(student.course || 'ICT Academic');
    setStudentClass(student.class || 'Inter 1st Year');
    setCourseFee(student.courseFee ? student.courseFee.toString() : '1500');
    setIsFormOpen(true);
  };

  const handleTransferClick = (student: Student) => {
    const currentBatch = batches.find((b) => b.id === student.batchId);
    const otherBatches = batches.filter((b) => b.id !== student.batchId);

    if (otherBatches.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'কোনো বিকল্প ব্যাচ নেই',
        text: 'স্থানান্তর করার জন্য সিস্টেমে অন্য কোনো ব্যাচ তৈরি করা নেই। প্রথমে "ব্যাচসমূহ" উপ-ট্যাব থেকে নতুন ব্যাচ তৈরি করুন।',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const inputOptions: Record<string, string> = {};
    otherBatches.forEach((b) => {
      inputOptions[b.id] = b.name;
    });

    Swal.fire({
      title: 'ব্যাচ স্থানান্তর করুন',
      html: `
        <div class="text-left space-y-2 p-2 text-sm text-slate-600">
          <p>শিক্ষার্থীর নাম: <strong class="text-slate-950 font-bold">${student.name}</strong></p>
          <p>রোল নম্বর: <strong class="text-slate-950 font-mono">${student.roll}</strong></p>
          <p>সেশন: <strong class="text-slate-950">${student.session || 'N/A'}</strong></p>
          <p>বর্তমান ব্যাচ: <strong class="text-rose-600 font-bold">${currentBatch ? currentBatch.name : 'N/A'}</strong></p>
        </div>
        <p class="text-xs text-slate-500 mt-4 text-left">স্থানান্তর করার জন্য নিচের ড্রপডাউন থেকে নতুন ব্যাচটি সিলেক্ট করুন:</p>
      `,
      input: 'select',
      inputOptions: inputOptions,
      inputPlaceholder: 'নতুন ব্যাচ সিলেক্ট করুন...',
      showCancelButton: true,
      confirmButtonText: 'স্থানান্তর নিশ্চিত করুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      inputValidator: (value) => {
        if (!value) {
          return 'অনুগ্রহ করে একটি ব্যাচ সিলেক্ট করুন!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const targetBatch = batches.find((b) => b.id === result.value);
        if (onTransferStudent) {
          onTransferStudent(student.id, result.value);
          Swal.fire({
            icon: 'success',
            title: 'স্থানান্তর সফল!',
            html: `<div class="text-sm"><strong>${student.name}</strong> কে সফলভাবে <span class="text-emerald-600 font-extrabold font-sans">${targetBatch ? targetBatch.name.split(' - ')[0] : ''}</span> ব্যাচে স্থানান্তর করা হয়েছে এবং তার সমস্ত অ্যাটেনডেন্স রেকর্ডও নতুন ব্যাচে আপডেট করে দেওয়া হয়েছে।</div>`,
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#4f46e5'
          });
        }
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !roll || !batchId || !session || !phone) {
      Swal.fire({
        title: 'ভুল হয়েছে!',
        text: 'দয়া করে সব প্রয়োজনীয় ঘর পূরণ করুন!',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    // Check duplicate roll in the same batch & session
    const duplicate = students.find(
      (s) => s.roll === roll && s.batchId === batchId && (s.session || '') === session && s.id !== editingStudent?.id
    );
    if (duplicate) {
      Swal.fire({
        title: 'রোল নম্বর ইতিমধ্যে বিদ্যমান!',
        text: `এই ব্যাচে এবং সেশনে রোল নম্বর ${roll} ইতিমধ্যে বিদ্যমান রয়েছে!`,
        icon: 'warning',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        name,
        roll,
        batchId,
        session,
        phone,
        email,
        gender,
        admissionDate,
        fatherName,
        motherName,
        address,
        course,
        class: studentClass,
        courseFee: Number(courseFee) || 0,
      });

      Swal.fire({
        title: 'সফল হয়েছে!',
        text: 'শিক্ষার্থীর তথ্য সফলভাবে সংরক্ষণ করা হয়েছে।',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#3b82f6',
      });
    } else {
      onAddStudent({
        name,
        roll,
        batchId,
        session,
        phone,
        email,
        gender,
        admissionDate,
        fatherName,
        motherName,
        address,
        course,
        class: studentClass,
        courseFee: Number(courseFee) || 0,
      });

      Swal.fire({
        title: 'ভর্তি নিশ্চিত হয়েছে!',
        html: `
          <div class="text-center font-sans">
            <p class="text-slate-600 text-sm">শিক্ষার্থী <strong class="text-blue-600">${name}</strong>-এর ভর্তি প্রক্রিয়া সফলভাবে সম্পন্ন হয়েছে।</p>
            <div class="bg-slate-50 p-4 rounded-xl text-left text-xs text-slate-600 space-y-1.5 mt-4 border border-slate-150 inline-block min-w-[240px]">
              <p><strong>রোল নম্বর:</strong> ${roll}</p>
              <p><strong>মোবাইল:</strong> ${phone}</p>
              <p><strong>ভর্তির তারিখ:</strong> ${admissionDate}</p>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#3b82f6',
      });
    }

    resetForm();
    setIsFormOpen(false);
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const batchNameClean = newBatchName.trim();
    if (!batchNameClean) {
      Swal.fire({
        icon: 'error',
        title: 'ভুল হয়েছে!',
        text: 'দয়া করে ব্যাচের নাম লিখুন!',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }
    if (batches.some((b) => b.name.toLowerCase() === batchNameClean.toLowerCase())) {
      Swal.fire({
        icon: 'warning',
        title: 'ইতিমধ্যে বিদ্যমান!',
        text: 'এই নামে ইতিমধ্যে একটি ব্যাচ তৈরি করা আছে!',
        confirmButtonColor: '#F59E0B',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }
    onAddBatch({
      name: batchNameClean,
      schedule: newBatchSchedule || 'N/A',
    });
    setNewBatchName('');
    setNewBatchSchedule('');
    Swal.fire({
      icon: 'success',
      title: 'ব্যাচ তৈরি হয়েছে!',
      text: 'নতুন ব্যাচটি সফলভাবে তৈরি করা হয়েছে।',
      confirmButtonColor: '#3B82F6',
      confirmButtonText: 'ঠিক আছে'
    });
  };

  const handleSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionNameClean = newSessionName.trim();
    if (!sessionNameClean) {
      Swal.fire({
        icon: 'error',
        title: 'ভুল হয়েছে!',
        text: 'দয়া করে সেশনের নাম লিখুন!',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }
    if (sessions.includes(sessionNameClean)) {
      Swal.fire({
        icon: 'warning',
        title: 'ইতিমধ্যে বিদ্যমান!',
        text: 'এই সেশনটি ইতিমধ্যে তৈরি করা আছে!',
        confirmButtonColor: '#F59E0B',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }
    onAddSession(sessionNameClean);
    setNewSessionName('');
    Swal.fire({
      icon: 'success',
      title: 'সেশন তৈরি হয়েছে!',
      text: 'নতুন সেশনটি সফলভাবে তৈরি করা হয়েছে।',
      confirmButtonColor: '#3B82F6',
      confirmButtonText: 'ঠিক আছে'
    });
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const classNameClean = newClassName.trim();
    if (!classNameClean) {
      Swal.fire({
        icon: 'error',
        title: 'ভুল হয়েছে!',
        text: 'দয়া করে শ্রেণীর নাম লিখুন!',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }
    if (classes.some(cl => cl.name.toLowerCase() === classNameClean.toLowerCase())) {
      Swal.fire({
        icon: 'warning',
        title: 'ইতিমধ্যে বিদ্যমান!',
        text: 'এই শ্রেণীটি ইতিমধ্যে তৈরি করা আছে!',
        confirmButtonColor: '#F59E0B',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }

    Swal.fire({
      title: 'শ্রেণী সেভ হচ্ছে...',
      text: 'অনুগ্রহ করে অপেক্ষা করুন, ডাটা লোকাল ডাটাবেজে সংরক্ষণ করা হচ্ছে...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const newClass = { id: 'class_' + Date.now(), name: classNameClean };
      const success = await onUpdateClasses([...classes, newClass]);
      setNewClassName('');

      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'শ্রেণী তৈরি হয়েছে!',
          text: 'নতুন শ্রেণীটি সফলভাবে তৈরি করা হয়েছে এবং ডাটাবেজে সংরক্ষণ করা হয়েছে।',
          confirmButtonColor: '#3B82F6',
          confirmButtonText: 'ঠিক আছে'
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'লোকাল সেভ হয়েছে!',
          text: 'শ্রেণীটি লোকাল মেমোরিতে সেভ হয়েছে, কিন্তু XAMPP MySQL ডাটাবেজে সিঙ্ক করা যায়নি। অনুগ্রহ করে সার্ভার সংযোগ চেক করুন।',
          confirmButtonColor: '#F59E0B',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    } catch (error: any) {
      console.error("Failed to save class: ", error);
      Swal.fire({
        icon: 'error',
        title: 'সংরক্ষণ ব্যর্থ হয়েছে!',
        text: `শ্রেণী সেভ করার সময় ত্রুটি ঘটেছে: ${error.message || error}`,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'ঠিক আছে'
      });
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const courseNameClean = newCourseName.trim();
    const courseFeeVal = parseFloat(newCourseFeeAmount) || 0;
    if (!courseNameClean) {
      Swal.fire({
        icon: 'error',
        title: 'ভুল হয়েছে!',
        text: 'দয়া করে কোর্সের নাম লিখুন!',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }
    if (courses.some(co => co.name.toLowerCase() === courseNameClean.toLowerCase())) {
      Swal.fire({
        icon: 'warning',
        title: 'ইতিমধ্যে বিদ্যমান!',
        text: 'এই কোর্সটি ইতিমধ্যে তৈরি করা আছে!',
        confirmButtonColor: '#F59E0B',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }

    Swal.fire({
      title: 'কোর্স সেভ হচ্ছে...',
      text: 'অনুগ্রহ করে অপেক্ষা করুন, ডাটা লোকাল ডাটাবেজে সংরক্ষণ করা হচ্ছে...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const newCourse = { id: 'course_' + Date.now(), name: courseNameClean, fee: courseFeeVal };
      const success = await onUpdateCourses([...courses, newCourse]);
      setNewCourseName('');
      setNewCourseFeeAmount('');

      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'কোর্স তৈরি হয়েছে!',
          text: 'নতুন কোর্সটি সফলভাবে তৈরি করা হয়েছে এবং ডাটাবেজে সংরক্ষণ করা হয়েছে।',
          confirmButtonColor: '#3B82F6',
          confirmButtonText: 'ঠিক আছে'
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'লোকাল সেভ হয়েছে!',
          text: 'কোর্সটি লোকাল মেমোরিতে সেভ হয়েছে, কিন্তু XAMPP MySQL ডাটাবেজে সিঙ্ক করা যায়নি। অনুগ্রহ করে সার্ভার সংযোগ চেক করুন।',
          confirmButtonColor: '#F59E0B',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    } catch (error: any) {
      console.error("Failed to save course: ", error);
      Swal.fire({
        icon: 'error',
        title: 'সংরক্ষণ ব্যর্থ হয়েছে!',
        text: `কোর্স সেভ করার সময় ত্রুটি ঘটেছে: ${error.message || error}`,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'ঠিক আছে'
      });
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll.includes(searchQuery) ||
      s.phone.includes(searchQuery);
    const matchesBatch = filterBatch === 'all' || s.batchId === filterBatch;
    const matchesSession = filterSession === 'all' || (s.session || '') === filterSession;
    const matchesClass = filterClass === 'all' || (s.class || 'Inter 1st Year') === filterClass;
    return matchesSearch && matchesBatch && matchesSession && matchesClass;
  });

  const toBengaliNum = (num: number | string): string => {
    const banglaDigits: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return num.toString().replace(/\d/g, (d) => banglaDigits[d] || d);
  };

  const handleDownloadPdf = () => {
    if (filteredStudents.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'দুঃখিত',
        text: 'ডাউনলোড করার মতো কোনো শিক্ষার্থী নেই!',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Swal.fire({
        icon: 'error',
        title: 'পপআপ ব্লকড!',
        text: 'পপআপ উইন্ডো খুলতে পারেনি! অনুগ্রহ করে আপনার ব্রাউজারের পপআপ ব্লকার নিষ্ক্রিয় করুন এবং পুনরায় চেষ্টা করুন।',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const currentSelectedSession = filterSession === 'all' ? 'সকল সেশন' : filterSession;
    const currentSelectedBatch = filterBatch === 'all' ? 'সকল ব্যাচ' : (batches.find(b => b.id === filterBatch)?.name.split(' - ')[0] || 'অজানা ব্যাচ');
    const currentSelectedClass = filterClass === 'all' ? 'সকল শ্রেণী' : filterClass;

    const studentRows = filteredStudents.map((s, idx) => {
      const batch = batches.find((b) => b.id === s.batchId);
      const totalPaid = fees
        ? fees.filter((f) => f.studentId === s.id && f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0)
        : 0;
      const due = (s.courseFee || 0) - totalPaid;

      return `
        <tr class="border-b border-slate-200 hover:bg-slate-50/50 text-slate-700 text-xs">
          <td class="py-2.5 px-3 font-semibold text-center">${toBengaliNum(idx + 1)}</td>
          <td class="py-2.5 px-3 font-semibold text-center font-mono">${s.roll}</td>
          <td class="py-2.5 px-3 font-bold text-slate-900 text-left">${s.name}</td>
          <td class="py-2.5 px-3 text-center">${s.session || '-'}</td>
          <td class="py-2.5 px-3 text-center">${s.class || 'Inter 1st Year'}</td>
          <td class="py-2.5 px-3 text-left font-semibold text-slate-600">${batch ? batch.name.split(' - ')[0] : 'N/A'}</td>
          <td class="py-2.5 px-3 text-center font-mono">${s.phone}</td>
          <td class="py-2.5 px-3 text-right font-semibold font-mono">${toBengaliNum(s.courseFee || 0)} ৳</td>
          <td class="py-2.5 px-3 text-right font-semibold font-mono text-emerald-600">${toBengaliNum(totalPaid)} ৳</td>
          <td class="py-2.5 px-3 text-right font-bold font-mono ${due > 0 ? 'text-rose-600' : 'text-slate-500'}">${toBengaliNum(due)} ৳</td>
        </tr>
      `;
    }).join('');

    const formattedDate = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>শিক্ষার্থী তালিকা - ${currentSelectedSession}</title>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <style>
    body {
      font-family: 'Noto Sans Bengali', 'Inter', sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
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
      #print-area {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body class="bg-slate-50 p-6 flex flex-col items-center">
  <!-- Controls -->
  <div class="no-print mb-6 w-full max-w-5xl flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
    <span class="text-xs font-bold text-slate-500 font-sans">প্রিন্ট প্রভিউ: সেশন অনুযায়ী সুন্দর তালিকা প্রিন্ট করুন অথবা পিডিএফ হিসেবে সংরক্ষণ করুন।</span>
    <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition shadow-md shadow-blue-500/15 cursor-pointer">
      প্রিন্ট করুন / PDF হিসেবে সেভ করুন
    </button>
  </div>

  <!-- Document Container -->
  <div id="print-area" class="w-full max-w-5xl bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
    <!-- Letterhead / Header -->
    <div class="flex flex-col items-center text-center border-b-2 border-slate-200 pb-5">
      <div class="bg-blue-600 text-white text-xl font-black p-3.5 rounded-full inline-flex items-center justify-center mb-3">
        🎓
      </div>
      <h1 class="text-2xl font-black text-slate-950 font-display">ICT PRIVATE HOME</h1>
      <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">আইসিটি প্রাইভেট হোম</p>
      <div class="mt-3 bg-blue-50 border border-blue-100 text-blue-800 text-xs font-extrabold px-4 py-1.5 rounded-full">
        শিক্ষার্থী তালিকা (Student List)
      </div>
    </div>

    <!-- Filter Metadata -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600">
      <div>
        <span class="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">সেশন</span>
        <strong class="text-slate-800 text-sm">${currentSelectedSession}</strong>
      </div>
      <div>
        <span class="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">শ্রেণী</span>
        <strong class="text-slate-800 text-sm">${currentSelectedClass}</strong>
      </div>
      <div>
        <span class="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">ব্যাচ</span>
        <strong class="text-slate-800 text-sm">${currentSelectedBatch}</strong>
      </div>
      <div>
        <span class="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-0.5">মোট শিক্ষার্থী</span>
        <strong class="text-blue-600 font-black text-sm">${toBengaliNum(filteredStudents.length)} জন</strong>
      </div>
    </div>

    <!-- Main Table -->
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-slate-100 border-b border-slate-300 text-slate-800 text-xs font-black uppercase tracking-wider text-center">
            <th class="py-3 px-2 w-10">#</th>
            <th class="py-3 px-3 w-20">রোল</th>
            <th class="py-3 px-3 text-left">শিক্ষার্থীর নাম</th>
            <th class="py-3 px-3">সেশন</th>
            <th class="py-3 px-3">শ্রেণী</th>
            <th class="py-3 px-3 text-left">ব্যাচ</th>
            <th class="py-3 px-3">মোবাইল নং</th>
            <th class="py-3 px-3 text-right">কোর্স ফি</th>
            <th class="py-3 px-3 text-right">পরিশোধ</th>
            <th class="py-3 px-3 text-right">বাকি</th>
          </tr>
        </thead>
        <tbody>
          ${studentRows}
        </tbody>
      </table>
    </div>

    <!-- Signature and Print Footer -->
    <div class="flex justify-between items-end text-xs text-slate-500 pt-16">
      <div>
        <span class="block">প্রিন্ট করার তারিখ: <strong>${formattedDate}</strong></span>
        <span class="block text-[10px] text-slate-400 font-sans">প্রস্তুতকারী: IPH PVT এডমিন প্যানেল</span>
      </div>
      <div class="text-center">
        <div class="border-t border-slate-300 pt-1.5 w-36 font-bold text-slate-700">প্রধান পরিচালক স্বাক্ষর</div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleDownloadCsv = () => {
    if (filteredStudents.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'দুঃখিত',
        text: 'ডাউনলোড করার মতো কোনো শিক্ষার্থী নেই!',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const headers = ['Roll', 'Name', 'Gender', 'Class', 'Batch', 'Session', 'Phone', 'Address', 'Course Fee', 'Paid', 'Due'];

    const rows = filteredStudents.map((s) => {
      const batch = batches.find((b) => b.id === s.batchId);
      const totalPaid = fees
        ? fees.filter((f) => f.studentId === s.id && f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0)
        : 0;
      const due = (s.courseFee || 0) - totalPaid;

      return [
        s.roll,
        s.name,
        s.gender === 'Male' ? 'ছাত্র' : s.gender === 'Female' ? 'ছাত্রী' : 'অন্যান্য',
        s.class || 'Inter 1st Year',
        batch ? batch.name.split(' - ')[0] : 'N/A',
        s.session || 'N/A',
        s.phone,
        s.address || '',
        s.courseFee || 0,
        totalPaid,
        due
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const sessionStr = filterSession === 'all' ? 'All_Sessions' : filterSession.replace(/\s+/g, '_');
    const batchStr = filterBatch === 'all' ? '' : `_Batch_${filterBatch}`;
    link.setAttribute('download', `Student_List_${sessionStr}${batchStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div id="admission-module" className="space-y-6 animate-fade-in">
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-slate-900 font-display flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600 stroke-[2.5px]" />
            ছাত্র/ছাত্রী ভর্তি ও প্রাতিষ্ঠানিক সেটআপ
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">নতুন শিক্ষার্থী ভর্তি করুন, এবং ব্যাচ ও সেশন আলাদাভাবে তৈরি করে কাস্টমাইজ করুন।</p>
        </div>
        {activeSubTab === 'students' && (
          <button
            id="btn-toggle-admission-form"
            onClick={() => {
              resetForm();
              setIsFormOpen(!isFormOpen);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-lg transition duration-200 shadow-md shadow-blue-600/10 self-start md:self-auto text-xs uppercase tracking-wider cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3px]" />
            {isFormOpen ? 'তালিকা দেখুন' : 'নতুন ছাত্র/ছাত্রী ভর্তি'}
          </button>
        )}
      </div>

      {/* Sub-Tab Navigation System */}
      <div className="flex border-b border-slate-200 gap-2 bg-white px-4 rounded-xl shadow-xs border">
        <button
          onClick={() => {
            setActiveSubTab('students');
            setIsFormOpen(false);
          }}
          className={`flex items-center gap-2 px-5 py-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'students'
              ? 'border-blue-600 text-blue-600 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          শিক্ষার্থী তালিকা ও ভর্তি
        </button>
        <button
          onClick={() => setActiveSubTab('batches')}
          className={`flex items-center gap-2 px-5 py-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'batches'
              ? 'border-blue-600 text-blue-600 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          ব্যাচ ব্যবস্থাপনা
        </button>
        <button
          onClick={() => {
            setActiveSubTab('sessions');
            setIsFormOpen(false);
          }}
          className={`flex items-center gap-2 px-5 py-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'sessions'
              ? 'border-blue-600 text-blue-600 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          সেশন ব্যবস্থাপনা
        </button>
        <button
          onClick={() => {
            setActiveSubTab('classes_courses');
            setIsFormOpen(false);
          }}
          className={`flex items-center gap-2 px-5 py-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'classes_courses'
              ? 'border-blue-600 text-blue-600 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          ক্লাস ও কোর্স ব্যবস্থাপনা
        </button>
      </div>

      {/* Sub-tab 1: Student Admission & List */}
      {activeSubTab === 'students' && (
        <>
          {isFormOpen ? (
            /* Admission/Edit Form */
            <form id="admission-form" onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-black text-slate-900 font-display">
                  {editingStudent ? 'ছাত্র/ছাত্রীর তথ্য পরিবর্তন করুন' : 'নতুন ছাত্র/ছাত্রী ভর্তি ফরম'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">সদস্য বা শিক্ষার্থীর সঠিক তথ্য দিয়ে নিচের ফরমটি পূরণ করুন। (* চিহ্নিত ঘরগুলো বাধ্যতামূলক)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    ছাত্র/ছাত্রীর নাম *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="যেমন: আরিফ রহমান"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Roll */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between uppercase tracking-wider">
                    <span>রোল নম্বর *</span>
                    {!editingStudent && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold font-sans">অটো-জেনারেটেড</span>
                    )}
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      value={roll}
                      onChange={(e) => setRoll(e.target.value)}
                      placeholder="যেমন: ১০১"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Batch dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    ব্যাচ নির্বাচন করুন *
                  </label>
                  <select
                    value={batchId}
                    onChange={(e) => {
                      const nextBatchId = e.target.value;
                      setBatchId(nextBatchId);
                      if (!editingStudent) {
                        setRoll(generateAutoRoll(nextBatchId, session));
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm cursor-pointer"
                    required
                  >
                    <option value="">নির্বাচন করুন</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    সেশন নির্বাচন করুন *
                  </label>
                  <select
                    value={session}
                    onChange={(e) => {
                      const nextSession = e.target.value;
                      setSession(nextSession);
                      if (!editingStudent) {
                        setRoll(generateAutoRoll(batchId, nextSession));
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm cursor-pointer"
                    required
                  >
                    <option value="">নির্বাচন করুন</option>
                    {sessions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    মোবাইল নম্বর *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="যেমন: ০১৭১২৩৪৫৬৭৮"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    ঠিকানা
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="যেমন: মিরপুর, ঢাকা"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm"
                    />
                  </div>
                </div>

                {/* Course Select */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    কোর্স নির্বাচন করুন *
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <select
                      value={course}
                      onChange={(e) => {
                        const selectedCourseName = e.target.value;
                        setCourse(selectedCourseName);
                        const foundCourse = courses.find((co) => co.name === selectedCourseName);
                        if (foundCourse) {
                          setCourseFee(foundCourse.fee.toString());
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm cursor-pointer"
                      required
                    >
                      <option value="">নির্বাচন করুন</option>
                      {courses.map((co) => (
                        <option key={co.id} value={co.name}>
                          {co.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Class Select */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    শ্রেণী নির্বাচন করুন *
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm cursor-pointer"
                      required
                    >
                      <option value="">নির্বাচন করুন</option>
                      {classes.map((cl) => (
                        <option key={cl.id} value={cl.name}>
                          {cl.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Course Fee */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    কোর্স ফি (টাকা) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="number"
                      value={courseFee}
                      onChange={(e) => setCourseFee(e.target.value)}
                      placeholder="যেমন: ১৫০০"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    লিঙ্গ
                  </label>
                  <div className="flex gap-4 py-2">
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-semibold text-xs">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={gender === 'Male'}
                        onChange={() => setGender('Male')}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      ছাত্র
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-semibold text-xs">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={gender === 'Female'}
                        onChange={() => setGender('Female')}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      ছাত্রী
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-semibold text-xs">
                      <input
                        type="radio"
                        name="gender"
                        value="Other"
                        checked={gender === 'Other'}
                        onChange={() => setGender('Other')}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      অন্যান্য
                    </label>
                  </div>
                </div>

                {/* Admission Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    ভর্তির তারিখ
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="date"
                      value={admissionDate}
                      onChange={(e) => setAdmissionDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm"
                    />
                  </div>
                </div>

                {/* Father's Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    পিতার নাম
                  </label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="পিতার নাম লিখুন"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-700 font-semibold text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsFormOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  {editingStudent ? 'তথ্য সংরক্ষণ করুন' : 'ভর্তি নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          ) : (
            /* Student List & Filter Table */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-150">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="নাম, রোল বা মোবাইল দিয়ে খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition text-slate-700 text-sm font-semibold"
                  />
                </div>

                {/* Class Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">শ্রেণী:</span>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    <option value="all">সব শ্রেণী</option>
                    {classes.map((cl) => (
                      <option key={cl.id} value={cl.name}>
                        {cl.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batch Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">ব্যাচ:</span>
                  <select
                    value={filterBatch}
                    onChange={(e) => setFilterBatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    <option value="all">সব ব্যাচ</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">সেশন:</span>
                  <select
                    value={filterSession}
                    onChange={(e) => setFilterSession(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    <option value="all">সব সেশন</option>
                    {sessions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Export/Download Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                <div className="text-xs font-bold text-slate-600">
                  {filterSession !== 'all' ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                      সেশন <strong className="text-blue-600 font-black">{filterSession}</strong>-এর শিক্ষার্থী তালিকা (${toBengaliNum(filteredStudents.length)} জন) ডাউনলোড করুন।
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                      সব সেশনের শিক্ষার্থী তালিকা (${toBengaliNum(filteredStudents.length)} জন) ডাউনলোড করুন। সেশন ফিল্টার করে আলাদা তালিকাও ডাউনলোড সম্ভব।
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-lg transition shadow-xs cursor-pointer border-0"
                  >
                    <Printer className="h-4 w-4" /> পিডিএফ ডাউনলোড ও প্রিন্ট
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-lg transition shadow-xs cursor-pointer border-0"
                  >
                    <Download className="h-4 w-4" /> সিএসভি ডাউনলোড (CSV)
                  </button>
                </div>
              </div>

              {/* Student List Grid/Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
                        <th className="py-4 px-3 md:px-4">রোল</th>
                        <th className="py-4 px-3 md:px-4">ছাত্র/ছাত্রীর নাম</th>
                        <th className="py-4 px-3 md:px-4">ব্যাচ</th>
                        <th className="py-4 px-3 md:px-4 hidden sm:table-cell">সেশন</th>
                        <th className="py-4 px-3 md:px-4 hidden md:table-cell">শ্রেণী</th>
                        <th className="py-4 px-3 md:px-4 hidden lg:table-cell">ঠিকানা</th>
                        <th className="py-4 px-3 md:px-4 hidden md:table-cell">পেমেন্ট</th>
                        <th className="py-4 px-3 md:px-4">বাকি</th>
                        <th className="py-4 px-3 md:px-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                      {paginatedStudents.length > 0 ? (
                        paginatedStudents.map((s) => {
                          const batch = batches.find((b) => b.id === s.batchId);
                          
                          // Calculate fee payments
                          const totalPaid = fees
                            .filter((f) => f.studentId === s.id && f.status === 'Paid')
                            .reduce((sum, f) => sum + f.amount, 0);
                          
                          const sCourseFee = s.courseFee || 0;
                          const isPaid = sCourseFee > 0 && totalPaid >= sCourseFee;
                          const hasRemaining = sCourseFee > 0 && totalPaid < sCourseFee && totalPaid > 0;
                          const dueAmount = sCourseFee - totalPaid;

                          return (
                            <tr key={s.id} className="hover:bg-slate-50/30 transition">
                              <td className="py-3.5 px-3 md:px-4 font-semibold text-slate-800">
                                {s.roll}
                              </td>
                              <td className="py-3.5 px-3 md:px-4">
                                <div className="font-bold text-slate-900">{s.name}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{s.gender === 'Male' ? 'ছাত্র' : s.gender === 'Female' ? 'ছাত্রী' : 'অন্যান্য'}</div>
                              </td>
                              <td className="py-3.5 px-3 md:px-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100">
                                  {batch ? batch.name.split(' - ')[0] : 'অজানা ব্যাচ'}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 md:px-4 font-semibold text-slate-600 text-xs hidden sm:table-cell">
                                {s.session || 'সেশন নেই'}
                              </td>
                              <td className="py-3.5 px-3 md:px-4 hidden md:table-cell">
                                <span className="bg-teal-50 text-teal-700 border border-teal-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  {s.class || 'Inter 1st Year'}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 md:px-4 text-xs font-semibold text-slate-600 max-w-[150px] truncate hidden lg:table-cell">
                                {s.address ? (
                                  <div className="flex items-center gap-0.5" title={s.address}>
                                    <MapPin className="h-3.5 w-3.5 inline shrink-0 text-slate-400" />
                                    {s.address}
                                  </div>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 md:px-4 text-xs hidden md:table-cell">
                                <div className="flex flex-col gap-1 items-start">
                                  <span className="font-bold text-slate-900">ফি: {sCourseFee} ৳</span>
                                  {isPaid ? (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="h-3 w-3 stroke-[2.5px]" /> পরিশোধিত
                                    </span>
                                  ) : hasRemaining ? (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                                      আংশিক ({totalPaid} ৳)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                                      অপরিশোধিত
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 md:px-4 text-xs font-bold">
                                {dueAmount > 0 ? (
                                  <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100 font-black">
                                    {dueAmount} ৳
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 font-black">
                                    ০ ৳
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 md:px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setViewingStudent(s)}
                                    className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 hover:text-blue-700 transition cursor-pointer"
                                    title="বিস্তারিত দেখুন"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(s)}
                                    className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 hover:text-amber-700 transition cursor-pointer"
                                    title="তথ্য পরিবর্তন"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleTransferClick(s)}
                                    className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                                    title="ব্যাচ স্থানান্তর"
                                  >
                                    <ArrowLeftRight className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteTarget({
                                        type: 'student',
                                        id: s.id,
                                        title: `আপনি কি নিশ্চিতভাবে ছাত্র/ছাত্রী "${s.name}" (রোল: ${s.roll}) কে ডিলিট করতে চান?`
                                      });
                                    }}
                                    className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 hover:text-rose-700 transition cursor-pointer"
                                    title="ডিলিট করুন"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="text-center py-12 text-slate-400 font-bold">
                            কোন ছাত্র/ছাত্রী খুঁজে পাওয়া যায়নি।
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Total Student Counter & Pagination */}
                <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-bold">
                  <span>মোট তালিকাভুক্ত ছাত্র/ছাত্রী: {filteredStudents.length} জন</span>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-2.5 py-1.5 rounded-md border ${
                          currentPage === 1
                            ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                        } transition`}
                      >
                        পূর্ববর্তী
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, index) => {
                        const pageNum = index + 1;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white border border-blue-600 shadow-sm'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-2.5 py-1.5 rounded-md border ${
                          currentPage === totalPages
                            ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                        } transition`}
                      >
                        পরবর্তী
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sub-tab 2: Batch Management */}
      {activeSubTab === 'batches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Batch Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1 h-fit">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-1.5">
                <Plus className="h-5 w-5 text-blue-600" />
                নতুন ব্যাচ তৈরি করুন
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">ব্যাচের নাম ও সাপ্তাহিক ক্লাস সূচী নির্ধারণ করুন।</p>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">ব্যাচের নাম *</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    placeholder="যেমন: Batch Sapphire (Science)"
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">ক্লাসের দিন / সময়</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={newBatchSchedule}
                    onChange={(e) => setNewBatchSchedule(e.target.value)}
                    placeholder="যেমন: Sat, Mon, Wed - 10:00 AM"
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-lg transition shadow-md shadow-blue-600/10 cursor-pointer"
              >
                ব্যাচ সেভ করুন
              </button>
            </form>
          </div>

          {/* Batches List Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-black text-slate-900 font-display text-sm uppercase tracking-wider">বিদ্যমান ব্যাচ সমূহ</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-wider">
                    <th className="py-3 px-6">ব্যাচের নাম</th>
                    <th className="py-3 px-6">ক্লাস সময়সূচী</th>
                    <th className="py-3 px-6 text-center">শিক্ষার্থী সংখ্যা</th>
                    <th className="py-3 px-6 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                  {batches.map((b) => {
                    const studentCount = students.filter((s) => s.batchId === b.id).length;
                    const isEditing = editingBatchId === b.id;
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/30 transition">
                        <td className="py-3.5 px-6 font-bold text-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingBatchName}
                              onChange={(e) => setEditingBatchName(e.target.value)}
                              className="w-full px-2 py-1 text-xs font-semibold rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              placeholder="ব্যাচের নাম"
                            />
                          ) : (
                            b.name
                          )}
                        </td>
                        <td className="py-3.5 px-6 font-medium text-slate-600">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingBatchSchedule}
                              onChange={(e) => setEditingBatchSchedule(e.target.value)}
                              className="w-full px-2 py-1 text-xs font-medium rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              placeholder="সময়সূচী"
                            />
                          ) : (
                            b.schedule || 'N/A'
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-center font-bold">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px]">
                            <Users className="h-3 w-3" />
                            {studentCount} জন
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const editingNameClean = editingBatchName.trim();
                                    if (!editingNameClean) {
                                      setCustomAlert('ব্যাচের নাম খালি রাখা যাবে না!');
                                      return;
                                    }
                                    if (batches.some((item) => item.id !== b.id && item.name.toLowerCase() === editingNameClean.toLowerCase())) {
                                      Swal.fire({
                                        icon: 'warning',
                                        title: 'ইতিমধ্যে বিদ্যমান!',
                                        text: 'এই নামে ইতিমধ্যে অন্য একটি ব্যাচ রয়েছে!',
                                        confirmButtonColor: '#F59E0B',
                                        confirmButtonText: 'ঠিক আছে'
                                      });
                                      return;
                                    }
                                    onUpdateBatch({
                                      id: b.id,
                                      name: editingNameClean,
                                      schedule: editingBatchSchedule.trim() || 'N/A'
                                    });
                                    setEditingBatchId(null);
                                    Swal.fire({
                                      icon: 'success',
                                      title: 'ব্যাচ আপডেট হয়েছে!',
                                      text: 'ব্যাচের নাম সফলভাবে পরিবর্তন করা হয়েছে এবং এই ব্যাচের সকল শিক্ষার্থীর তথ্য আপডেট করা হয়েছে।',
                                      confirmButtonColor: '#3B82F6',
                                      confirmButtonText: 'ঠিক আছে'
                                    });
                                  }}
                                  className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                                  title="সেভ করুন"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingBatchId(null)}
                                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-600 transition cursor-pointer"
                                  title="বাতিল করুন"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingBatchId(b.id);
                                    setEditingBatchName(b.name);
                                    setEditingBatchSchedule(b.schedule || '');
                                  }}
                                  className="p-1.5 hover:bg-blue-50 rounded text-blue-600 hover:text-blue-700 transition cursor-pointer"
                                  title="সম্পাদনা করুন"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (studentCount > 0) {
                                      setCustomAlert('এই ব্যাচে শিক্ষার্থী রয়েছে! ব্যাচটি ডিলিট করার আগে শিক্ষার্থীদের অন্য ব্যাচে স্থানান্তর করুন।');
                                      return;
                                    }
                                    setDeleteTarget({
                                      type: 'batch',
                                      id: b.id,
                                      title: `আপনি কি নিশ্চিতভাবে এই ব্যাচটি (${b.name}) ডিলিট করতে চান?`
                                    });
                                  }}
                                  className="p-1.5 hover:bg-rose-50 rounded text-rose-600 hover:text-rose-700 transition cursor-pointer"
                                  title="ডিলিট ব্যাচ"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Session Management */}
      {activeSubTab === 'sessions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Session Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1 h-fit">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-1.5">
                <Plus className="h-5 w-5 text-blue-600" />
                নতুন সেশন তৈরি করুন
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">শিক্ষাবর্ষ বা সেশন নাম নির্ধারণ করুন।</p>
            </div>

            <form onSubmit={handleSessionSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">সেশনের নাম *</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="যেমন: ২০২৭-২০২৮"
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-lg transition shadow-md shadow-blue-600/10 cursor-pointer"
              >
                সেশন সেভ করুন
              </button>
            </form>
          </div>

          {/* Sessions List Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-black text-slate-900 font-display text-sm uppercase tracking-wider">বিদ্যমান সেশন সমূহ</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-wider">
                    <th className="py-3 px-6">সেশনের নাম</th>
                    <th className="py-3 px-6 text-center">শিক্ষার্থী সংখ্যা</th>
                    <th className="py-3 px-6 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                  {sessions.map((s) => {
                    const studentCount = students.filter((st) => (st.session || '') === s).length;
                    return (
                      <tr key={s} className="hover:bg-slate-50/30 transition">
                        <td className="py-3.5 px-6 font-bold text-slate-900">
                          {s}
                        </td>
                        <td className="py-3.5 px-6 text-center font-bold">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">
                            <Users className="h-3 w-3" />
                            {studentCount} জন
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (studentCount > 0) {
                                  setCustomAlert('এই সেশনে শিক্ষার্থী রয়েছে! সেশনটি ডিলিট করার আগে শিক্ষার্থীদের অন্য সেশনে স্থানান্তর করুন।');
                                  return;
                                }
                                setDeleteTarget({
                                  type: 'session',
                                  id: s,
                                  title: `আপনি কি নিশ্চিতভাবে এই সেশনটি (${s}) ডিলিট করতে চান?`
                                });
                              }}
                              className="p-1.5 hover:bg-rose-50 rounded text-rose-600 hover:text-rose-700 transition cursor-pointer"
                              title="ডিলিট সেশন"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Class & Course Management */}
      {activeSubTab === 'classes_courses' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Class Management Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">শ্রেণী ব্যবস্থাপনা</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create Class Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1 h-fit">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-base font-black text-slate-900 font-display flex items-center gap-1.5">
                    <Plus className="h-5 w-5 text-blue-600" />
                    নতুন শ্রেণী যুক্ত করুন
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">শিক্ষার্থীর শ্রেণীর নাম নির্ধারণ করুন।</p>
                </div>

                <form onSubmit={handleClassSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">শ্রেণীর নাম *</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="যেমন: Inter 1st Year"
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-lg transition shadow-md shadow-blue-600/10 cursor-pointer"
                  >
                    শ্রেণী সেভ করুন
                  </button>
                </form>
              </div>

              {/* Classes List Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <h4 className="font-black text-slate-900 font-display text-sm uppercase tracking-wider">বিদ্যমান শ্রেণী সমূহ</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-wider">
                        <th className="py-3 px-6">শ্রেণীর নাম</th>
                        <th className="py-3 px-6 text-center">শিক্ষার্থী সংখ্যা</th>
                        <th className="py-3 px-6 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {classes.map((cl) => {
                        const studentCount = students.filter((st) => st.class === cl.name).length;
                        return (
                          <tr key={cl.id} className="hover:bg-slate-50/30 transition">
                            <td className="py-3.5 px-6 font-bold text-slate-900">
                              {cl.name}
                            </td>
                            <td className="py-3.5 px-6 text-center font-bold">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">
                                <Users className="h-3 w-3" />
                                {studentCount} জন
                              </span>
                            </td>
                            <td className="py-3.5 px-6">
                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (studentCount > 0) {
                                      setCustomAlert('এই শ্রেণীতে শিক্ষার্থী রয়েছে! শ্রেণীটি ডিলিট করার আগে শিক্ষার্থীদের অন্য শ্রেণীতে স্থানান্তর করুন।');
                                      return;
                                    }
                                    setDeleteTarget({
                                      type: 'class',
                                      id: cl.id,
                                      title: `আপনি কি নিশ্চিতভাবে এই শ্রেণীটি (${cl.name}) ডিলিট করতে চান?`
                                    });
                                  }}
                                  className="p-1.5 hover:bg-rose-50 rounded text-rose-600 hover:text-rose-700 transition cursor-pointer"
                                  title="ডিলিট শ্রেণী"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Course Management Section */}
          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">কোর্স ব্যবস্থাপনা</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create Course Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1 h-fit">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-base font-black text-slate-900 font-display flex items-center gap-1.5">
                    <Plus className="h-5 w-5 text-blue-600" />
                    নতুন কোর্স যুক্ত করুন
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">কোর্সের নাম ও ফি নির্ধারণ করুন।</p>
                </div>

                <form onSubmit={handleCourseSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">কোর্সের নাম *</label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        placeholder="যেমন: ICT Academic"
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">কোর্স ফি (টাকা) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="number"
                        required
                        value={newCourseFeeAmount}
                        onChange={(e) => setNewCourseFeeAmount(e.target.value)}
                        placeholder="যেমন: ১৫০০"
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-lg transition shadow-md shadow-blue-600/10 cursor-pointer"
                  >
                    কোর্স সেভ করুন
                  </button>
                </form>
              </div>

              {/* Courses List Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <h4 className="font-black text-slate-900 font-display text-sm uppercase tracking-wider">বিদ্যমান কোর্স সমূহ</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-wider">
                        <th className="py-3 px-6">কোর্সের নাম</th>
                        <th className="py-3 px-6 text-right">কোর্স ফি (৳)</th>
                        <th className="py-3 px-6 text-center">শিক্ষার্থী সংখ্যা</th>
                        <th className="py-3 px-6 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {courses.map((co) => {
                        const studentCount = students.filter((st) => st.course === co.name).length;
                        return (
                          <tr key={co.id} className="hover:bg-slate-50/30 transition">
                            <td className="py-3.5 px-6 font-bold text-slate-900">
                              {co.name}
                            </td>
                            <td className="py-3.5 px-6 text-right font-bold text-slate-800 font-mono">
                              {co.fee} ৳
                            </td>
                            <td className="py-3.5 px-6 text-center font-bold">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">
                                <Users className="h-3 w-3" />
                                {studentCount} জন
                              </span>
                            </td>
                            <td className="py-3.5 px-6">
                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (studentCount > 0) {
                                      setCustomAlert('এই কোর্সে শিক্ষার্থী রয়েছে! কোর্সটি ডিলিট করার আগে শিক্ষার্থীদের অন্য কোর্সে স্থানান্তর করুন।');
                                      return;
                                    }
                                    setDeleteTarget({
                                      type: 'course',
                                      id: co.id,
                                      title: `আপনি কি নিশ্চিতভাবে এই কোর্সটি (${co.name}) ডিলিট করতে চান?`
                                    });
                                  }}
                                  className="p-1.5 hover:bg-rose-50 rounded text-rose-600 hover:text-rose-700 transition cursor-pointer"
                                  title="ডিলিট কোর্স"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 text-rose-600 mb-4">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 text-center font-display">
                কনফার্ম করুন
              </h3>
              <p className="text-sm text-slate-500 font-semibold text-center mt-2 leading-relaxed">
                {deleteTarget.title}
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={async () => {
                  const targetType = deleteTarget.type;
                  const targetId = deleteTarget.id;
                  setDeleteTarget(null);

                  Swal.fire({
                    title: 'ডিলিট হচ্ছে...',
                    text: 'অনুগ্রহ করে অপেক্ষা করুন, ডাটা ডাটাবেজ থেকে মুছে ফেলা হচ্ছে...',
                    allowOutsideClick: false,
                    didOpen: () => {
                      Swal.showLoading();
                    }
                  });

                  try {
                    let success = false;
                    if (targetType === 'student') {
                      success = await onDeleteStudent(targetId);
                    } else if (targetType === 'batch') {
                      success = await onDeleteBatch(targetId);
                    } else if (targetType === 'session') {
                      success = await onDeleteSession(targetId);
                    } else if (targetType === 'class') {
                      success = await onUpdateClasses(classes.filter((cl) => cl.id !== targetId));
                    } else if (targetType === 'course') {
                      success = await onUpdateCourses(courses.filter((co) => co.id !== targetId));
                    }

                    if (success) {
                      Swal.fire({
                        icon: 'success',
                        title: 'ডিলিট সম্পন্ন হয়েছে!',
                        text: 'সফলভাবে মুছে ফেলা হয়েছে এবং ডাটাবেজ আপডেট করা হয়েছে।',
                        confirmButtonColor: '#3B82F6',
                        confirmButtonText: 'ঠিক আছে'
                      });
                    } else {
                      Swal.fire({
                        icon: 'warning',
                        title: 'লোকাল ডিলিট হয়েছে!',
                        text: 'লোকাল মেমোরি থেকে ডিলিট হয়েছে, কিন্তু XAMPP MySQL ডাটাবেজে সিঙ্ক করা যায়নি। অনুগ্রহ করে সার্ভার সংযোগ চেক করুন।',
                        confirmButtonColor: '#F59E0B',
                        confirmButtonText: 'ঠিক আছে'
                      });
                    }
                  } catch (error: any) {
                    console.error("Failed to delete item: ", error);
                    Swal.fire({
                      icon: 'error',
                      title: 'ডিলিট ব্যর্থ হয়েছে!',
                      text: `আইটেম মুছে ফেলার সময় ত্রুটি ঘটেছে: ${error.message || error}`,
                      confirmButtonColor: '#EF4444',
                      confirmButtonText: 'ঠিক আছে'
                    });
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
              >
                ডিলিট করুন
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {customAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-50 text-amber-600 mb-4">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 text-center font-display">
                সতর্কতা
              </h3>
              <p className="text-sm text-slate-500 font-semibold text-center mt-2 leading-relaxed">
                {customAlert}
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCustomAlert(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {viewingStudent && (() => {
        const batch = batches.find((b) => b.id === viewingStudent.batchId);
        const totalPaid = fees
          .filter((f) => f.studentId === viewingStudent.id && f.status === 'Paid')
          .reduce((sum, f) => sum + f.amount, 0);
        const sCourseFee = viewingStudent.courseFee || 0;
        const dueAmount = sCourseFee - totalPaid;
        const studentFees = fees.filter((f) => f.studentId === viewingStudent.id);

        return (
          <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 my-8">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black font-display flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-400" />
                    ছাত্র/ছাত্রীর বিস্তারিত তথ্য
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">
                    রোল নম্বর: {viewingStudent.roll} | {viewingStudent.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingStudent(null)}
                  className="text-slate-400 hover:text-white transition text-xl font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-left">
                {/* Visual Identity Profile Grid */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">ছাত্র/ছাত্রীর নাম</span>
                    <span className="text-base font-black text-slate-800">{viewingStudent.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">রোল নম্বর</span>
                    <span className="text-base font-black font-mono text-slate-800">{viewingStudent.roll}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">ব্যাচ</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black bg-blue-50 text-blue-700 border border-blue-100 mt-1">
                      {batch ? batch.name : 'অজানা ব্যাচ'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">সেশন</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 mt-1">
                      {viewingStudent.session || '২০২৬-২০২৭'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">শ্রেণী</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100 mt-1">
                      {viewingStudent.class || 'Inter 1st Year'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">কোর্স</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100 mt-1">
                      {viewingStudent.course || 'ICT Academic'}
                    </span>
                  </div>
                </div>

                {/* Main Information Grid */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">সাধারণ তথ্য</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-bold block">মোবাইল নম্বর</span>
                      <span className="text-sm font-bold text-slate-800 font-mono flex items-center gap-1">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {viewingStudent.phone || 'নেই'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-bold block">ইমেইল এড্রেস</span>
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-1 font-mono">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {viewingStudent.email || 'নেই'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-bold block">পিতার নাম</span>
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        <User className="h-4 w-4 text-slate-400" />
                        {viewingStudent.fatherName || 'নেই'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-bold block">ঠিকানা</span>
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {viewingStudent.address || 'নেই'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-bold block">ভর্তির তারিখ</span>
                      <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {viewingStudent.admissionDate}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-bold block">লিঙ্গ</span>
                      <span className="text-sm font-bold text-slate-800">
                        {viewingStudent.gender === 'Male' ? 'পুরুষ' : viewingStudent.gender === 'Female' ? 'মহিলা' : 'অন্যান্য'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">আর্থিক তথ্য ও হিসাব</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block">কোর্স ফি</span>
                      <span className="text-base font-black text-slate-800 font-mono">{sCourseFee} ৳</span>
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-center">
                      <span className="text-[10px] text-emerald-600 font-bold block">পরিশোধিত</span>
                      <span className="text-base font-black text-emerald-700 font-mono">{totalPaid} ৳</span>
                    </div>
                    <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 text-center">
                      <span className="text-[10px] text-rose-600 font-bold block">বাকি</span>
                      <span className="text-base font-black text-rose-700 font-mono">{dueAmount} ৳</span>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="border-t border-slate-100 pt-5 font-sans">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">পেমেন্ট হিস্ট্রি ও তারিখভিত্তিক বিবরণ</h4>
                    <div className="flex rounded-lg bg-slate-100 p-0.5 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setHistoryTab('grouped')}
                        className={`px-2.5 py-1 rounded-md transition ${historyTab === 'grouped' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        তারিখ ভিত্তিক
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistoryTab('list')}
                        className={`px-2.5 py-1 rounded-md transition ${historyTab === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        সকল ট্রানজেকশন
                      </button>
                    </div>
                  </div>

                  {studentFees.length > 0 ? (
                    historyTab === 'list' ? (
                      <div className="bg-slate-50 rounded-xl border border-slate-150 overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-150">
                              <th className="py-2.5 px-3">তারিখ</th>
                              <th className="py-2.5 px-3">ফি বিবরণ / মাস</th>
                              <th className="py-2.5 px-3 font-mono">পরিমাণ</th>
                              <th className="py-2.5 px-3 text-right">স্ট্যাটাস</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {studentFees.map((f) => (
                              <tr key={f.id} className="hover:bg-white/50 transition">
                                <td className="py-2.5 px-3">{f.paymentDate || 'N/A'}</td>
                                <td className="py-2.5 px-3">{f.month}</td>
                                <td className="py-2.5 px-3 font-mono">{f.amount} ৳</td>
                                <td className="py-2.5 px-3 text-right">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    f.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                  }`}>
                                    {f.status === 'Paid' ? 'পরিশোধিত' : 'বাকি'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      // Grouped by Date view
                      <div className="space-y-2">
                        {(() => {
                          const groups: { [date: string]: FeeCollection[] } = {};
                          studentFees.forEach((fee) => {
                            const d = fee.paymentDate || 'অনির্ধারিত তারিখ';
                            if (!groups[d]) groups[d] = [];
                            groups[d].push(fee);
                          });
                          const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
                          
                          return sortedDates.map((date) => {
                            const dayFees = groups[date];
                            const totalPaidOnDay = dayFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
                            const countOnDay = dayFees.length;
                            return (
                              <div key={date} className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs space-y-2">
                                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                                  <span className="font-bold text-slate-850 bg-blue-50/80 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-100">{date}</span>
                                  <span className="text-slate-500 font-bold">
                                    মোট পেমেন্ট: <span className="font-mono text-emerald-600 font-black">{totalPaidOnDay} ৳</span> ({countOnDay} বার ট্রানজেকশন)
                                  </span>
                                </div>
                                <div className="space-y-1.5 pl-1.5">
                                  {dayFees.map((f, i) => (
                                    <div key={f.id} className="flex justify-between items-center text-slate-600 text-[11px] font-medium">
                                      <span>{i + 1}. {f.month} ({f.paymentMethod})</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-slate-800">{f.amount} ৳</span>
                                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                                          f.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                        }`}>
                                          {f.status === 'Paid' ? 'পরিশোধিত' : 'বাকি'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )
                  ) : (
                    <p className="text-xs text-slate-400 font-bold">কোনো পেমেন্ট রেকর্ড খুঁজে পাওয়া যায়নি।</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingStudent(null)}
                  className="px-5 py-2 bg-slate-850 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
