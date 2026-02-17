import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout and Pages - Explicit .jsx extensions for Vite Build Analysis
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Booking from './pages/Booking.jsx';
import Dashboard from './pages/UserDashboard.jsx';
import Login from './pages/UserLogin.jsx';
import Register from './pages/UserRegister.jsx';
import MyBookings from './pages/MyBookings.jsx';

// Import Session Manager for persistent storage
import { sessionManager } from './session/session';

/**
 * OKZ Sports - Main Application Component
 * Implements React Router and Persistent Session Management
 */
function App() {
    // Hydrated Storage: State is initialized from browser cookie
    const [user, setUser] = useState(() => {
        const session = sessionManager.getSession();
        return session ? session.user : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionManager.isValidSession();
    });

    const handleLoginSuccess = (userData) => {
        // Save to browser cookie for persistence
        sessionManager.saveSession(userData);
        
        // Update React state
        setUser(userData);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        console.log('OKZ Sports: Clearing persistent session...');
        
        // Remove browser cookie
        sessionManager.endSession();
        
        // Clear React state
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <Layout 
                            user={user} 
                            isAuthenticated={isAuthenticated} 
                            onLogout={handleLogout} 
                        />
                    }
                >
                    <Route index element={<Home />} />
                    <Route 
                        path="login" 
                        element={
                            isAuthenticated 
                                ? <Navigate to="/dashboard" /> 
                                : <Login onLoginSuccess={handleLoginSuccess} />
                        } 
                    />
                    <Route path="register" element={<Register />} />

                    <Route 
                        path="booking" 
                        element={<Booking user={user} />} 
                    />
                    <Route 
                        path="dashboard" 
                        element={<Dashboard user={user} />} 
                    />
                    <Route 
                        path="my-bookings" 
                        element={<MyBookings user={user} />} 
                    />

                    <Route path="*" element={<Navigate to="/" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;