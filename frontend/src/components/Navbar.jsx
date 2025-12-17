import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Briefcase, LogOut, TreeDeciduous } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, logout, currentUser } = useAuth();

  const isActive = (path) => location.pathname === path;

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  if (!currentUser) return null;

  // Role Styling Logic
  const isEntrepreneur = userRole === 'entrepreneur';

  const roleStyles = userRole === 'entrepreneur'
    ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
    : 'border-[#00FF41] text-[#00FF41] bg-[#00FF41]/10 shadow-[0_0_10px_rgba(0,255,65,0.2)]';

  const roleIcon = userRole === 'entrepreneur'
    ? <Zap size={12} className="fill-current" />
    : <Briefcase size={12} className="fill-current" />;

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">

        {/* Brand + Role Label */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight group">
            <TreeDeciduous className="w-9 h-9 text-[#00FF41] filter drop-shadow-[0_0_8px_rgba(0,255,65,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(0,255,65,0.8)] transition-all" />
            <span className="text-white group-hover:text-[#00FF41] transition-colors duration-300">Roots</span>
          </Link>

          {userRole && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border flex items-center gap-1.5 transition-all duration-300 ${roleStyles}`}>
              {roleIcon}
              {userRole}
            </span>
          )}
        </div>

        <div className="flex items-center gap-8">
          <ul className="flex items-center gap-1 list-none p-0 m-0">
            {['Dashboard', 'Upload', 'Analysis', 'Comparison', 'Market', 'Reports'].map((item) => {
              const path = `/${item.toLowerCase()}`;
              const active = isActive(path);

              return (
                <li key={item}>
                  <Link
                    to={path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden group
                      ${active
                        ? 'text-[#00FF41] bg-[#00FF41]/10 shadow-[0_0_15px_rgba(0,255,65,0.15)]'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <span className="relative z-10">{item}</span>
                    {active && <div className="absolute inset-0 border border-[#00FF41]/20 rounded-lg pointer-events-none" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-4 pl-6 border-l border-white/10 h-8">
            {/* User Identity */}
            <div className="flex items-center gap-2 text-zinc-400 text-xs hidden md:flex font-mono">
              <span className="max-w-[120px] truncate" title={currentUser.email}>
                {currentUser.email}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10 group"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;