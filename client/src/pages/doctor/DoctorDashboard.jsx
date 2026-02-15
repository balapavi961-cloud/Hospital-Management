import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, CheckCircle, Activity, XCircle, Loader2 } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import HandwrittenPrescription from './HandwrittenPrescription';
import ReferralModal from './ReferralModal';
import { prescriptionService } from '../../services/prescriptionService';

const DoctorDashboard = () => {
    const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user')) || { name: 'Doctor' });
    const DOCTOR_NAME = user.name;

    const [stats, setStats] = useState({
        total: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0
    });
    const [loading, setLoading] = useState(true);

    // Prescription Modal State for Dashboard
    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [selectedPatientForPrescription, setSelectedPatientForPrescription] = useState(null);

    // Referral Modal State
    const [isReferralOpen, setIsReferralOpen] = useState(false);
    const [selectedPatientForReferral, setSelectedPatientForReferral] = useState(null);

    const handleAttendClick = (patient) => {
        setSelectedPatientForPrescription(patient);
        setIsPrescriptionOpen(true);
    };

    const handleReferClick = (patient) => {
        setSelectedPatientForReferral(patient);
        setIsReferralOpen(true);
    };

    const handleSavePrescription = async (images) => {
        try {
            // Upload prescriptions
            const uploadPromises = Object.entries(images).map(([type, base64String]) => {
                return prescriptionService.uploadPrescription(selectedPatientForPrescription.id, base64String, type);
            });

            await Promise.all(uploadPromises);

            // Then mark as completed
            await doctorService.updateStatus(selectedPatientForPrescription.id, 'completed');

            // Don't show alert or close modal - let HandwrittenPrescription handle the flow
            // The appointment is marked as completed but modal stays open for Send button
        } catch (error) {
            alert('Failed to process: ' + error.message);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await doctorService.getStats(DOCTOR_NAME);
                setStats(data);
            } catch (error) {
                console.error("Failed to load doctor stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, bg }) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl ${bg} ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{loading ? '-' : value}</h3>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Welcome, {DOCTOR_NAME}</h1>
                    <p className="text-slate-500 mt-1">Here's your schedule overview for today.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200">
                    <Activity size={16} className="text-accent" />
                    <span>System Online</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Appointments"
                    value={stats.total}
                    icon={Calendar}
                    color="text-accent"
                    bg="bg-emerald-50"
                />
                <StatCard
                    title="Scheduled Today"
                    value={stats.upcoming}
                    icon={Clock}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
                <StatCard
                    title="Patients Seen"
                    value={stats.completed}
                    icon={CheckCircle}
                    color="text-accent"
                    bg="bg-emerald-50"
                />
                <StatCard
                    title="Cancelled"
                    value={stats.cancelled}
                    icon={XCircle}
                    color="text-red-600"
                    bg="bg-red-50"
                />
            </div>

            {/* Live Queue Section */}
            <LiveQueue doctorName={DOCTOR_NAME} onAttend={handleAttendClick} onRefer={handleReferClick} />

            {/* Referral Modal */}
            <ReferralModal
                isOpen={isReferralOpen}
                onClose={() => {
                    setIsReferralOpen(false);
                    setSelectedPatientForReferral(null);
                }}
                patient={selectedPatientForReferral}
                sourceDoctor={{ name: DOCTOR_NAME }}
            />

            {/* Prescription Modal */}
            <HandwrittenPrescription
                isOpen={isPrescriptionOpen}
                onClose={() => {
                    setIsPrescriptionOpen(false);
                    setSelectedPatientForPrescription(null);
                }}
                onSave={handleSavePrescription}
                patient={selectedPatientForPrescription}
                patientName={selectedPatientForPrescription?.patient_name || 'Patient'}
            />
        </div>
    );
};

const LiveQueue = ({ doctorName, onAttend, onRefer }) => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = async () => {
        setLoading(true);
        try {
            console.log("Fetching Live Queue for:", doctorName);
            const data = await doctorService.getLiveQueue(doctorName);
            console.log("Live Queue Response:", data);
            setQueue(data);
        } catch (error) {
            console.error("Failed to fetch live queue:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [doctorName]);


    if (queue.length === 0) {
        return (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Patients in Queue</h3>
                <p className="text-slate-500">Patients accepted by nurses for you will appear here.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="text-accent" size={20} />
                        Live Patient Queue
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Showing patients for: <span className="font-semibold text-slate-600">{doctorName}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchQueue()}
                        className="p-2 text-slate-400 hover:text-accent hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Refresh Queue"
                    >
                        <Loader2 size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                    <span className="bg-emerald-50 text-accent px-3 py-1 rounded-full text-xs font-bold">
                        {queue.length} Waiting
                    </span>
                </div>
            </div>
            <div className="divide-y divide-slate-100">
                {queue.map((patient) => (
                    <div key={patient.id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                            <div className="flex items-start gap-4 w-full md:w-auto">
                                <div className="w-12 h-12 bg-emerald-50 text-accent rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                                    {patient.patient_name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 text-lg">{patient.patient_name}</h3>
                                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-slate-500 mt-1">
                                        <span>{patient.age} yrs, {patient.gender}</span>
                                        <span className="hidden md:inline">•</span>
                                        <span>Time: {patient.time}</span>
                                    </div>

                                    {/* Vitals Display */}
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-500">BP</p>
                                            <p className="font-semibold text-slate-800">{patient.blood_pressure || '--'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-500">Heart Rate</p>
                                            <p className="font-semibold text-slate-800">{patient.heart_rate || '--'} bpm</p>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-500">Temp</p>
                                            <p className="font-semibold text-slate-800">{patient.temperature || '--'} °F</p>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-500">SpO2</p>
                                            <p className="font-semibold text-slate-800">{patient.oxygen_level || '--'}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                                <button
                                    className="flex-1 md:flex-none px-6 py-2 bg-brand-gradient text-white rounded-xl font-semibold hover:opacity-90 shadow-lg shadow-accent/20 transition-all"
                                    onClick={() => onAttend(patient)}
                                >
                                    Attend
                                </button>
                                <button
                                    className="flex-1 md:flex-none px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl font-semibold transition-all"
                                    onClick={() => onRefer(patient)}
                                >
                                    Refer
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorDashboard;


