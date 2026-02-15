import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, Search, Filter } from 'lucide-react';
import { doctorService } from '../../services/doctorService';

const DoctorCompleted = () => {
    const [user] = useState(JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user')) || { name: 'Doctor' });
    const DOCTOR_NAME = user.name;

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCompletedAppointments();
    }, []);

    const fetchCompletedAppointments = async () => {
        try {
            const data = await doctorService.getAppointments(DOCTOR_NAME);
            // Filter only completed appointments
            const completed = data.filter(apt => apt.status === 'completed');
            setAppointments(completed);
        } catch (error) {
            console.error("Failed to fetch completed appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAppointments = appointments.filter(apt =>
        apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading completed list...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Completed Sessions</h1>
                    <p className="text-slate-500 mt-1">History of attended patients</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <input
                        type="text"
                        placeholder="Search history..."
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 text-sm text-slate-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {filteredAppointments.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No completed appointments found.</div>
                    ) : (
                        filteredAppointments.map(apt => (
                            <div key={apt.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex md:flex-col items-center gap-3 md:gap-1 min-w-[100px]">
                                        <span className="text-lg font-bold text-slate-800">{apt.time}</span>
                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{apt.date}</span>
                                    </div>

                                    <div className="flex-1 flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                                            <CheckCircle size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{apt.patient_name}</h4>
                                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <User size={14} /> {apt.age} yrs, {apt.gender}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-2">
                                                <span className="font-medium">Reason:</span> {apt.symptoms}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                            Completed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorCompleted;


