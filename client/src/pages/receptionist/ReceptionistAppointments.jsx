import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, Search, Filter, MoreVertical, MapPin, Edit, XCircle, ChevronDown, Save, Loader2 } from 'lucide-react';
import { receptionistService } from '../../services/receptionistService';
import { useNavigate } from 'react-router-dom';

const ReceptionistAppointments = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('upcoming');
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);

    const [stats, setStats] = useState({
        total: 0,
        checkedIn: 0,
        waiting: 0,
        cancelled: 0,
        activeDoctors: 0
    });

    const fetchAppointments = async () => {
        try {
            const data = await receptionistService.getAppointments();
            const formattedData = data.map(apt => ({
                id: apt.id,
                patientName: apt.patient_name,
                age: apt.age,
                gender: apt.gender,
                time: apt.time,
                date: apt.date,
                type: apt.type,
                doctor: apt.doctor,
                status: apt.status || 'upcoming',
                contact: apt.contact_number
            }));
            setAppointments(formattedData);

            // Calculate stats
            const uniqueDoctors = new Set(formattedData.map(a => a.doctor));
            setStats({
                total: formattedData.length,
                checkedIn: formattedData.filter(a => a.status === 'waiting' || a.status === 'in-progress').length,
                waiting: formattedData.filter(a => ['upcoming', 'scheduled'].includes(a.status)).length,
                cancelled: formattedData.filter(a => a.status === 'cancelled').length,
                activeDoctors: uniqueDoctors.size
            });

        } catch (error) {
            console.error("Failed to fetch appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [editForm, setEditForm] = useState({
        time: '',
        date: '',
        patientName: ''
    });

    const [pendingUpdates, setPendingUpdates] = useState({});

    const handleEditClick = (apt) => {
        setSelectedAppointment(apt);
        setEditForm({
            time: apt.time,
            date: apt.date,
            patientName: apt.patientName
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            await receptionistService.updateAppointment(selectedAppointment.id, editForm);
            // Refresh data to ensure consistency including stats
            fetchAppointments();
            setIsEditModalOpen(false);
            setSelectedAppointment(null);
        } catch (error) {
            console.error("Failed to update appointment:", error);
            alert("Failed to update appointment details");
        }
    };

    // Track dropdown changes locally
    const handleDropdownChange = (id, value) => {
        setPendingUpdates(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // Commit changes on Save button click
    const handleSave = async (id) => {
        if (pendingUpdates[id]) {
            const newStatus = pendingUpdates[id];
            try {
                await receptionistService.updateAppointmentStatus(id, newStatus);
                // Refresh to update stats and list
                fetchAppointments();

                // Clear pending update for this id
                setPendingUpdates(prev => {
                    const newState = { ...prev };
                    delete newState[id];
                    return newState;
                });
            } catch (error) {
                console.error("Failed to update status:", error);
                alert("Failed to update status");
            }
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'waiting': return 'bg-emerald-50 text-accent border-emerald-200'; // Checked In
            case 'upcoming': return 'bg-amber-100 text-amber-700 border-amber-200'; // Booked
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'waiting': return 'Checked In';
            case 'upcoming': return 'Booked';
            case 'in-progress': return 'In Progress';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
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
                    <h1 className="text-2xl font-bold text-slate-800">Reception Desk</h1>
                    <p className="text-slate-500 mt-1">Manage patient check-ins and appointments</p>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Search patient..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full md:w-64 text-sm text-slate-800"
                        />
                    </div>

                    <button className="px-4 py-2.5 bg-brand-gradient text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                        onClick={() => navigate('/dashboard/receptionist/book')}
                    >
                        <Calendar size={18} />
                        <span>Book New</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Todays Appointments', value: stats.total, icon: Calendar, color: 'text-accent', bg: 'bg-emerald-50' },
                    { label: 'Checked In', value: stats.checkedIn, icon: CheckCircle, color: 'text-accent', bg: 'bg-emerald-50' },
                    { label: 'Waiting/Pending', value: stats.waiting, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Doctors Active', value: stats.activeDoctors, icon: User, color: 'text-accent', bg: 'bg-emerald-50' },
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
                    <h3 className="font-bold text-slate-800 text-lg">Today's Schedule</h3>
                    <div className="flex gap-2 text-sm bg-slate-50 p-1 rounded-lg">
                        {['All', 'Booked', 'Checked-In', 'Cancelled'].map(tab => (
                            <button
                                key={tab}
                                className={`px-4 py-1.5 rounded-md font-medium transition-all ${(filter === 'upcoming' && tab === 'Booked') ||
                                    (filter === 'checked-in' && tab === 'Checked-In') ||
                                    (filter === 'cancelled' && tab === 'Cancelled') ||
                                    (filter === 'all' && tab === 'All')
                                    ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => setFilter(tab === 'Booked' ? 'upcoming' : tab === 'Checked-In' ? 'checked-in' : tab === 'Cancelled' ? 'cancelled' : 'all')}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Column Headers */}
                <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:grid">
                    <div>Time</div>
                    <div>Patient Details</div>
                    <div>Status</div>
                    <div className="text-center">Actions</div>
                </div>

                <div className="divide-y divide-slate-100">
                    {appointments.filter(apt => {
                        if (filter === 'all') return true;
                        if (filter === 'upcoming') return apt.status === 'upcoming';
                        if (filter === 'checked-in') return apt.status === 'waiting';
                        if (filter === 'cancelled') return apt.status === 'cancelled';
                        return true;
                    }).map(apt => (
                        <div key={apt.id} className="p-6 hover:bg-slate-50 transition-colors group">
                            <div className="flex flex-col md:grid md:grid-cols-[1fr_2fr_1fr_1fr] md:items-center gap-4">
                                {/* Time Column */}
                                <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-1">
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
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <User size={14} /> {apt.age} yrs, {apt.gender}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User size={14} /> {apt.doctor}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-2">
                                            <span className="font-medium text-slate-500">Contact:</span> {apt.contact}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Column */}
                                <div className="flex items-center md:justify-start justify-center">
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${getStatusStyle(apt.status)}`}>
                                        {getStatusLabel(apt.status)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center md:justify-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0">
                                    <div className="relative">
                                        <select
                                            className="appearance-none px-4 py-2 pr-8 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                                            value={pendingUpdates[apt.id] || apt.status}
                                            onChange={(e) => handleDropdownChange(apt.id, e.target.value)}
                                        >
                                            <option value="upcoming">Booked</option>
                                            <option value="waiting">Checked In</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>
                                    {apt.status !== 'checked-in' && (
                                        <button
                                            className="p-2 text-slate-500 hover:text-accent hover:bg-emerald-50 rounded-lg transition-colors"
                                            title="Edit Appointment"
                                            onClick={() => handleEditClick(apt)}
                                        >
                                            <Edit size={18} />
                                        </button>
                                    )}
                                    <button
                                        className={`px-3 py-1.5 text-sm font-semibold text-white rounded-lg shadow-sm transition-all flex items-center gap-2 ${pendingUpdates[apt.id] ? 'bg-accent hover:opacity-90 shadow-accent/20' : 'bg-slate-300 cursor-not-allowed'}`}
                                        title="Save Appointment"
                                        onClick={() => handleSave(apt.id)}
                                        disabled={!pendingUpdates[apt.id]}
                                    >
                                        <Save size={16} />
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Modal */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-scale-in">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Edit Appointment</h3>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
                                    <input
                                        type="text"
                                        value={editForm.patientName}
                                        onChange={(e) => setEditForm({ ...editForm, patientName: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                        <input
                                            type="text"
                                            value={editForm.date}
                                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                        <input
                                            type="text"
                                            value={editForm.time}
                                            onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-8">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 text-slate-600 font-semibold bg-slate-100/50 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex-1 px-4 py-2.5 text-white font-semibold bg-accent hover:opacity-90 rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ReceptionistAppointments;


