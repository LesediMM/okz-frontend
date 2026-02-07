import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
            <div className="card glass-card auth-container">
                <div className="auth-header">
                    <div className="apple-id-icon"></div>
                    <h2>Sign In</h2>
                    <p className="text-muted">Use your OKZ Sports ID to continue.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="apple-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="apple@id.com" 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
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
                            className={`btn btn-primary btn-large ${loading ? 'btn-loading' : ''}`}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </form>
                
                <div className="auth-footer">
                    <p>New to OKZ? <Link to="/register" className="apple-link">Create Account</Link></p>
                    <Link to="/" className="apple-link-secondary">← Back to Home</Link>
                </div>
            </div>

            <style>{`
                .auth-page {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 85vh;
                    padding: 20px;
                }

                .auth-container {
                    width: 100%;
                    max-width: 400px;
                    padding: 3rem 2.5rem !important;
                    text-align: center;
                }

                .auth-header {
                    margin-bottom: 2.5rem;
                }

                .apple-id-icon {
                    font-size: 3rem;
                    margin-bottom: 0.5rem;
                    color: #000;
                    font-weight: 300;
                }

                .auth-header h2 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .apple-form {
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-group label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-main);
                    margin-left: 4px;
                }

                input {
                    background: rgba(255, 255, 255, 0.4);
                    border: 1px solid rgba(0, 0, 0, 0.08);
                }

                input:focus {
                    background: #fff;
                }

                .btn-large {
                    width: 100%;
                    padding: 14px !important;
                    font-size: 1rem;
                    margin-top: 1rem;
                }

                .auth-footer {
                    margin-top: 2.5rem;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }

                .apple-link {
                    color: var(--system-blue);
                    text-decoration: none;
                    font-weight: 600;
                }

                .apple-link-secondary {
                    display: block;
                    margin-top: 1.5rem;
                    color: var(--system-gray);
                    text-decoration: none;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .apple-link-secondary:hover {
                    color: var(--text-main);
                }

                @media (max-width: 480px) {
                    .auth-container {
                        padding: 2rem 1rem !important;
                        background: transparent !important;
                        backdrop-filter: none !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default UserLogin;