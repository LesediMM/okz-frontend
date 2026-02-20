import React, { useState, useEffect } from 'react';
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

// ===== FALLBACKS - Isolated inline (no extra files) =====
const AppFallbacks = {
    // Session refresh interval (check every 5 minutes)
    refreshInterval: null,
    
    startSessionMonitor() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        
        this.refreshInterval = setInterval(() => {
            // FAIL SAFE: Check if session is still valid
            if (!sessionManager.isValidSession()) {
                console.log('[App] Session expired during monitoring');
                window.dispatchEvent(new CustomEvent('session-expired'));
            }
        }, 300000); // 5 minutes
    },

    stopSessionMonitor() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    },

    // Storage event listener for cross-tab sync
    setupCrossTabSync(setUser, setIsAuthenticated) {
        const handleStorageChange = (e) => {
            if (e.key === 'okz_session_backup' || e.key === 'okz_user_session') {
                const session = sessionManager.getSession();
                setUser(session ? session.user : null);
                setIsAuthenticated(sessionManager.isValidSession());
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    },

    // Session expired handler
    setupSessionExpiredListener(setUser, setIsAuthenticated) {
        const handleSessionExpired = () => {
            setUser(null);
            setIsAuthenticated(false);
        };
        
        window.addEventListener('session-expired', handleSessionExpired);
        return () => window.removeEventListener('session-expired', handleSessionExpired);
    },

    // Route guard with fallback
    protectedRoute(Component, user, fallback = '/login') {
        return user ? Component : <Navigate to={fallback} />;
    },

    // Error boundary fallback
    ErrorFallback: ({ error, resetError }) => (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center'
        }}>
            <div className="glass-panel" style={{ maxWidth: '400px', padding: '40px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎾</div>
                <h2>Something went wrong</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                    {error?.message || 'The application encountered an error'}
                </p>
                <button
                    onClick={resetError}
                    className="btn-primary"
                    style={{ padding: '12px 24px' }}
                >
                    Try Again
                </button>
            </div>
        </div>
    ),

    // State recovery from corruption
    recoverState() {
        try {
            const session = sessionManager.getSession();
            return {
                user: session ? session.user : null,
                isAuthenticated: sessionManager.isValidSession()
            };
        } catch (e) {
            console.error('[App] State recovery failed:', e);
            return { user: null, isAuthenticated: false };
        }
    },

    // App health check
    getHealth() {
        return {
            hasSession: sessionManager.isValidSession(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            online: navigator.onLine
        };
    }
};
// ===== END FALLBACKS =====

/**
 * OKZ Sports - Main Application Component
 * Implements React Router and Persistent Session Management
 */
function App() {
    // FAIL SAFE: Initialize state with recovery option
    const [user, setUser] = useState(() => {
        try {
            const session = sessionManager.getSession();
            return session ? session.user : null;
        } catch (error) {
            console.error('[App] Error loading session:', error);
            return null;
        }
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try {
            return sessionManager.isValidSession();
        } catch (error) {
            console.error('[App] Error checking session:', error);
            return false;
        }
    });

    const [error, setError] = useState(null);
    const [hasError, setHasError] = useState(false);

    // FAIL SAFE: Setup monitors on mount
    useEffect(() => {
        // Start session monitor
        AppFallbacks.startSessionMonitor();
        
        // Setup cross-tab sync
        const cleanupStorage = AppFallbacks.setupCrossTabSync(setUser, setIsAuthenticated);
        
        // Setup session expired listener
        const cleanupExpired = AppFallbacks.setupSessionExpiredListener(setUser, setIsAuthenticated);
        
        // FAIL SAFE: Recover from corrupt state if needed
        if (!user && isAuthenticated) {
            console.warn('[App] State inconsistency detected, attempting recovery');
            const recovered = AppFallbacks.recoverState();
            setUser(recovered.user);
            setIsAuthenticated(recovered.isAuthenticated);
        }

        // FAIL SAFE: Handle online/offline events
        const handleOnline = () => {
            console.log('[App] Network restored, refreshing session');
            const session = sessionManager.getSession();
            if (session) {
                setUser(session.user);
                setIsAuthenticated(true);
            }
        };

        window.addEventListener('online', handleOnline);
        
        return () => {
            AppFallbacks.stopSessionMonitor();
            cleanupStorage();
            cleanupExpired();
            window.removeEventListener('online', handleOnline);
        };
    }, [user, isAuthenticated]);

    const handleLoginSuccess = (userData) => {
        try {
            // FAIL HARD: Validate user data before saving
            if (!userData || !userData.email) {
                throw new Error('Invalid user data received');
            }

            // Save to browser cookie for persistence
            sessionManager.saveSession(userData);
            
            // Update React state
            setUser(userData);
            setIsAuthenticated(true);
            
            console.log('[App] Login successful for:', userData.email);
        } catch (error) {
            console.error('[App] Login error:', error);
            setError(error);
        }
    };

    const handleLogout = () => {
        try {
            console.log('OKZ Sports: Clearing persistent session...');
            
            // Remove browser cookie
            sessionManager.endSession();
            
            // Clear React state
            setUser(null);
            setIsAuthenticated(false);
            
            // FAIL SAFE: Clear any error state
            setError(null);
            setHasError(false);
        } catch (error) {
            console.error('[App] Logout error:', error);
            // FAIL SAFE: Force clear state even if session manager fails
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // FAIL SAFE: Error boundary style catch
    if (hasError) {
        return <AppFallbacks.ErrorFallback 
            error={error} 
            resetError={() => {
                setHasError(false);
                setError(null);
                window.location.href = '/';
            }} 
        />;
    }

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
                    
                    {/* Login route with redirect */}
                    <Route 
                        path="login" 
                        element={
                            isAuthenticated 
                                ? <Navigate to="/dashboard" replace /> 
                                : <Login onLoginSuccess={handleLoginSuccess} />
                        } 
                    />
                    
                    {/* Register route (always accessible) */}
                    <Route path="register" element={<Register />} />

                    {/* Protected routes - FAIL SAFE: Guard with fallback */}
                    <Route 
                        path="booking" 
                        element={
                            isAuthenticated 
                                ? <Booking user={user} /> 
                                : <Navigate to="/login" replace />
                        } 
                    />
                    
                    <Route 
                        path="dashboard" 
                        element={
                            isAuthenticated 
                                ? <Dashboard user={user} /> 
                                : <Navigate to="/login" replace />
                        } 
                    />
                    
                    <Route 
                        path="my-bookings" 
                        element={
                            isAuthenticated 
                                ? <MyBookings user={user} /> 
                                : <Navigate to="/login" replace />
                        } 
                    />

                    {/* Catch-all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

// FAIL SAFE: Error Boundary wrapper (class component style)
class AppWithErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[App Error Boundary]', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <AppFallbacks.ErrorFallback 
                error={this.state.error}
                resetError={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.href = '/';
                }}
            />;
        }

        return <App />;
    }
}

export default AppWithErrorBoundary;