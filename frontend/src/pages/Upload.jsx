import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { createStartup, parsePitchDeck } from '../services/api';

const Upload = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

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
      setFileName(e.target.files[0].name);
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
    <AppLayout title="New Project" subtitle="Configure analysis parameters and upload materials.">
      {({ theme, role }) => (
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* 1. General Settings Panel */}
            <div className="bg-slate-900 rounded-lg border border-white/5 p-6 space-y-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                Project Overview
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">Project Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full h-10 bg-slate-950 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all placeholder:text-slate-600"
                    placeholder="e.g. Acme Intelligence"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Industry</label>
                    <input
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full h-10 bg-slate-950 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all placeholder:text-slate-600"
                      placeholder="e.g. Fintech"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Stage</label>
                    <select
                      name="stage"
                      value={formData.stage}
                      onChange={handleChange}
                      className="w-full h-10 bg-slate-950 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
                    >
                      <option>Pre-Seed</option>
                      <option>Seed</option>
                      <option>Series A</option>
                      <option>Series B</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-slate-950 border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all placeholder:text-slate-600 resize-none"
                    placeholder="Brief summary of the startup..."
                  />
                </div>
              </div>
            </div>

            {/* 2. File Upload Panel */}
            <div className="bg-slate-900 rounded-lg border border-white/5 p-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                Materials
              </h3>

              <div className="relative group">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.ppt,.pptx"
                />
                <label
                  htmlFor="file-upload"
                  className={`
                                        flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all
                                        ${formData.file
                      ? `bg-slate-900 border-${theme.primary}-500/50`
                      : 'bg-slate-950/30 border-slate-700 hover:border-slate-500 hover:bg-slate-950/50'
                    }
                                    `}
                >
                  {formData.file ? (
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded bg-${theme.primary}-500/10 text-${theme.primary}-400`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{fileName}</p>
                        <p className="text-xs text-slate-500">Ready to upload</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-slate-400 font-medium">Click to upload Pitch Deck</p>
                      <p className="text-xs text-slate-600 mt-1">PDF or PPTX (Max 20MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`
                                    px-6 py-2 rounded-md text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                                    ${role === 'investor' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}
                                `}
              >
                {loading ? 'Processing...' : 'Create Project'}
              </button>
            </div>

          </form>
        </div>
      )}
    </AppLayout>
  );
};

export default Upload;