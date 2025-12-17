import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';

const Icons = {
  Plus: ({ className, size = 18 }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  TrendingUp: ({ className, size = 18 }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Users: ({ className, size = 18 }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Eye: ({ className, size = 18 }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  ArrowRight: ({ className, size = 16 }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Rocket: ({ className, size = 18 }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.94 5.25-2.48 7.9A22.84 22.84 0 0 1 15 12z" />
      <path d="M9 9 3 21" /><path d="M15 9l6 12" />
    </svg>
  ),
  Briefcase: ({ className, size = 18 }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
};

const Dashboard = () => {
  const { user, role } = useOutletContext();
  const isInvestor = role === 'investor';

  const stats = [
    { label: 'Total Interactions', value: '1,284', trend: '+12.5%', icon: Icons.Eye },
    { label: 'Active Projects', value: '42', trend: '+5.2%', icon: isInvestor ? Icons.Briefcase : Icons.Rocket },
    { label: 'Growth Score', value: '8.4', trend: '+0.8', icon: Icons.TrendingUp },
  ];

  const projects = [
    { id: 1, name: 'EcoSmart', category: 'Cleantech', status: 'Analysis Ready', date: '2 hrs ago' },
    { id: 2, name: 'FinFlow', category: 'Fintech', status: 'Pending', date: '1 day ago' },
    { id: 3, name: 'MediCare AI', category: 'Healthtech', status: 'Completed', date: '3 days ago' },
    { id: 4, name: 'Urban Grow', category: 'AgriTech', status: 'Analysis Ready', date: '5 days ago' },
  ];

  const accentText = isInvestor ? 'text-emerald-400' : 'text-indigo-400';
  const accentBg = isInvestor ? 'bg-emerald-500/10' : 'bg-indigo-500/10';
  const accentBorder = isInvestor ? 'border-emerald-500/20' : 'border-indigo-500/20';
  const accentButton = isInvestor ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl bg-gradient-to-br ${
        isInvestor 
          ? 'from-emerald-950/40 via-teal-950/20 to-slate-950/0' 
          : 'from-indigo-950/40 via-purple-950/20 to-slate-950/0'
      }`}>
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30"></div>
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isInvestor ? 'bg-emerald-500/30' : 'bg-indigo-500/30'
        }`}></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${accentBg} ${accentBorder} ${accentText}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isInvestor ? 'bg-emerald-400' : 'bg-indigo-400'} animate-pulse`}></div>
              {isInvestor ? 'Investor Portal' : 'Entrepreneur Workspace'}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              Good morning, <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                isInvestor ? 'from-emerald-200 via-teal-300 to-emerald-400' : 'from-indigo-200 via-purple-300 to-indigo-400'
              }`}>
                {user?.email?.split('@')[0] || 'User'}
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg font-light max-w-xl leading-relaxed">
              {isInvestor
                ? "Your portfolio is active. Here are your latest insights and deal flow metrics."
                : "Your startup analysis is ready. Track your growth scores and funding readiness."}
            </p>
          </div>

          {!isInvestor && (
            <Link to="/upload" className="group">
              <div className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-bold text-white shadow-xl transition-all hover:-translate-y-1 active:scale-95 ${accentButton} ${isInvestor ? 'shadow-emerald-900/30' : 'shadow-indigo-900/30'}`}>
                <Icons.Plus size={18} />
                <span>Create New Project</span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`relative group p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1 ${
              isInvestor 
                ? 'hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)]' 
                : 'hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)]'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${accentBg} ${accentText}`}>
                <stat.icon size={20} />
              </div>
              <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-slate-950/50 border-white/10 ${accentText}`}>
                {stat.trend}
                <Icons.TrendingUp size={12} className={accentText} />
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white tracking-tight mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Projects</h3>
            <p className="text-xs text-slate-500 mt-1">Real-time status updates</p>
          </div>
          <Link to="/analysis" className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 ${accentText}`}>
            View All <Icons.ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/30">
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Name</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.map((project) => (
                <tr key={project.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-sm ${accentBg} ${accentText} font-bold text-sm`}>
                        {project.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-slate-100 transition-colors">{project.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">#{project.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 text-xs font-medium">
                      {project.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        project.status === 'Completed' 
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                          : project.status === 'Analysis Ready' 
                            ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' 
                            : 'bg-slate-500'
                      }`}></span>
                      <span className={`text-xs font-semibold ${
                        project.status === 'Completed' 
                          ? 'text-emerald-400' 
                          : project.status === 'Analysis Ready' 
                            ? 'text-blue-400' 
                            : 'text-slate-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-xs font-mono">{project.date}</td>
                  <td className="px-8 py-5 text-right">
                    <button className={`text-xs font-bold px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all ${accentText}`}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
