import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarPlus,
    History,
    Settings,
    LogOut,
    Menu,
    Bell,
    User,
    Building2, // Hospital Icon
    Activity,
    Calendar, // Added Calendar
    CheckCircle,
    Pill,
    FlaskConical
} from 'lucide-react';

const DashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract role from path (e.g. /dashboard/patient -> patient)
    const role = location.pathname.split('/')[2] || 'patient';

    // Function to get display name based on role
    const getDisplayName = (userRole) => {
        const roleNames = {
            'nurse': 'Nurse User',
            'receptionist': 'Receptionist User',
            'doctor': 'Doctor User',
            'admin': 'Admin User',
            'institution': 'Institution Admin',
            'patient': 'Patient User',
            'pharmacy': 'Pharmacy User',
            'laboratory': 'Laboratory User'
        };
        return roleNames[userRole] || `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} User`;
    };

    // Get user from storage
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        const currentRole = storedUser ? JSON.parse(storedUser).role : role;

        // Always use role-based display name
        return {
            name: getDisplayName(currentRole || role),
            role: currentRole || role
        };
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Sync user role with current portal
    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        const currentRole = role;

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            // If stored role doesn't match current portal, update it
            if (parsedUser.role !== currentRole) {
                const updatedUser = {
                    ...parsedUser,
                    role: currentRole,
                    name: getDisplayName(currentRole)
                };

                // Update storage
                if (localStorage.getItem('user')) {
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                } else {
                    sessionStorage.setItem('user', JSON.stringify(updatedUser));
                }

                // Update state
                setUser(updatedUser);
            }
        }
    }, [role]); // Re-run when role (URL) changes

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Todo: Move to config/nav.js later if it grows
    const navItems = {
        patient: [
            { icon: LayoutDashboard, label: 'Overview', path: `/dashboard/patient` },
            { icon: CalendarPlus, label: 'Book Appointment', path: `/dashboard/patient/book` },
        ],
        nurse: [
            { icon: CalendarPlus, label: 'Appointments', path: `/dashboard/nurse/appointments` },
            { icon: Calendar, label: 'Book Appointment', path: `/dashboard/nurse/book` },

        ],
        receptionist: [
            { icon: CalendarPlus, label: 'Front Desk', path: `/dashboard/receptionist/appointments` },
            { icon: Calendar, label: 'Book Appointment', path: `/dashboard/receptionist/book` },
            { icon: History, label: 'Daily Log', path: `/dashboard/receptionist/log` },
        ],
        admin: [
            { icon: LayoutDashboard, label: 'Dashboard', path: `/dashboard/admin` },
            { icon: User, label: 'Staff', path: `/dashboard/admin/staff` },
            { icon: Building2, label: 'Departments', path: `/dashboard/admin/departments` },
        ],
        doctor: [
            { icon: LayoutDashboard, label: 'Dashboard', path: `/dashboard/doctor` },
            { icon: CalendarPlus, label: 'My Schedule', path: `/dashboard/doctor/appointments` },
            { icon: CheckCircle, label: 'Completed', path: `/dashboard/doctor/completed` },
            { icon: User, label: 'Referrals', path: `/dashboard/doctor/referrals` },
        ],
        pharmacy: [
            { icon: LayoutDashboard, label: 'Dashboard', path: `/dashboard/pharmacy` },
            { icon: Pill, label: 'Prescriptions', path: `/dashboard/pharmacy/prescriptions` },
        ],
        laboratory: [
            { icon: LayoutDashboard, label: 'Dashboard', path: `/dashboard/laboratory` },
            { icon: FlaskConical, label: 'Prescriptions', path: `/dashboard/laboratory/prescriptions` },
        ],
        // Add other roles later
    };

    const currentNav = navItems[role] || navItems.patient;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 text-white transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        bg-gradient-to-br from-slate-800 to-slate-900
      `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <LayoutDashboard size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">MedCare<span className="text-emerald-400">+</span></h1>
                                <p className="text-xs text-slate-400">Hospital Management</p>
                            </div>
                        </div>
                    </div>

                    <nav className="p-6 space-y-2 flex-1">
                        {currentNav.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end // Force exact match so Overview isn't active when on sub-pages
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                    ${isActive
                                        ? 'bg-accent text-white shadow-sm ring-1 ring-accent/20'
                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                                `}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>


                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-40">
                    <button
                        className="md:hidden p-2 text-text-muted"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="ml-auto flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-accent transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false); // Close mobile menu if open
                                    setIsUserMenuOpen(!isUserMenuOpen);
                                }}
                                className="flex items-center gap-3 focus:outline-none"
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-gradient p-[2px]">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                        <User size={20} className="text-accent" />
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-semibold text-slate-700">{user.name}</p>
                                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                                </div>
                            </button>

                            {/* User Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-slate-50 sm:hidden">
                                        <p className="text-sm font-semibold text-slate-700">User</p>
                                    </div>

                                    {role !== 'nurse' && role !== 'receptionist' && (
                                        <button
                                            onClick={() => {
                                                navigate(`/ dashboard / ${role} / profile`);
                                                setIsUserMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-accent transition-colors"
                                        >
                                            <User size={16} />
                                            My Profile
                                        </button>
                                    )}

                                    <button
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-accent transition-colors"
                                    >
                                        <Settings size={16} />
                                        Settings
                                    </button>

                                    <div className="h-px bg-slate-100 my-1" />

                                    <button
                                        onClick={() => navigate('/login/patient')}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div >

            {/* Mobile Overlay */}
            {
                isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )
            }
        </div >
    );
};

export default DashboardLayout;


