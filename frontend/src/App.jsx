import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Services
import { getUserProfile } from './services/api';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Comparison from './pages/Comparison';
import MarketAnalysis from './pages/MarketAnalysis';
import Reports from './pages/Reports';

// Layouts
const ProtectedLayout = ({ user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/10 to-slate-950 text-slate-200 relative overflow-hidden">
      {/* Pass user to Navbar so it knows what to render */}
      <Navbar user={user} />
      <main className="w-full relative">
        <Outlet />
      </main>
    </div>
  );
};

// Global Loading Spinner
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 gap-6 relative overflow-hidden">
    {/* Animated Background */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse animation-delay-1000"></div>
    </div>
    
    <div className="relative z-10 flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin animation-delay-200"></div>
      </div>
      <div className="text-center">
        <p className="text-slate-300 font-semibold text-lg mb-2">Initializing Application</p>
        <p className="text-slate-500 text-sm">Loading your workspace...</p>
      </div>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false); // Validates if Firebase check is done

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthResolved(true);
    });
    return () => unsubscribe();
  }, []);

  // 1. Loading State: Do NOT render Router until auth is resolved
  if (!authResolved) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>

        {/* --- Public Routes --- */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" replace />} />

        {/* --- Protected Routes --- */}
        <Route element={
          <ProtectedRoute user={user}>
            <ProtectedLayout user={user} />
          </ProtectedRoute>
        }>
          {/* Redirect "/" to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Feature Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analysis/:startupId?" element={<Analysis />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/market/:startupId?" element={<MarketAnalysis />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* --- Fallback --- */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

      </Routes>
    </Router>
  );
}

export default App;