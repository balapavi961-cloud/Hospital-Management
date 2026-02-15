import React, { useState, useEffect } from 'react';
import { FlaskConical, X, CheckCircle, Clock, User, Calendar, Stethoscope, Eye, Upload, Send } from 'lucide-react';
import { getPrescriptions, uploadReport, sendReportToDoctor } from '../../services/laboratoryService';

const LaboratoryPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [sending, setSending] = useState(false);
    const [reportFiles, setReportFiles] = useState([]);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    useEffect(() => {
        filterPrescriptions();
    }, [activeFilter, prescriptions]);

    const fetchPrescriptions = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const data = await getPrescriptions();
            setPrescriptions(data);
            return data;
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            return [];
        } finally {
            if (showLoader) setLoading(false);
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
        setReportFiles([]);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setReportFiles(Array.from(e.target.files));
        }
    };

    const handleUploadReport = async () => {
        if (!selectedPrescription || reportFiles.length === 0) {
            alert('Please select at least one report file');
            return;
        }

        try {
            setUploading(true);
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

            const response = await uploadReport(selectedPrescription.id, reportFiles, user.name || 'Lab Technician');

            // Optimistically update the selected prescription with the returned paths
            if (response && response.report_paths) {
                console.log('Upload successful, updating state with:', response.report_paths);

                const updatedPrescription = {
                    ...selectedPrescription,
                    report_paths: JSON.stringify(response.report_paths) // Ensure it's stored as string if that's how it's expected, or array if logic adapts. The backend sends array. Frontend expects string usually.
                    // Wait, the backend sends an ARRAY. The frontend validation parses JSON.
                    // Let's store it as a JSON string to match the DB format the frontend expects in other places, 
                    // OR check if we should update it as an array.
                    // The frontend component attempts JSON.parse(selectedPrescription.report_paths).
                    // So we should stringify it here to match the type expected by the render logic.
                };

                // Correction: The backend returns an array object. We should probably keep it consistent.
                // Let's create a safe updater.
                let newReportPaths = response.report_paths;
                if (Array.isArray(newReportPaths)) {
                    newReportPaths = JSON.stringify(newReportPaths);
                }

                const finalUpdated = {
                    ...selectedPrescription,
                    report_paths: newReportPaths,
                    status: 'pending' // Still pending until sent
                };

                setSelectedPrescription(finalUpdated);

                // Also update the list in background so if they close/reopen it's there
                setPrescriptions(prev => prev.map(p => p.id === selectedPrescription.id ? finalUpdated : p));
            } else {
                // Fallback to fetch if response is weird
                await fetchPrescriptions(false);
            }

            alert(`${reportFiles.length} report(s) uploaded successfully`);
            setReportFiles([]);
        } catch (error) {
            console.error('Error uploading report:', error);
            alert('Failed to upload report');
        } finally {
            setUploading(false);
        }
    };

    const handleSendReport = async () => {
        if (!selectedPrescription) return;

        console.log('Sending report for:', selectedPrescription);
        // Check if report_paths exists (new) or report_path exists (legacy)
        let hasReports = false;

        // Check legacy report_path
        if (selectedPrescription.report_path && selectedPrescription.report_path.trim() !== '') {
            hasReports = true;
        }

        // Check new report_paths (try parse if string)
        if (!hasReports && selectedPrescription.report_paths) {
            try {
                const parsed = JSON.parse(selectedPrescription.report_paths);
                if (Array.isArray(parsed) && parsed.length > 0) hasReports = true;
            } catch (e) {
                // Not JSON, treat as string
                if (typeof selectedPrescription.report_paths === 'string' && selectedPrescription.report_paths.trim() !== '' && selectedPrescription.report_paths !== '[]') {
                    hasReports = true;
                }
            }
        }

        if (!hasReports) {
            console.warn('No reports found in:', selectedPrescription);
            alert('Please upload a report first');
            return;
        }

        try {
            setSending(true);
            await sendReportToDoctor(selectedPrescription.id);

            // Refresh prescriptions
            await fetchPrescriptions();
            setShowModal(false);
            setSelectedPrescription(null);
            alert('Report sent to doctor successfully');
        } catch (error) {
            console.error('Error sending report:', error);
            alert('Failed to send report to doctor');
        } finally {
            setSending(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            completed: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
                {status === 'pending' ? 'Pending' : 'Completed'}
            </span>
        );
    };

    const stats = {
        all: prescriptions.length,
        pending: prescriptions.filter(p => p.status === 'pending').length,
        completed: prescriptions.filter(p => p.status === 'completed').length
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
                <h1 className="text-3xl font-bold text-slate-800">Laboratory Prescriptions</h1>
                <p className="text-slate-500 mt-1">View prescriptions and upload test reports</p>
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
                        onClick={() => setActiveFilter('completed')}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${activeFilter === 'completed'
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Completed ({stats.completed})
                    </button>
                </div>
            </div>

            {/* Prescriptions List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                {filteredPrescriptions.length === 0 ? (
                    <div className="p-12 text-center">
                        <FlaskConical size={48} className="mx-auto text-slate-300 mb-4" />
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
                                            <div className="p-2 bg-blue-50 rounded-lg">
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

                            {/* Prescription Image from Doctor */}
                            <div>
                                <h3 className="font-bold text-slate-800 mb-3">Prescription from Doctor</h3>
                                <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-center min-h-[200px]">
                                    {selectedPrescription.image_path ? (
                                        <img
                                            src={`http://localhost:5000/${selectedPrescription.image_path}`}
                                            alt="Prescription"
                                            className="max-w-full h-auto rounded-lg shadow-lg"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="text-center py-12"
                                        style={{ display: selectedPrescription.image_path ? 'none' : 'block' }}
                                    >
                                        <FlaskConical size={48} className="mx-auto text-slate-300 mb-2" />
                                        <p className="text-slate-500">
                                            {selectedPrescription.image_path
                                                ? 'Failed to load prescription image'
                                                : 'No prescription image available'}
                                        </p>
                                        {selectedPrescription.image_path && (
                                            <p className="text-xs text-slate-400 mt-2">
                                                Path: {selectedPrescription.image_path}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Upload Report Section */}
                            {selectedPrescription.status === 'pending' && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                        <Upload size={20} />
                                        Upload Test Reports (Multiple Files)
                                    </h3>
                                    <div className="space-y-3">
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            multiple
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-slate-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-lg file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-600 file:text-white
                                                hover:file:bg-blue-700
                                                file:cursor-pointer cursor-pointer"
                                        />
                                        {reportFiles.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-semibold text-slate-700">
                                                    Selected {reportFiles.length} file(s):
                                                </p>
                                                <div className="max-h-32 overflow-y-auto space-y-1">
                                                    {reportFiles.map((file, index) => (
                                                        <div key={index} className="text-xs text-slate-600 bg-white p-2 rounded border">
                                                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={handleUploadReport}
                                                    disabled={uploading}
                                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                                >
                                                    {uploading ? 'Uploading...' : `Upload ${reportFiles.length} Report(s)`}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Uploaded Reports Display */}
                            {selectedPrescription.report_paths && (() => {
                                try {
                                    const parsed = JSON.parse(selectedPrescription.report_paths);
                                    return Array.isArray(parsed) ? parsed.length > 0 : !!parsed;
                                } catch {
                                    // If parse fails, check if it's a non-empty string
                                    return !!selectedPrescription.report_paths;
                                }
                            })() && (
                                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                        <h3 className="font-bold text-emerald-800 mb-3">
                                            Uploaded Test Reports ({(() => {
                                                try {
                                                    const parsed = JSON.parse(selectedPrescription.report_paths);
                                                    return Array.isArray(parsed) ? parsed.length : (parsed ? 1 : 0);
                                                } catch {
                                                    return selectedPrescription.report_paths ? 1 : 0;
                                                }
                                            })()})
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(() => {
                                                let reportsToRender = [];
                                                try {
                                                    const parsed = JSON.parse(selectedPrescription.report_paths);
                                                    const rawList = Array.isArray(parsed) ? parsed : [selectedPrescription.report_paths];
                                                    // Filter for valid non-empty strings only
                                                    reportsToRender = rawList.filter(p => p && typeof p === 'string' && p.trim() !== '');
                                                } catch {
                                                    // Fallback for raw string
                                                    const raw = selectedPrescription.report_paths;
                                                    if (raw && typeof raw === 'string' && raw.trim() !== '') {
                                                        reportsToRender = [raw];
                                                    }
                                                }
                                                return reportsToRender;
                                            })().map((reportPath, index) => (
                                                <div key={index} className="bg-white rounded-lg p-3 border">
                                                    <p className="text-xs text-slate-500 mb-2">Report {index + 1}</p>
                                                    {reportPath && typeof reportPath === 'string' && reportPath.endsWith('.pdf') ? (
                                                        <a
                                                            href={`http://localhost:5000/${reportPath}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline text-sm"
                                                        >
                                                            View PDF Report
                                                        </a>
                                                    ) : (
                                                        <img
                                                            src={reportPath && typeof reportPath === 'string' ? `http://localhost:5000/${reportPath}` : ''}
                                                            alt={`Lab Report ${index + 1}`}
                                                            className="w-full h-auto rounded shadow"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {selectedPrescription.lab_technician && (
                                            <p className="text-sm text-emerald-700 mt-3">
                                                Uploaded by: {selectedPrescription.lab_technician}
                                            </p>
                                        )}
                                    </div>
                                )}

                            {/* Completion Info */}
                            {selectedPrescription.status === 'completed' && (
                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle size={20} className="text-emerald-600" />
                                        <h3 className="font-bold text-emerald-800">Report Sent to Doctor</h3>
                                    </div>
                                    <div className="text-sm text-emerald-700">
                                        <p>Sent at: {selectedPrescription.report_sent_at
                                            ? new Date(selectedPrescription.report_sent_at).toLocaleString()
                                            : 'N/A'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {selectedPrescription.status === 'pending' && selectedPrescription.report_paths && (() => {
                            try {
                                const parsed = JSON.parse(selectedPrescription.report_paths);
                                return Array.isArray(parsed) ? parsed.length > 0 : !!parsed;
                            } catch {
                                return !!selectedPrescription.report_paths;
                            }
                        })() && (
                                <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendReport}
                                        disabled={sending}
                                        className="px-6 py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {sending ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                Send Reports to Doctor
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

export default LaboratoryPrescriptions;
