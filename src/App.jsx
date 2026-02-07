import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout and Pages
import Layout from './components/Layout';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Dashboard from './pages/UserDashboard';
import Login from './pages/UserLogin';
import Register from './pages/UserRegister';
import MyBookings from './pages/MyBookings';

/**
 * OKZ Sports - Main Application Component
 * Implements React Router and Zero-Storage State Management
 */
function App() {
    // Zero-Storage: State is held in volatile memory (RAM).
    // Refreshing the browser will naturally "log out" the user.
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    /**
     * Handlers for updating global state
     */
    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        console.log('OKZ Sports: Clearing session from memory...');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <BrowserRouter>
            <Routes>
                {/* Main Shell wrapping all routes */}
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
                    {/* Public Routes */}
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

                    {/* Feature Routes - Passing user state as props */}
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

                    {/* Fallback Catch-all */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;