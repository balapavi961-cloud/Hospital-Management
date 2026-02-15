import React, { useState } from 'react';
import { User, Calendar, Clock, Stethoscope, CheckCircle, ArrowRight, Plus, MapPin, Search, Loader2 } from 'lucide-react';
import { nurseService } from '../../services/nurseService';
import { staffService } from '../../services/staffService';

import { LOCATION_DATA } from '../../data/locationData';

const NurseBookAppointment = () => {
    const [view, setView] = useState('list'); // 'list', 'form', 'success'

    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const formatTimeTo12Hour = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12 < 10 ? '0' + h12 : h12}:${minutes} ${ampm}`;
    };

    const [formData, setFormData] = useState({
        patientName: '',
        age: '',
        contactNumber: '',
        state: '',
        district: '',
        thaluk: '',
        place: '',
        department: '',
        doctor: '',
        date: new Date().toISOString().split('T')[0],
        time: getCurrentTime(),
        reason: '',
        gender: ''
    });

    const handleStateChange = (e) => {
        setFormData({
            ...formData,
            state: e.target.value,
            district: '',
            thaluk: ''
        });
    };

    const handleDistrictChange = (e) => {
        setFormData({
            ...formData,
            district: e.target.value,
            thaluk: ''
        });
    };

    const [doctors, setDoctors] = useState([]);

    React.useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const data = await staffService.getAllStaff('Doctor');
                setDoctors(data);
            } catch (err) {
                console.error("Failed to load doctors", err);
            }
        };
        fetchDoctors();
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await nurseService.createAppointment({
                patientName: formData.patientName,
                age: formData.age,
                contactNumber: formData.contactNumber,
                place: formData.place, // Note: Backend might need to be updated to store place/location if needed, currently storing as contacts or ignore
                doctor: formData.doctor,
                date: new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // Format: "Oct 24"
                time: formatTimeTo12Hour(formData.time),
                type: formData.department, // Using department as appointment type/context
                reason: formData.reason,
                gender: formData.gender
            });
            setView('success');
        } catch (error) {
            console.error("Booking failed:", error);
            alert("Failed to book appointment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            patientName: '',
            age: '',
            contactNumber: '',
            state: '',
            district: '',
            thaluk: '',
            place: '',
            department: '',
            doctor: '',
            date: '',
            time: '',
            reason: '',
            gender: ''
        });
        setView('list');
    };

    // Auto-redirect after 1 second when in success view
    React.useEffect(() => {
        if (view === 'success') {
            const timer = setTimeout(() => {
                resetForm();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [view]);

    // View: Success Confirmation
    if (view === 'success') {
        return (
            <div className="max-w-xl mx-auto mt-20 p-8 glass-panel bg-white border border-slate-200 shadow-xl rounded-2xl text-center">
                {/* Content */}
                <div className="p-8">
                    {/* Assuming 'success' state is managed elsewhere or implicitly true here */}
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-accent" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Appointment Booked!</h2>
                        <p className="text-slate-500 mb-8">
                            The appointment for {formData.patientName} has been successfully scheduled.
                        </p>
                        {/* Back button removed as per requirement for auto-redirect */}
                    </div>
                </div>
            </div>
        );
    }

    if (!LOCATION_DATA) {
        return <div className="p-8 text-center text-red-500">Error: Location data failed to load.</div>;
    }

    // View: Booking Form (Always show form if accessed directly or via button)
    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">New Appointment Booking</h1>
                <p className="text-slate-500">Schedule a visit for a patient</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Patient Name Input */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Patient Name <span className="text-red-500 ml-1">*</span></label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500 transition-all"
                                    value={formData.patientName}
                                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Gender Select */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Gender <span className="text-red-500 ml-1">*</span></label>
                            <select
                                className="w-full px-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500 appearance-none transition-all"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Age Input */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Age <span className="text-red-500 ml-1">*</span></label>
                            <input
                                type="number"
                                placeholder="Age"
                                className="w-full px-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500 transition-all"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                required
                                min="0"
                                max="150"
                            />
                        </div>

                        {/* Contact Number */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number <span className="text-red-500 ml-1">*</span></label>
                            <input
                                type="tel"
                                placeholder="Contact number"
                                className="w-full px-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 transition-all"
                                value={formData.contactNumber}
                                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                required
                            />
                        </div>

                        {/* Place */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Place <span className="text-red-500 ml-1">*</span></label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="City / Town"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 transition-all"
                                    value={formData.place}
                                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* State Select */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">State <span className="text-red-500 ml-1">*</span></label>
                            <select
                                className="w-full px-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 appearance-none transition-all"
                                value={formData.state}
                                onChange={handleStateChange}
                                required
                            >
                                <option value="" disabled>Select State</option>
                                {LOCATION_DATA && Object.keys(LOCATION_DATA).map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        {/* District Select */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">District <span className="text-red-500 ml-1">*</span></label>
                            <select
                                className="w-full px-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 appearance-none transition-all"
                                value={formData.district}
                                onChange={handleDistrictChange}
                                required
                                disabled={!formData.state}
                            >
                                <option value="" disabled>Select District</option>
                                {formData.state && LOCATION_DATA[formData.state] && Object.keys(LOCATION_DATA[formData.state]).map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        {/* Thaluk Select */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Thaluk <span className="text-red-500 ml-1">*</span></label>
                            <select
                                className="w-full px-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 appearance-none transition-all"
                                value={formData.thaluk}
                                onChange={(e) => setFormData({ ...formData, thaluk: e.target.value })}
                                required
                                disabled={!formData.district}
                            >
                                <option value="" disabled>Select Thaluk</option>
                                {formData.state && formData.district && LOCATION_DATA[formData.state][formData.district] && LOCATION_DATA[formData.state][formData.district].map(thaluk => (
                                    <option key={thaluk} value={thaluk}>{thaluk}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Department Select */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Department <span className="text-red-500 ml-1">*</span></label>
                            <div className="relative">
                                <Stethoscope size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                                <select
                                    className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 appearance-none transition-all"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select Department</option>
                                    <option>General Medicine</option>
                                    <option>Cardiology</option>
                                    <option>Orthopedics</option>
                                    <option>Pediatrics</option>
                                    <option>Neurology</option>
                                </select>
                            </div>
                        </div>

                        {/* Doctor Select */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Doctor <span className="text-red-500 ml-1">*</span></label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                                <select
                                    className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 appearance-none transition-all"
                                    value={formData.doctor}
                                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select Doctor</option>
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.name}>{doc.name} ({doc.department || 'General'})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Date <span className="text-red-500 ml-1">*</span></label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 transition-all"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Time <span className="text-red-500 ml-1">*</span></label>
                            <input
                                type="time"
                                className="w-full px-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 transition-all"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Visit</label>
                        <textarea
                            rows="3"
                            placeholder="Brief description of symptoms or reason (Optional)"
                            className="w-full px-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 resize-none transition-all"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-brand-gradient hover:opacity-90 disabled:opacity-70 text-white rounded-xl font-bold shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span className="text-white">Processing...</span>
                            </>
                        ) : (
                            <>
                                Confirm Booking
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NurseBookAppointment;


