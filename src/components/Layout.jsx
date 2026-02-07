import { Outlet, Link, useNavigate } from 'react-router-dom';

const Layout = ({ user, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout(); 
    navigate('/');
  };

  return (
    <div className="apple-shell">
      {/* --- Minimalist Frosted Navbar --- */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">OKZ</Link>
          
          <div className="nav-links">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-item">Dashboard</Link>
                <Link to="/booking" className="nav-item">Book</Link>
                <button onClick={handleLogoutClick} className="apple-logout-btn">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-item">Sign In</Link>
                <Link to="/register" className="nav-item nav-cta">Join</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- Page Content Injection --- */}
      <main className="content">
        <Outlet /> 
      </main>

      {/* Footer removed to allow pages to define their own minimalist bottom sections */}

      <style>{`
        .navbar {
          background: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
          height: 64px;
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 9999;
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .nav-brand {
          font-weight: 800;
          font-size: 1.2rem;
          color: #000;
          text-decoration: none;
          letter-spacing: -0.5px;
        }

        .nav-links {
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .nav-item {
          text-decoration: none;
          color: var(--text-main);
          font-size: 0.9rem;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .nav-item:hover {
          opacity: 0.7;
        }

        .nav-cta {
          color: var(--system-blue) !important;
          font-weight: 600 !important;
        }

        .apple-logout-btn {
          background: transparent;
          border: none;
          color: var(--system-red);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          transition: opacity 0.2s;
        }

        .apple-logout-btn:hover {
          opacity: 0.7;
        }

        .content {
          /* Ensures content doesn't get hidden behind sticky nav */
          min-height: calc(100vh - 64px);
        }

        @media (max-width: 600px) {
          .nav-container { padding: 0 16px; }
          .nav-links { gap: 16px; }
          .nav-brand { font-size: 1.1rem; }
        }
      `}</style>
    </div>
  );
};

export default Layout;