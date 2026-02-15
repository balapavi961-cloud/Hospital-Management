import React, { useState, useEffect } from 'react';
import { X, Send, User, Building } from 'lucide-react';
import { referralService } from '../../services/referralService';
import { staffService } from '../../services/staffService';
import { receptionistService } from '../../services/receptionistService';

const ReferralModal = ({ isOpen, onClose, patient, sourceDoctor }) => {
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);

    // Form State
    const [referralType, setReferralType] = useState('doctor'); // 'doctor' or 'department'
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            const depts = await receptionistService.getDepartments();
            setDepartments(depts);

            const staff = await staffService.getAllStaff();
            // Filter only doctors and exclude self
            const docList = staff.filter(s => s.role === 'Doctor' && s.name !== sourceDoctor.name);
            setDoctors(docList);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const referralData = {
                patient_id: patient.patient_id,
                source_doctor_name: sourceDoctor.name,
                reason,
                status: 'pending'
            };

            if (referralType === 'doctor') {
                const doc = doctors.find(d => d.id === parseInt(selectedDoctor));
                if (!doc) {
                    alert('Please select a doctor');
                    setLoading(false);
                    return;
                }
                referralData.target_doctor_id = doc.id;
                referralData.target_doctor_name = doc.name;
                referralData.target_department_name = doc.department; // Optional but good to have
            } else {
                const dept = departments.find(d => d.id === parseInt(selectedDepartment));
                if (!dept) {
                    alert('Please select a department');
                    setLoading(false);
                    return;
                }
                referralData.target_department_id = dept.id;
                referralData.target_department_name = dept.name;
            }

            await referralService.createReferral(referralData);
            alert('Referral sent successfully!');
            onClose();
        } catch (error) {
            alert('Failed to send referral: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Refer Patient</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-emerald-50 p-4 rounded-xl border border-blue-100 mb-4">
                        <p className="text-sm text-blue-800 font-medium">Referring: {patient?.patient_name}</p>
                    </div>

                    {/* Type Selection */}
                    <div className="flex gap-4 mb-4">
                        <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${referralType === 'doctor' ? 'border-accent bg-emerald-50 text-accent' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}>
                            <input
                                type="radio"
                                name="type"
                                value="doctor"
                                checked={referralType === 'doctor'}
                                onChange={() => setReferralType('doctor')}
                                className="hidden"
                            />
                            <User size={18} />
                            <span className="font-medium">Specific Doctor</span>
                        </label>
                        <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${referralType === 'department' ? 'border-accent bg-emerald-50 text-accent' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}>
                            <input
                                type="radio"
                                name="type"
                                value="department"
                                checked={referralType === 'department'}
                                onChange={() => setReferralType('department')}
                                className="hidden"
                            />
                            <Building size={18} />
                            <span className="font-medium">Department</span>
                        </label>
                    </div>

                    {referralType === 'doctor' ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Doctor</label>
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 transition-colors"
                                required
                            >
                                <option value="">Select a doctor...</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>Dr. {doc.name} ({doc.department})</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Department</label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 transition-colors"
                                required
                            >
                                <option value="">Select a department...</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Referral</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please maintain ... details or reason ..."
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 transition-colors h-32 resize-none"
                            required
                        ></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-brand-gradient text-white font-medium rounded-xl hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : (
                                <>
                                    <Send size={18} /> Send Referral
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReferralModal;


