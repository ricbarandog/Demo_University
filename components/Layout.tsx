import React from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, LayoutDashboard, Users, CreditCard, FileText, Menu, X, GraduationCap, BookOpen, Settings, ShieldAlert, School, List } from 'lucide-react';
import { User, Student } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { user, logout, config } = useApp();
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);

  const getMenuItems = () => {
    switch (user?.role) {
      case 'finance':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'accounts', label: 'Student Accounts', icon: Users },
        ];
      case 'registrar':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'records', label: 'Student Accounts', icon: Users },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'My Classes', icon: BookOpen },
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
          { id: 'grades', label: 'My Grades', icon: GraduationCap },
          { id: 'billing', label: 'My Balance', icon: CreditCard },
        ];
      case 'super_admin':
        return [
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'academic', label: 'Academic Config', icon: School },
            { id: 'transactions', label: 'Transaction Logs', icon: List },
            { id: 'requests', label: 'System Requests', icon: ShieldAlert },
        ];
      default:
        return [];
    }
  };

  const displayName = React.useMemo(() => {
    if (!user) return '';
    if ('firstName' in user) {
        return `${(user as Student).firstName} ${(user as Student).lastName}`;
    }
    return (user as User).name;
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-neutral-900 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col shadow-2xl
      `}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="text-white w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight"><span className="text-red-500">COSCA</span>System</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                <X size={20} />
            </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {user?.role.replace('_', ' ')} Portal
            </div>
            {getMenuItems().map((item) => (
                <button
                    key={item.id}
                    onClick={() => {
                        onNavigate(item.id);
                        setSidebarOpen(false);
                    }}
                    className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${activePage === item.id 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                    `}
                >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                    {displayName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate capitalize">{user?.role.replace('_', ' ')}</p>
                </div>
            </div>
            <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-lg transition-colors text-sm font-medium"
            >
                <LogOut size={18} />
                Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-8 shadow-sm z-10">
            <button 
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 capitalize ml-2 md:ml-0">
                {activePage === 'records' || activePage === 'accounts' ? 'Student Accounts' : activePage.replace('-', ' ')}
            </h2>
            <div className="text-sm text-gray-500 hidden md:block">
                AY {config.academicYear} • {config.semester}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-6">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};