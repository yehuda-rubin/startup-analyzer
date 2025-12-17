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

  // Layout wrapper for protected pages to include Navbar
  const ProtectedLayout = ({ children }) => (
    <ProtectedRoute>
      <Navbar />
      <main className="max-w-7xl mx-auto pt-20 px-6">
        {children}
      </main>
    </ProtectedRoute>
  );

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-slate-50 font-sans">
          <Routes>
            {/* Public Routes */}
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;