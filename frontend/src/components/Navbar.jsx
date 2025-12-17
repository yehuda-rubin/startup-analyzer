import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Briefcase, LogOut, User } from 'lucide-react';

const styles = {
  nav: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)', // slate-900/80
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '0 24px',
    height: '64px',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  container: {
    maxWidth: '1280px', // max-w-7xl
    margin: '0 auto',
    height: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  links: {
    display: 'flex',
    gap: '4px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    alignItems: 'center',
  },
  link: {
    color: '#94a3b8', // slate-400
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  linkActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#f8fafc', // slate-50
  },
};

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

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <span>🚀</span> Roots
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <ul style={styles.links}>
            {['Dashboard', 'Upload', 'Analysis', 'Comparison', 'Market', 'Reports'].map((item) => {
              const path = `/${item.toLowerCase()}`;
              return (
                <li key={item}>
                  <Link
                    to={path}
                    style={{
                      ...styles.link,
                      ...(isActive(path) ? styles.linkActive : {})
                    }}
                  >
                    {item}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-4 pl-4 border-l border-white/10 h-8">
            {/* Dynamic Role Badge */}
            {userRole && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider
                  ${userRole === 'entrepreneur'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                  }`}
              >
                {userRole === 'entrepreneur' ? (
                  <Zap className="h-3 w-3" />
                ) : (
                  <Briefcase className="h-3 w-3" />
                )}
                {userRole}
              </div>
            )}

            {/* User Identity */}
            <div className="flex items-center gap-2 text-slate-400 text-xs hidden md:flex">
              <span className="max-w-[100px] truncate" title={currentUser.email}>
                {currentUser.email}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;