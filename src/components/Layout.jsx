import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import '../styles/global.css'; // This handles all layout and navigation styles

// ===== FALLBACKS - Isolated inline (no extra files) =====
const LayoutFallbacks = {
    // Network status tracker
    network: {
        isOnline: navigator.onLine,
        
        init() {
            window.addEventListener('online', () => { this.isOnline = true; });
            window.addEventListener('offline', () => { this.isOnline = false; });
        }
    },

    // Navigation guard (prevents accidental navigation)
    navigationGuard: {
        isNavigating: false,
        
        startNavigation() {
            this.isNavigating = true;
            setTimeout(() => { this.isNavigating = false; }, 1000);
        },
        
        canNavigate() {
            return !this.isNavigating;
        }
    },

    // Logout confirmation with options
    logoutOptions: {
        showConfirm: true,
        confirmMessage: 'Are you sure you want to sign out?',
        
        async confirm() {
            if (!this.showConfirm) return true;
            return window.confirm(this.confirmMessage);
        }
    },

    // User menu state (for potential mobile menu)
    menuState: {
        isOpen: false,
        
        toggle() {
            this.isOpen = !this.isOpen;
            return this.isOpen;
        },
        
        close() {
            this.isOpen = false;
        }
    },

    // Avatar color generator (consistent per user)
    getAvatarColor(email) {
        if (!email) return '#1a2b56';
        
        // Simple hash to generate consistent color
        const hash = email.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 70%, 45%)`;
    },

    // Fallback avatar when image fails
    FallbackAvatar: ({ initial, email }) => (
        <div className="nav-profile-circle" style={{
            backgroundColor: LayoutFallbacks.getAvatarColor(email),
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            fontSize: '16px',
            fontWeight: '600'
        }}>
            {initial}
        </div>
    ),

    // Offline indicator component
    OfflineIndicator: () => (
        <div style={{
            position: 'fixed',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ffc107',
            color: '#000',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }}>
            <span style={{ fontSize: '1rem' }}>📱</span>
            Offline - Some features may be limited
        </div>
    ),

    // Error boundary for navigation failures
    handleNavigationError(error, navigate, fallbackPath = '/') {
        console.error('[Layout] Navigation error:', error);
        setTimeout(() => navigate(fallbackPath), 100);
    },

    // Logout with retry
    async logoutWithRetry(onLogout, navigate, retries = 2) {
        for (let i = 0; i < retries; i++) {
            try {
                await onLogout();
                LayoutFallbacks.navigationGuard.startNavigation();
                navigate('/');
                return true;
            } catch (error) {
                if (i === retries - 1) {
                    console.error('[Layout] Logout failed after retries:', error);
                    // FAIL SAFE: Force navigation even if logout fails
                    window.location.href = '/';
                    return false;
                }
                await new Promise(r => setTimeout(r, 500));
            }
        }
    },

    // Session timeout warning
    sessionTimeout: {
        warningShown: false,
        
        checkAndWarn(lastActivity) {
            const inactiveTime = Date.now() - lastActivity;
            const warningThreshold = 25 * 60 * 1000; // 25 minutes
            const logoutThreshold = 30 * 60 * 1000; // 30 minutes
            
            if (inactiveTime > logoutThreshold) {
                return 'expired';
            } else if (inactiveTime > warningThreshold && !this.warningShown) {
                this.warningShown = true;
                return 'warning';
            }
            return 'active';
        }
    },

    // Track user activity
    activityTracker: {
        lastActivity: Date.now(),
        
        init() {
            const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
            const updateActivity = () => { this.lastActivity = Date.now(); };
            
            events.forEach(event => {
                window.addEventListener(event, updateActivity);
            });
            
            return () => {
                events.forEach(event => {
                    window.removeEventListener(event, updateActivity);
                });
            };
        },
        
        getLastActivity() {
            return this.lastActivity;
        }
    },

    // Error messages
    messages: {
        logoutConfirm: 'Are you sure you want to sign out?',
        logoutError: 'Unable to sign out. Please try again.',
        sessionExpired: 'Your session has expired. Please sign in again.',
        networkError: 'Network connection lost. Some features may be unavailable.'
    }
};

// Initialize
LayoutFallbacks.network.init();
// ===== END FALLBACKS =====

/**
 * Layout Component
 * Provides the global navigation shell with frosted glass (blur) effects.
 * Includes defensive coding to prevent crashes during state transitions.
 */
const Layout = ({ user, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(!LayoutFallbacks.network.isOnline);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // FAIL SAFE: Track user activity
  useEffect(() => {
    const cleanup = LayoutFallbacks.activityTracker.init();
    return cleanup;
  }, []);

  // FAIL SAFE: Monitor network status
  useEffect(() => {
    const handleOnline = () => setShowOfflineIndicator(false);
    const handleOffline = () => setShowOfflineIndicator(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // FAIL SAFE: Check for session timeout (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      const status = LayoutFallbacks.sessionTimeout.checkAndWarn(
        LayoutFallbacks.activityTracker.getLastActivity()
      );
      
      if (status === 'warning' && !showSessionWarning) {
        setShowSessionWarning(true);
      } else if (status === 'expired') {
        // Auto logout on session expiry
        handleLogoutClick(true);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [isAuthenticated, showSessionWarning]);

  const handleLogoutClick = async (isAuto = false) => {
    // FAIL HARD: Prevent multiple logout attempts
    if (isLoggingOut || !LayoutFallbacks.navigationGuard.canNavigate()) return;
    
    setIsLoggingOut(true);

    // FAIL SAFE: Show confirmation unless auto-logout
    if (!isAuto) {
      const confirmed = await LayoutFallbacks.logoutOptions.confirm();
      if (!confirmed) {
        setIsLoggingOut(false);
        return;
      }
    }

    // FAIL HARD: Attempt logout with retry
    try {
      await LayoutFallbacks.logoutWithRetry(onLogout, navigate);
    } catch (error) {
      LayoutFallbacks.handleNavigationError(error, navigate);
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * Defensive Check: Initial for Avatar
   * We use optional chaining (?.) and a default fallback to prevent
   * "Cannot read property 'charAt' of undefined" crashes.
   */
  const userInitial = user?.fullName?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="apple-shell">
      {/* FAIL SAFE: Offline indicator */}
      {showOfflineIndicator && <LayoutFallbacks.OfflineIndicator />}

      {/* FAIL SAFE: Session warning */}
      {showSessionWarning && isAuthenticated && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ff8c00',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>⏰</span>
          Your session will expire soon
          <button
            onClick={() => setShowSessionWarning(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* --- Minimalist Frosted Navbar --- */}
      <nav className="navbar" style={{
        opacity: isLoggingOut ? 0.7 : 1,
        pointerEvents: isLoggingOut ? 'none' : 'auto'
      }}>
        <div className="nav-container">
          {/* Logo with Branded Accent Dot */}
          <Link to="/" className="nav-brand" onClick={(e) => {
            // FAIL HARD: Prevent navigation during logout
            if (isLoggingOut) e.preventDefault();
          }}>
            OKZ<span className="brand-dot">.</span>
          </Link>
          
          <div className="nav-links">
            {isAuthenticated ? (
              <>
                {/* Authenticated Links */}
                <Link to="/dashboard" className="nav-item" onClick={(e) => {
                  if (isLoggingOut) e.preventDefault();
                }}>Dashboard</Link>
                <Link to="/booking" className="nav-item" onClick={(e) => {
                  if (isLoggingOut) e.preventDefault();
                }}>Book</Link>
                
                {/* Styled Sign Out Button */}
                <button 
                  onClick={() => handleLogoutClick(false)} 
                  className="logout-link"
                  disabled={isLoggingOut}
                  style={{
                    opacity: isLoggingOut ? 0.5 : 1,
                    cursor: isLoggingOut ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                </button>
                
                {/* Defensive Profile Circle Accent - FAIL SAFE with fallback */}
                {user ? (
                  <LayoutFallbacks.FallbackAvatar 
                    initial={userInitial} 
                    email={user.email}
                  />
                ) : (
                  <div className="nav-profile-circle">{userInitial}</div>
                )}
              </>
            ) : (
              <>
                {/* Guest Links */}
                <Link to="/login" className="nav-item" onClick={(e) => {
                  if (isLoggingOut) e.preventDefault();
                }}>Sign In</Link>
                <Link to="/register" className="nav-item nav-cta-pill" onClick={(e) => {
                  if (isLoggingOut) e.preventDefault();
                }}>
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- Page Content Injection --- */}
      {/* The Outlet is the placeholder for child routes. 
          By wrapping child routes in this Layout, the navbar stays static 
          while the content fades in underneath.
      */}
      
      <main className="content-viewport" style={{
        opacity: isLoggingOut ? 0.5 : 1,
        transition: 'opacity 0.3s ease'
      }}>
        <Outlet /> 
      </main>

      {/* FAIL SAFE: Navigation guard overlay */}
      {isLoggingOut && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'transparent',
          zIndex: 999,
          cursor: 'wait'
        }} />
      )}
    </div>
  );
};

export default Layout;