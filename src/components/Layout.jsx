import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import '../styles/global.css'; // This handles all layout and navigation styles

/**
 * Layout Component
 * Provides the global navigation shell with frosted glass (blur) effects.
 * Includes defensive coding to prevent crashes during state transitions.
 */
const Layout = ({ user, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    // Clear user session through the passed-in handler
    onLogout(); 
    // Redirect to home page immediately
    navigate('/');
  };

  /**
   * Defensive Check: Initial for Avatar
   * We use optional chaining (?.) and a default fallback to prevent
   * "Cannot read property 'charAt' of undefined" crashes.
   */
  const userInitial = user?.fullName?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="apple-shell">
      {/* --- Minimalist Frosted Navbar --- */}
      <nav className="navbar">
        <div className="nav-container">
          {/* Logo with Branded Accent Dot */}
          <Link to="/" className="nav-brand">
            OKZ<span className="brand-dot">.</span>
          </Link>
          
          <div className="nav-links">
            {isAuthenticated ? (
              <>
                {/* Authenticated Links */}
                <Link to="/dashboard" className="nav-item">Dashboard</Link>
                <Link to="/booking" className="nav-item">Book</Link>
                
                {/* Styled Sign Out Button */}
                <button onClick={handleLogoutClick} className="logout-link">
                  Sign Out
                </button>
                
                {/* Defensive Profile Circle Accent */}
                <div className="nav-profile-circle">
                   {userInitial}
                </div>
              </>
            ) : (
              <>
                {/* Guest Links */}
                <Link to="/login" className="nav-item">Sign In</Link>
                <Link to="/register" className="nav-item nav-cta-pill">
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
      
      <main className="content-viewport">
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;