import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/Card';
import { PasswordRequest } from '../../types';
import { Key } from 'lucide-react';

export const SystemRequests = () => {
    const { students, getPasswordRequests, resolvePasswordRequest, approveVoidTransaction } = useApp();
    const [passwordRequests, setPasswordRequests] = useState<PasswordRequest[]>([]);
    
    // Get void requests from all students
    const voidRequests = students.flatMap(s => 
        s.transactions
            .filter(t => t.status === 'void_requested')
            .map(t => ({ student: s, transaction: t }))
    );

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const reqs = await getPasswordRequests();
        setPasswordRequests(reqs);
    };

    const handleResolvePassword = async (req: PasswordRequest) => {
        const newPass = Math.random().toString(36).slice(-8).toUpperCase();
        if(window.confirm(`Reset password for ${req.email} to ${newPass}?`)) {
             await resolvePasswordRequest(req.id, newPass);
             alert(`Password reset successfully. New Password: ${newPass}`);
             loadData();
        }
    };

    const handleApproveVoid = async (studentId: string, txId: string) => {
        if(window.confirm("Approve voiding this transaction? This cannot be undone.")) {
            await approveVoidTransaction(studentId, txId);
        }
    };

    return (
        <div className="space-y-6">
            <Card title="Password Reset Requests" className="border-l-4 border-l-yellow-500">
                {passwordRequests.length === 0 ? (
                    <div className="text-gray-500 text-sm italic py-4 text-center">No pending password reset requests.</div>
                ) : (
                    <div className="space-y-3">
                        {passwordRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                                        <Key size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{req.email}</p>
                                        <p className="text-xs text-gray-500 capitalize">{req.userType} • Requested: {new Date(req.requestDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleResolvePassword(req)}
                                    className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                                >
                                    Reset & Resolve
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Card title="Transaction Void Requests" className="border-l-4 border-l-red-500">
                 {voidRequests.length === 0 ? (
                    <div className="text-gray-500 text-sm italic py-4 text-center">No transactions pending void approval.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3">Ref #</th>
                                    <th className="p-3">Student</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3 text-right">Amount</th>
                                    <th className="p-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {voidRequests.map(({ student, transaction }) => (
                                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-mono text-gray-500 text-xs">{transaction.id}</td>
                                        <td className="p-3 font-medium">
                                            {student.lastName}, {student.firstName}
                                            <div className="text-xs text-gray-400">{student.id}</div>
                                        </td>
                                        <td className="p-3 text-gray-600">{transaction.description}</td>
                                        <td className="p-3 font-mono text-right">₱{transaction.amount.toLocaleString()}</td>
                                        <td className="p-3 text-center">
                                            <button 
                                                onClick={() => handleApproveVoid(student.id, transaction.id)}
                                                className="text-red-600 hover:text-red-800 font-medium text-xs border border-red-200 px-3 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                                            >
                                                Approve Void
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};