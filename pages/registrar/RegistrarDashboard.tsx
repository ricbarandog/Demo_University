import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/Card';
import { BarChart, DonutChart } from '../../components/Charts';
import { Users, GraduationCap, Clock, AlertCircle } from 'lucide-react';

export const RegistrarDashboard = () => {
    const { students, courses } = useApp();

    // Chart Data
    const enrollmentByCourse = courses.map(c => ({
        label: c.id,
        value: students.filter(s => s.courseId === c.id).length,
        color: 'bg-red-500'
    })).sort((a,b) => b.value - a.value);

    const statusData = [
        { label: 'Enrolled', value: students.filter(s => s.enrollmentStatus === 'enrolled').length, color: '#10B981' },
        { label: 'Pending', value: students.filter(s => s.enrollmentStatus === 'pending').length, color: '#F59E0B' },
        { label: 'Dropped', value: students.filter(s => s.enrollmentStatus === 'dropped').length, color: '#EF4444' }
    ];

    const totalStudents = students.length;
    const pendingDocs = students.reduce((acc, s) => acc + s.documents.filter(d => d.status === 'pending').length, 0);

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                 <Card className="flex items-center gap-4 p-6 border-l-4 border-l-red-600">
                    <div className="p-3 bg-red-50 text-red-600 rounded-full"><Users size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 p-6 border-l-4 border-l-green-500">
                    <div className="p-3 bg-green-50 text-green-600 rounded-full"><GraduationCap size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Enrolled</p>
                        <p className="text-2xl font-bold text-gray-900">{statusData[0].value}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 p-6 border-l-4 border-l-yellow-500">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full"><Clock size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Approval</p>
                        <p className="text-2xl font-bold text-gray-900">{statusData[1].value}</p>
                    </div>
                </Card>
                 <Card className="flex items-center gap-4 p-6 border-l-4 border-l-blue-500">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><AlertCircle size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Doc Reviews</p>
                        <p className="text-2xl font-bold text-gray-900">{pendingDocs}</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 h-80">
                    <BarChart title="Enrollment by Program" data={enrollmentByCourse} />
                </div>
                <div className="md:col-span-1 h-80">
                    <DonutChart title="Student Status" data={statusData} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Quick Links">
                     <p className="text-sm text-gray-500 mb-4">Access common registrar functions.</p>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition">
                            <h4 className="font-semibold text-gray-800">Enrollment List</h4>
                            <p className="text-xs text-gray-500">View enrolled students</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition">
                            <h4 className="font-semibold text-gray-800">Review Documents</h4>
                            <p className="text-xs text-gray-500">Process pending files</p>
                        </div>
                     </div>
                </Card>
                 <Card title="System Notifications">
                     <div className="space-y-3">
                        <div className="flex items-start gap-3 text-sm">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                            <p className="text-gray-600">Enrollment period for 1st Semester 2024-2025 is active.</p>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-yellow-500"></div>
                            <p className="text-gray-600">35 Students have pending requirements.</p>
                        </div>
                     </div>
                </Card>
            </div>
        </div>
    );
};