import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/Card';
import { Search } from 'lucide-react';

export const TransactionLogs = () => {
    const { students } = useApp();
    const [filter, setFilter] = useState('');

    const allTransactions = students.flatMap(s => 
        s.transactions.map(t => ({
            ...t,
            studentName: `${s.lastName}, ${s.firstName}`,
            studentId: s.id,
            course: s.courseId
        }))
    ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredTx = allTransactions.filter(t => 
        t.studentName.toLowerCase().includes(filter.toLowerCase()) || 
        t.id.includes(filter) ||
        t.description.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <Card title="System-wide Transaction Logs">
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Filter by Student, Ref #, or Description..."
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Ref #</th>
                            <th className="p-3">Student</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Description</th>
                            <th className="p-3 text-right">Amount</th>
                            <th className="p-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTx.map(t => (
                            <tr key={`${t.studentId}-${t.id}`} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-gray-500 whitespace-nowrap">{t.date}</td>
                                <td className="p-3 font-mono text-xs">{t.id}</td>
                                <td className="p-3 font-medium">
                                    {t.studentName}
                                    <div className="text-xs text-gray-400">{t.studentId}</div>
                                </td>
                                <td className="p-3 capitalize">{t.type}</td>
                                <td className="p-3 text-gray-600">{t.description}</td>
                                <td className={`p-3 text-right font-mono ${t.type === 'payment' ? 'text-green-600' : 'text-gray-900'}`}>
                                    {t.type === 'payment' && '-'}{t.amount.toLocaleString()}
                                </td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                                        t.status === 'voided' ? 'bg-red-100 text-red-600' : 
                                        t.status === 'void_requested' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                        {t.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};