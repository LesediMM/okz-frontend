import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
            <div className="card glass-card auth-container">
                <div className="auth-header">
                    <div className="apple-logo-icon"></div>
                    <h2>Create Account</h2>
                    <p className="text-muted">Start your OKZ Sports journey today.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="apple-form">
                    <div className="form-group">
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

                    <div className="form-group">
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

                    <div className="form-group">
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

                    <div className="form-group">
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
                            className={`btn btn-primary btn-large ${loading ? 'btn-loading' : ''}`} 
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Continue'}
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    <p>Already a member? <Link to="/login" className="apple-link">Sign In</Link></p>
                </div>
            </div>

            <style>{`
                .auth-page {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 80vh;
                    padding: 1rem;
                }

                .auth-container {
                    width: 100%;
                    max-width: 420px;
                    padding: 3rem 2rem !important;
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .apple-logo-icon {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                    color: #000;
                }

                .auth-header h2 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .apple-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-group label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-main);
                    margin-bottom: 6px;
                }

                input {
                    transition: all 0.2s ease;
                    background: rgba(255, 255, 255, 0.5);
                }

                input:focus {
                    background: #fff;
                    transform: translateY(-1px);
                }

                .auth-actions {
                    margin-top: 1rem;
                }

                .btn-large {
                    width: 100%;
                    padding: 14px !important;
                    font-size: 1rem;
                }

                .auth-footer {
                    margin-top: 2rem;
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }

                .apple-link {
                    color: var(--system-blue);
                    text-decoration: none;
                    font-weight: 600;
                    margin-left: 4px;
                }

                .btn-loading {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                @media (max-width: 480px) {
                    .auth-container {
                        padding: 2rem 1.5rem !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: transparent !important;
                        backdrop-filter: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default UserRegister;