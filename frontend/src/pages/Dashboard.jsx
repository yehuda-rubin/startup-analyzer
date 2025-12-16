import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listStartups, getStartupScores } from '../services/api';
import PageLayout from '../components/PageLayout';

// Inline SVGs replacing Lucide
const Icons = {
  Projects: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>,
  Trend: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
  Clock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  ArrowRight: ({ className }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  FolderOpen: ({ className }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2" /></svg>
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [startups, setStartups] = useState([]);
  const [scores, setScores] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadStartups();
  }, []);

  const loadStartups = async () => {
    try {
      const data = await listStartups();
      setStartups(data);

      const scoresData = {};
      for (const startup of data) {
        try {
          const startupScores = await getStartupScores(startup.id);
          if (startupScores.length > 0) {
            scoresData[startup.id] = startupScores[0].overall_score.toFixed(1);
          }
        } catch (error) {
          console.error(`Failed to load scores for startup ${startup.id}`, error);
        }
      }
      setScores(scoresData);
    } catch (error) {
      console.error('Failed to load startups:', error);
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Manage your projects and view AI-driven insights."
      action={
        <button
          onClick={() => navigate('/upload')}
          className="group relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Project
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>
      }
    >
      {({ theme, role }) => (
        <div className="space-y-12">

          {/* 1. Stats Row - Premium Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Active Projects', value: startups.length, icon: Icons.Projects, trend: '+2 this week', color: 'indigo' },
              { label: 'Avg. Analysis Score', value: '8.4', icon: Icons.Trend, trend: '+0.8 points', color: 'purple' },
              { label: 'Pending Reviews', value: '2', icon: Icons.Clock, trend: 'Due today', color: 'cyan' }
            ].map((stat, i) => (
              <div 
                key={i} 
                className="relative overflow-hidden rounded-2xl glass p-6 transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl group animate-in fade-in slide-in-bottom"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Gradient Glow */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-3xl ${
                  stat.color === 'indigo' ? 'bg-indigo-500' : 
                  stat.color === 'purple' ? 'bg-purple-500' : 
                  'bg-cyan-500'
                }`}></div>

                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
                    <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
                      {stat.value}
                    </h3>
                    <p className={`text-xs font-semibold ${theme.textAccent} flex items-center gap-1`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      {stat.trend}
                    </p>
                  </div>
                  <div className={`p-3.5 rounded-xl ${theme.iconBg} ${theme.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Projects Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Icons.FolderOpen className="w-5 h-5 text-slate-400" />
                Recent Projects
              </h2>
            </div>

            {loadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-72 rounded-3xl glass animate-pulse border border-white/5">
                    <div className="h-full bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-3xl"></div>
                  </div>
                ))}
              </div>
            ) : startups.length === 0 ? (
              // Empty State
              <div className="text-center py-24 rounded-3xl border-2 border-dashed border-slate-800/50 glass relative overflow-hidden group">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-6 ${theme.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <svg className={`w-12 h-12 ${theme.iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-3">
                    No projects found
                  </h3>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">
                    Get started by creating your first startup analysis project. It's quick and easy.
                  </p>
                  <button
                    onClick={() => navigate('/upload')}
                    className="px-8 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95"
                  >
                    Create First Project
                  </button>
                </div>
              </div>
            ) : (
              // Regular Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {startups.map((startup, index) => (
                  <div
                    key={startup.id}
                    onClick={() => navigate(`/analysis/${startup.id}`)}
                    className="group relative glass rounded-3xl p-1 overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl cursor-pointer animate-in fade-in slide-in-bottom"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Animated Border Gradient */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${
                      role === 'investor' 
                        ? 'from-emerald-500/50 via-teal-500/30' 
                        : 'from-indigo-500/50 via-purple-500/30'
                    } to-transparent rounded-3xl`}></div>

                    <div className="relative h-full bg-slate-950/80 backdrop-blur-sm rounded-[22px] p-6 border border-white/5 group-hover:border-white/10 transition-colors">

                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300 ${theme.iconBg}`}>
                          {startup.name.substring(0, 2).toUpperCase()}
                        </div>
                        {scores[startup.id] && (
                          <div className={`px-4 py-1.5 rounded-full text-sm font-bold border backdrop-blur-sm ${
                            role === 'investor' 
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                              : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                          }`}>
                            {scores[startup.id]}
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-slate-200 group-hover:to-slate-400 transition-all duration-300">
                        {startup.name}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-2 h-12 mb-6 group-hover:text-slate-300 transition-colors">
                        {startup.description || 'No description available'}
                      </p>

                      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-1.5 rounded-lg bg-slate-900/50">
                          {startup.industry || 'Technology'}
                        </span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-300 ${theme.iconBg}`}>
                          <Icons.ArrowRight className={`w-5 h-5 ${theme.iconColor}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Dashboard;