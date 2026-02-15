import React, { useState, useEffect } from 'react';
import { Pill, X, CheckCircle, Clock, User, Calendar, Stethoscope, Eye } from 'lucide-react';
import { getPrescriptions, dispensePrescription } from '../../services/pharmacyService';

const PharmacyPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [dispensing, setDispensing] = useState(false);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    useEffect(() => {
        filterPrescriptions();
    }, [activeFilter, prescriptions]);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const data = await getPrescriptions();
            setPrescriptions(data);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPrescriptions = () => {
        if (activeFilter === 'all') {
            setFilteredPrescriptions(prescriptions);
        } else {
            setFilteredPrescriptions(
                prescriptions.filter(p => p.status === activeFilter)
            );
        }
    };

    const handleViewPrescription = (prescription) => {
        setSelectedPrescription(prescription);
        setShowModal(true);
    };

    const handleDispense = async () => {
        if (!selectedPrescription) return;

        try {
            setDispensing(true);
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

            await dispensePrescription(selectedPrescription.id, {
                dispensedBy: user.name || 'Pharmacist',
                notes: 'Dispensed via pharmacy portal'
            });

            // Refresh prescriptions
            await fetchPrescriptions();
            setShowModal(false);
            setSelectedPrescription(null);
        } catch (error) {
            console.error('Error dispensing prescription:', error);
            alert('Failed to dispense prescription');
        } finally {
            setDispensing(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            dispensed: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
                {status === 'pending' ? 'Pending' : 'Dispensed'}
            </span>
        );
    };

    const stats = {
        all: prescriptions.length,
        pending: prescriptions.filter(p => p.status === 'pending').length,
        dispensed: prescriptions.filter(p => p.status === 'dispensed').length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Prescriptions</h1>
                <p className="text-slate-500 mt-1">View and manage pharmacy prescriptions</p>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${activeFilter === 'all'
                                ? 'bg-brand-gradient text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        All ({stats.all})
                    </button>
                    <button
                        onClick={() => setActiveFilter('pending')}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${activeFilter === 'pending'
                                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Pending ({stats.pending})
                    </button>
                    <button
                        onClick={() => setActiveFilter('dispensed')}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${activeFilter === 'dispensed'
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Dispensed ({stats.dispensed})
                    </button>
                </div>
            </div>

            {/* Prescriptions List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                {filteredPrescriptions.length === 0 ? (
                    <div className="p-12 text-center">
                        <Pill size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">No prescriptions found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredPrescriptions.map((prescription) => (
                            <div
                                key={prescription.id}
                                className="p-6 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        {/* Patient Info */}
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-50 rounded-lg">
                                                <User size={20} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">
                                                    {prescription.patient_name}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    {prescription.age} years • {prescription.gender}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Stethoscope size={16} className="text-slate-400" />
                                                <span>Dr. {prescription.doctor}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar size={16} className="text-slate-400" />
                                                <span>{new Date(prescription.appointment_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Clock size={16} className="text-slate-400" />
                                                <span>{new Date(prescription.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            {getStatusBadge(prescription.status)}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleViewPrescription(prescription)}
                                        className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2"
                                    >
                                        <Eye size={18} />
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Prescription Detail Modal */}
            {showModal && selectedPrescription && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Prescription Details</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Patient: {selectedPrescription.patient_name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X size={24} className="text-slate-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Patient Info Card */}
                            <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Patient</p>
                                    <p className="font-semibold text-slate-800">{selectedPrescription.patient_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Age / Gender</p>
                                    <p className="font-semibold text-slate-800">
                                        {selectedPrescription.age} / {selectedPrescription.gender}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Doctor</p>
                                    <p className="font-semibold text-slate-800">Dr. {selectedPrescription.doctor}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Status</p>
                                    {getStatusBadge(selectedPrescription.status)}
                                </div>
                            </div>

                            {/* Prescription Image */}
                            <div>
                                <h3 className="font-bold text-slate-800 mb-3">Prescription Image</h3>
                                <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-center">
                                    {selectedPrescription.image_path ? (
                                        <img
                                            src={`http://localhost:5000/${selectedPrescription.image_path}`}
                                            alt="Prescription"
                                            className="max-w-full h-auto rounded-lg shadow-lg"
                                        />
                                    ) : (
                                        <div className="text-center py-12">
                                            <Pill size={48} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-slate-500">No prescription image available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dispensing Info */}
                            {selectedPrescription.status === 'dispensed' && (
                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle size={20} className="text-emerald-600" />
                                        <h3 className="font-bold text-emerald-800">Dispensed</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-emerald-600">Dispensed By</p>
                                            <p className="font-semibold text-emerald-800">
                                                {selectedPrescription.dispensed_by || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-emerald-600">Dispensed At</p>
                                            <p className="font-semibold text-emerald-800">
                                                {selectedPrescription.dispensed_at
                                                    ? new Date(selectedPrescription.dispensed_at).toLocaleString()
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {selectedPrescription.status === 'pending' && (
                            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDispense}
                                    disabled={dispensing}
                                    className="px-6 py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {dispensing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Dispensing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} />
                                            Mark as Dispensed
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyPrescriptions;
