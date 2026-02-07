import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const UserLogin = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    
    // Local UI state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('https://okz.onrender.com/api/v1/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                // ✅ Update Zero-Storage state in App.jsx
                // result.data should contain the user object (email, fullName, etc.)
                onLoginSuccess(result.data.user);
                
                // Navigate using React Router
                navigate('/dashboard');
            } else {
                alert(result.message || 'Login failed. Check your credentials.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Login Error:', error);
            alert('Network error. Please try again later.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <nav className="simple-nav">
                <Link to="/" className="btn-link">← Back to Home</Link>
            </nav>
            
            <div className="auth-container">
                <h2>Login to OKZ Sports</h2>
                <form onSubmit={handleSubmit} id="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com" 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password" 
                            required 
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="btn btn-primary"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <p className="auth-footer">
                    Don't have an account? <Link to="/register" className="btn-link">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default UserLogin;