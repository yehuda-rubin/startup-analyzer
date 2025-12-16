import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { createStartup, parsePitchDeck } from '../services/api';

// Inline SVGs
const Icons = {
  UploadIcon: ({ size = 24, className = "" }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>,
  FileText: ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Briefcase: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
};

const Upload = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    stage: 'Seed',
    file: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startupData = {
        name: formData.name,
        description: formData.description,
        industry: formData.industry,
        stage: formData.stage
      };

      const newStartup = await createStartup(startupData);

      if (formData.file && newStartup.id) {
        const formDataObj = new FormData();
        formDataObj.append('file', formData.file);
        await parsePitchDeck(newStartup.id, formDataObj);
      }

      navigate('/dashboard');
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="New Project" subtitle="Create a new workspace for startup analysis.">
      {({ theme, role }) => (
        <div className="flex justify-center pb-20">

          {/* Centered Form Container with Glow */}
          <div className="relative w-full max-w-3xl">
            {/* Glow effect under the card */}
            <div className={`absolute -inset-1 rounded-3xl opacity-20 blur-xl ${role === 'investor' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>

            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">

              <form onSubmit={handleSubmit} className="space-y-10">

                {/* Section 1: Basic Info */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${theme.iconBg} ${theme.iconColor}`}>
                      <Icons.Briefcase size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Project Essentials</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Project Name</label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={`w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 outline-none transition-all ${theme.inputFocus} hover:border-slate-600`}
                        placeholder="e.g. Acme AI"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Industry</label>
                      <input
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className={`w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 outline-none transition-all ${theme.inputFocus} hover:border-slate-600`}
                        placeholder="e.g. Fintech"
                      />
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className={`w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 outline-none transition-all ${theme.inputFocus} hover:border-slate-600 resize-none`}
                      placeholder="What does this startup do? (Brief summary)"
                    />
                  </div>
                </div>

                <div className="h-px w-full bg-slate-800/50"></div>

                {/* Section 2: Files */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${theme.iconBg} ${theme.iconColor}`}>
                      <Icons.UploadIcon size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Pitch Deck</h3>
                  </div>

                  <div className={`group relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${formData.file ? 'border-transparent bg-slate-900' : 'border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/30'}`}>

                    {/* Active Border Gradient when file uploaded */}
                    {formData.file && (
                      <div className={`absolute inset-0 rounded-2xl opacity-20 ${role === 'investor' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                    )}

                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.ppt,.pptx"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block relative z-10">
                      {formData.file ? (
                        <div className="flex flex-col items-center animate-in zoom-in duration-300">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${theme.buttonPrimary}`}>
                            <Icons.FileText size={32} />
                          </div>
                          <p className="text-lg font-bold text-white">{formData.file.name}</p>
                          <p className="text-sm text-slate-400 mt-1">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                          <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-950/50 text-xs font-medium text-slate-300">
                            Click to change
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center mb-4 text-slate-400 group-hover:scale-110 transition-transform duration-300 group-hover:text-white group-hover:border-slate-600">
                            <Icons.UploadIcon size={32} />
                          </div>
                          <p className="text-lg font-medium text-white">Drop your pitch deck here</p>
                          <p className="text-sm text-slate-500 mt-2">Supports PDF, PPTX (Max 20MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 flex items-center justify-between border-t border-slate-800/50">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-10 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 ${theme.buttonPrimary} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : 'Create & Analyze'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Upload;