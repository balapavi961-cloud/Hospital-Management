import React, { useState, useEffect } from 'react';
import { User, Plus, Search, Filter, MoreVertical, Mail, Phone, Shield, ArrowLeft, MapPin, Calendar, Clock, CheckCircle, Stethoscope, ArrowRight, Trash2, Edit2 } from 'lucide-react';
import { LOCATION_DATA } from '../../data/locationData';
import { staffService } from '../../services/staffService';

const StaffManager = () => {
    const [view, setView] = useState('list'); // 'list', 'form', 'success'
    const [activeTab, setActiveTab] = useState('doctors'); // doctors, nurses, receptionists, admins
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const getRoleFromTab = (tab) => {
        const map = {
            'doctors': 'Doctor',
            'nurses': 'Nurse',
            'receptionists': 'Receptionist',
            'admins': 'Admin',
            'lab': 'Lab Technician',
            'pharmacists': 'Pharmacist'
        };
        return map[tab] || 'Staff';
    };

    const tabs = [
        { id: 'doctors', label: 'Doctors' },
        { id: 'nurses', label: 'Nurses' },
        { id: 'receptionists', label: 'Receptionists' },
        { id: 'admins', label: 'Admins' },
        { id: 'lab', label: 'Lab Technicians' },
        { id: 'pharmacists', label: 'Pharmacists' },
    ];

    // Fetch Staff
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const role = getRoleFromTab(activeTab);
            const data = await staffService.getAllStaff(role);
            setStaffList(data);
        } catch (error) {
            console.error("Failed to fetch staff:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'list') {
            fetchStaff();
        }
    }, [activeTab, view]);

    // Form State
    const [formData, setFormData] = useState({
        staffName: '',
        age: '',
        contactNumber: '',
        place: '',
        state: '',
        district: '',
        thaluk: '',
        department: '',
        joiningDate: '',
        shift: '',
        email: '',
        password: ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.staffName,
                role: getRoleFromTab(activeTab),
                department: formData.department,
                age: formData.age,
                contactNumber: formData.contactNumber,
                email: formData.email,
                place: formData.place,
                state: formData.state,
                district: formData.district,
                thaluk: formData.thaluk,
                joiningDate: formData.joiningDate,
                shift: formData.shift,
                password: formData.password
            };

            if (editingId) {
                await staffService.updateStaff(editingId, payload);
            } else {
                await staffService.addStaff(payload);
            }

            setView('success');
        } catch (error) {
            console.error("Failed to save staff:", error);
            alert("Failed to save staff. Please try again.");
        }
    };

    const handleEdit = (staff) => {
        setEditingId(staff.id);
        const [year, month, day] = new Date(staff.joining_date).toISOString().split('T')[0].split('-');

        setFormData({
            staffName: staff.name,
            age: staff.age,
            contactNumber: staff.contact_number,
            place: staff.place,
            state: staff.state,
            district: staff.district,
            thaluk: staff.thaluk,
            department: staff.department,
            joiningDate: `${year}-${month}-${day}`,
            shift: staff.shift_time,
            email: staff.email,
            password: '' // Security: Don't show password
        });
        setView('form');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await staffService.deleteStaff(id);
                fetchStaff(); // Refresh list
            } catch (error) {
                console.error("Failed to delete staff:", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            staffName: '',
            age: '',
            contactNumber: '',
            place: '',
            state: '',
            district: '',
            thaluk: '',
            department: '',
            joiningDate: '',
            shift: '',
            email: '',
            password: ''
        });
        setEditingId(null);
        setView('list');
    };

    // Auto-redirect after 1 second when in success view
    useEffect(() => {
        if (view === 'success') {
            const timer = setTimeout(() => {
                resetForm();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [view]);

    // VIEW: Success
    if (view === 'success') {
        return (
            <div className="max-w-xl mx-auto mt-20 p-8 glass-panel bg-white border border-slate-200 shadow-xl rounded-2xl text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Staff {editingId ? 'Updated' : 'Added'}!</h2>
                <p className="text-slate-500 mb-8">
                    {formData.staffName} has been successfully {editingId ? 'updated' : 'added to the system'}.
                </p>
            </div>
        );
    }

    // VIEW: Form
    if (view === 'form') {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => setView('list')}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{editingId ? 'Edit Staff' : 'Add New Staff'}</h1>
                        <p className="text-slate-500">{editingId ? 'Update details' : 'Enter details'} for {activeTab === 'lab' ? 'Lab Technician' : activeTab === 'pharmacists' ? 'Pharmacist' : activeTab.slice(0, -1)}</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Staff Name Input */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Staff Name <span className="text-red-500 ml-1">*</span></label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Enter full name"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 transition-all"
                                        value={formData.staffName}
                                        onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Age Input */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Age <span className="text-red-500 ml-1">*</span></label>
                                <input
                                    type="number"
                                    placeholder="Age"
                                    className="w-full px-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 transition-all"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    required
                                    min="18"
                                    max="100"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email Input */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email <span className="text-red-500 ml-1">*</span></label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Password <span className="text-red-500 ml-1">{editingId ? '' : '*'}</span></label>
                                <div className="relative">
                                    <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder={editingId ? "Reset Password (Optional)" : "Set Password"}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 transition-all"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingId}
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
                                        <option>Administration</option>
                                        <option>Nursing</option>
                                        <option>Laboratory</option>
                                        <option>Pharmacy</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Joining <span className="text-red-500 ml-1">*</span></label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 transition-all"
                                        value={formData.joiningDate}
                                        onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Shift Time <span className="text-red-500 ml-1">*</span></label>
                                <div className="relative">
                                    <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                                    <select
                                        className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 appearance-none transition-all"
                                        value={formData.shift}
                                        onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Select Shift</option>
                                        <option>Morning (08:00 AM - 04:00 PM)</option>
                                        <option>Evening (04:00 PM - 12:00 AM)</option>
                                        <option>Night (12:00 AM - 08:00 AM)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-accent hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 mt-6"
                        >
                            {editingId ? 'Update Staff Member' : 'Add Staff Member'}
                            <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // VIEW: List
    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
                    <p className="text-slate-500">Manage doctors, nurses, and hospital staff</p>
                </div>
                <button
                    onClick={() => setView('form')}
                    className="w-full md:w-auto bg-accent hover:bg-accent text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-accent/20"
                >
                    <Plus size={20} />
                    Add New {activeTab === 'lab' ? 'Lab Technician' : activeTab === 'pharmacists' ? 'Pharmacist' : activeTab.slice(0, -1).replace(/^\w/, c => c.toUpperCase())}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-200 mb-8 gap-6 no-scrollbar pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {/* Count logic would need separate aggregate query, skipping for now or filtering client side if we fetched all */}
                            {/* {tab.count} */}
                        </span>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search staff..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 flex items-center justify-center gap-2">
                        <Filter size={18} />
                        Filter
                    </button>
                    {/* Mobile Only Add Button if needed below, usually top button suffices but let's keep search clean */}
                </div>
            </div>

            {/* Staff List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {staffList.map((staff) => (
                                <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                                                {staff.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{staff.name}</p>
                                                <p className="text-xs text-slate-500">ID: #{staff.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{staff.department || staff.role}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Mail size={12} /> {staff.email || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Phone size={12} /> {staff.contact_number}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${staff.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-blue-100' :
                                            'bg-amber-50 text-amber-700 border border-amber-100'
                                            }`}>
                                            {staff.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(staff)}
                                                className="p-2 text-slate-400 hover:text-accent hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(staff.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StaffManager;


