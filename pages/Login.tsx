
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GraduationCap, Lock, User, ArrowRight, ShieldCheck, HelpCircle, Info } from 'lucide-react';
import { Modal } from '../components/Card';

export const Login = () => {
  const { login, isLoading } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'staff' | 'student'>('staff');
  const [error, setError] = useState('');
  
  const [isForgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (!success) {
      setError('Invalid credentials. Please verify your identity and try again.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`Password reset instructions have been sent to ${forgotEmail}`);
      setForgotOpen(false);
      setForgotEmail('');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative elements for a premium academic look */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[400px] h-[400px] bg-red-900/10 rounded-full blur-[100px]" />

        <div className="w-full max-w-[440px] relative">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/40 mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <GraduationCap size={36} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white text-center tracking-tight">
                    Colegio De Santa Catalina De Alejandria
                </h1>
                <div className="h-px w-12 bg-red-600/50 my-3"></div>
                <p className="text-neutral-400 text-sm font-medium tracking-widest uppercase">
                    Secure Enrollment Gateway
                </p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-white/10">
                <div className="p-8">
                    {/* Role Switcher */}
                    <div className="flex gap-2 p-1.5 bg-neutral-100 rounded-2xl mb-8">
                        <button 
                            onClick={() => { setRole('staff'); setUsername(''); setPassword(''); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${role === 'staff' ? 'bg-white shadow-md text-red-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            Staff Portal
                        </button>
                        <button 
                             onClick={() => { setRole('student'); setUsername(''); setPassword(''); setError(''); }}
                             className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${role === 'student' ? 'bg-white shadow-md text-red-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            Student Portal
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">
                                {role === 'staff' ? 'Employee Username' : 'First Name Login'}
                            </label>
                            <div className="group relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User size={18} className="text-neutral-400 group-focus-within:text-red-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-11 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-600 focus:bg-white outline-none transition-all text-neutral-900 placeholder:text-neutral-300"
                                    placeholder={role === 'staff' ? "e.g., registrar" : "e.g., Alice"}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Account Password</label>
                            <div className="group relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-neutral-400 group-focus-within:text-red-600 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    className="w-full pl-11 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-600 focus:bg-white outline-none transition-all text-neutral-900 placeholder:text-neutral-300"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-medium">
                                    <Info size={12} />
                                    {role === 'student' ? 'Check your initial finance slip' : 'Case sensitive entry'}
                                </div>
                                {role === 'student' && (
                                    <button type="button" onClick={() => setForgotOpen(true)} className="text-xs text-red-600 font-bold hover:text-red-700 transition-colors">
                                        Need help?
                                    </button>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <ShieldCheck size={18} className="mt-0.5 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-300 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-600/25 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Validating...
                                </div>
                            ) : (
                                <>
                                    Enter {role === 'staff' ? 'Portal' : 'Dashboard'}
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                <div className="bg-neutral-50 border-t border-neutral-100 py-4 px-8">
                    <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        <span>EST. 2024</span>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span>System Secure</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-center text-neutral-500 text-xs font-medium">
                Authorized Use Only. Compliance with COSCA Data Privacy Policy is mandatory.
            </p>
        </div>

        {/* Password Reset Modal */}
        <Modal isOpen={isForgotOpen} onClose={() => setForgotOpen(false)} title="Security Assistance">
             <form onSubmit={handleForgotSubmit} className="space-y-6">
                 <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm flex gap-3">
                    <HelpCircle className="flex-shrink-0" size={20} />
                    <p>Enter the email associated with your student record. We'll send a temporary access key to your inbox.</p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase ml-1">Institutional Email</label>
                    <input 
                        type="email" 
                        required 
                        placeholder="yourname@cosca.edu"
                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-600 outline-none"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                    />
                 </div>
                 <button type="submit" className="w-full py-4 bg-neutral-900 text-white rounded-xl font-bold hover:bg-black transition-all">
                    Send Reset Link
                 </button>
             </form>
        </Modal>
    </div>
  );
};
