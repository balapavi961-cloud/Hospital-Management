import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Search, Filter, Loader2, MapPin, PenTool } from 'lucide-react';
import { doctorService } from '../../services/doctorService';

import HandwrittenPrescription from './HandwrittenPrescription';
import AppointmentDetails from './AppointmentDetails';
import { prescriptionService } from '../../services/prescriptionService';

const DoctorAppointments = () => {
    // Hardcoded for now
    const [user] = useState(JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user')) || { name: 'Doctor' });
    const DOCTOR_NAME = user.name;

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming');
    const [searchTerm, setSearchTerm] = useState('');

    // Prescription Modal State
    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await doctorService.getAppointments(DOCTOR_NAME);
                setAppointments(data);
            } catch (error) {
                console.error("Failed to fetch appointments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'in-progress': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'waiting': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const handlePrescribeClick = (appointment) => {
        setSelectedAppointment(appointment);
        setIsPrescriptionOpen(true);
    };

    const handleSavePrescription = async (images) => {
        try {
            console.log("handleSavePrescription received images:", typeof images, images);
            const uploadPromises = Object.entries(images).map(([type, base64String]) => {
                console.log(`Uploading ${type}:`, typeof base64String, base64String ? base64String.substring(0, 50) + '...' : 'null');
                return prescriptionService.uploadPrescription(selectedAppointment.id, base64String, type);
            });

            await Promise.all(uploadPromises);

            // Don't show alert or close modal - let HandwrittenPrescription handle the flow
            // Optionally refresh appointments or update UI
        } catch (error) {
            console.error(error);
            alert('Failed to save prescription: ' + error.message);
        }
    };


    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all'
            ? true
            : filter === 'upcoming'
                ? ['upcoming', 'scheduled', 'waiting', 'in-progress'].includes(apt.status)
                : apt.status === filter;

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Schedule</h1>
                    <p className="text-slate-500 mt-1">Manage your appointments and patient visits</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Search patient..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full md:w-64 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-100 w-full md:w-fit overflow-x-auto no-scrollbar">
                {['upcoming', 'completed', 'cancelled', 'all'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === tab
                            ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/10'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((apt) => (
                            <div key={apt.id} className="p-6 hover:bg-slate-50 transition-colors group">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    {/* Date/Time Box */}
                                    <div className="flex flex-row md:flex-col items-center justify-between md:justify-center w-full md:w-auto bg-slate-50 rounded-xl p-3 md:min-w-[100px] border border-slate-100 group-hover:border-emerald-100 group-hover:bg-emerald-50/50 transition-colors">
                                        <span className="text-lg font-bold text-slate-700">{apt.time}</span>
                                        <span className="text-xs font-medium text-slate-400">{apt.date}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 w-full">
                                        <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                                            <h3 className="font-bold text-slate-800 text-lg">{apt.patient_name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(apt.status)}`}>
                                                {apt.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-500 mb-3">
                                            <span className="flex items-center gap-1.5">
                                                <User size={16} /> {apt.age} yrs, {apt.gender}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <FileText size={16} /> {apt.type}
                                            </span>
                                        </div>

                                        {apt.symptoms && (
                                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <span className="font-medium">Symptoms:</span> {apt.symptoms}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions Placeholder */}
                                    <div className="flex items-center gap-2 self-start md:self-center w-full md:w-auto mt-2 md:mt-0">
                                        <button
                                            onClick={() => handlePrescribeClick(apt)}
                                            className="flex-1 md:flex-none px-4 py-2 text-sm font-semibold text-white bg-brand-gradient hover:opacity-90 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <PenTool size={16} />
                                            Attend
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedAppointment(apt);
                                                setIsDetailsOpen(true);
                                            }}
                                            className="flex-1 md:flex-none px-4 py-2 text-sm font-semibold text-accent bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-center"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-lg font-medium">No appointments found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Handwritten Prescription Modal */}
            <HandwrittenPrescription
                isOpen={isPrescriptionOpen}
                onClose={() => {
                    setIsPrescriptionOpen(false);
                    setSelectedAppointment(null);
                }}
                onSave={handleSavePrescription}
                patient={selectedAppointment}
            />

            <AppointmentDetails
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedAppointment(null);
                }}
                appointment={selectedAppointment}
            />
        </div>
    );
};

export default DoctorAppointments;


