import React from 'react';

export type Role = 'registrar' | 'finance' | 'student' | 'teacher' | 'super_admin';

export type StudentType = 'college' | 'highschool';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'tuition' | 'misc' | 'lab' | 'payment' | 'adjustment';
  description: string;
  recordedBy: string; // User ID
  status?: 'posted' | 'void_requested' | 'voided';
}

export interface Subject {
  code: string;
  name: string;
  units: number; 
  yearLevel?: number;
  semester?: number;
}

export interface Course {
  id: string;
  name: string;
  type: StudentType;
  department: string; // Link to Teacher Department
  adviser?: string;   // Assigned Teacher/Adviser
  subjects: Subject[]; 
  tuitionPerUnit?: number; 
  miscFee?: number;
}

export interface EnrolledSubject extends Subject {
  grade?: number | string;
  status: 'enrolled' | 'completed' | 'dropped' | 'failed';
  term?: string; 
  instructor?: string; 
}

export interface EnrollmentDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  url: string; 
  status: 'pending' | 'approved' | 'rejected';
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  password?: string; 
  isPasswordChanged?: boolean;
  type: StudentType;
  courseId: string; 
  yearLevel: number;
  enrollmentStatus: 'pending' | 'enrolled' | 'graduated' | 'dropped';
  balance: number;
  transactions: Transaction[];
  academicRecords: EnrolledSubject[]; 
  documents: EnrollmentDocument[];
  role?: Role;
}

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
  department?: string; 
  email?: string;
}

export interface PasswordRequest {
    id: string;
    userId: string; 
    userType: 'student' | 'staff';
    email: string;
    status: 'pending' | 'resolved';
    requestDate: string;
}

export interface SystemConfig {
    academicYear: string;
    semester: string;
    departments: string[]; // List of available departments
}