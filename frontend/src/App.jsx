import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Comparison from './pages/Comparison';
import MarketAnalysis from './pages/MarketAnalysis';
import Reports from './pages/Reports';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

const App = () => {
  const [selectedStartup, setSelectedStartup] = useState(null);

  // Layout wrapper for protected pages to include Navbar and Ambience
  const ProtectedLayout = ({ children }) => (
    <ProtectedRoute>
      <div className="min-h-screen bg-black relative text-slate-50 font-sans selection:bg-[#00FF41]/30">

        {/* Global Electric Flow Ambience for Inner Pages */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00FF41]/5 rounded-full blur-[100px] mix-blend-screen opacity-50" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#00E5FF]/5 rounded-full blur-[100px] mix-blend-screen opacity-50" />
        </div>

        <Navbar />

        <main className="max-w-7xl mx-auto pt-24 px-6 relative z-10">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - contain their own layout wrappers */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedLayout><Navigate to="/dashboard" replace /></ProtectedLayout>} />

          <Route path="/dashboard" element={
            <ProtectedLayout>
              <Dashboard onSelectStartup={setSelectedStartup} />
            </ProtectedLayout>
          } />

          <Route path="/upload" element={
            <ProtectedLayout>
              <Upload />
            </ProtectedLayout>
          } />

          <Route path="/analysis/:startupId?" element={
            <ProtectedLayout>
              <Analysis />
            </ProtectedLayout>
          } />

          <Route path="/comparison" element={
            <ProtectedLayout>
              <Comparison />
            </ProtectedLayout>
          } />

          <Route path="/market/:startupId?" element={
            <ProtectedLayout>
              <MarketAnalysis />
            </ProtectedLayout>
          } />

          <Route path="/reports" element={
            <ProtectedLayout>
              <Reports />
            </ProtectedLayout>
          } />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;