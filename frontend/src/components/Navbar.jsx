import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Briefcase, LogOut } from 'lucide-react';

const styles = {
  nav: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // White/95
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e2e8f0', // Slate-200
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
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brand: {
    color: '#0f172a', // Slate-900 (Dark for light bg)
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
    color: '#475569', // Slate-600
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  linkActive: {
    backgroundColor: '#f1f5f9', // Slate-100
    color: '#3b82f6', // Electric Blue
  },
  roleLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }
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

  // Role Styling
  const isEntrepreneur = userRole === 'entrepreneur';
  const roleColor = isEntrepreneur ? '#818cf8' : '#34d399'; // Indigo-400 : Emerald-400
  const roleBg = isEntrepreneur ? 'rgba(99, 102, 241, 0.1)' : 'rgba(52, 211, 153, 0.1)';
  const roleBorder = isEntrepreneur ? 'rgba(99, 102, 241, 0.2)' : 'rgba(52, 211, 153, 0.2)';

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>

        {/* Brand + Role Label */}
        <div style={styles.brandGroup}>
          <Link to="/" style={styles.brand}>
            <span>🚀</span> Roots
          </Link>

          {userRole && (
            <span style={{
              ...styles.roleLabel,
              color: roleColor,
              backgroundColor: roleBg,
              border: `1px solid ${roleBorder}`
            }}>
              {isEntrepreneur ? <Zap size={10} /> : <Briefcase size={10} />}
              {userRole}
            </span>
          )}
        </div>

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

          <div className="flex items-center gap-4 pl-4 border-l border-slate-200 h-8">
            {/* User Identity */}
            <div className="flex items-center gap-2 text-slate-900 text-xs hidden md:flex">
              <span className="max-w-[100px] truncate font-medium" title={currentUser.email}>
                {currentUser.email}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
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