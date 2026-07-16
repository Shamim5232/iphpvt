export interface Student {
  id: string;
  name: string;
  roll: string;
  batchId: string;
  session?: string;
  phone: string;
  email?: string;
  gender: 'Male' | 'Female' | 'Other';
  admissionDate: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  course?: string;
  class?: string;
  courseFee?: number;
}

export interface Course {
  id: string;
  name: string;
  fee: number;
}

export interface SchoolClass {
  id: string;
  name: string;
}

export interface Batch {
  id: string;
  name: string;
  schedule?: string;
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  studentId: string;
  batchId: string;
  status: 'Present' | 'Absent';
}

export interface FeeCollection {
  id: string;
  studentId: string;
  month: string; // YYYY-MM
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank';
  status: 'Paid' | 'Pending' | 'Unpaid';
  receiptNo: string;
}

export interface ModelTestMark {
  studentId: string;
  month: string; // YYYY-MM
  test1: number; // Marks out of 100
  test2: number;
  test3: number;
  test4: number;
  test5: number;
}

export interface SeatAssignment {
  studentId: string;
  roomName: string;
  rowNo: number;
  colNo: number; // Left/Right side of bench
  seatNo: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

