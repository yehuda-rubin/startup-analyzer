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
        <div className="min-h-[calc(100vh-64px)] w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 relative overflow-hidden pt-16">
            {/* Modern Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Animated Gradient Orbs */}
                <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${
                    role === 'investor' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`} style={{ animationDuration: '4s' }}></div>
                <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 animate-pulse ${
                    role === 'investor' ? 'bg-teal-500' : 'bg-purple-500'
                }`} style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
                
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
                
                {/* Radial Gradient Overlay */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/50 to-slate-950"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                {(title || action) && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                        <div className="space-y-2">
                            {title && (
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-sm md:text-base text-slate-400 max-w-2xl">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        {action && (
                            <div className="flex-shrink-0">
                                {action}
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                <div>
                    {typeof children === 'function' ? children({ theme, role, loading }) : children}
                </div>
            </div>
        </div>
    );
};

export default PageLayout;
