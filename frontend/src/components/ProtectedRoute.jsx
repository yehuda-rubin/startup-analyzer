import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase'; // Ensure we can access auth if needed, or pass user prop

// Since App.jsx handles the global "Loading" state, this component accepts the 'user' prop
// to determine access. It doesn't need its own loading state anymore.
const ProtectedRoute = ({ user, children }) => {
    if (!user) {
        // Not logged in? Go to login.
        return <Navigate to="/login" replace />;
    }

    // Logged in? Render the protected page.
    return children;
};

export default ProtectedRoute;
