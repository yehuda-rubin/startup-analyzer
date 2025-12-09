import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Comparison from './pages/Comparison';
import MarketAnalysis from './pages/MarketAnalysis';
import Reports from './pages/Reports';

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
  },
  main: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  }
};

function App() {
  const [selectedStartup, setSelectedStartup] = useState(null);

  return (
    <Router>
      <div style={styles.app}>
        <Navbar />
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard onSelectStartup={setSelectedStartup} />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/analysis/:startupId?" element={<Analysis />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/market/:startupId?" element={<MarketAnalysis />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;