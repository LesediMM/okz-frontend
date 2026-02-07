import { Outlet, Link, useNavigate } from 'react-router-dom';

// Match the props passed from App.jsx: user, isAuthenticated, onLogout
const Layout = ({ user, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout(); // Clears memory state in App.jsx
    navigate('/');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">OKZ SPORTS</Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/booking">Book Court</Link>
            {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
            
            {isAuthenticated ? (
              <button onClick={handleLogoutClick} className="logout-btn">
                Logout ({user?.email?.split('@')[0]})
              </button>
            ) : (
              <Link to="/login" className="login-btn">Login</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="content">
        <Outlet /> 
      </main>

      <footer className="footer">
        <p>© 2024 OKZ Sports. 400 EGP/Hour</p>
      </footer>
    </div>
  );
};

export default Layout;