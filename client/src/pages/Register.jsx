import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, ArrowRight, Building2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingInput from '../components/ui/FloatingInput';

const Register = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName) newErrors.fullName = 'Full Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone Number is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        // Navigate to login after success (or dashboard)
        navigate('/login/patient');
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 overflow-hidden">

            {/* LEFT SIDE: Branding & Info */}
            <div className="hidden md:flex w-1/3 min-w-[320px] bg-gradient-to-br from-slate-800 to-slate-900 text-white flex-col relative overflow-hidden p-8 justify-between">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent)]" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]" />

                {/* Branding */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-accent rounded-lg">
                            <Building2 size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">MediCare<span className="text-emerald-400">Plus</span></h1>
                            <p className="text-xs text-slate-300">New Account Creation</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold leading-tight">Join Our Healthcare Network</h2>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Create your account to access personalized healthcare services, book appointments, and manage your medical records securely.
                        </p>
                    </div>
                </div>

                {/* Feature List */}
                <div className="relative z-10 space-y-4">
                    {[
                        "24/7 Appointment Booking",
                        "Access Medical Records",
                        "Secure Health Data",
                        "Direct Doctor Communication"
                    ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="p-1 bg-accent/20 rounded-full text-emerald-300">
                                <CheckCircle size={16} />
                            </div>
                            <span className="text-sm font-medium text-slate-100">{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="relative z-10 pt-8 border-t border-white/10">
                    <p className="text-xs text-slate-400">
                        By signing up, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE: Register Form */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative bg-white md:bg-slate-50 overflow-y-auto">
                {/* Mobile Header */}
                <div className="absolute top-6 left-6 md:hidden flex items-center gap-2 text-slate-800">
                    <Building2 size={24} className="text-blue-600" />
                    <span className="font-bold">MediCare+</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white md:shadow-xl md:rounded-2xl p-8 md:p-12 border-slate-100"
                >
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-2 bg-brand-gradient rounded-lg shadow-lg shadow-blue-900/20">
                            <Activity className="text-white h-6 w-6" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            MedCare<span className="text-accent">+</span>
                        </h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Patient Account</h2>
                        <p className="text-slate-500">Join our advanced healthcare management portal.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput
                                id="firstName" label="First Name" value={formData.firstName}
                                onChange={handleChange} required icon={User}
                                className="bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-800"
                                error={errors.firstName}
                            />
                            <FloatingInput
                                id="lastName" label="Last Name" value={formData.lastName}
                                onChange={handleChange} required icon={User}
                                className="bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-800"
                                error={errors.lastName}
                            />
                        </div>

                        <FloatingInput
                            id="email" type="email" label="Email Address" value={formData.email}
                            onChange={handleChange} required icon={Mail}
                            className="bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-800"
                            error={errors.email}
                        />

                        <FloatingInput
                            id="mobile" type="tel" label="Mobile Number" value={formData.mobile}
                            onChange={handleChange} required icon={Phone}
                            className="bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-800"
                            error={errors.mobile}
                        />

                        <FloatingInput
                            id="password" type="password" label="Password" value={formData.password}
                            onChange={handleChange} required icon={Lock}
                            className="bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-800"
                            error={errors.password}
                        />

                        {/* Terms - Simplified */}
                        <div className="flex items-start gap-3 pt-2">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-[#14532d] transition-all"
                                />
                            </div>
                            <div className="text-sm text-slate-500">
                                I agree to the <a href="#" className="font-medium text-accent hover:underline">Terms of Service</a> and <a href="#" className="font-medium text-accent hover:underline">Privacy Policy</a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-br bg-brand-gradient hover:opacity-90 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span className="relative z-10">Create Account</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-accent font-bold hover:underline transition-all"
                        >
                            Sign In
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;


