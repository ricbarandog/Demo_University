import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/Card';
import { Book, Clock, DollarSign, FileCheck } from 'lucide-react';

export const StudentDashboard = () => {
    const { user, students, courses } = useApp();
    
    // Find the full student object based on the logged-in user
    const studentData = students.find(s => s.id === user?.id);
    const course = courses.find(c => c.id === studentData?.courseId);

    if (!studentData) return <div className="p-8 text-center text-gray-500">Loading student data...</div>;

    const enrolledSubjects = studentData.academicRecords.filter(r => r.status === 'enrolled');

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-8 text-white shadow-xl">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {studentData.firstName}!</h1>
                <p className="text-red-100">{course?.name || studentData.courseId} • {studentData.type.toUpperCase()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="flex items-center gap-4 p-6">
                    <div className="p-3 bg-red-100 text-red-600 rounded-full"><DollarSign /></div>
                    <div>
                        <p className="text-sm text-gray-500">Outstanding Balance</p>
                        <p className="text-xl font-bold text-gray-900">₱{studentData.balance.toLocaleString()}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 p-6">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Book /></div>
                    <div>
                        <p className="text-sm text-gray-500">Enrolled Subjects</p>
                        <p className="text-xl font-bold text-gray-900">{enrolledSubjects.length}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 p-6">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full"><FileCheck /></div>
                    <div>
                        <p className="text-sm text-gray-500">Enrollment Status</p>
                        <p className="text-lg font-bold text-gray-900 capitalize">{studentData.enrollmentStatus}</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="My Subjects & Grades">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="py-3 px-4">Subject</th>
                                        <th className="py-3 px-4">Instructor</th>
                                        <th className="py-3 px-4">Units</th>
                                        <th className="py-3 px-4">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentData.academicRecords.length > 0 ? studentData.academicRecords.map((g, idx) => (
                                        <tr key={idx} className="border-b border-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-900">{g.code}</div>
                                                <div className="text-xs text-gray-500">{g.name}</div>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-500">{g.instructor || 'TBA'}</td>
                                            <td className="py-3 px-4 text-gray-600">{g.units || '-'}</td>
                                            <td className={`py-3 px-4 font-bold ${g.grade ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                                {g.grade || 'In Progress'}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-400">No records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div>
                     <Card title="Recent Activity">
                        <div className="space-y-4 mt-2">
                            {studentData.transactions.slice(0, 5).map(t => (
                                <div key={t.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                                    <div className="mt-1"><Clock size={16} className="text-gray-400" /></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{t.description}</p>
                                        <p className="text-xs text-gray-500">{t.date}</p>
                                        <p className={`text-xs font-semibold ${t.type === 'payment' ? 'text-green-600' : 'text-red-500'}`}>
                                            {t.type === 'payment' ? '-' : '+'}₱{Math.abs(t.amount)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {studentData.transactions.length === 0 && <p className="text-sm text-gray-400">No recent activity.</p>}
                        </div>
                     </Card>
                </div>
            </div>
        </div>
    );
};