import React from 'react';
import { Users, UserPlus, CreditCard, Activity, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';

const StatCard = ({ title, value, change, trend, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
                <Icon size={24} />
            </div>
            {change && (
                <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-blue-600' : 'text-red-600'}`}>
                    {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {change}
                </div>
            )}
        </div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
);

const AdminOverview = () => {
    // Mock Data
    const stats = [
        { title: 'Total Patients', value: '0', change: '0%', trend: 'neutral', icon: Users, color: 'blue' },
        { title: 'Total Staff', value: '0', change: '0', trend: 'neutral', icon: UserPlus, color: 'blue' },
        { title: 'Monthly Revenue', value: '$0', change: '0%', trend: 'neutral', icon: CreditCard, color: 'violet' },
        { title: 'Avg. Wait Time', value: '0 min', change: '0 min', trend: 'neutral', icon: Activity, color: 'amber' },
    ];

    const recentActivity = [];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Institution Overview</h1>
                    <p className="text-slate-500">Welcome back, Administrator</p>
                </div>
                {/* Updated Button to be Black */}
                <button className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-slate-900/20">
                    <FileText size={20} />
                    Generate Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Revenue Analytics</h2>
                        <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 outline-none">
                            <option>This Month</option>
                            <option>Last 3 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <div className="text-center text-slate-400">
                            <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                            <p>Revenue Chart Visualization</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
                        <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
                    </div>
                    <div className="space-y-6">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex gap-4">
                                <div className={`w-2 h-2 mt-2 rounded-full ${activity.type === 'medical' ? 'bg-indigo-500' :
                                    activity.type === 'admin' ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`} />
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{activity.user}</p>
                                    <p className="text-sm text-slate-500">{activity.action}</p>
                                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;


