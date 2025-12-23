import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/Card';
import { DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, DonutChart } from '../../components/Charts';

export const FinanceDashboard = () => {
    const { students, courses } = useApp();

    // Chart Data Preparation
    const totalReceivables = students.reduce((acc, s) => acc + s.balance, 0);
    const paidCount = students.filter(s => s.balance <= 0).length;
    const unpaidCount = students.length - paidCount;
    
    const receivablesByCourse = courses.map(c => ({
        label: c.id,
        value: students.filter(s => s.courseId === c.id).reduce((acc, s) => acc + s.balance, 0),
        color: 'bg-red-500'
    })).sort((a,b) => b.value - a.value);

    return (
        <div className="space-y-6">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="md:col-span-2">
                     <div className="grid grid-cols-2 gap-4 h-full">
                        <Card className="border-l-4 border-l-red-500 flex flex-col justify-center">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Receivables</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                        ₱{totalReceivables.toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-2 bg-red-50 rounded-lg text-red-600"><DollarSign size={20} /></div>
                            </div>
                        </Card>
                         <Card className="border-l-4 border-l-green-500 flex flex-col justify-center">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Collected (Est)</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                        ₱452,000
                                    </h3>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg text-green-600"><TrendingUp size={20} /></div>
                            </div>
                        </Card>
                     </div>
                </div>
                <div className="md:col-span-1 h-64">
                    <DonutChart 
                        title="Payment Status" 
                        data={[
                            { label: 'Fully Paid', value: paidCount, color: '#10B981' }, 
                            { label: 'With Balance', value: unpaidCount, color: '#EF4444' }
                        ]} 
                    />
                </div>
                <div className="md:col-span-1 h-64">
                    <BarChart 
                        title="Balance by Course" 
                        data={receivablesByCourse} 
                        currency
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Quick Actions">
                    <div className="text-gray-500 text-sm">
                        Use the sidebar to navigate to <b>Student Accounts</b> to manage billing records, add new students, or process transactions.
                    </div>
                </Card>
                <Card title="System Status">
                     <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Finance Services Operational
                     </div>
                </Card>
            </div>
        </div>
    );
};