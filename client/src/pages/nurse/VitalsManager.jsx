import React, { useState, useEffect } from 'react';
import { Search, Activity, Thermometer, Heart, Timer, Save, CheckCircle, Scale, Ruler, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import FloatingInput from '../../components/ui/FloatingInput';
import { nurseService } from '../../services/nurseService';

const VitalsManager = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedPatient, setSelectedPatient] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Check if we arrived with a specific patient context
    const patientContext = location.state;
    const isSinglePatientMode = !!patientContext?.patientId;

    useEffect(() => {
        if (patientContext?.patientId) {
            setSelectedPatient(patientContext.patientId);
        }
    }, [patientContext]);

    const [patients, setPatients] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);

    // Fetch patients for search
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await nurseService.getPatients();
                const formattedData = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    room: p.bed_number || 'N/A',
                    age: p.age
                }));
                setPatients(formattedData);
            } catch (err) {
                console.error("Failed to load patients for search:", err);
            } finally {
                setLoadingPatients(false);
            }
        };
        fetchPatients();
    }, []);

    // Fetch existing vitals when patient is selected
    useEffect(() => {
        const fetchVitals = async () => {
            if (!selectedPatient) {
                // Reset form if no patient selected
                setVitals({ bpSys: '', bpDia: '', temp: '', pulse: '', spo2: '', respRate: '', height: '', weight: '' });
                return;
            }

            try {
                const data = await nurseService.getVitals(selectedPatient);
                if (data && data.length > 0) {
                    const latest = data[0]; // Assuming sorted by desc date
                    const [sys, dia] = (latest.blood_pressure || '/').split('/');

                    setVitals({
                        bpSys: sys || '',
                        bpDia: dia || '',
                        temp: latest.temperature || '',
                        pulse: latest.heart_rate || '',
                        spo2: latest.oxygen_level || '',
                        respRate: latest.respiratory_rate || '',
                        height: latest.height || '',
                        weight: latest.weight || ''
                    });
                } else {
                    // No existing vitals, reset form
                    setVitals({ bpSys: '', bpDia: '', temp: '', pulse: '', spo2: '', respRate: '', height: '', weight: '' });
                }
            } catch (err) {
                console.error("Failed to load vitals:", err);
            }
        };

        fetchVitals();
    }, [selectedPatient]);

    // Helper to get patient name (either from context or list)
    const getPatientName = () => {
        if (patientContext?.patientName && selectedPatient === patientContext.patientId) {
            return patientContext.patientName;
        }
        return patients.find(p => p.id === selectedPatient)?.name;
    };

    const [vitals, setVitals] = useState({
        bpSys: '',
        bpDia: '',
        temp: '',
        pulse: '',
        spo2: '',
        respRate: '',
        height: '',
        weight: ''
    });

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await nurseService.addVitals({
                patientId: selectedPatient,
                bloodPressure: `${vitals.bpSys}/${vitals.bpDia}`,
                temperature: vitals.temp,
                heartRate: vitals.pulse,
                oxygenLevel: vitals.spo2,
                respiratoryRate: vitals.respRate || 0,
                height: vitals.height || null,
                weight: vitals.weight || null
            });

            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setVitals({ bpSys: '', bpDia: '', temp: '', pulse: '', spo2: '', respRate: '', height: '', weight: '' });
                if (isSinglePatientMode) {
                    navigate(-1);
                } else {
                    setSelectedPatient('');
                }
            }, 1500);
        } catch (err) {
            console.error("Failed to save vitals:", err);
            console.error("Failed to save vitals:", err);
            const msg = err.message || "Unknown error";
            const sqlErr = err.sqlError || "";
            alert(`Failed to save vitals: ${msg} ${sqlErr ? '\nSQL Info: ' + sqlErr : ''}`);
        }
    };

    // Filter patients based on search
    const [searchTerm, setSearchTerm] = useState('');
    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.room.includes(searchTerm)
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {(selectedPatient || isSinglePatientMode) && (
                        <button
                            onClick={() => {
                                if (isSinglePatientMode) {
                                    navigate(-1);
                                } else {
                                    setSelectedPatient('');
                                    setSearchTerm('');
                                }
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Vitals Monitor</h1>
                        <p className="text-slate-500">Log and track patient vital signs</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div>
                {selectedPatient ? (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {isSuccess && (
                            <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                                <CheckCircle size={64} className="text-accent mb-4" />
                                <h3 className="text-xl font-bold text-slate-800">Vitals Logged Successfully</h3>
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                            <div className="p-3 bg-emerald-50 rounded-full text-accent">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">New Vitals Entry</h2>
                                <p className="text-slate-500 text-sm">Recording for <span className="font-semibold text-accent">{getPatientName()}</span></p>
                                {patientContext?.status === 'completed' && (
                                    <p className="text-red-500 font-bold mt-1 text-sm bg-red-50 px-2 py-1 rounded-md inline-block">
                                        Patient Discharged - Vitals Read Only
                                    </p>
                                )}
                            </div>
                        </div>

                        <fieldset disabled={patientContext?.status === 'completed'} className="space-y-8 group-disabled:opacity-75">
                            {/* Blood Pressure */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Blood Pressure (mmHg)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FloatingInput
                                        label="Systolic (Top)" id="sys"
                                        type="number"
                                        value={vitals.bpSys} onChange={e => setVitals({ ...vitals, bpSys: e.target.value })}
                                        icon={Activity}
                                        className="bg-slate-50 border-slate-200 focus:border-blue-500"
                                        required
                                    />
                                    <FloatingInput
                                        label="Diastolic (Bottom)" id="dia"
                                        type="number"
                                        value={vitals.bpDia} onChange={e => setVitals({ ...vitals, bpDia: e.target.value })}
                                        icon={Activity}
                                        className="bg-slate-50 border-slate-200 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Core Vitals */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Core Vitals</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <FloatingInput
                                        label="Temperature (°F)" id="temp"
                                        type="number"
                                        value={vitals.temp} onChange={e => setVitals({ ...vitals, temp: e.target.value })}
                                        icon={Thermometer}
                                        className="bg-slate-50 border-slate-200 focus:border-blue-500"
                                        required
                                    />
                                    <FloatingInput
                                        label="Pulse (bpm)" id="pulse"
                                        type="number"
                                        value={vitals.pulse} onChange={e => setVitals({ ...vitals, pulse: e.target.value })}
                                        icon={Heart}
                                        className="bg-slate-50 border-slate-200 focus:border-blue-500"
                                        required
                                    />
                                    <FloatingInput
                                        label="SpO2 (%)" id="spo2"
                                        type="number"
                                        value={vitals.spo2} onChange={e => setVitals({ ...vitals, spo2: e.target.value })}
                                        icon={Activity}
                                        className="bg-slate-50 border-slate-200 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Physical Metrics */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Physical Metrics <span className="text-slate-300 font-normal normal-case">(Optional)</span></h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <FloatingInput
                                        label="Height (cm)" id="height"
                                        type="number"
                                        value={vitals.height} onChange={e => setVitals({ ...vitals, height: e.target.value })}
                                        icon={Ruler}
                                        className="bg-slate-50 border-slate-200 focus:border-blue-500"
                                    />
                                    <FloatingInput
                                        label="Weight (kg)" id="weight"
                                        type="number"
                                        value={vitals.weight} onChange={e => setVitals({ ...vitals, weight: e.target.value })}
                                        icon={Scale}
                                        className="bg-slate-50 border-slate-200 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {patientContext?.status !== 'completed' && (
                                <button
                                    onClick={handleSave}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    Save Vitals Log
                                </button>
                            )}
                        </fieldset>
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto mt-10">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
                                <Activity size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Log New Vitals</h2>
                            <p className="text-slate-500 mb-8">Search for a patient to begin recording vitals.</p>

                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name or room number..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg text-slate-800"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {searchTerm && (
                                <div className="text-left space-y-2 max-h-60 overflow-y-auto">
                                    {filteredPatients.length > 0 ? (
                                        filteredPatients.map(patient => (
                                            <button
                                                key={patient.id}
                                                onClick={() => setSelectedPatient(patient.id)}
                                                className="w-full p-4 rounded-xl flex items-center justify-between hover:bg-emerald-50 hover:text-accent transition-colors group border border-transparent hover:border-emerald-200"
                                            >
                                                <div>
                                                    <p className="font-bold text-slate-700 group-hover:text-accent">{patient.name}</p>
                                                    <p className="text-sm text-slate-400 group-hover:text-accent/70">Room {patient.room} • {patient.age} yrs</p>
                                                </div>
                                                <ArrowLeft size={18} className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-center text-slate-400 py-4">No patients found</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VitalsManager;


