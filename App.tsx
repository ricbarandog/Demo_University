import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { FinanceDashboard } from './pages/finance/FinanceDashboard';
import { StudentAccounts } from './pages/finance/StudentAccounts';
import { RegistrarDashboard } from './pages/registrar/RegistrarDashboard';
import { StudentRecords } from './pages/registrar/StudentRecords';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';
import { UserManagement } from './pages/superadmin/UserManagement';
import { AcademicConfig } from './pages/superadmin/AcademicConfig';
import { SystemRequests } from './pages/superadmin/SystemRequests';
import { TransactionLogs } from './pages/superadmin/TransactionLogs';
import { Student } from './types';
import { Lock, Save } from 'lucide-react';

const ChangePasswordScreen = () => {
    const { user, changePassword, logout } = useApp();
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            setError("Passwords do not match");
            return;
        }
        if (newPass.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        await changePassword(user!.id, newPass);
        alert("Password updated successfully!");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
             <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl">
                 <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Update Password</h2>
                    <p className="text-gray-500 text-sm mt-2">For security, you must change your auto-generated password before continuing.</p>
                 </div>
                 
                 <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                         <input type="password" required className="w-full p-3 border rounded-lg" value={newPass} onChange={e=>setNewPass(e.target.value)} />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                         <input type="password" required className="w-full p-3 border rounded-lg" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} />
                     </div>
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                     <button type="submit" className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2">
                        <Save size={18} /> Update & Continue
                     </button>
                     <button type="button" onClick={logout} className="w-full text-gray-500 text-sm hover:underline mt-2">Sign out</button>
                 </form>
             </div>
        </div>
    )
}

const AppContent = () => {
  const { user } = useApp();
  const [activePage, setActivePage] = useState('dashboard');

  if (!user) {
    return <Login />;
  }
  
  // Enforce password change for students
  if (user.role === 'student' && 'isPasswordChanged' in user && user.isPasswordChanged === false) {
      return <ChangePasswordScreen />;
  }

  const renderContent = () => {
    if (user.role === 'finance') {
        if (activePage === 'accounts') return <StudentAccounts />;
        return <FinanceDashboard />;
    }
    if (user.role === 'registrar') {
        if (activePage === 'records') return <StudentRecords />;
        return <RegistrarDashboard />;
    }
    if (user.role === 'student') {
        return <StudentDashboard />;
    }
    if (user.role === 'teacher') {
        return <TeacherDashboard />;
    }
    if (user.role === 'super_admin') {
        switch (activePage) {
            case 'users': return <UserManagement />;
            case 'academic': return <AcademicConfig />;
            case 'requests': return <SystemRequests />;
            case 'transactions': return <TransactionLogs />;
            default: return <SuperAdminDashboard />;
        }
    }
    return <div>Access Denied</div>;
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderContent()}
    </Layout>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;