import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Activity, FileText, Clock, Heart, Thermometer, Info } from 'lucide-react';
import { doctorService } from '../../services/doctorService'; // Ensure this matches export
import { nurseService } from '../../services/nurseService'; // For getVitals
import { prescriptionService } from '../../services/prescriptionService';

const AppointmentDetails = ({ isOpen, onClose, appointment }) => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vitals, setVitals] = useState(null);
    const [activeTab, setActiveTab] = useState('pharmacy');
    const [sendingStatus, setSendingStatus] = useState({});

    useEffect(() => {
        if (isOpen && appointment) {
            fetchDetails();
        } else {
            setVitals(null);
            setPrescriptions([]);
            setLoading(true);
        }
    }, [isOpen, appointment]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            // Fetch Vitals
            const vitalsData = await nurseService.getVitals(appointment.patient_id);
            if (vitalsData && vitalsData.length > 0) {
                setVitals(vitalsData[0]); // Get latest
            }

            // Fetch Prescriptions
            const prescriptionsData = await prescriptionService.getPrescriptions(appointment.id);
            // Ensure array
            setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : []);

        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendToPharmacy = async (prescriptionId) => {
        setSendingStatus(prev => ({ ...prev, [prescriptionId]: 'sending' }));
        try {
            await prescriptionService.sendToPharmacy(prescriptionId);
            setSendingStatus(prev => ({ ...prev, [prescriptionId]: 'sent' }));
            // Refresh prescriptions to get updated status
            await fetchDetails();
        } catch (error) {
            console.error('Error sending to pharmacy:', error);
            alert('Failed to send prescription to pharmacy');
            setSendingStatus(prev => ({ ...prev, [prescriptionId]: 'error' }));
        }
    };

    const handleSendToLab = async (prescriptionId) => {
        setSendingStatus(prev => ({ ...prev, [prescriptionId]: 'sending' }));
        try {
            await prescriptionService.sendToLab(prescriptionId);
            setSendingStatus(prev => ({ ...prev, [prescriptionId]: 'sent' }));
            // Refresh prescriptions to get updated status
            await fetchDetails();
        } catch (error) {
            console.error('Error sending to lab:', error);
            alert('Failed to send prescription to lab');
            setSendingStatus(prev => ({ ...prev, [prescriptionId]: 'error' }));
        }
    };

    if (!isOpen || !appointment) return null;

    const API_BASE_URL = 'http://localhost:5000'; // Or from config

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Appointment Details</h2>
                        <p className="text-slate-500">
                            {appointment.patient_name} • {appointment.age} yrs • {appointment.gender}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Appointment Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <Info size={18} /> Symptoms & Reason
                                    </h3>
                                    <p className="text-slate-600">{appointment.symptoms || appointment.reason || 'No symptoms recorded'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <Clock size={18} /> Date & Time
                                    </h3>
                                    <p className="text-slate-600">{appointment.date} at {appointment.time}</p>
                                </div>
                            </div>

                            {/* Vitals */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Activity className="text-emerald-500" /> Latest Vitals
                                </h3>
                                {vitals ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                            <div className="text-sm text-slate-400 mb-1">Blood Pressure</div>
                                            <div className="text-xl font-bold text-slate-700">{vitals.blood_pressure || '--/--'} <span className="text-xs font-normal text-slate-400">mmHg</span></div>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                            <div className="text-sm text-slate-400 mb-1">Heart Rate</div>
                                            <div className="text-xl font-bold text-slate-700 flex items-center gap-1">
                                                {vitals.heart_rate || '--'} <Heart size={14} className="text-rose-500 fill-rose-500" />
                                                <span className="text-xs font-normal text-slate-400">bpm</span>
                                            </div>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                            <div className="text-sm text-slate-400 mb-1">Temperature</div>
                                            <div className="text-xl font-bold text-slate-700 flex items-center gap-1">
                                                {vitals.temperature || '--'} <Thermometer size={14} className="text-amber-500" />
                                                <span className="text-xs font-normal text-slate-400">°F</span>
                                            </div>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                                            <div className="text-sm text-slate-400 mb-1">SpO2</div>
                                            <div className="text-xl font-bold text-slate-700">{vitals.oxygen_level || '--'} <span className="text-xs font-normal text-slate-400">%</span></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-slate-400 text-sm italic py-4 bg-slate-50 rounded-xl text-center border-dashed border-2 border-slate-200">
                                        No vitals recorded for this patient.
                                    </div>
                                )}
                            </div>

                            {/* Prescription */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <FileText className="text-emerald-500" /> Prescriptions
                                </h3>
                                {prescriptions.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Tabs */}
                                        <div className="flex border-b border-slate-200">
                                            <button
                                                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'pharmacy'
                                                    ? 'border-accent text-accent'
                                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                                    }`}
                                                onClick={() => setActiveTab('pharmacy')}
                                            >
                                                Pharmacy
                                            </button>
                                            <button
                                                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'laboratory'
                                                    ? 'border-accent text-accent'
                                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                                    }`}
                                                onClick={() => setActiveTab('laboratory')}
                                            >
                                                Laboratory
                                            </button>
                                        </div>

                                        {/* Display Logic */}
                                        {prescriptions.filter(p => (p.prescription_type || p.type) === activeTab).length > 0 ? (
                                            prescriptions
                                                .filter(p => (p.prescription_type || p.type) === activeTab)
                                                .map((pres) => (
                                                    <div key={pres.id} className="space-y-3">
                                                        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-md">
                                                            <div className="bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider py-2 px-4 flex justify-between">
                                                                <span>{(pres.prescription_type || pres.type) ? (pres.prescription_type || pres.type).toUpperCase() : 'PRESCRIPTION'}</span>
                                                                <span>{new Date(pres.created_at).toLocaleString()}</span>
                                                            </div>
                                                            <img
                                                                src={`${API_BASE_URL}/${pres.image_path}`}
                                                                alt={`${pres.prescription_type || pres.type} Prescription`}
                                                                className="w-full h-auto max-h-[500px] object-contain bg-white"
                                                            />
                                                        </div>
                                                        {/* Send Button */}
                                                        {activeTab === 'pharmacy' && (
                                                            <button
                                                                onClick={() => handleSendToPharmacy(pres.id)}
                                                                disabled={pres.sent_to_pharmacy || sendingStatus[pres.id] === 'sending'}
                                                                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${pres.sent_to_pharmacy
                                                                    ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                                                                    : sendingStatus[pres.id] === 'sending'
                                                                        ? 'bg-slate-300 text-slate-600 cursor-wait'
                                                                        : 'bg-accent hover:opacity-90 text-white shadow-lg shadow-accent/20'
                                                                    }`}
                                                            >
                                                                {pres.sent_to_pharmacy ? (
                                                                    <>
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        Sent to Pharmacy
                                                                    </>
                                                                ) : sendingStatus[pres.id] === 'sending' ? (
                                                                    'Sending...'
                                                                ) : (
                                                                    'Send to Pharmacy'
                                                                )}
                                                            </button>
                                                        )}
                                                        {activeTab === 'laboratory' && (
                                                            <button
                                                                onClick={() => handleSendToLab(pres.id)}
                                                                disabled={pres.sent_to_lab || sendingStatus[pres.id] === 'sending'}
                                                                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${pres.sent_to_lab
                                                                    ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                                                                    : sendingStatus[pres.id] === 'sending'
                                                                        ? 'bg-slate-300 text-slate-600 cursor-wait'
                                                                        : 'bg-accent hover:opacity-90 text-white shadow-lg shadow-accent/20'
                                                                    }`}
                                                            >
                                                                {pres.sent_to_lab ? (
                                                                    <>
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        Sent to Lab
                                                                    </>
                                                                ) : sendingStatus[pres.id] === 'sending' ? (
                                                                    'Sending...'
                                                                ) : (
                                                                    'Send to Lab'
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="text-slate-400 text-sm italic py-8 bg-slate-50 rounded-xl text-center border-dashed border-2 border-slate-200">
                                                No {activeTab} prescription found.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-slate-400 text-sm italic py-8 bg-slate-50 rounded-xl text-center border-dashed border-2 border-slate-200">
                                        No prescription has been written yet.
                                    </div>
                                )}\r
                            </div>

                            {/* Lab Reports Section */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <FileText className="text-blue-500" /> Lab Reports
                                </h3>
                                {prescriptions.filter(p => p.prescription_type === 'laboratory' && p.report_paths).length > 0 ? (
                                    <div className="space-y-4">
                                        {prescriptions
                                            .filter(p => p.prescription_type === 'laboratory' && p.report_paths)
                                            .map((pres) => {
                                                // Safe JSON parsing
                                                // Safe JSON parsing
                                                let reports = [];
                                                try {
                                                    // Try to parse as JSON first
                                                    reports = JSON.parse(pres.report_paths || '[]');
                                                    if (!Array.isArray(reports)) {
                                                        // If it parses but isn't an array (unexpected), treat as single item if string
                                                        if (typeof reports === 'string') {
                                                            reports = [reports];
                                                        } else {
                                                            reports = [];
                                                        }
                                                    }
                                                } catch (e) {
                                                    // If parsing fails, it might be a raw string path from legacy data
                                                    console.warn('report_paths is not JSON, treating as single path:', pres.report_paths);
                                                    if (pres.report_paths && typeof pres.report_paths === 'string') {
                                                        reports = [pres.report_paths];
                                                    } else {
                                                        reports = [];
                                                    }
                                                }

                                                if (reports.length === 0) return null;

                                                return (
                                                    <div key={pres.id} className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h4 className="font-semibold text-blue-900">
                                                                Lab Test - {new Date(pres.created_at).toLocaleDateString()}
                                                            </h4>
                                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
                                                                {reports.length} Report(s)
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {reports.map((reportPath, index) => (
                                                                <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                                                                    <p className="text-xs text-slate-500 mb-2">Report {index + 1}</p>
                                                                    {reportPath.endsWith('.pdf') ? (
                                                                        <a
                                                                            href={`${API_BASE_URL}/${reportPath}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 hover:underline text-sm font-medium"
                                                                        >
                                                                            📄 View PDF Report
                                                                        </a>
                                                                    ) : (
                                                                        <img
                                                                            src={`${API_BASE_URL}/${reportPath}`}
                                                                            alt={`Lab Report ${index + 1}`}
                                                                            className="w-full h-auto rounded shadow cursor-pointer hover:opacity-90"
                                                                            onClick={() => window.open(`${API_BASE_URL}/${reportPath}`, '_blank')}
                                                                        />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {pres.lab_technician && (
                                                            <p className="text-xs text-slate-600 mt-2">
                                                                Uploaded by: {pres.lab_technician}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <div className="text-slate-400 text-sm italic py-8 bg-slate-50 rounded-xl text-center border-dashed border-2 border-slate-200">
                                        No lab reports available yet.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetails;


