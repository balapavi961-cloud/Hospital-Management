import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Package, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { getLaboratoryStats, getPrescriptions } from '../../services/laboratoryService';

const LaboratoryDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        completed_today: 0
    });
    const [recentPrescriptions, setRecentPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsData, prescriptionsData] = await Promise.all([
                getLaboratoryStats(),
                getPrescriptions('pending')
            ]);
            setStats(statsData);
            setRecentPrescriptions(prescriptionsData.slice(0, 5));
        } catch (error) {
            console.error('Error fetching laboratory data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, bg }) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500 font-medium">{title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
                </div>
                <div className={`p-4 rounded-xl ${bg}`}>
                    <Icon size={28} className={color} />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Laboratory Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage prescriptions and test reports</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/laboratory/prescriptions')}
                    className="px-6 py-3 bg-brand-gradient text-white rounded-xl font-semibold hover:opacity-90 shadow-lg transition-all flex items-center gap-2"
                >
                    <FlaskConical size={20} />
                    View Prescriptions
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Prescriptions"
                    value={stats.total}
                    icon={Package}
                    color="text-accent"
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={Clock}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
                <StatCard
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <StatCard
                    title="Completed Today"
                    value={stats.completed_today}
                    icon={TrendingUp}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
            </div>

            {/* Recent Pending Prescriptions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Recent Pending Prescriptions</h2>
                    <p className="text-sm text-slate-500 mt-1">Latest laboratory prescriptions awaiting processing</p>
                </div>

                {recentPrescriptions.length === 0 ? (
                    <div className="p-12 text-center">
                        <FlaskConical size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">No pending prescriptions</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {recentPrescriptions.map((prescription) => (
                            <div key={prescription.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800">{prescription.patient_name}</h3>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                                            <span>Age: {prescription.age}</span>
                                            <span>•</span>
                                            <span>Gender: {prescription.gender}</span>
                                            <span>•</span>
                                            <span>Doctor: {prescription.doctor}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">
                                            Created: {new Date(prescription.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/dashboard/laboratory/prescriptions')}
                                        className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LaboratoryDashboard;
