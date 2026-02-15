import { Shield, User, Heart, Stethoscope, Lock, Building2, Pill, FlaskConical } from 'lucide-react';

export const roleConfig = {
    patient: {
        title: 'Patient Portal',
        icon: Heart,
        color: 'from-blue-500 to-cyan-500',
        description: 'Access your health records and appointments',
        route: '/dashboard/patient'
    },
    receptionist: {
        title: 'Receptionist Portal',
        icon: User,
        color: 'from-blue-600 to-indigo-600',
        description: 'Manage appointments and patient registration',
        route: '/dashboard/receptionist'
    },
    nurse: {
        title: 'Nurse Portal',
        icon: Stethoscope,
        color: 'from-indigo-500 to-purple-500',
        description: 'Track patient vitals and care schedules',
        route: '/dashboard/nurse'
    },
    doctor: {
        title: 'Doctor Portal',
        icon: Stethoscope,
        color: 'from-blue-600 to-indigo-600',
        description: 'Manage appointments and patient records',
        route: '/dashboard/doctor'
    },
    pharmacy: {
        title: 'Pharmacy Portal',
        icon: Pill,
        color: 'from-emerald-600 to-green-600',
        description: 'Manage prescriptions and medication dispensing',
        route: '/dashboard/pharmacy'
    },
    laboratory: {
        title: 'Laboratory Portal',
        icon: FlaskConical,
        color: 'from-cyan-600 to-blue-600',
        description: 'Manage lab prescriptions and test reports',
        route: '/dashboard/laboratory'
    },
    institution: {
        title: 'Institution Portal',
        icon: Building2,
        color: 'from-slate-700 to-slate-900',
        description: 'Admin, Management & Super Admin Access',
        route: '/dashboard/admin'
    }
};
