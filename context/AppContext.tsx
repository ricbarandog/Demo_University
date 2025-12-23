import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../services/mockDb';
import { Student, User, Transaction, Course, PasswordRequest, SystemConfig } from '../types';

interface AppContextType {
  user: User | Student | null;
  students: Student[];
  courses: Course[];
  staffUsers: User[];
  config: SystemConfig;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  refreshData: () => Promise<void>;
  
  // Student/Registrar/Finance
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  addTransaction: (studentId: string, transaction: Transaction) => Promise<void>;
  updateTransaction: (studentId: string, transaction: Transaction) => Promise<void>;
  requestTransactionVoid: (studentId: string, transactionId: string) => Promise<void>;
  changePassword: (studentId: string, newPass: string) => Promise<void>;
  uploadDocument: (studentId: string, file: File, name: string, type: string) => Promise<void>;
  createPasswordRequest: (email: string, userType: 'student' | 'staff') => Promise<void>;
  
  // Super Admin Methods
  addUser: (user: User) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  updateSystemConfig: (config: SystemConfig) => Promise<void>;
  getPasswordRequests: () => Promise<PasswordRequest[]>;
  resolvePasswordRequest: (reqId: string, newPass: string) => Promise<void>;
  approveVoidTransaction: (studentId: string, txId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [config, setConfig] = useState<SystemConfig>({ academicYear: '', semester: '', departments: [] });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      setStudents(await db.getStudents());
      setCourses(await db.getCourses());
      setStaffUsers(await db.getUsers());
      setConfig(await db.getSystemConfig());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const foundUser = await db.login(username, password);
      if (foundUser) {
        setUser(foundUser);
        await refreshData(); 
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setStudents([]);
  };

  const addStudent = async (student: Student) => {
    await db.createStudent(student);
    await refreshData();
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    await db.updateStudent(id, updates);
    await refreshData();
  };

  const addTransaction = async (studentId: string, transaction: Transaction) => {
    await db.addTransaction(studentId, transaction);
    await refreshData();
  };

  const updateTransaction = async (studentId: string, transaction: Transaction) => {
    await db.updateTransaction(studentId, transaction);
    await refreshData();
  };

  const requestTransactionVoid = async (studentId: string, transactionId: string) => {
      await db.requestTransactionVoid(studentId, transactionId);
      await refreshData();
  };

  const changePassword = async (studentId: string, newPass: string) => {
      await db.changePassword(studentId, newPass);
      if (user && user.id === studentId) {
          setUser({ ...user, ...(user as Student), isPasswordChanged: true });
      }
      await refreshData();
  };

  const uploadDocument = async (studentId: string, file: File, name: string, type: string) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const url = reader.result as string;
        const newDoc = {
            id: Date.now().toString(),
            name,
            type,
            uploadDate: new Date().toISOString().split('T')[0],
            url,
            status: 'pending' as const
        };
        await db.uploadDocument(studentId, newDoc);
        await refreshData();
    };
  };

  const createPasswordRequest = async (email: string, userType: 'student' | 'staff') => {
      await db.createPasswordRequest(email, userType);
  };

  // --- SUPER ADMIN ---
  const addUser = async (user: User) => {
      await db.addUser(user);
      await refreshData();
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
      await db.updateUser(id, updates);
      await refreshData();
  };

  const addCourse = async (course: Course) => {
      await db.addCourse(course);
      await refreshData();
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
      await db.updateCourse(id, updates);
      await refreshData();
  };

  const updateSystemConfig = async (config: SystemConfig) => {
      await db.updateSystemConfig(config);
      await refreshData();
  };

  const getPasswordRequests = async () => {
      return await db.getPasswordRequests();
  };

  const resolvePasswordRequest = async (id: string, pass: string) => {
      await db.resolvePasswordRequest(id, pass);
      await refreshData();
  };

  const approveVoidTransaction = async (sid: string, tid: string) => {
      await db.approveVoidTransaction(sid, tid);
      await refreshData();
  };

  return (
    <AppContext.Provider value={{ 
      user, students, courses, staffUsers, config, isLoading, 
      login, logout, refreshData, 
      addStudent, updateStudent, addTransaction, updateTransaction, requestTransactionVoid, changePassword, uploadDocument, createPasswordRequest,
      addUser, updateUser, addCourse, updateCourse, updateSystemConfig, getPasswordRequests, resolvePasswordRequest, approveVoidTransaction
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};