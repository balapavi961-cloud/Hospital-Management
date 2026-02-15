import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Activity, FileText, MoreVertical, Phone, Loader2, X } from 'lucide-react';
import { nurseService } from '../../services/nurseService';

const PatientList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await nurseService.getPatients();
                // Map backend data to frontend structure
                const formattedData = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    age: p.age,
                    gender: p.gender,
                    room: p.bed_number || 'N/A',
                    condition: 'Stable', // Placeholder, could be derived from recent vitals
                    diagnosis: p.diagnosis,
                    admissionDate: new Date(p.admission_date).toLocaleDateString(),
                    contact: p.contact_number
                }));
                setPatients(formattedData);
            } catch (err) {
                console.error("Error fetching patients:", err);
                setError("Failed to load patients");
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const getConditionColor = (condition) => {
        switch (condition) {
            case 'Stable': return 'bg-emerald-100 text-emerald-700';
            case 'Critical': return 'bg-red-100 text-red-700';
            case 'Observation': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-500 bg-red-50 rounded-xl border border-red-100">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Patients</h1>
                    <p className="text-slate-500">Currently assigned patients under your care</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
                    Total Assigned: <span className="text-accent font-bold ml-1">{patients.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map(patient => (
                    <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer group hover:border-emerald-200"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-50">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{patient.name}</h3>
                                        <p className="text-xs text-slate-500">{patient.age} yrs • {patient.gender}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getConditionColor(patient.condition)}`}>
                                    {patient.condition}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={16} className="text-accent" />
                                    Room {patient.room}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Phone size={16} className="text-accent" />
                                    {patient.contact}
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 bg-slate-50/50 flex-1">
                            <div className="mb-4">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diagnosis</span>
                                <p className="text-slate-700 font-medium">{patient.diagnosis}</p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admitted</span>
                                <p className="text-slate-700">{patient.admissionDate}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); navigate('/dashboard/nurse/vitals'); }}
                                className="flex-1 py-2.5 bg-brand-gradient hover:opacity-90 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                            >
                                <Activity size={16} />
                                Log Vitals
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); /* Add charts logic */ }}
                                className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                            >
                                <FileText size={16} />
                                Charts
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {/* Patient Details Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800">Patient Details</h3>
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedPatient(null); }}
                                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-3xl">
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{selectedPatient.name}</h2>
                                    <p className="text-slate-500">ID: #{selectedPatient.id}</p>
                                    <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-bold ${getConditionColor(selectedPatient.condition)}`}>
                                        {selectedPatient.condition}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Age / Gender</span>
                                    <p className="font-medium text-slate-800 flex items-center gap-2">
                                        <User size={16} className="text-accent" />
                                        {selectedPatient.age} yrs, {selectedPatient.gender}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Contact</span>
                                    <p className="font-medium text-slate-800 flex items-center gap-2">
                                        <Phone size={16} className="text-accent" />
                                        {selectedPatient.contact}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Room</span>
                                    <p className="font-medium text-slate-800 flex items-center gap-2">
                                        <MapPin size={16} className="text-accent" />
                                        Room {selectedPatient.room}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Admitted</span>
                                    <p className="font-medium text-slate-800 flex items-center gap-2">
                                        <FileText size={16} className="text-accent" />
                                        {selectedPatient.admissionDate}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Diagnosis</span>
                                <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-700">
                                    {selectedPatient.diagnosis}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end">
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedPatient(null); }}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-900/10"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientList;


