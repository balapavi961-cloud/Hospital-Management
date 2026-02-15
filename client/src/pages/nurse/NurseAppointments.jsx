import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, Search, Filter, MoreVertical, MapPin, Loader2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { nurseService } from '../../services/nurseService';

const NurseAppointments = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('upcoming');
    const [searchTerm, setSearchTerm] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await nurseService.getAppointments();
                // Map backend data to frontend structure
                const formattedData = data.map(apt => ({
                    id: apt.id,
                    patientId: apt.patient_id, // Ensure this is captured for Vitals logging
                    patientName: apt.patient_name,
                    age: apt.age || 'N/A',
                    gender: apt.gender || 'N/A',
                    time: apt.time,
                    date: apt.date, // Assuming string format like "Today, Oct 24" from seed/form
                    type: apt.type,
                    doctor: apt.doctor,
                    status: apt.status,
                    priority: apt.priority,
                    symptoms: apt.symptoms,
                    hasVitals: apt.has_vitals // Boolean flag from backend
                }));
                setAppointments(formattedData);
            } catch (err) {
                console.error("Failed to load appointments:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await nurseService.updateAppointmentStatus(id, newStatus);
            // Optimistic update
            setAppointments(prev => prev.map(apt =>
                apt.id === id ? { ...apt, status: newStatus } : apt
            ));
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update appointment status");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'in-progress': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'waiting': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
                    <p className="text-slate-500 mt-1">Manage today's scheduled patient visits</p>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Search patient..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full md:w-64 text-sm text-slate-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 md:flex-none p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 flex justify-center">
                            <Filter size={18} />
                        </button>
                        <button className="flex-1 md:flex-none px-4 py-2.5 bg-brand-gradient text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-lg shadow-accent/20 flex items-center justify-center gap-2">
                            <Calendar size={18} />
                            <span>Today</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Appointments', value: appointments.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-emerald-50' },
                    { label: 'Waiting', value: appointments.filter(a => a.status === 'waiting').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'In Progress', value: appointments.filter(a => a.status === 'in-progress').length, icon: CheckCircle, color: 'text-accent', bg: 'bg-emerald-50' },
                    { label: 'Upcoming', value: appointments.filter(a => a.status === 'upcoming').length, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50' },
                    { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-lg">Schedule List</h3>
                    <div className="flex gap-2 text-sm bg-slate-50 p-1 rounded-lg">
                        {['All', 'Upcoming', 'Completed'].map(tab => (
                            <button
                                key={tab}
                                className={`px-4 py-1.5 rounded-md font-medium transition-all ${filter === tab.toLowerCase() ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => setFilter(tab.toLowerCase())}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {appointments.filter(apt => {
                        const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase());
                        if (!matchesSearch) return false;

                        if (filter === 'all') return apt.status !== 'cancelled';
                        if (filter === 'upcoming') return ['upcoming', 'scheduled', 'waiting', 'in-progress'].includes(apt.status);
                        if (filter === 'completed') return apt.status === 'completed';
                        return apt.status !== 'cancelled';
                    }).map(apt => (
                        <div key={apt.id} className="p-6 hover:bg-slate-50 transition-colors group">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                {/* Time Column */}
                                <div className="flex md:flex-col items-center gap-3 md:gap-1 min-w-[100px]">
                                    <span className="text-lg font-bold text-slate-800">{apt.time}</span>
                                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{apt.date}</span>
                                </div>

                                {/* Patient Info */}
                                <div className="flex-1 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg">
                                        {apt.patientName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-slate-800">{apt.patientName}</h4>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusStyle(apt.status)}`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <User size={14} /> {apt.age} yrs, {apt.gender}
                                            </span>

                                        </div>
                                        <p className="text-sm text-slate-600 mt-2 bg-slate-50 inline-block px-3 py-1 rounded-lg">
                                            <span className="font-medium">Symptom via {apt.type}:</span> {apt.symptoms}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0">
                                    {/* Action Buttons */}
                                    {apt.status !== 'in-progress' && apt.status !== 'completed' && (
                                        <button
                                            onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                                            className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                                            title="Cancel Appointment"
                                        >
                                            <XCircle size={16} />
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleStatusUpdate(apt.id, 'in-progress')}
                                        disabled={!apt.hasVitals}
                                        className={`px-4 py-2 text-sm font-semibold border rounded-lg transition-colors flex items-center gap-2 ${apt.hasVitals
                                            ? 'text-accent bg-emerald-50 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                                            : 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
                                            }`}
                                        title={apt.hasVitals ? "Accept Patient" : "Please log vitals first"}
                                    >
                                        <CheckCircle size={16} />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => navigate('/dashboard/nurse/vitals', {
                                            state: {
                                                patientId: apt.patientId,
                                                patientName: apt.patientName,
                                                age: apt.age,
                                                gender: apt.gender,
                                                status: apt.status
                                            }
                                        })}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2 ${apt.hasVitals
                                            ? 'text-white bg-accent hover:opacity-90 shadow-blue-200'
                                            : 'text-white bg-brand-gradient hover:opacity-90 shadow-blue-200'
                                            }`}
                                    >
                                        {apt.hasVitals ? (
                                            <>
                                                <CheckCircle size={16} />
                                                Vitals Recorded
                                            </>
                                        ) : (
                                            <>
                                                Log Vitals
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NurseAppointments;


