import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Modal } from '../../components/Card';
import { Student, User } from '../../types';
import { BookOpen } from 'lucide-react';

export const TeacherDashboard = () => {
    const { user, students, courses, updateStudent } = useApp();
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isGradeModalOpen, setGradeModalOpen] = useState(false);
    
    const teacherDept = (user as User).department;
    
    // Filter students: Their course's department must match teacher's department
    const myStudents = students.filter(s => {
        const course = courses.find(c => c.id === s.courseId);
        return course?.department === teacherDept;
    });

    const handleUpdateGrade = async (student: Student, subjectCode: string, newGrade: string) => {
        const updatedRecords = student.academicRecords.map(r => 
            r.code === subjectCode ? { ...r, grade: newGrade } : r
        );
        
        await updateStudent(student.id, { academicRecords: updatedRecords });
        
        if (selectedStudent && selectedStudent.id === student.id) {
            setSelectedStudent({ ...selectedStudent, academicRecords: updatedRecords });
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 <Card className="flex items-center gap-4 p-6 border-l-4 border-l-red-600">
                    <div className="p-3 bg-red-50 text-red-600 rounded-full"><BookOpen size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Department Students</p>
                        <p className="text-2xl font-bold text-gray-900">{myStudents.length}</p>
                        <p className="text-xs text-gray-400">{teacherDept}</p>
                    </div>
                </Card>
            </div>

            <Card title={`Department Enrollees: ${teacherDept || 'Unassigned'}`}>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                            <tr>
                                <th className="p-4">Student ID</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Course/Year</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myStudents.map(student => (
                                <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4 font-mono text-gray-600">{student.id}</td>
                                    <td className="p-4 font-medium text-gray-900">{student.lastName}, {student.firstName}</td>
                                    <td className="p-4">{student.courseId} - Year {student.yearLevel}</td>
                                    <td className="p-4 capitalize">{student.enrollmentStatus}</td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => { setSelectedStudent(student); setGradeModalOpen(true); }}
                                            className="text-red-600 hover:text-red-800 font-medium text-sm border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition"
                                        >
                                            View & Grade
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {myStudents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">No students found in your department.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </Card>

            <Modal isOpen={isGradeModalOpen && !!selectedStudent} onClose={() => setGradeModalOpen(false)} title="Student Grades">
                {selectedStudent && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                             <h3 className="font-bold text-gray-900">{selectedStudent.lastName}, {selectedStudent.firstName}</h3>
                             <p className="text-sm text-gray-500">{selectedStudent.id}</p>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">Academic Record:</p>
                        
                        <div className="space-y-3">
                             {selectedStudent.academicRecords.map(subject => (
                                    <div key={subject.code} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{subject.code}</p>
                                            <p className="text-xs text-gray-500">{subject.name}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-400">{subject.units} Units</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 uppercase">Grade:</span>
                                                <input 
                                                    type="text" 
                                                    className="w-16 p-2 border border-gray-300 rounded text-center font-bold focus:ring-2 focus:ring-red-500 outline-none"
                                                    defaultValue={subject.grade}
                                                    onBlur={(e) => handleUpdateGrade(selectedStudent, subject.code, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                             ))}
                        </div>
                        
                        <div className="flex justify-end mt-4">
                            <button onClick={() => setGradeModalOpen(false)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};