import React from 'react';
import { useParams } from 'react-router-dom';
import { roleConfig } from '../config/roles';

const Dashboard = () => {
    const { role } = useParams();
    const config = roleConfig[role];

    if (!config) {
        return <div className="p-8 text-center text-red-400">Invalid Role Access</div>;
    }

    return (
        <div className="min-h-screen bg-bg-dark text-text-main p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 p-6 glass-panel flex items-center gap-4">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${config.color}`}>
                        <config.icon size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold capitalize">{role} Dashboard</h1>
                        <p className="text-text-muted">Welcome back to your portal</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Placeholder Content Area */}
                    <div className="glass-panel p-6 h-64 md:col-span-2 flex items-center justify-center border-dashed border-2 border-glass-border">
                        <span className="text-text-muted">Main Content Area</span>
                    </div>

                    <div className="glass-panel p-6 h-64 flex items-center justify-center border-dashed border-2 border-glass-border">
                        <span className="text-text-muted">Sidebar / Stats</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;


