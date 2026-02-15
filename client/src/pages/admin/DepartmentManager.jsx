import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, ArrowLeft, CheckCircle, ArrowRight, User, MapPin, FileText } from 'lucide-react';

const DepartmentManager = () => {
    const [view, setView] = useState('list'); // 'list', 'form', 'success'

    const [editingId, setEditingId] = useState(null);

    // Form data state
    const [formData, setFormData] = useState({
        name: '',
        head: '',
        location: '',
        description: ''
    });

    const resetForm = () => {
        setFormData({
            name: '',
            head: '',
            location: '',
            description: ''
        });
        setEditingId(null);
        setView('list');
    };

    const handleEdit = (dept) => {
        setEditingId(dept.id);
        setFormData({
            name: dept.name,
            head: dept.head || '',
            location: dept.location || '',
            description: dept.description || ''
        });
        setView('form');
    };


    // Auto-redirect from success
    React.useEffect(() => {
        if (view === 'success') {
            const timer = setTimeout(() => {
                resetForm();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [view]);


    // State for departments list
    const [departments, setDepartments] = useState([]);

    // Fetch Departments
    const fetchDepartments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/departments');
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    React.useEffect(() => {
        fetchDepartments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingId
                ? `http://localhost:5000/api/departments/${editingId}`
                : 'http://localhost:5000/api/departments';

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setView('success');
                fetchDepartments(); // Refresh list
            }
        } catch (error) {
            console.error('Error saving department:', error);
        }
    };

    // VIEW: Success
    if (view === 'success') {
        return (
            <div className="max-w-xl mx-auto mt-20 p-8 glass-panel bg-white border border-slate-200 shadow-xl rounded-2xl text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Department {editingId ? 'Updated' : 'Added'}!</h2>
                <p className="text-slate-500 mb-8">
                    The department has been successfully {editingId ? 'updated' : 'configured'}.
                </p>
            </div>
        );
    }

    // VIEW: Form
    if (view === 'form') {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => setView('list')}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{editingId ? 'Edit Department' : 'Add New Department'}</h1>
                        <p className="text-slate-500">{editingId ? 'Update department details' : 'Configure a new hospital department'}</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Department Name */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Department Name <span className="text-red-500 ml-1">*</span></label>
                            <div className="relative">
                                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="e.g. Cardiology"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Head of Department */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Head of Department <span className="text-red-500 ml-1">*</span></label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="e.g. Dr. Sarah Smith"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 transition-all"
                                    value={formData.head}
                                    onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Location <span className="text-red-500 ml-1">*</span></label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="e.g. Block A, 2nd Floor"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 transition-all"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                            <div className="relative">
                                <FileText size={18} className="absolute left-3 top-3.5 text-slate-400 z-10 pointer-events-none" />
                                <textarea
                                    rows="3"
                                    placeholder="Brief description of the department functions..."
                                    className="w-full pl-10 pr-4 py-3 rounded-lg outline-none border bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-500 resize-none transition-all"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-accent hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2"
                        >
                            {editingId ? 'Update Department' : 'Create Department'}
                            <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // VIEW: List
    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
                    <p className="text-slate-500">Configure hospital departments and specialties</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setView('form');
                    }}
                    className="w-full md:w-auto bg-accent hover:bg-accent text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-accent/20"
                >
                    <Plus size={20} />
                    Add Department
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {departments.map((dept) => (
                    <div key={dept.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 text-blue-600 rounded-lg">
                                <Building2 size={24} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(dept)}
                                    className="p-2 text-slate-400 hover:text-accent hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-1">{dept.name}</h3>
                        <p className="text-sm text-slate-500 mb-4">{dept.location}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div>
                                <p className="text-xs text-slate-400">Head of Dept.</p>
                                <p className="text-sm font-medium text-slate-700">{dept.head}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Total Staff</p>
                                <p className="text-sm font-medium text-slate-700">{dept.staffCount} Members</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DepartmentManager;


