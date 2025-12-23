
import { Student, User, Transaction, EnrollmentDocument, Course, Subject, PasswordRequest, SystemConfig, Role } from '../types';

// Initial Static Data
const INITIAL_COURSES: Course[] = [
    {
        id: 'BSCS',
        name: 'BS Computer Science',
        type: 'college',
        department: 'College of Science',
        adviser: 'Mr. Keating',
        tuitionPerUnit: 1200,
        miscFee: 5000,
        subjects: [
            { code: 'CS101', name: 'Intro to Computing', units: 3, yearLevel: 1, semester: 1 },
            { code: 'CS102', name: 'Computer Programming 1', units: 3, yearLevel: 1, semester: 1 },
            { code: 'MATH1', name: 'Calculus 1', units: 4, yearLevel: 1, semester: 1 },
            { code: 'ENG1', name: 'Purposive Communication', units: 3, yearLevel: 1, semester: 1 },
            { code: 'CS103', name: 'Data Structures', units: 3, yearLevel: 1, semester: 2 },
            { code: 'CS104', name: 'Discrete Structures', units: 3, yearLevel: 1, semester: 2 },
        ]
    },
    {
        id: 'BSBA',
        name: 'BS Business Administration',
        type: 'college',
        department: 'College of Business',
        adviser: 'Mrs. Krabappel',
        tuitionPerUnit: 1000,
        miscFee: 4500,
        subjects: [
            { code: 'BA101', name: 'Principles of Management', units: 3, yearLevel: 1, semester: 1 },
            { code: 'MKT101', name: 'Principles of Marketing', units: 3, yearLevel: 1, semester: 1 },
            { code: 'ACCT1', name: 'Financial Accounting', units: 3, yearLevel: 1, semester: 1 },
            { code: 'ECO1', name: 'Microeconomics', units: 3, yearLevel: 1, semester: 2 },
        ]
    },
    {
        id: 'G11',
        name: 'Grade 11 - STEM',
        type: 'highschool',
        department: 'High School',
        adviser: 'Mr. White',
        tuitionPerUnit: 0, 
        miscFee: 15000, 
        subjects: [
            { code: 'G11-M1', name: 'General Mathematics', units: 1 },
            { code: 'G11-S1', name: 'Earth Science', units: 1 },
            { code: 'G11-E1', name: 'Oral Communication', units: 1 },
            { code: 'G11-PE', name: 'Physical Education', units: 1 },
        ]
    },
    {
        id: 'G12',
        name: 'Grade 12 - STEM',
        type: 'highschool',
        department: 'High School',
        adviser: 'Mrs. Krabappel',
        tuitionPerUnit: 0,
        miscFee: 15500,
        subjects: [
            { code: 'G12-M2', name: 'Statistics & Probability', units: 1 },
            { code: 'G12-S2', name: 'Physics 1', units: 1 },
            { code: 'G12-P2', name: 'Capstone Project', units: 1 },
        ]
    }
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: '2024-001',
    firstName: 'Alice',
    lastName: 'Rivera',
    email: 'alice.r@crimson.edu',
    contactNumber: '0917-123-4567',
    password: 'tempPassword123',
    isPasswordChanged: true, 
    type: 'college',
    courseId: 'BSCS',
    yearLevel: 1,
    enrollmentStatus: 'enrolled',
    balance: 5500, 
    transactions: [
      { id: 't1', date: '2024-01-15', amount: 20000, type: 'tuition', description: 'Tuition Assessment', recordedBy: 'system', status: 'posted' },
      { id: 't2', date: '2024-02-01', amount: -14500, type: 'payment', description: 'Partial Payment', recordedBy: 'finance_admin', status: 'posted' }
    ],
    academicRecords: [
      { code: 'CS101', name: 'Intro to Computing', units: 3, grade: 1.5, status: 'completed', term: '1st Sem 2023', instructor: 'Mr. Keating' },
      { code: 'CS102', name: 'Computer Programming 1', units: 3, grade: 1.75, status: 'completed', term: '1st Sem 2023', instructor: 'Ms. Honey' },
      { code: 'CS103', name: 'Data Structures', units: 3, grade: '', status: 'enrolled', term: '2nd Sem 2024', instructor: 'Mr. Keating' },
      { code: 'CS104', name: 'Discrete Structures', units: 3, grade: '', status: 'enrolled', term: '2nd Sem 2024', instructor: 'Mr. Keating' }
    ],
    documents: [
      { id: 'd1', name: 'Form 137.pdf', type: 'application/pdf', uploadDate: '2024-01-10', url: '', status: 'approved' }
    ]
  },
  {
    id: '2024-002',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@crimson.edu',
    contactNumber: '0919-987-6543',
    password: 'password',
    isPasswordChanged: false, 
    type: 'highschool',
    courseId: 'G12',
    yearLevel: 12,
    enrollmentStatus: 'pending',
    balance: 15500,
    transactions: [
         { id: 't3', date: '2024-08-01', amount: 15500, type: 'tuition', description: 'Annual School Fees', recordedBy: 'system', status: 'posted' }
    ],
    academicRecords: [
        { code: 'G12-M2', name: 'Statistics & Probability', units: 1, status: 'enrolled', term: 'AY 2024-2025', instructor: 'Mrs. Krabappel' },
        { code: 'G12-S2', name: 'Physics 1', units: 1, status: 'enrolled', term: 'AY 2024-2025', instructor: 'Mr. White' }
    ],
    documents: []
  }
];

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'registrar', role: 'registrar', name: 'Regina Mills', email: 'registrar@cosca.edu' },
  { id: 'u2', username: 'finance', role: 'finance', name: 'Fiona Cash', email: 'finance@cosca.edu' },
  { id: 'u3', username: 'teacher', role: 'teacher', name: 'Mr. Keating', email: 'keating@cosca.edu', department: 'College of Science' },
  { id: 'u4', username: 'admin', role: 'super_admin', name: 'System Administrator', email: 'admin@cosca.edu' },
  { id: 'u5', username: 'krabappel', role: 'teacher', name: 'Mrs. Krabappel', email: 'krabappel@cosca.edu', department: 'High School' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDatabase {
  private students: Student[];
  private users: User[];
  private courses: Course[];
  private passwordRequests: PasswordRequest[];
  private config: SystemConfig;

  constructor() {
    const storedStudents = typeof window !== 'undefined' ? localStorage.getItem('crimson_students') : null;
    this.students = storedStudents ? JSON.parse(storedStudents) : INITIAL_STUDENTS;
    this.users = [...INITIAL_USERS]; 
    this.courses = INITIAL_COURSES;
    this.passwordRequests = [];
    this.config = { 
        academicYear: '2024-2025', 
        semester: '1st Semester',
        departments: ['College of Science', 'College of Business', 'High School', 'College of Arts'] 
    };
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('crimson_students', JSON.stringify(this.students));
    }
  }

  private calculateBalance(transactions: Transaction[]): number {
    return transactions.reduce((acc, t) => {
        if (t.status === 'voided') return acc;
        if (t.type === 'payment') return acc - Math.abs(t.amount);
        else if (t.type === 'adjustment') return acc + t.amount;
        else return acc + Math.abs(t.amount);
    }, 0);
  }

  async login(username: string, password?: string): Promise<User | Student | null> {
    await delay(500);
    const internalUser = this.users.find(u => u.username === username);
    if (internalUser) return internalUser;

    const studentUser = this.students.find(s => 
        s.firstName.toLowerCase() === username.toLowerCase() && 
        (s.password === password || !password) 
    );
    
    if (studentUser) {
        if (password && studentUser.password !== password) return null;
        // Construct the session object without spreading to avoid duplicate property errors
        return {
            id: studentUser.id,
            firstName: studentUser.firstName,
            lastName: studentUser.lastName,
            email: studentUser.email,
            contactNumber: studentUser.contactNumber,
            type: studentUser.type,
            courseId: studentUser.courseId,
            yearLevel: studentUser.yearLevel,
            enrollmentStatus: studentUser.enrollmentStatus,
            balance: studentUser.balance,
            transactions: studentUser.transactions,
            academicRecords: studentUser.academicRecords,
            documents: studentUser.documents,
            isPasswordChanged: studentUser.isPasswordChanged,
            username: studentUser.firstName,
            role: 'student' as Role,
            name: `${studentUser.firstName} ${studentUser.lastName}`,
        };
    }
    return null;
  }

  async changePassword(studentId: string, newPassword: string): Promise<void> {
      await delay(300);
      const index = this.students.findIndex(s => s.id === studentId);
      if (index === -1) throw new Error("Student not found");
      
      this.students[index] = { 
          ...this.students[index], 
          password: newPassword,
          isPasswordChanged: true
      };
      this.save();
  }

  async requestTransactionVoid(studentId: string, transactionId: string): Promise<Student> {
      await delay(300);
      const index = this.students.findIndex(s => s.id === studentId);
      if (index === -1) throw new Error("Student not found");

      let s = this.students[index];
      const txIndex = s.transactions.findIndex(t => t.id === transactionId);
      if (txIndex !== -1) {
          const updatedTx = [...s.transactions];
          updatedTx[txIndex] = { ...updatedTx[txIndex], status: 'void_requested' }; 
          s.transactions = updatedTx;
          s.balance = this.calculateBalance(s.transactions);
      }
      
      this.students[index] = s;
      this.save();
      return s;
  }

  async getStudents(): Promise<Student[]> {
    await delay(300);
    return [...this.students];
  }

  async getCourses(): Promise<Course[]> {
      return [...this.courses];
  }

  async createStudent(student: Student): Promise<Student> {
    await delay(500);
    if (student.transactions.length > 0) {
        student.balance = this.calculateBalance(student.transactions);
    }
    this.students.push(student);
    this.save();
    return student;
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    await delay(400);
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Student not found");
    this.students[index] = { ...this.students[index], ...updates };
    this.save();
    return this.students[index];
  }

  async addTransaction(studentId: string, transaction: Transaction): Promise<Student> {
    await delay(400);
    const index = this.students.findIndex(s => s.id === studentId);
    if (index === -1) throw new Error("Student not found");

    const student = this.students[index];
    const tx = { ...transaction, status: transaction.status || 'posted' };
    const newTransactions = [tx, ...student.transactions]; 
    const newBalance = this.calculateBalance(newTransactions);

    this.students[index] = { ...student, transactions: newTransactions, balance: newBalance };
    this.save();
    return this.students[index];
  }
  
  async updateTransaction(studentId: string, transaction: Transaction): Promise<Student> {
      const index = this.students.findIndex(s => s.id === studentId);
      if (index === -1) throw new Error("Student not found");

      let s = this.students[index];
      const txIndex = s.transactions.findIndex(t => t.id === transaction.id);
      if (txIndex === -1) throw new Error("Transaction not found");

      s.transactions[txIndex] = transaction;
      s.balance = this.calculateBalance(s.transactions);
      
      this.students[index] = s;
      this.save();
      return s;
  }

  async uploadDocument(studentId: string, doc: EnrollmentDocument): Promise<Student> {
    await delay(500);
    const index = this.students.findIndex(s => s.id === studentId);
    if (index === -1) throw new Error("Student not found");
    
    const updatedDocs = [...this.students[index].documents, doc];
    this.students[index] = { ...this.students[index], documents: updatedDocs };
    this.save();
    return this.students[index];
  }

  async getUsers(): Promise<User[]> {
      await delay(300);
      return [...this.users];
  }

  async addUser(user: User): Promise<void> {
      await delay(400);
      this.users.push(user);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
      await delay(400);
      const index = this.users.findIndex(u => u.id === id);
      if (index !== -1) {
          this.users[index] = { ...this.users[index], ...updates };
      }
  }

  async getSystemConfig(): Promise<SystemConfig> {
      return this.config;
  }

  async updateSystemConfig(config: SystemConfig): Promise<void> {
      this.config = config;
  }

  async addCourse(course: Course): Promise<void> {
      await delay(300);
      this.courses.push(course);
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<void> {
      await delay(300);
      const index = this.courses.findIndex(c => c.id === id);
      if (index !== -1) {
          this.courses[index] = { ...this.courses[index], ...updates };
      }
  }

  async createPasswordRequest(email: string, userType: 'student' | 'staff'): Promise<void> {
      this.passwordRequests.push({
          id: Date.now().toString(),
          userId: '', userType, email, status: 'pending', requestDate: new Date().toISOString()
      });
  }

  async getPasswordRequests(): Promise<PasswordRequest[]> {
      return this.passwordRequests.filter(r => r.status === 'pending');
  }

  async resolvePasswordRequest(requestId: string, newPass: string): Promise<void> {
      const index = this.passwordRequests.findIndex(r => r.id === requestId);
      if (index !== -1) {
          this.passwordRequests[index].status = 'resolved';
          const sIndex = this.students.findIndex(s => s.email === this.passwordRequests[index].email);
          if (sIndex !== -1) {
              this.students[sIndex].password = newPass;
              this.students[sIndex].isPasswordChanged = false;
              this.save();
          }
      }
  }

  async approveVoidTransaction(studentId: string, transactionId: string): Promise<void> {
      const index = this.students.findIndex(s => s.id === studentId);
      if (index !== -1) {
          const s = this.students[index];
          const txIndex = s.transactions.findIndex(t => t.id === transactionId);
          if (txIndex !== -1) {
              s.transactions[txIndex].status = 'voided';
              s.balance = this.calculateBalance(s.transactions);
              this.students[index] = s;
              this.save();
          }
      }
  }
}

export const db = new MockDatabase();
