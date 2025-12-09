import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const styles = {
  nav: {
    backgroundColor: '#2c3e50',
    padding: '15px 30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '20px',
    listStyle: 'none',
  },
  link: {
    color: '#ecf0f1',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  linkActive: {
    backgroundColor: '#34495e',
  },
};

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          🚀 Startup Analyzer AI
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
              Market
            </Link>
          </li>
          <li>
            <Link 
              to="/reports" 
              style={{
                ...styles.link,
                ...(isActive('/reports') ? styles.linkActive : {})
              }}
            >
              Reports
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;