import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css'; // Importing your new separation of concerns style

const UserRegister = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('https://okz.onrender.com/api/v1/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const res = await response.json();

            if (response.ok && res.status === 'success') {
                navigate('/login');
            } else {
                alert(`Error: ${res.message || 'Registration failed.'}`);
                setLoading(false);
            }
        } catch (err) {
            alert('Connection error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-page apple-fade-in">
            {/* Using the glass-panel class from global.css and auth-card from Auth.css */}
            <div className="glass-panel auth-card">
                <div className="auth-header">
                    {/* Using your brand navy color for the icon focus */}
                    <div className="apple-logo-icon" style={{ color: 'var(--brand-navy)' }}>🎾</div>
                    <h2>Join OKZ</h2>
                    <p className="text-muted">Experience premier court management.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="apple-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            name="fullName" 
                            placeholder="John Doe" 
                            value={formData.fullName}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="apple@id.com" 
                            value={formData.email}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Required" 
                            value={formData.password}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>Phone Number</label>
                        <input 
                            type="tel" 
                            name="phoneNumber" 
                            placeholder="01XXXXXXXXX" 
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="auth-actions">
                        <button 
                            type="submit" 
                            className="btn-primary"
                            style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Continue'}
                        </button>
                    </div>
                </form>

                <div className="auth-footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already a member? 
                        <Link to="/login" style={{ color: 'var(--brand-navy)', fontWeight: '700', marginLeft: '6px', textDecoration: 'none' }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserRegister;