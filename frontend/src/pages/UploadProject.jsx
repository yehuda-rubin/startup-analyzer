import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

// Inline Icons
const Icons = {
    UploadCloud: ({ className, size = 24 }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></svg>,
    Save: ({ className, size = 18 }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg>,
    FileText: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    CheckCircle: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
};

const UploadProject = () => {
    const { theme } = useOutletContext();
    const [dragging, setDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        // Handle file drop logic here
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Launch New Project</h1>
                    <p className="text-slate-500 mt-2 text-lg">Provide details about your startup to generate comprehensive insights.</p>
                </div>

                <div className={theme.card + ' p-8'}>
                    <form className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Startup Name</label>
                                <input type="text" placeholder="e.g. Nexus AI" className={theme.input} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">One-Liner Pitch</label>
                                <input type="text" placeholder="Revolutionizing data analytics with..." className={theme.input} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Detailed Description</label>
                                <textarea rows="5" placeholder="Describe the problem, solution, and market..." className={theme.input + ' resize-none'}></textarea>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200">
                            <label className="block text-sm font-medium text-slate-700 mb-4">Pitch Deck / Business Plan</label>
                            <div
                                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${dragging
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-indigo-500">
                                    <Icons.UploadCloud size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-slate-800">Upload your Pitch Deck</h3>
                                <p className="text-slate-500 text-sm mt-1">Drag and drop or click to browse</p>
                                <p className="text-slate-400 text-xs mt-4 uppercase tracking-wide">PDF, PPTX up to 25MB</p>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button type="button" className={theme.buttonPrimary}>
                                <div className="flex items-center gap-2">
                                    <Icons.Save size={18} />
                                    <span>Analyze Project</span>
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Tips & Info (Desktop Only) */}
            <div className="hidden lg:block space-y-6">
                <div className={`${theme.glassPanel} rounded-2xl p-6`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Icons.FileText className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-slate-900">What we analyze</h3>
                    </div>
                    <ul className="space-y-4">
                        {[
                            'Problem & Soluiton Fit',
                            'Market Size & Potential',
                            'Business Model Viability',
                            'Competitor Analysis'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-sm text-slate-600">
                                <Icons.CheckCircle className="w-4 h-4 text-emerald-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-lg shadow-indigo-500/20 text-white">
                    <h3 className="font-bold mb-2 text-white">Pro Tip</h3>
                    <p className="text-sm text-indigo-100 leading-relaxed">
                        Ensure your pitch deck clearly defines your "Secret Sauce". Our AI looks for unique value propositions that stand out from competitors.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UploadProject;
