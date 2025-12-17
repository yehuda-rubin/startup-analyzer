import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import useTheme from '../hooks/useTheme';

const AppLayout = ({ role, user }) => {
    const theme = useTheme(role);
    const isInvestor = role === 'investor';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 transition-colors duration-500 relative">
            {/* Premium Background System */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Base Gradient Layer */}
                <div className={`absolute inset-0 bg-gradient-to-br ${isInvestor
                        ? 'from-slate-950 via-emerald-950/30 to-slate-950'
                        : 'from-slate-950 via-indigo-950/30 to-slate-950'
                    }`}></div>

                {/* Primary Glow Orb */}
                <div className={`absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full blur-[120px] opacity-30 animate-pulse ${isInvestor ? 'bg-emerald-600/40' : 'bg-indigo-600/40'
                    }`} style={{ animationDuration: '8s' }}></div>

                {/* Secondary Glow Orb */}
                <div className={`absolute -bottom-40 -left-32 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 animate-pulse ${isInvestor ? 'bg-teal-600/30' : 'bg-purple-600/30'
                    }`} style={{ animationDuration: '12s', animationDelay: '2s' }}></div>

                {/* Accent Glow (Center) */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[180px] opacity-8 mix-blend-screen ${isInvestor ? 'bg-cyan-500/20' : 'bg-pink-500/20'
                    }`}></div>

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
            </div>

            {/* Navbar */}
            <Navbar user={user} role={role} />

            {/* Main Content */}
            <main className="relative z-10 w-full max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
                <Outlet context={{ theme, user, role }} />
            </main>
        </div>
    );
};

export default AppLayout;
