import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Components
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Services
import { getUserProfile } from './services/api';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import UploadProject from './pages/UploadProject';
import Analysis from './pages/Analysis';
import Comparison from './pages/Comparison';
import MarketAnalysis from './pages/MarketAnalysis';
import Reports from './pages/Reports';

// Global Loading Spinner
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-6">
    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
    <p className="text-slate-400 text-sm">Loading Application...</p>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await getUserProfile();
          setRole(profile.role);
        } catch (error) {
          console.error("Failed to fetch role", error);
        }
      } else {
        setRole(null);
      }
      setAuthResolved(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authResolved) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      {/* 
          FOUNDATION RESET:
          - Outer shell: dark background, full height.
          - Content centered with max-width.
      */}
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">

        <Routes>

          {/* --- Public Routes (Login/Signup) own layout --- */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" replace />} />

          {/* --- Protected Routes (Inside App Shell) --- */}
          <Route element={
            <ProtectedRoute user={user}>
              <AppLayout role={role} user={user} />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard role={role} />} />
            <Route path="/upload" element={<UploadProject />} />
            <Route path="/analysis/:startupId?" element={<Analysis />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/market/:startupId?" element={<MarketAnalysis />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* --- Fallback --- */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;