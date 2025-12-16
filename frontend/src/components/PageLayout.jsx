import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { getUserProfile } from '../services/api';
import useTheme from '../hooks/useTheme';

const PageLayout = ({ children, title, subtitle, action }) => {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            if (auth.currentUser) {
                try {
                    const profile = await getUserProfile();
                    setRole(profile.role);
                } catch (error) {
                    console.error("Failed to fetch role", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchRole();
    }, []);

    const theme = useTheme(role);

    return (
        <div className={`min-h-[calc(100vh-64px)] w-full transition-colors duration-500 bg-slate-950 text-slate-200 relative overflow-hidden pt-16`}>

            {/* 1. Enhanced Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Primary Glow */}
                <div className={`absolute -top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full blur-[120px] opacity-[0.15] mix-blend-screen animate-pulse ${
                    role === 'investor' ? 'bg-emerald-600' : 'bg-indigo-600'
                }`}></div>
                
                {/* Secondary Glow */}
                <div className={`absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-[0.1] mix-blend-screen animate-pulse animation-delay-2000 ${
                    role === 'investor' ? 'bg-teal-600' : 'bg-purple-600'
                }`}></div>
                
                {/* Tertiary Glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.05] mix-blend-screen animate-pulse animation-delay-4000 ${
                    role === 'investor' ? 'bg-cyan-600' : 'bg-pink-600'
                }`}></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
            </div>

            {/* 2. Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* 3. Enhanced Header */}
                {(title || action) && (
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/5 animate-in fade-in slide-in-bottom">
                        <div className="space-y-3">
                            {title && (
                                <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {action && (
                            <div className="flex-shrink-0 animate-in fade-in slide-in-bottom animation-delay-200">
                                {action}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. Children (The Page Content) */}
                <div className="animate-in fade-in slide-in-bottom duration-700">
                    {typeof children === 'function' ? children({ theme, role, loading }) : children}
                </div>
            </div>
        </div>
    );
};

export default PageLayout;
