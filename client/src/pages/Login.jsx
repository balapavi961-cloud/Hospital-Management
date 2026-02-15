import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, HeartPulse, Activity, Stethoscope, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { roleConfig } from '../config/roles';
import FloatingInput from '../components/ui/FloatingInput';

const Login = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const currentRole = role || 'patient';
    const config = roleConfig[currentRole];

    // Form State
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.identifier) newErrors.identifier = 'ID is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);

        try {
            // Call backend API for authentication
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: formData.identifier,
                    password: formData.password,
                    role: currentRole
                })
            });

            if (!response.ok) {
                const error = await response.json();
                setErrors({ form: error.message || 'Invalid credentials' });
                setIsLoading(false);
                return;
            }

            // Get actual user data from API
            const userData = await response.json();

            // Save user info with actual data from database
            if (rememberMe) {
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('role', userData.role);
            } else {
                sessionStorage.setItem('user', JSON.stringify(userData));
                sessionStorage.setItem('role', userData.role);
            }

            // Small delay to show loading state
            setTimeout(() => {
                navigate(config.route || `/dashboard/${userData.role}`);
            }, 500);

        } catch (error) {
            console.error('Login error:', error);
            setErrors({ form: 'Network error. Please try again.' });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50">
            {/* LEFT SIDE: Portal Selection */}
            <div className="hidden md:flex w-1/3 min-w-[320px] bg-gradient-to-br from-slate-800 to-slate-900 text-white flex-col relative overflow-hidden p-8">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent)]" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]" />

                {/* Branding */}
                <div className="relative z-10 mb-12 flex items-center gap-3">
                    <div className="p-2 bg-accent rounded-lg">
                        <Building2 size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">MediCare<span className="text-emerald-400">Plus</span></h1>
                        <p className="text-xs text-slate-400">Hospital Management System</p>
                    </div>
                </div>

                {/* Portal List */}
                <div className="relative z-10 flex-1 space-y-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">Select Portal</p>

                    {Object.entries(roleConfig).map(([key, value]) => {
                        const ItemIcon = value.icon;
                        const isActive = key === currentRole;
                        return (
                            <button
                                key={key}
                                onClick={() => navigate(`/login/${key}`)}
                                className={`
                                    w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-300 border
                                    ${isActive
                                        ? 'bg-white/20 border-white/20 shadow-lg shadow-black/10 translate-x-2'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                                `}
                            >
                                <div className={`p-2 rounded-lg ${isActive ? 'bg-accent' : 'bg-slate-700'}`}>
                                    <ItemIcon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                                </div>
                                <div className="text-left">
                                    <h3 className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                        {value.title.split(' ')[0]}
                                    </h3>
                                    <p className={`text-xs ${isActive ? 'text-emerald-200' : 'text-slate-500'}`}>
                                        {value.description.slice(0, 30)}...
                                    </p>
                                </div>
                                {isActive && <ArrowRight size={16} className="ml-auto text-emerald-400" />}
                            </button>
                        );
                    })}
                </div>

                {/* Footer Info */}
                <div className="relative z-10 mt-auto pt-8 border-t border-white/10">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Activity size={16} className="text-accent" />
                        <span>System Operational</span>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Login Form */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative bg-white md:bg-slate-50">
                {/* Mobile Header */}
                <div className="absolute top-6 left-6 md:hidden flex items-center gap-2 text-slate-800">
                    <Building2 size={24} className="text-accent" />
                    <span className="font-bold">MediCare+</span>
                </div>

                <motion.div
                    key={currentRole}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md bg-white md:shadow-xl md:rounded-2xl p-8 md:p-12 border-slate-100 mt-16 md:mt-0"
                >
                    {/* Mobile Portal Selector */}
                    <div className="md:hidden mb-8 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide flex gap-3">
                        {Object.entries(roleConfig).map(([key, value]) => {
                            const isActive = key === currentRole;
                            return (
                                <button
                                    key={key}
                                    onClick={() => navigate(`/login/${key}`)}
                                    className={`
                                        flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                                        ${isActive
                                            ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                                    `}
                                >
                                    {value.title.split(' ')[0]}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mb-10">
                        <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${config.color} mb-6 shadow-lg transform -translate-y-2`}>
                            <config.icon size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">{config.title}</h2>
                        <p className="text-slate-500">{config.description}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FloatingInput
                            id="identifier"
                            label="Email or ID"
                            icon={User}
                            value={formData.identifier}
                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                            error={errors.identifier}
                            className="text-slate-800 bg-slate-50 border-slate-200 focus:border-accent"
                        />

                        <FloatingInput
                            id="password"
                            type="password"
                            label="Password"
                            icon={Lock}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            error={errors.password}
                            className="text-slate-800 bg-slate-50 border-slate-200 focus:border-accent"
                        />

                        {errors.form && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
                                {errors.form}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="rounded border-slate-300 text-accent focus:ring-accent"
                                />
                                <span>Remember me</span>
                            </label>
                            <button type="button" className="text-sm font-semibold text-accent hover:text-emerald-400">
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-brand-gradient hover:opacity-90 text-white rounded-lg font-semibold shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Signing In...' : 'Access Portal'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    {currentRole === 'patient' && (
                        <p className="mt-8 text-center text-sm text-slate-500">
                            Don't have an account?{' '}
                            <button onClick={() => navigate('/register')} className="text-accent font-semibold hover:underline">Register Now</button>
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Login;


