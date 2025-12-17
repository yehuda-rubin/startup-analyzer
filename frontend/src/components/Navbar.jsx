import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Icons = {
  Logo: ({ className }) => (
    <svg width="20" height="20" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  Dashboard: ({ className }) => (
    <svg width="16" height="16" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  Upload: ({ className }) => (
    <svg width="16" height="16" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Analysis: ({ className }) => (
    <svg width="16" height="16" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Compare: ({ className }) => (
    <svg width="16" height="16" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M6 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M11 18H8a2 2 0 0 1-2-2V9" />
    </svg>
  ),
  Market: ({ className }) => (
    <svg width="16" height="16" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Reports: ({ className }) => (
    <svg width="16" height="16" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
};

function Navbar({ user, role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { path: '/upload', label: 'New Project', icon: Icons.Upload },
    { path: '/analysis', label: 'Analysis', icon: Icons.Analysis },
    { path: '/comparison', label: 'Compare', icon: Icons.Compare },
    { path: '/market', label: 'Market', icon: Icons.Market },
    { path: '/reports', label: 'Reports', icon: Icons.Reports },
  ];

  const accentText = role === 'investor' ? 'text-emerald-400' : 'text-indigo-400';
  const accentBg = role === 'investor' ? 'bg-emerald-500/10' : 'bg-indigo-500/10';
  const accentBorder = role === 'investor' ? 'border-emerald-500/20' : 'border-indigo-500/20';

  if (!user) return null;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          🚀 Roots
        </Link>
        <ul style={styles.links}>
          <li>
            <Link 
              to="/dashboard" 
              style={{
                ...styles.link,
                ...(isActive('/dashboard') ? styles.linkActive : {})
              }}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/upload" 
              style={{
                ...styles.link,
                ...(isActive('/upload') ? styles.linkActive : {})
              }}
            >
              Upload
            </Link>
          </li>
          <li>
            <Link 
              to="/analysis" 
              style={{
                ...styles.link,
                ...(isActive('/analysis') ? styles.linkActive : {})
              }}
            >
              Analysis
            </Link>
          </li>
          <li>
            <Link 
              to="/comparison" 
              style={{
                ...styles.link,
                ...(isActive('/comparison') ? styles.linkActive : {})
              }}
            >
              Compare
            </Link>
          </li>
          <li>
            <Link 
              to="/market" 
              style={{
                ...styles.link,
                ...(isActive('/market') ? styles.linkActive : {})
              }}
            >
              Sign Out
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-white/5 mt-2 pt-4 animate-in fade-in slide-in-bottom">
            <div className="flex flex-col gap-1">
              {links.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? `${accentBg} ${accentText}`
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <link.icon />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
