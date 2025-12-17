import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

// Icons Object (Explicit Sizing to 20px)
const Icons = {
    Logo: ({ className }) => <svg width="24" height="24" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
    Dashboard: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>,
    Upload: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    Analysis: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    Settings: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    LogOut: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    ChevronLeft: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
    ChevronRight: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
};

const Sidebar = ({ isExpanded, setIsExpanded, role }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.signOut();
        navigate('/login');
    };

    const isInvestor = role === 'investor';
    const accentColor = isInvestor ? 'text-emerald-500' : 'text-indigo-500';
    const bgActive = isInvestor ? 'bg-emerald-500/10' : 'bg-indigo-500/10';
    const borderActive = isInvestor ? 'border-emerald-500' : 'border-indigo-500';

    const links = [
        { path: '/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
        ...(role === 'entrepreneur' ? [{ path: '/upload', label: 'New Project', icon: Icons.Upload }] : []),
        { path: '/analysis', label: 'Analysis', icon: Icons.Analysis },
    ];

    return (
        <aside
            className={`
                relative h-screen bg-slate-900/50 backdrop-blur-xl border-r border-white/5 
                transition-all duration-300 ease-in-out flex flex-col z-50
                ${isExpanded ? 'w-64' : 'w-20'}
            `}
        >
            {/* Header / Logo */}
            <div className={`flex items-center h-20 px-6 border-b border-white/5 ${isExpanded ? 'justify-start gap-3' : 'justify-center'}`}>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${isInvestor ? 'from-emerald-600 to-teal-600' : 'from-indigo-600 to-purple-600'} shadow-lg shadow-black/20`}>
                    <Icons.Logo className="text-white" />
                </div>
                {isExpanded && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <h1 className="font-bold text-white text-lg tracking-tight leading-none">Startup</h1>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${accentColor}`}>Analyzer</span>
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`
                                flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative
                                ${isActive ? `${bgActive} text-white` : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                ${!isExpanded && 'justify-center'}
                            `}
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${isInvestor ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                            )}

                            <link.icon className={`transition-transform group-hover:scale-110 ${isActive ? accentColor : ''}`} />

                            {isExpanded && (
                                <span className="ml-3 font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                                    {link.label}
                                </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {!isExpanded && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10">
                                    {link.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Footer / Toggle & Logout */}
            <div className="p-4 border-t border-white/5 space-y-2">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                    {isExpanded ? <Icons.ChevronLeft /> : <Icons.ChevronRight />}
                </button>

                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors
                        ${!isExpanded && 'justify-center'}
                    `}
                    title="Sign Out"
                >
                    <Icons.LogOut />
                    {isExpanded && <span className="ml-3 font-medium text-sm">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
