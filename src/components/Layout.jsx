import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import '../styles/global.css'; // This now handles all layout and navigation styles

/**
 * Layout Component
 * Provides the global navigation shell with frosted glass (blur) effects.
 * Consolidated styling into global.css to ensure build stability on Render.
 */
const Layout = ({ user, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    // Clear user session through the passed-in handler
    onLogout(); 
    // Redirect to home page immediately
    navigate('/');
  };

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
                <button onClick={handleLogoutClick} className="logout-link">
                  Sign Out
                </button>
                
                {/* Profile Circle Accent */}
                <div className="nav-profile-circle">
                   {user?.fullName?.charAt(0).toUpperCase() || 'U'}
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
      {/* Outlet renders the child routes (Home, Booking, MyBookings, etc.) */}
      <main className="content-viewport">
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;