import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password, role) {
    // "Simulate saving it" -> Storing role in localStorage for persistence across reloads for this MVP
    localStorage.setItem('tempUserRole', role);
    setUserRole(role);
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    localStorage.removeItem('tempUserRole');
    setUserRole(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      // Attempt to recover role from basic storage if user exists
      if (user) {
        const storedRole = localStorage.getItem('tempUserRole');
        if (storedRole) {
          setUserRole(storedRole);
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
