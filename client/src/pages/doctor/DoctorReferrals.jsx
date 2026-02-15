import React, { useState, useEffect } from 'react';
import { referralService } from '../../services/referralService';
import { User, Calendar, Clock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { doctorService } from '../../services/doctorService'; // Reuse updateStatus if needed, or referral has status

const DoctorReferrals = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user] = useState(JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user')) || { name: 'Doctor' });
    const DOCTOR_NAME = user.name;

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            // Fetch by doctor Name (since that's what we have locally easily)
            const data = await referralService.getReferralsForDoctor(null, DOCTOR_NAME);
            setReferrals(data);
        } catch (error) {
            console.error("Failed to fetch referrals:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (referral) => {
        try {
            await referralService.updateStatus(referral.id, 'accepted');

            // Optionally: Add to doctor's queue or Appointments?
            // For now, just mark accepted.
            // Ideally, this should trigger creating an 'appointment' or adding to 'Live Queue'.
            // Let's assume 'accepted' status puts them in a special state.

            // Refetch to hide/update
            fetchReferrals();
            alert(`Referral for ${referral.patient_id} accepted.`);
        } catch (error) {
            alert("Failed to accept referral: " + error.message);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading referrals...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Patient Referrals</h1>
                <p className="text-slate-500">Patients referred to you by other doctors</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {referrals.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800">No Pending Referrals</h3>
                        <p>Any patients referred to you will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {referrals.map((referral) => (
                            <div key={referral.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-emerald-50 text-accent rounded-full flex items-center justify-center shrink-0">
                                            <ArrowRight size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">
                                                Patient ID: {referral.patient_id}
                                                {/* If we had patient name joined, we'd verify it. For now ID is reliable */}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Referred by <span className="font-medium text-slate-700">{referral.source_doctor_name}</span>
                                            </p>
                                            <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                                                <span className="font-medium text-slate-700">Reason:</span> {referral.reason}
                                            </div>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} /> {new Date(referral.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} /> {new Date(referral.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleAccept(referral)}
                                            className="px-4 py-2 bg-brand-gradient text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Accept
                                        </button>
                                        {/* Reject button logic can be added here */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorReferrals;


