import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Modal } from '../../components/Card';
import { Student, EnrolledSubject } from '../../types';
import { UserPlus, Search, FileText, Upload, BookOpen, PlusCircle, CheckCircle, Clock } from 'lucide-react';

export const StudentRecords = () => {
    const { students, courses, addStudent, updateStudent, uploadDocument } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'academics' | 'docs'>('info');

    // Form State for new student
    const [newStudent, setNewStudent] = useState<Partial<Student>>({
        firstName: '', lastName: '', email: '', type: 'college', courseId: ''
    });

    const filteredStudents = students.filter(s => 
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.id.includes(searchTerm)
    );

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        const autoPassword = Math.random().toString(36).slice(-8).toUpperCase();
        const selectedCourse = courses.find(c => c.id === newStudent.courseId);
        
        // Auto-load subjects for 1st year 1st sem if course selected
        const initialSubjects: EnrolledSubject[] = selectedCourse 
            ? selectedCourse.subjects
                .filter(s => s.yearLevel === 1 && s.semester === 1)
                .map(s => ({ ...s, status: 'enrolled', term: '1st Sem 2024', instructor: 'TBA' }))
            : [];

        const totalUnits = initialSubjects.reduce((sum, s) => sum + s.units, 0);
        const tuition = (selectedCourse?.tuitionPerUnit || 0) * totalUnits;
        const misc = selectedCourse?.miscFee || 0;
        const initialBalance = tuition + misc;

        const student: Student = {
            id: `2024-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            firstName: newStudent.firstName!,
            lastName: newStudent.lastName!,
            email: newStudent.email!,
            password: autoPassword,
            type: newStudent.type as 'college' | 'highschool',
            courseId: newStudent.courseId!,
            yearLevel: 1,
            enrollmentStatus: 'pending',
            balance: initialBalance,
            transactions: [], 
            academicRecords: initialSubjects,
            documents: []
        };
        await addStudent(student);
        setAddModalOpen(false);
        setNewStudent({ firstName: '', lastName: '', email: '', type: 'college', courseId: '' });
        alert(`Student created successfully!\n\nName: ${student.firstName} ${student.lastName}\nStudent ID: ${student.id}\nAuto-generated Password: ${autoPassword}`);
    };

    const handleAddSubject = async (subjectCode: string) => {
        if (!selectedStudent) return;
        const course = courses.find(c => c.id === selectedStudent.courseId);
        const subjectDef = course?.subjects.find(s => s.code === subjectCode);
        
        if (subjectDef) {
            const newRecord: EnrolledSubject = {
                ...subjectDef,
                status: 'enrolled',
                term: 'Current Term',
                grade: '',
                instructor: 'TBA'
            };
            const updatedRecords = [...selectedStudent.academicRecords, newRecord];
            await updateStudent(selectedStudent.id, { academicRecords: updatedRecords });
            setSelectedStudent({...selectedStudent, academicRecords: updatedRecords});
        }
    };

    const availableSubjects = selectedStudent 
        ? courses.find(c => c.id === selectedStudent.courseId)?.subjects.filter(
            s => !selectedStudent.academicRecords.find(ar => ar.code === s.code)
          ) || []
        : [];

    return (
        <div className="space-y-6">
            <Card title="Student Accounts" action={
                <div className="flex gap-3">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by name or ID..." 
                            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                    >
                        <UserPlus size={16} />
                        Enroll Student
                    </button>
                </div>
            }>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                            <tr>
                                <th className="p-4">Student ID</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Course</th>
                                <th className="p-4">Enrollment Status</th>
                                <th className="p-4">Billing Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-mono text-gray-600">{student.id}</td>
                                    <td className="p-4 font-medium text-gray-900">{student.lastName}, {student.firstName}</td>
                                    <td className="p-4 text-gray-600">{student.courseId}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                                            student.enrollmentStatus === 'enrolled' ? 'bg-green-100 text-green-700' : 
                                            student.enrollmentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {student.enrollmentStatus}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                         <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${student.balance <= 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span className="font-mono text-gray-700">₱{student.balance.toLocaleString()}</span>
                                         </div>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => { setSelectedStudent(student); setDetailsOpen(true); setActiveTab('info'); }}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            View Record
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="New Student Enrollment">
                <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input type="text" required className="w-full p-2 border rounded-lg focus:ring-red-500" 
                                value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input type="text" required className="w-full p-2 border rounded-lg focus:ring-red-500" 
                                value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} />
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                         <input type="email" required className="w-full p-2 border rounded-lg focus:ring-red-500" 
                             value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Program Type</label>
                         <select className="w-full p-2 border rounded-lg bg-white focus:ring-red-500" 
                            value={newStudent.type} onChange={e => setNewStudent({...newStudent, type: e.target.value as any, courseId: ''})}>
                                <option value="college">College</option>
                                <option value="highschool">High School</option>
                         </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Course / Grade</label>
                        <select className="w-full p-2 border rounded-lg bg-white focus:ring-red-500" required
                            value={newStudent.courseId} onChange={e => setNewStudent({...newStudent, courseId: e.target.value})}>
                                <option value="">-- Select Course --</option>
                                {courses.filter(c => c.type === newStudent.type).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                        </select>
                    </div>
                    <button type="submit" className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-lg mt-4">Create Student Record</button>
                </form>
            </Modal>

            <Modal isOpen={isDetailsOpen && !!selectedStudent} onClose={() => setDetailsOpen(false)} title="Student Record Details">
                {selectedStudent && (
                    <div className="flex flex-col h-[600px]">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                                {selectedStudent.firstName.charAt(0)}{selectedStudent.lastName.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedStudent.lastName}, {selectedStudent.firstName}</h2>
                                <p className="text-gray-500 text-sm">{selectedStudent.id} • {selectedStudent.courseId}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Billing Status</p>
                                <p className={`text-lg font-bold ${selectedStudent.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {selectedStudent.balance > 0 ? `Unpaid (₱${selectedStudent.balance.toLocaleString()})` : 'Fully Paid'}
                                </p>
                            </div>
                        </div>

                        <div className="flex border-b border-gray-200 mb-4">
                            <button onClick={() => setActiveTab('info')} className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'info' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Information</button>
                            <button onClick={() => setActiveTab('academics')} className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'academics' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Academics & Grades</button>
                            <button onClick={() => setActiveTab('docs')} className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'docs' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Documents</button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2">
                            {activeTab === 'info' && (
                                <div className="space-y-4">
                                     <div className="grid grid-cols-2 gap-4">
                                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase">Program</p>
                                            <p className="font-semibold text-gray-900">{courses.find(c => c.id === selectedStudent.courseId)?.name}</p>
                                         </div>
                                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase">Student Type</p>
                                            <p className="font-semibold text-gray-900 capitalize">{selectedStudent.type}</p>
                                         </div>
                                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase">Email Address</p>
                                            <p className="font-semibold text-gray-900">{selectedStudent.email}</p>
                                         </div>
                                         <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase">Year Level</p>
                                            <p className="font-semibold text-gray-900">{selectedStudent.yearLevel}</p>
                                         </div>
                                     </div>
                                     
                                     <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-sm font-semibold text-blue-900 mb-2">Enrollment Status</p>
                                        <select 
                                            value={selectedStudent.enrollmentStatus}
                                            onChange={(e) => {
                                                updateStudent(selectedStudent.id, { enrollmentStatus: e.target.value as any });
                                                setSelectedStudent({...selectedStudent, enrollmentStatus: e.target.value as any});
                                            }}
                                            className="w-full p-2 border border-blue-200 rounded bg-white text-sm"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="enrolled">Enrolled</option>
                                            <option value="dropped">Dropped</option>
                                            <option value="graduated">Graduated</option>
                                        </select>
                                     </div>
                                </div>
                            )}

                            {activeTab === 'academics' && (
                                <div className="space-y-6">
                                    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                                            <h4 className="font-medium text-sm text-gray-700">Enrolled Subjects</h4>
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                                <tr>
                                                    <th className="p-3 text-left">Code</th>
                                                    <th className="p-3 text-left">Title</th>
                                                    <th className="p-3 text-left">Instructor</th>
                                                    <th className="p-3 text-center">Units</th>
                                                    <th className="p-3 text-center">Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedStudent.academicRecords.map((sub, idx) => (
                                                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                                                        <td className="p-3 font-medium text-gray-900">{sub.code}</td>
                                                        <td className="p-3 text-gray-600">{sub.name}</td>
                                                        <td className="p-3 text-gray-600 text-xs">{sub.instructor || 'TBA'}</td>
                                                        <td className="p-3 text-center text-gray-600">{sub.units}</td>
                                                        <td className="p-3 text-center font-bold text-gray-800">
                                                            {sub.grade || <span className="text-gray-400 italic font-normal">Pending</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-medium text-sm mb-3 text-gray-800 flex items-center gap-2"><PlusCircle size={16}/> Add Subject Load</h4>
                                        <div className="flex gap-2">
                                            <select 
                                                className="flex-1 p-2 border rounded-lg text-sm bg-white"
                                                id="subject-select"
                                            >
                                                <option value="">-- Select Subject from Curriculum --</option>
                                                {availableSubjects.map(s => (
                                                    <option key={s.code} value={s.code}>{s.code} - {s.name} ({s.units}u)</option>
                                                ))}
                                            </select>
                                            <button 
                                                onClick={() => {
                                                    const select = document.getElementById('subject-select') as HTMLSelectElement;
                                                    if (select.value) handleAddSubject(select.value);
                                                }}
                                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'docs' && (
                                <div className="space-y-4">
                                    <label className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                            <Upload className="text-gray-400 group-hover:text-red-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Click to upload document</span>
                                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG</p>
                                        <input type="file" className="hidden" onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                await uploadDocument(selectedStudent.id, e.target.files[0], e.target.files[0].name, e.target.files[0].type);
                                                const updated = students.find(s => s.id === selectedStudent.id);
                                                if (updated) setSelectedStudent(updated);
                                            }
                                        }} />
                                    </label>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-800">Uploaded Documents</h4>
                                        {selectedStudent.documents.length === 0 && <p className="text-sm text-gray-400 italic">No documents uploaded yet.</p>}
                                        {selectedStudent.documents.map(doc => (
                                            <div key={doc.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={18} className="text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full uppercase tracking-wide font-medium flex items-center gap-1 ${
                                                    doc.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {doc.status === 'approved' ? <CheckCircle size={10} /> : <Clock size={10}/>}
                                                    {doc.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};