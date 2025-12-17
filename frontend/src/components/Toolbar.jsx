import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

// Explicitly Sized 24x24 Icons
const Icons = {
    Logo: ({ className }) => <svg width="24" height="24" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,

    // Actions
    NewDoc: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>,
    Search: ({ className }) => <svg width="18" height="18" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    Settings: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    LogOut: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,

    // Nav Items
    Dashboard: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>,
    Upload: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    Analysis: ({ className }) => <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
};

const Toolbar = ({ theme, user, role }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.signOut();
        navigate('/login');
    };

    const links = [
        { path: '/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
        ...(role === 'entrepreneur' ? [{ path: '/upload', label: 'New Project', icon: Icons.Upload }] : []),
        { path: '/analysis', label: 'Analysis', icon: Icons.Analysis },
    ];

    return (
        <nav className="sticky top-0 z-50 transition-all duration-300">
            {/* The Gradient + Glass Background Request */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/80 backdrop-blur-xl border-b border-indigo-100 shadow-sm opacity-95"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Left: Brand & Search */}
                    <div className="flex items-center gap-6 md:gap-8">
                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="relative p-2 rounded-xl bg-white shadow-sm ring-1 ring-indigo-50 transition-transform group-hover:scale-105">
                                <Icons.Logo className={`text-indigo-600`} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-800 tracking-tight">Startup<span className="text-indigo-600">Analyzer</span></h1>
                            </div>
                        </Link>

                        {/* Search Bar */}
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/60 border border-indigo-100 rounded-full focus-within:ring-2 focus-within:ring-indigo-200 transition-all w-64 shadow-sm">
                            <Icons.Search className="text-indigo-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none text-sm text-slate-700 placeholder-slate-400 focus:outline-none w-full"
                            />
                        </div>
                    </div>

                    {/* Center: Main Navigation (Horizontal) */}
                    <div className="hidden md:flex items-center gap-2 bg-white/40 p-1.5 rounded-2xl border border-white/50 backdrop-blur-md shadow-sm">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-white text-indigo-900 shadow-sm ring-1 ring-black/5'
                                            : 'text-slate-600 hover:text-indigo-700 hover:bg-white/50'
                                        }`}
                                >
                                    <link.icon className={isActive ? 'text-indigo-600' : 'opacity-70'} />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right: Actions & Profile */}
                    <div className="flex items-center gap-3">
                        {/* Action Icons Group */}
                        <div className="hidden sm:flex items-center gap-2 border-r border-indigo-200/50 pr-4 mr-1">
                            {role === 'entrepreneur' && (
                                <Link to="/upload" className="w-10 h-10 flex items-center justify-center rounded-full text-indigo-700 bg-white/40 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-indigo-100" title="New Project">
                                    <Icons.NewDoc />
                                </Link>
                            )}
                            <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-indigo-700 bg-white/40 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-indigo-100" title="Settings">
                                <Icons.Settings />
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md ring-2 ring-white ${role === 'investor'
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                    : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                                }`}>
                                <span className="text-sm font-bold">{user?.email?.[0].toUpperCase()}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <Icons.LogOut />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Toolbar;
