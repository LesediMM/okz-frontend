import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css'; // Importing your new separation of concerns style

const UserLogin = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('https://okz.onrender.com/api/v1/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                onLoginSuccess(result.data.user);
                navigate('/dashboard');
            } else {
                alert(result.message || 'Login failed. Check your credentials.');
                setLoading(false);
            }
        } catch (error) {
            alert('Network error. Please try again later.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-page apple-fade-in">
            {/* Using glass-panel from global.css and auth-card from Auth.css */}
            <div className="glass-panel auth-card">
                <div className="auth-header">
                    <div className="apple-id-icon" style={{ color: 'var(--brand-navy)' }}>🎾</div>
                    <h2>Sign In</h2>
                    <p className="text-muted">Access your OKZ Sports Portal</p>
                </div>
                
                <form onSubmit={handleSubmit} className="apple-form">
                    <div className="input-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="apple@id.com" 
                            required 
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Required" 
                            required 
                        />
                    </div>
                    
                    <div className="auth-actions">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="btn-primary"
                            style={{ width: '100%', padding: '16px', fontSize: '1rem', marginTop: '1rem' }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </form>
                
                <div className="auth-footer" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        New to OKZ? 
                        <Link to="/register" style={{ color: 'var(--brand-navy)', fontWeight: '700', marginLeft: '6px', textDecoration: 'none' }}>
                            Create Account
                        </Link>
                    </p>
                    <Link to="/" style={{ display: 'block', marginTop: '1.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;