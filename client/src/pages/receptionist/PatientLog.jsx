import React, { useState, useEffect } from 'react';
import { Search, UserPlus, FileText, Calendar, Clock, Phone, User, X, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { receptionistService } from '../../services/receptionistService';
import FloatingInput from '../../components/ui/FloatingInput';

const PatientLog = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // New Patient Form State
    const [newPatient, setNewPatient] = useState({
        name: '',
        age: '',
        gender: 'Male',
        contactNumber: '',
        reason: ''
    });

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await receptionistService.getPatients();

            // Filter for TODAY only (client-side filtering for now)
            const today = new Date().toDateString();
            const todaysPatients = data.filter(p => {
                const admissionDate = new Date(p.admission_date).toDateString();
                return admissionDate === today;
            });

            // Or if we want to show all but highlight today, but the request was "daily patient list"
            // I'll stick to showing today's patients primarily
            setPatients(todaysPatients);
        } catch (error) {
            console.error("Failed to load patients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleAddPatient = async (e) => {
        e.preventDefault();
        try {
            await receptionistService.addPatient(newPatient);
            setIsAddModalOpen(false);
            setNewPatient({ name: '', age: '', gender: 'Male', contactNumber: '', reason: '' });
            fetchPatients(); // Refresh list
        } catch (error) {
            console.error("Failed to add patient:", error);
            alert("Failed to add patient");
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contact_number?.includes(searchTerm)
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Daily Patient Log</h1>
                        <p className="text-slate-500">Log book of patients visiting today</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Search log..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 text-sm text-slate-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        <span>Add Entry</span>
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Today's Entries ({patients.length})</h3>
                    <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-accent" size={32} />
                    </div>
                ) : filteredPatients.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {filteredPatients.map((patient) => (
                            <div
                                key={patient.id}
                                onClick={() => setSelectedPatient(patient)}
                                className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center gap-6 cursor-pointer group"
                            >
                                {/* Time/Date */}
                                <div className="min-w-[80px] text-center md:text-left">
                                    <span className="block text-lg font-bold text-slate-800">
                                        {new Date(patient.admission_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Time In</span>
                                </div>

                                {/* Patient Info */}
                                <div className="flex-1 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-accent flex items-center justify-center font-bold text-lg">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg mb-1">{patient.name}</h4>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <User size={14} /> {patient.age} yrs, {patient.gender}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Phone size={14} /> {patient.contact_number}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex-1 md:text-right">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Reason for Visit</span>
                                    <p className="text-slate-700 font-medium">{patient.diagnosis || 'General Visit'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-400">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium text-slate-600">No entries for today</p>
                        <p>Click "Add Entry" to log a new patient visit.</p>
                    </div>
                )}
            </div>

            {/* Add Patient Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800">Add Patient Entry</h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddPatient} className="p-6 space-y-4">
                            <FloatingInput
                                label="Patient Name"
                                value={newPatient.name}
                                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FloatingInput
                                    label="Age"
                                    type="number"
                                    value={newPatient.age}
                                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                                    required
                                />
                                <div className="relative">
                                    <select
                                        className="w-full h-[56px] px-4 pt-4 pb-1 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none text-slate-800 font-medium transition-all"
                                        value={newPatient.gender}
                                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <label className="absolute left-4 top-2 text-xs font-semibold text-slate-400 pointer-events-none uppercase tracking-wider">
                                        Gender
                                    </label>
                                </div>
                            </div>

                            <FloatingInput
                                label="Contact Number"
                                value={newPatient.contactNumber}
                                onChange={(e) => setNewPatient({ ...newPatient, contactNumber: e.target.value })}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Visit</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px]"
                                    placeholder="Enter details..."
                                    value={newPatient.reason}
                                    onChange={(e) => setNewPatient({ ...newPatient, reason: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-brand-gradient text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-accent/20 flex items-center justify-center gap-2 mt-4"
                            >
                                <Save size={20} />
                                Save Entry
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800">Patient Details</h3>
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-20 h-20 rounded-full bg-emerald-50 text-accent flex items-center justify-center font-bold text-3xl">
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{selectedPatient.name}</h2>
                                    <p className="text-slate-500">ID: #{selectedPatient.id}</p>
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
                                        {selectedPatient.contact_number}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Entry Time</span>
                                    <p className="font-medium text-slate-800 flex items-center gap-2">
                                        <Clock size={16} className="text-accent" />
                                        {new Date(selectedPatient.admission_date).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Reason for Visit</span>
                                <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-700">
                                    {selectedPatient.diagnosis || 'No specific reason recorded.'}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end">
                            <button
                                onClick={() => setSelectedPatient(null)}
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

export default PatientLog;


