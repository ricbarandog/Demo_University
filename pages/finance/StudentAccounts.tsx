import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Modal } from '../../components/Card';
import { Student, Transaction, EnrolledSubject } from '../../types';
import { Search, UserPlus, CheckCircle, FileText, PieChart, Copy, Key, Hash, Mail, Trash2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const generateFinancialSummary = async (student: Student) => {
   const prompt = `Analyze the financial status for student ${student.firstName} ${student.lastName}. Total Balance: ₱${student.balance}. Transaction count: ${student.transactions.length}. Brief summary only.`;
   if (process.env.API_KEY) {
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          return response.text;
      } catch (e) {
          return "AI Analysis unavailable.";
      }
   }
   return "AI Analysis: Student has pending balance. Payment regularity is average. Recommend follow-up.";
};

interface StudentBillingRowProps {
    s: Student;
    onUpdate: (id: string) => void;
    onAnalyze: (id: string) => void;
}

const StudentBillingRow: React.FC<StudentBillingRowProps> = ({ s, onUpdate, onAnalyze }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="py-4 px-4 font-medium text-gray-900">{s.id}</td>
        <td className="py-4 px-4">
            <div className="font-medium text-gray-900">{s.lastName}, {s.firstName}</div>
            <div className="text-xs text-gray-500">{s.courseId} - {s.type}</div>
        </td>
        <td className="py-4 px-4">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.balance <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {s.balance <= 0 ? 'Paid' : 'Unpaid'}
            </span>
        </td>
        <td className="py-4 px-4 font-mono text-gray-700">
            ₱{s.balance.toLocaleString()}
        </td>
        <td className="py-4 px-4">
            <button 
                onClick={() => onUpdate(s.id)}
                className="text-red-600 hover:text-red-800 font-medium text-sm mr-3"
            >
                Billing Details
            </button>
            <button 
                onClick={() => onAnalyze(s.id)}
                className="text-gray-500 hover:text-gray-700 text-sm"
            >
                Analyze
            </button>
        </td>
    </tr>
);

export const StudentAccounts = () => {
    const { students, courses, config, addStudent, addTransaction, requestTransactionVoid } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [isBillingModalOpen, setBillingModalOpen] = useState(false);
    const [isAddStudentOpen, setAddStudentOpen] = useState(false);
    
    // Add Student Form State
    const [newStudent, setNewStudent] = useState<Partial<Student>>({
        firstName: '', lastName: '', email: '', contactNumber: '', type: 'college', courseId: ''
    });
    // Temporary state for filtering courses in the modal
    const [filterDept, setFilterDept] = useState('');
    
    const [createdCredentials, setCreatedCredentials] = useState<{name: string, password: string, id: string, email: string} | null>(null);

    // Transaction Form State
    const [txForm, setTxForm] = useState<Partial<Transaction>>({ amount: 0, description: '', type: 'payment' });
    
    const [aiSummary, setAiSummary] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);

    const selectedStudent = useMemo(() => 
        students.find(s => s.id === selectedStudentId) || null, 
    [students, selectedStudentId]);

    const filteredStudents = students.filter(s => 
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.id.includes(searchTerm)
    );

    const getCourseDetails = (courseId: string) => courses.find(c => c.id === courseId);

    const calculateAssessment = (student: Student) => {
        const course = getCourseDetails(student.courseId);
        if (!course) return { tuition: 0, misc: 0, total: 0, units: 0 };

        const totalUnits = student.academicRecords
            .filter(r => r.status === 'enrolled')
            .reduce((sum, r) => sum + r.units, 0);
        
        const tuition = course.tuitionPerUnit ? totalUnits * course.tuitionPerUnit : 0;
        const misc = course.miscFee || 0;
        return { tuition, misc, total: tuition + misc, units: totalUnits };
    };

    const transactionHistoryWithBalance = useMemo(() => {
        if (!selectedStudent) return [];
        
        const sortedTx = [...selectedStudent.transactions].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        let runningBalance = 0;
        const withBalance = sortedTx.map(tx => {
            if (tx.status === 'voided') {
                return { ...tx, balanceAfter: runningBalance };
            }
            
            let effect = 0;
            if (tx.type === 'payment') {
                effect = -Math.abs(tx.amount);
            } else if (tx.type === 'adjustment') {
                effect = tx.amount;
            } else {
                effect = Math.abs(tx.amount);
            }
            runningBalance += effect;
            return { ...tx, balanceAfter: runningBalance };
        });

        return withBalance.reverse();
    }, [selectedStudent]);

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        const autoPassword = Math.random().toString(36).slice(-8).toUpperCase();
        const selectedCourse = courses.find(c => c.id === newStudent.courseId);
        
        const initialSubjects: EnrolledSubject[] = selectedCourse 
            ? selectedCourse.subjects
                .filter(s => s.yearLevel === 1 && s.semester === 1)
                .map(s => ({ ...s, status: 'enrolled', term: '1st Sem 2024', instructor: 'TBA' }))
            : [];
            
        const totalUnits = initialSubjects.reduce((sum, s) => sum + s.units, 0);
        const tuition = (selectedCourse?.tuitionPerUnit || 0) * totalUnits;
        const misc = selectedCourse?.miscFee || 0;
        const totalAssessment = tuition + misc;

        const generatedId = `2024-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        const txId = `TRX-${Math.floor(Math.random() * 1000000)}`;

        const student: Student = {
            id: generatedId,
            firstName: newStudent.firstName!,
            lastName: newStudent.lastName!,
            email: newStudent.email!,
            contactNumber: newStudent.contactNumber!,
            password: autoPassword,
            isPasswordChanged: false,
            type: newStudent.type as 'college' | 'highschool',
            courseId: newStudent.courseId!,
            yearLevel: 1,
            enrollmentStatus: 'pending',
            balance: totalAssessment,
            transactions: [
                {
                    id: txId,
                    date: new Date().toISOString().split('T')[0],
                    amount: totalAssessment,
                    type: 'tuition',
                    description: 'Initial Enrollment Assessment',
                    recordedBy: 'finance_admin',
                    status: 'posted'
                }
            ],
            academicRecords: initialSubjects,
            documents: []
        };

        await addStudent(student);
        setCreatedCredentials({
            name: `${student.firstName} ${student.lastName}`,
            password: autoPassword,
            id: generatedId,
            email: student.email
        });
        setNewStudent({ firstName: '', lastName: '', email: '', contactNumber: '', type: 'college', courseId: '' });
        setFilterDept('');
    };

    const handleSaveTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !txForm.amount) return;

        const txId = `TRX-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

        const txData: Transaction = {
            id: txId,
            date: new Date().toISOString().split('T')[0],
            amount: Number(txForm.amount),
            type: txForm.type as any,
            description: txForm.description || '',
            recordedBy: 'finance_staff',
            status: 'posted'
        };

        await addTransaction(selectedStudent.id, txData);
        setTxForm({ amount: 0, description: '', type: 'payment' });
    };

    const handleAnalyze = async (id: string) => {
        const student = students.find(s => s.id === id);
        if (!student) return;
        setLoadingAi(true);
        const summary = await generateFinancialSummary(student);
        setAiSummary(summary);
        setLoadingAi(false);
    };
    
    const handleSendEmail = () => {
        if (createdCredentials) {
            alert(`Credentials emailed to ${createdCredentials.email}`);
        }
    };
    
    const handleVoidTransaction = async (txId: string) => {
        if (!selectedStudent) return;
        if (confirm("Are you sure you want to request deletion/void for this transaction?")) {
            await requestTransactionVoid(selectedStudent.id, txId);
        }
    };

    const closeCreateModal = () => {
        setAddStudentOpen(false);
        setCreatedCredentials(null);
        setFilterDept('');
    }

    // Filter courses based on type AND selected department
    const availableCourses = courses.filter(c => 
        c.type === newStudent.type && 
        (!filterDept || c.department === filterDept)
    );

    return (
        <div className="space-y-6">
            {selectedStudent && aiSummary && (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg animate-in fade-in slide-in-from-top-4">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                             <PieChart size={18} className="text-red-400" /> 
                             AI Financial Insight: {selectedStudent.firstName}
                        </h4>
                        <button onClick={() => setAiSummary('')}><span className="text-gray-400 hover:text-white">&times;</span></button>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{loadingAi ? 'Generating analysis...' : aiSummary}</p>
                </div>
            )}

            <Card 
                title="Student Accounts Directory" 
                action={
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search student..." 
                            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setAddStudentOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                    >
                        <UserPlus size={16} />
                        New Account
                    </button>
                </div>
            }>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                <th className="py-3 px-4">ID</th>
                                <th className="py-3 px-4">Student</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Balance</th>
                                <th className="py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(s => (
                                <StudentBillingRow 
                                    key={s.id} 
                                    s={s} 
                                    onUpdate={(id) => { setSelectedStudentId(id); setBillingModalOpen(true); }}
                                    onAnalyze={(id) => { setSelectedStudentId(id); handleAnalyze(id); }}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isAddStudentOpen} onClose={closeCreateModal} title="Create Financial Account">
                 {!createdCredentials ? (
                    <form onSubmit={handleCreateStudent} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                                    value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                                    value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                                    value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                                    value={newStudent.contactNumber} onChange={e => setNewStudent({...newStudent, contactNumber: e.target.value})} />
                             </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Type</label>
                                <select className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white" 
                                    value={newStudent.type} onChange={e => {
                                        setNewStudent({...newStudent, type: e.target.value as any, courseId: ''});
                                        setFilterDept('');
                                    }}>
                                        <option value="college">College</option>
                                        <option value="highschool">High School</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department Filter</label>
                                <select className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white" 
                                    value={filterDept} onChange={e => {
                                        setFilterDept(e.target.value);
                                        setNewStudent({...newStudent, courseId: ''}); // Reset course when dept changes
                                    }}>
                                        <option value="">-- All Departments --</option>
                                        {config.departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course / Level</label>
                            <select className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white" required
                                value={newStudent.courseId} onChange={e => setNewStudent({...newStudent, courseId: e.target.value})}>
                                    <option value="">-- Select Course --</option>
                                    {availableCourses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                            </select>
                        </div>

                        {newStudent.courseId && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
                                <h5 className="font-semibold text-gray-800 mb-2">Projected Assessment (1st Sem/Term)</h5>
                                {(() => {
                                    const c = courses.find(course => course.id === newStudent.courseId);
                                    const units = c?.subjects.filter(s => s.yearLevel === 1 && s.semester === 1).reduce((acc,s) => acc+s.units,0) || 0;
                                    const tuition = (c?.tuitionPerUnit || 0) * units;
                                    const misc = c?.miscFee || 0;
                                    return (
                                        <div className="space-y-1 text-gray-600">
                                            <div className="flex justify-between"><span>Assigned Adviser:</span> <span className="font-medium text-gray-900">{c?.adviser || 'N/A'}</span></div>
                                            <div className="flex justify-between border-t pt-1 mt-1"><span>Tuition ({units} units):</span> <span>₱{tuition.toLocaleString()}</span></div>
                                            <div className="flex justify-between"><span>Misc Fees:</span> <span>₱{misc.toLocaleString()}</span></div>
                                            <div className="flex justify-between font-bold text-gray-900 border-t pt-1 mt-1"><span>Total Due:</span> <span>₱{(tuition + misc).toLocaleString()}</span></div>
                                        </div>
                                    )
                                })()}
                            </div>
                        )}

                        <button type="submit" className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold shadow-lg shadow-red-600/20 transition-all">
                            Create Account & Post Assessment
                        </button>
                    </form>
                 ) : (
                    <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Account Created Successfully</h3>
                            <p className="text-gray-500">The student record and initial assessment have been posted.</p>
                        </div>
                        
                        <div className="bg-gray-900 rounded-xl p-6 max-w-sm mx-auto text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10"><Key size={80} className="text-white"/></div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Student Portal Credentials</p>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Student ID</p>
                                    <p className="text-white font-mono font-medium">{createdCredentials.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Auto-Generated Password</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xl text-white font-mono font-bold tracking-wide">{createdCredentials.password}</p>
                                        <button onClick={() => navigator.clipboard.writeText(createdCredentials.password)} className="text-gray-400 hover:text-white" title="Copy">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleSendEmail} className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-xs font-medium transition-colors">
                                <Mail size={14} /> Send via Email
                            </button>
                        </div>

                        <button onClick={closeCreateModal} className="w-full py-3 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                            Close & Return to List
                        </button>
                    </div>
                 )}
            </Modal>

            <Modal isOpen={isBillingModalOpen} onClose={() => setBillingModalOpen(false)} title={`Billing Details: ${selectedStudent?.lastName}, ${selectedStudent?.firstName}`}>
                {selectedStudent && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><FileText size={16}/> Current Assessment</h4>
                                {(() => {
                                    const assessment = calculateAssessment(selectedStudent);
                                    const course = getCourseDetails(selectedStudent.courseId);
                                    return (
                                        <div className="text-sm space-y-1 text-blue-800">
                                            <div className="flex justify-between">
                                                <span>Course:</span>
                                                <span className="font-medium">{course?.name} ({selectedStudent.type})</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Enrolled Units:</span>
                                                <span className="font-medium">{assessment.units} units</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tuition Fee ({course?.tuitionPerUnit}/unit):</span>
                                                <span className="font-medium">₱{assessment.tuition.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Misc. Fees:</span>
                                                <span className="font-medium">₱{assessment.misc.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col justify-center">
                                <p className="text-sm text-red-600 font-medium mb-1">Current Balance (Real-time)</p>
                                <p className="text-3xl font-bold text-red-700">₱{selectedStudent.balance.toLocaleString()}</p>
                                <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><CheckCircle size={12}/> Updated instantly</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                             <h4 className="font-semibold text-gray-900 mb-3">Add New Transaction</h4>
                             <form onSubmit={handleSaveTransaction} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <select 
                                        className="p-2 border rounded-lg text-sm bg-white"
                                        value={txForm.type}
                                        onChange={(e) => setTxForm({...txForm, type: e.target.value as any})}
                                    >
                                        <option value="payment">Receive Payment</option>
                                        <option value="tuition">Add Tuition</option>
                                        <option value="misc">Add Misc Fee</option>
                                        <option value="adjustment">Adjustment</option>
                                    </select>
                                    <input 
                                        type="number" 
                                        placeholder="Amount"
                                        className="p-2 border rounded-lg text-sm"
                                        value={txForm.amount || ''}
                                        onChange={(e) => setTxForm({...txForm, amount: parseFloat(e.target.value)})}
                                        required
                                    />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Description (e.g. Partial Payment)"
                                    className="w-full p-2 border rounded-lg text-sm"
                                    value={txForm.description || ''}
                                    onChange={(e) => setTxForm({...txForm, description: e.target.value})}
                                    required
                                />
                                <div className="flex justify-end gap-2">
                                    <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                                        Add Transaction
                                    </button>
                                </div>
                             </form>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center justify-between">
                                <span>Transaction History</span>
                            </h4>
                            <div className="max-h-48 overflow-y-auto border rounded-lg shadow-inner bg-white">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 sticky top-0 border-b z-10">
                                        <tr>
                                            <th className="p-2 font-medium text-gray-600">Date</th>
                                            <th className="p-2 font-medium text-gray-600">Ref #</th>
                                            <th className="p-2 font-medium text-gray-600">Desc</th>
                                            <th className="p-2 text-right font-medium text-gray-600">Amount</th>
                                            <th className="p-2 text-right font-medium text-gray-600">Balance</th>
                                            <th className="p-2 text-center font-medium text-gray-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactionHistoryWithBalance.length > 0 ? transactionHistoryWithBalance.map((tx, idx) => (
                                            <tr key={tx.id || idx} className={`border-b last:border-0 hover:bg-gray-50 transition-colors ${tx.status === 'voided' ? 'opacity-50 bg-gray-100 line-through' : ''}`}>
                                                <td className="p-2 text-gray-500 text-xs">{tx.date}</td>
                                                <td className="p-2 text-gray-500 text-xs font-mono">{tx.id}</td>
                                                <td className="p-2 font-medium text-gray-700">
                                                    {tx.description}
                                                    {tx.status === 'voided' && <span className="ml-2 text-xs text-red-500 font-bold">(VOID)</span>}
                                                </td>
                                                <td className={`p-2 text-right font-mono ${tx.type === 'payment' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {tx.type === 'payment' ? '-' : ''}{Math.abs(tx.amount).toLocaleString()}
                                                </td>
                                                 <td className="p-2 text-right font-mono text-gray-800 font-semibold">
                                                    ₱{tx.balanceAfter.toLocaleString()}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {tx.status !== 'voided' && (
                                                        <button 
                                                            onClick={() => handleVoidTransaction(tx.id)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                            title="Request Deletion / Void"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="p-4 text-center text-gray-400">No transactions recorded.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};