import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Modal } from '../../components/Card';
import { User } from '../../types';
import { Plus, Edit, Lock } from 'lucide-react';

export const UserManagement = () => {
    const { staffUsers, addUser, updateUser, config } = useApp();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({
        username: '', name: '', role: 'registrar', email: '', department: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode && formData.id) {
            await updateUser(formData.id, formData);
        } else {
            await addUser({
                id: `u${Date.now()}`,
                username: formData.username!,
                name: formData.name!,
                role: formData.role!,
                email: formData.email,
                department: formData.role === 'teacher' ? formData.department : undefined
            });
        }
        setModalOpen(false);
    };

    const openEdit = (user: User) => {
        setFormData(user);
        setEditMode(true);
        setModalOpen(true);
    };

    const openAdd = () => {
        setFormData({ username: '', name: '', role: 'registrar', email: '', department: '' });
        setEditMode(false);
        setModalOpen(true);
    };

    // Sort departments for display
    const sortedDepartments = [...config.departments].sort();

    return (
        <div className="space-y-6">
            <Card title="Staff & Teacher Directory" action={
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
                    <Plus size={16} /> Add User
                </button>
            }>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Username</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffUsers.map(u => (
                                <tr key={u.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{u.name}</td>
                                    <td className="p-4 font-mono text-gray-600">{u.username}</td>
                                    <td className="p-4 capitalize">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                                            u.role === 'finance' ? 'bg-green-100 text-green-700' :
                                            u.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                        }`}>{u.role.replace('_', ' ')}</span>
                                    </td>
                                    <td className="p-4 text-gray-500">{u.email || '-'}</td>
                                    <td className="p-4 text-gray-500">{u.department || '-'}</td>
                                    <td className="p-4">
                                        <button onClick={() => openEdit(u)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                            <Edit size={14} /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editMode ? "Edit User" : "Add New User"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input className="w-full p-2 border rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Username</label>
                            <input className="w-full p-2 border rounded" value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select className="w-full p-2 border rounded bg-white" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value as any})}>
                                <option value="registrar">Registrar</option>
                                <option value="finance">Finance</option>
                                <option value="teacher">Teacher</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input className="w-full p-2 border rounded" type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
                    </div>
                    {formData.role === 'teacher' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Department / Level</label>
                            <select className="w-full p-2 border rounded bg-white" value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})}>
                                <option value="">-- Select --</option>
                                {sortedDepartments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Save User</button>
                </form>
            </Modal>
        </div>
    );
};