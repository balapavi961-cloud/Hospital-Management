import React, { useState } from 'react';
import { User, Phone, MapPin, Calendar, Mail, Save, Camera } from 'lucide-react';
import FloatingInput from '../../components/ui/FloatingInput';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user] = useState(JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user')) || {});

    const [formData, setFormData] = useState({
        firstName: user.name ? user.name.split(' ')[0] : 'John',
        lastName: user.name ? user.name.split(' ')[1] || '' : 'Doe',
        email: user.email || 'john.doe@example.com',
        phone: user.mobile || '9876543210',
        dob: '1992-05-15',
        gender: 'Male',
        address: '123 Health Street, Medicity',
        bloodGroup: 'O+'
    });

    const handleSave = () => {
        setIsEditing(false);
        // TODO: API call to update profile
        console.log('Profile Updated', formData);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
                    <p className="text-slate-500">Manage your personal information</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full md:w-auto px-6 py-2 bg-brand-gradient text-white rounded-lg hover:opacity-90 transition"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 md:flex-none px-6 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-brand-gradient text-white rounded-lg hover:opacity-90 transition"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Avatar & Quick Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-brand-gradient" />

                        <div className="relative mt-8 mb-4">
                            <div className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-lg bg-slate-200 flex items-center justify-center text-slate-400">
                                <User size={40} />
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-0 right-1/2 translate-x-12 p-2 bg-white rounded-full shadow-md hover:text-accent">
                                    <Camera size={16} />
                                </button>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-slate-800">{formData.firstName} {formData.lastName}</h2>
                        <p className="text-slate-500 text-sm mb-4">Patient ID: #PAT-8829</p>

                        <div className="flex justify-center gap-2">
                            <span className="px-3 py-1 bg-emerald-50 text-accent rounded-full text-xs font-semibold">{formData.bloodGroup}</span>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">Active</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-6">Personal Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FloatingInput
                                id="fname" label="First Name" value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                disabled={!isEditing}
                                icon={User}
                                className="bg-slate-50 border-slate-200 text-slate-800"
                            />
                            <FloatingInput
                                id="lname" label="Last Name" value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                disabled={!isEditing}
                                icon={User}
                                className="bg-slate-50 border-slate-200 text-slate-800"
                            />
                            <FloatingInput
                                id="email" label="Email Address" value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={!isEditing}
                                icon={Mail}
                                className="bg-slate-50 border-slate-200 text-slate-800"
                            />
                            <FloatingInput
                                id="phone" label="Phone Number" value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                disabled={!isEditing}
                                icon={Phone}
                                className="bg-slate-50 border-slate-200 text-slate-800"
                            />
                            <FloatingInput
                                id="dob" label="Date of Birth" type="date" value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                disabled={!isEditing}
                                icon={Calendar}
                                className="bg-slate-50 border-slate-200 text-slate-800"
                            />
                            <FloatingInput
                                id="address" label="Address" value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                disabled={!isEditing}
                                icon={MapPin}
                                className="bg-slate-50 border-slate-200 text-slate-800"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;


