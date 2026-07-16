import { Student, Batch, AttendanceRecord, FeeCollection, ModelTestMark, Course, SchoolClass } from '../types';

export const initialBatches: Batch[] = [
  { id: 'b1', name: 'Batch Crimson (Science) - 09:00 AM', schedule: 'Sat, Mon, Wed' },
  { id: 'b2', name: 'Batch Emerald (Commerce) - 11:30 AM', schedule: 'Sun, Tue, Thu' },
  { id: 'b3', name: 'Batch Sapphire (Arts) - 03:00 PM', schedule: 'Sat, Mon, Wed' }
];

export const initialStudents: Student[] = [
  // Batch Crimson (Science)
  {
    id: 's1',
    name: 'আরিফ রহমান (Arif Rahman)',
    roll: '101',
    batchId: 'b1',
    phone: '01712345678',
    gender: 'Male',
    admissionDate: '2026-01-10',
    fatherName: 'লতিফুর রহমান',
    motherName: 'রেহানা পারভীন',
    address: 'মিরপুর, ঢাকা',
    course: 'ICT Academic',
    class: 'Inter 1st Year',
    courseFee: 1500
  },
  {
    id: 's2',
    name: 'তাসনিম সুলতানা (Tasnim Sultana)',
    roll: '102',
    batchId: 'b1',
    phone: '01812345678',
    gender: 'Female',
    admissionDate: '2026-01-12',
    fatherName: 'আব্দুস সোবহান',
    motherName: 'নিলুফার ইয়াসমিন',
    address: 'উত্তরা, ঢাকা',
    course: 'ICT Academic',
    class: 'Inter 1st Year',
    courseFee: 1500
  },
  {
    id: 's3',
    name: 'ইমতিয়াজ আহমেদ (Imtiaz Ahmed)',
    roll: '103',
    batchId: 'b1',
    phone: '01912345678',
    gender: 'Male',
    admissionDate: '2026-01-15',
    fatherName: 'রফিকুল ইসলাম',
    motherName: 'পারভীন বেগম',
    address: 'ধানমণ্ডি, ঢাকা',
    course: 'ICT Academic',
    class: 'Inter 1st Year',
    courseFee: 1500
  },
  
  // Batch Emerald (Commerce)
  {
    id: 's4',
    name: 'ফাতেমা আক্তার (Fatema Akhter)',
    roll: '201',
    batchId: 'b2',
    phone: '01512345678',
    gender: 'Female',
    admissionDate: '2026-01-20',
    fatherName: 'শাহজাহান আলী',
    motherName: 'মরিয়ম বেগম',
    address: 'গুলশান, ঢাকা',
    course: 'Revision Batch',
    class: 'Inter 2nd Year',
    courseFee: 1200
  },
  {
    id: 's5',
    name: 'ফরহাদ হোসেন (Farhad Hossain)',
    roll: '202',
    batchId: 'b2',
    phone: '01612345678',
    gender: 'Male',
    admissionDate: '2026-01-22',
    fatherName: 'কামাল হোসেন',
    motherName: 'জেসমিন আক্তার',
    address: 'বাড্ডা, ঢাকা',
    course: 'Revision Batch',
    class: 'Inter 2nd Year',
    courseFee: 1200
  },
  {
    id: 's6',
    name: 'নাদিয়া চৌধুরী (Nadia Chowdhury)',
    roll: '203',
    batchId: 'b2',
    phone: '01312345678',
    gender: 'Female',
    admissionDate: '2026-01-25',
    fatherName: 'আফজাল চৌধুরী',
    motherName: 'তাহমিনা চৌধুরী',
    address: 'বনানী, ঢাকা',
    course: 'Revision Batch',
    class: 'Inter 2nd Year',
    courseFee: 1200
  },

  // Batch Sapphire (Arts)
  {
    id: 's7',
    name: 'সাকিব আল হাসান (Sakib Al Hasan)',
    roll: '301',
    batchId: 'b3',
    phone: '01798765432',
    gender: 'Male',
    admissionDate: '2026-02-01',
    fatherName: 'মাশরাফি বিন মুর্তজা',
    motherName: 'উম্মে আহমেদ',
    address: 'মাগুরা, বাংলাদেশ',
    course: 'ICT Academic',
    class: 'Inter 1st Year',
    courseFee: 1000
  },
  {
    id: 's8',
    name: 'নুসরাত জাহান (Nusrat Jahan)',
    roll: '302',
    batchId: 'b3',
    phone: '01898765432',
    gender: 'Female',
    admissionDate: '2026-02-03',
    fatherName: 'জাকির হোসেন',
    motherName: 'শাহনাজ বেগম',
    address: 'খুলনা, বাংলাদেশ',
    course: 'Revision Batch',
    class: 'Inter 2nd Year',
    courseFee: 1000
  }
];

// Helper to generate attendance for June 2026
const generateAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const days = ['2026-06-01', '2026-06-03', '2026-06-05', '2026-06-08', '2026-06-10', '2026-06-12', '2026-06-15', '2026-06-17', '2026-06-19', '2026-06-22', '2026-06-24', '2026-06-26'];
  
  initialStudents.forEach((student, index) => {
    days.forEach((day, dayIdx) => {
      // Create some variance: Arif, Tasnim (s1, s2) have high attendance
      // Nadia, Sakib (s6, s7) have some absences
      let status: 'Present' | 'Absent' = 'Present';
      if (student.id === 's6' && dayIdx % 3 === 0) status = 'Absent';
      if (student.id === 's7' && dayIdx % 4 === 0) status = 'Absent';
      if (student.id === 's3' && dayIdx === 5) status = 'Absent';
      
      records.push({
        date: day,
        studentId: student.id,
        batchId: student.batchId,
        status
      });
    });
  });
  return records;
};

export const initialAttendance: AttendanceRecord[] = generateAttendance();

export const initialFees: FeeCollection[] = [
  {
    id: 'f1',
    studentId: 's1',
    month: '2026-06',
    amount: 1500,
    paymentDate: '2026-06-05',
    paymentMethod: 'bKash',
    status: 'Paid',
    receiptNo: 'REC-20260601-01'
  },
  {
    id: 'f2',
    studentId: 's2',
    month: '2026-06',
    amount: 1500,
    paymentDate: '2026-06-06',
    paymentMethod: 'Cash',
    status: 'Paid',
    receiptNo: 'REC-20260601-02'
  },
  {
    id: 'f3',
    studentId: 's3',
    month: '2026-06',
    amount: 1500,
    paymentDate: '2026-06-10',
    paymentMethod: 'Nagad',
    status: 'Paid',
    receiptNo: 'REC-20260601-03'
  },
  {
    id: 'f4',
    studentId: 's4',
    month: '2026-06',
    amount: 1200,
    paymentDate: '2026-06-04',
    paymentMethod: 'bKash',
    status: 'Paid',
    receiptNo: 'REC-20260601-04'
  },
  {
    id: 'f5',
    studentId: 's5',
    month: '2026-06',
    amount: 1200,
    paymentDate: '',
    paymentMethod: 'Cash',
    status: 'Pending',
    receiptNo: 'REC-20260601-05'
  },
  {
    id: 'f6',
    studentId: 's6',
    month: '2026-06',
    amount: 1200,
    paymentDate: '2026-06-12',
    paymentMethod: 'Rocket',
    status: 'Paid',
    receiptNo: 'REC-20260601-06'
  },
  {
    id: 'f7',
    studentId: 's7',
    month: '2026-06',
    amount: 1000,
    paymentDate: '',
    paymentMethod: 'Cash',
    status: 'Unpaid',
    receiptNo: 'REC-20260601-07'
  },
  {
    id: 'f8',
    studentId: 's8',
    month: '2026-06',
    amount: 1000,
    paymentDate: '2026-06-02',
    paymentMethod: 'Cash',
    status: 'Paid',
    receiptNo: 'REC-20260601-08'
  }
];

export const initialModelTests: ModelTestMark[] = [
  {
    studentId: 's1', // Tasnim has high marks
    month: '2026-06',
    test1: 92,
    test2: 88,
    test3: 95,
    test4: 90,
    test5: 94
  },
  {
    studentId: 's2', // Tasnim is super high
    month: '2026-06',
    test1: 96,
    test2: 98,
    test3: 94,
    test4: 97,
    test5: 99
  },
  {
    studentId: 's3',
    month: '2026-06',
    test1: 75,
    test2: 82,
    test3: 80,
    test4: 78,
    test5: 85
  },
  {
    studentId: 's4',
    month: '2026-06',
    test1: 85,
    test2: 87,
    test3: 89,
    test4: 84,
    test5: 90
  },
  {
    studentId: 's5',
    month: '2026-06',
    test1: 68,
    test2: 72,
    test3: 70,
    test4: 75,
    test5: 74
  },
  {
    studentId: 's6',
    month: '2026-06',
    test1: 80,
    test2: 85,
    test3: 82,
    test4: 88,
    test5: 86
  },
  {
    studentId: 's7',
    month: '2026-06',
    test1: 72,
    test2: 78,
    test3: 75,
    test4: 70,
    test5: 82
  },
  {
    studentId: 's8',
    month: '2026-06',
    test1: 88,
    test2: 90,
    test3: 87,
    test4: 91,
    test5: 89
  }
];

export const initialClasses: SchoolClass[] = [
  { id: 'c1', name: 'Inter 1st Year' },
  { id: 'c2', name: 'Inter 2nd Year' }
];

export const initialCourses: Course[] = [
  { id: 'co1', name: 'ICT Academic', fee: 1500 },
  { id: 'co2', name: 'Revision Batch', fee: 2000 }
];
