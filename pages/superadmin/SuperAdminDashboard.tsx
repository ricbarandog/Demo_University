import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/Card';
import { BarChart, DonutChart } from '../../components/Charts';
import { Users, DollarSign, School } from 'lucide-react';

export const SuperAdminDashboard = () => {
    const { students, staffUsers, courses } = useApp();

    const totalStudents = students.length;
    const totalStaff = staffUsers.length;
    const totalReceivables = students.reduce((acc, s) => acc + s.balance, 0);
    const totalCourses = courses.length;

    // Charts
    const enrollmentData = courses.map(c => ({
        label: c.id,
        value: students.filter(s => s.courseId === c.id).length,
        color: 'bg-indigo-500'
    }));

    const financialData = courses.map(c => ({
        label: c.id,
        value: students.filter(s => s.courseId === c.id).reduce((acc,s) => acc+s.balance,0),
        color: 'bg-emerald-500'
    }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="flex items-center gap-4 p-6 border-l-4 border-l-indigo-600">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><Users size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">System Users</p>
                        <p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 p-6 border-l-4 border-l-red-600">
                    <div className="p-3 bg-red-50 text-red-600 rounded-full"><Users size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 p-6 border-l-4 border-l-emerald-600">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full"><DollarSign size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Receivables</p>
                        <p className="text-2xl font-bold text-gray-900">₱{totalReceivables.toLocaleString()}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 p-6 border-l-4 border-l-orange-600">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-full"><School size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Active Courses</p>
                        <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80">
                    <BarChart title="Enrollment Distribution" data={enrollmentData} />
                </div>
                <div className="h-80">
                    <BarChart title="Financial Distribution (Receivables)" data={financialData} currency />
                </div>
            </div>
        </div>
    );
};