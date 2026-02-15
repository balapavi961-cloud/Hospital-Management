import React, { useState } from 'react';
import { User, Calendar, Clock, Stethoscope, CheckCircle, ArrowRight, Plus, MapPin } from 'lucide-react';
import FloatingInput from '../../components/ui/FloatingInput';

const BookAppointment = () => {
    const [view, setView] = useState('list'); // 'list', 'form', 'success'

    const [formData, setFormData] = useState({
        department: '',
        doctor: '',
        date: '',
        time: '',
        reason: ''
    });

    // Mock Data for Upcoming Appointments
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setView('success');
    };

    const resetForm = () => {
        setFormData({
            department: '',
            doctor: '',
            date: '',
            time: '',
            reason: ''
        });
        setView('list');
    };

    // View: Success Confirmation
    if (view === 'success') {
        return (
            <div className="max-w-xl mx-auto mt-20 p-8 glass-panel bg-white border border-slate-200 shadow-xl rounded-2xl text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Appointment Confirmed!</h2>
                <p className="text-slate-500 mb-8">
                    Your appointment has been successfully scheduled.
                </p>
                <button
                    onClick={resetForm}
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    Back to Appointments
                </button>
            </div>
        );
    }

    // View: Booking Form
    if (view === 'form') {
        return (
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => setView('list')}
                    className="mb-6 text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors"
                >
                    &larr; Back to List
                </button>

                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Book New Appointment</h1>
                    <p className="text-slate-500">Select your preferred doctor and time.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Department Select */}
                        <div className="relative">
                            <Stethoscope size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                            <select
                                className="w-full pl-10 pr-4 py-3.5 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 appearance-none"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            >
                                <option value="" disabled>Select Department</option>
                                <option>General Medicine</option>
                                <option>Cardiology</option>
                                <option>Orthopedics</option>
                                <option>Pediatrics</option>
                                <option>Neurology</option>
                            </select>
                        </div>

                        {/* Doctor Select */}
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                            <select
                                className="w-full pl-10 pr-4 py-3.5 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 appearance-none"
                                value={formData.doctor}
                                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                            >
                                <option value="" disabled>Select Doctor</option>
                                {/* Doctors will be fetched dynamically */}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full px-4 py-3.5 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                                <select
                                    className="w-full pl-10 pr-4 py-3.5 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 appearance-none"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                >
                                    <option value="" disabled>Select Time</option>
                                    {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
                                        '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
                                        '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'].map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="relative">
                            <textarea
                                rows="3"
                                placeholder="Reason for visit (Optional)"
                                className="w-full px-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 resize-none"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-brand-gradient hover:opacity-90 text-white rounded-lg font-bold shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2"
                        >
                            Confirm Booking
                            <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // View: Appointment List (Default)
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
                    <p className="text-slate-500">Manage and view your upcoming visits</p>
                </div>
                <button
                    onClick={() => setView('form')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient text-white rounded-xl shadow-lg shadow-accent/20 hover:opacity-90 transition-all"
                >
                    <Plus size={20} />
                    Book Appointment
                </button>
            </div>

            {/* Next Bookings List */}
            <div className="grid gap-6">
                {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center gap-6">
                        {/* Date Box */}
                        <div className="flex-shrink-0 w-full md:w-20 text-center bg-emerald-50 rounded-xl p-3 border border-blue-100">
                            <span className="block text-accent font-bold text-xl">{new Date(apt.date).getDate()}</span>
                            <span className="block text-accent/80 text-xs uppercase font-semibold">
                                {new Date(apt.date).toLocaleString('default', { month: 'short' })}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-bold text-slate-800">{apt.doctor}</h3>
                            <p className="text-accent text-sm font-medium mb-2">{apt.specialty}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Clock size={16} />
                                    {apt.time}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    {apt.location}
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-4 py-1.5 rounded-full text-sm font-medium border
                        ${apt.status === 'Confirmed'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'}
                    `}>
                            {apt.status}
                        </div>
                    </div>
                ))}

                {/* Empty State visual if needed (not shown since we have mock data) */}
            </div>
        </div>
    );
};

export default BookAppointment;


