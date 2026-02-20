import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

// ===== FALLBACKS - Isolated inline (no extra files) =====
const LoginFallbacks = {
    // Track login attempts per email (circuit breaker)
    attemptTracker: new Map(),
    
    checkAttempts(email) {
        const attempts = this.attemptTracker.get(email?.toLowerCase());
        if (attempts) {
            // 5 attempts max in 15 minutes
            if (attempts.count >= 5 && Date.now() - attempts.firstAttempt < 900000) {
                return {
                    blocked: true,
                    remaining: 0,
                    resetIn: Math.ceil((900000 - (Date.now() - attempts.firstAttempt)) / 60000)
                };
            }
            // Reset if older than 15 min
            if (Date.now() - attempts.firstAttempt > 900000) {
                this.attemptTracker.delete(email?.toLowerCase());
            }
        }
        return { blocked: false, remaining: 5 - (attempts?.count || 0) };
    },
    
    recordAttempt(email, success = false) {
        const key = email?.toLowerCase();
        if (success) {
            this.attemptTracker.delete(key);
            return;
        }
        
        const current = this.attemptTracker.get(key) || { 
            count: 0, 
            firstAttempt: Date.now() 
        };
        
        this.attemptTracker.set(key, {
            count: current.count + 1,
            firstAttempt: current.firstAttempt
        });
        
        // Persist to localStorage (optional)
        try {
            const tracker = {};
            this.attemptTracker.forEach((value, key) => {
                tracker[key] = value;
            });
            localStorage.setItem('okz_login_attempts', JSON.stringify(tracker));
        } catch (e) {}
    },

    // Load saved attempts from localStorage
    loadAttempts() {
        try {
            const saved = localStorage.getItem('okz_login_attempts');
            if (saved) {
                const tracker = JSON.parse(saved);
                Object.entries(tracker).forEach(([key, value]) => {
                    this.attemptTracker.set(key, value);
                });
            }
        } catch (e) {}
    },

    // Retry with backoff
    async retry(fn, maxRetries = 2) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (err) {
                const isLast = i === maxRetries - 1;
                if (isLast) throw err;
                
                const wait = 1000 * Math.pow(2, i);
                console.log(`🔄 Login retry ${i + 1}/${maxRetries} in ${wait}ms`);
                await new Promise(r => setTimeout(r, wait));
            }
        }
    },

    // Timeout wrapper (8 seconds)
    async withTimeout(promise, ms = 8000) {
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), ms)
        );
        return Promise.race([promise, timeout]);
    },

    // Network status
    network: {
        isOnline: navigator.onLine,
        
        init() {
            window.addEventListener('online', () => { this.isOnline = true; });
            window.addEventListener('offline', () => { this.isOnline = false; });
        }
    },

    // User-friendly messages
    messages: {
        rateLimit: 'Too many attempts. Please wait {minutes} minutes.',
        network: 'Network connection unavailable. Please check your internet.',
        timeout: 'Request timed out. Please try again.',
        invalid: 'Invalid email or password.',
        server: 'Server is waking up. Please try again.',
        offline: 'You are offline. Please connect to the internet.',
        default: 'Login failed. Please try again.'
    }
};

// Initialize
LoginFallbacks.loadAttempts();
LoginFallbacks.network.init();
// ===== END FALLBACKS =====

const UserLogin = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [rateLimitInfo, setRateLimitInfo] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setRateLimitInfo(null);

        // FAIL HARD: Check network first
        if (!LoginFallbacks.network.isOnline) {
            setErrorMessage(LoginFallbacks.messages.offline);
            return;
        }

        // FAIL HARD: Check rate limiting
        const attemptCheck = LoginFallbacks.checkAttempts(email);
        if (attemptCheck.blocked) {
            const message = LoginFallbacks.messages.rateLimit.replace(
                '{minutes}', 
                attemptCheck.resetIn
            );
            setRateLimitInfo({
                message,
                remaining: 0,
                resetIn: attemptCheck.resetIn
            });
            return;
        }

        setLoading(true);

        try {
            // FAIL HARD: Add timeout and retry
            const response = await LoginFallbacks.retry(async () => {
                return await LoginFallbacks.withTimeout(
                    fetch('https://okz.onrender.com/api/v1/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    })
                );
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                // FAIL SAFE: Record successful login (clears attempt counter)
                LoginFallbacks.recordAttempt(email, true);
                onLoginSuccess(result.data.user);
                navigate('/dashboard');
            } else {
                // FAIL HARD: Record failed attempt
                LoginFallbacks.recordAttempt(email, false);
                
                // Update remaining attempts
                const check = LoginFallbacks.checkAttempts(email);
                
                // FAIL SAFE: Show friendly error message
                const errorMsg = result.message || LoginFallbacks.messages.invalid;
                
                if (check.remaining > 0) {
                    setErrorMessage(`${errorMsg} (${check.remaining} attempts remaining)`);
                } else {
                    setErrorMessage(errorMsg);
                }
                
                setLoading(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // FAIL HARD: Record failed attempt
            LoginFallbacks.recordAttempt(email, false);
            
            // FAIL SAFE: Show appropriate error message
            if (error.message === 'Request timeout') {
                setErrorMessage(LoginFallbacks.messages.timeout);
            } else if (!LoginFallbacks.network.isOnline) {
                setErrorMessage(LoginFallbacks.messages.offline);
            } else {
                setErrorMessage(LoginFallbacks.messages.server);
            }
            
            setLoading(false);
        }
    };

    return (
        <div className="auth-page apple-fade-in">
            {/* FAIL SAFE: Rate limit banner */}
            {rateLimitInfo && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#dc3545',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '30px',
                    fontSize: '0.9rem',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(220,53,69,0.3)'
                }}>
                    ⚠️ {rateLimitInfo.message}
                </div>
            )}

            {/* FAIL SAFE: Offline banner */}
            {!LoginFallbacks.network.isOnline && !rateLimitInfo && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ffc107',
                    color: '#000',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    fontSize: '0.85rem',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    📱 Offline mode - Please check your connection
                </div>
            )}

            <div className="glass-panel auth-card">
                <div className="auth-header">
                    <div className="apple-id-icon" style={{ color: 'var(--brand-navy)' }}>🎾</div>
                    <h2>Sign In</h2>
                    <p className="text-muted">Access your OKZ Sports Portal</p>
                </div>
                
                {/* FAIL SAFE: Error message display */}
                {errorMessage && (
                    <div style={{
                        backgroundColor: 'rgba(220,53,69,0.1)',
                        color: '#dc3545',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        border: '1px solid rgba(220,53,69,0.2)'
                    }}>
                        {errorMessage}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="apple-form">
                    <div className="input-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="apple@id.com" 
                            required 
                            disabled={loading || rateLimitInfo !== null}
                            style={{
                                opacity: (loading || rateLimitInfo !== null) ? 0.7 : 1
                            }}
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
                            disabled={loading || rateLimitInfo !== null}
                            style={{
                                opacity: (loading || rateLimitInfo !== null) ? 0.7 : 1
                            }}
                        />
                    </div>
                    
                    {/* FAIL SAFE: Rate limit info */}
                    {!rateLimitInfo && !errorMessage && (
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#666',
                            marginTop: '5px',
                            textAlign: 'right'
                        }}>
                            ⚡ 5 attempts per 15 minutes
                        </div>
                    )}
                    
                    <div className="auth-actions">
                        <button 
                            type="submit" 
                            disabled={loading || rateLimitInfo !== null || !LoginFallbacks.network.isOnline} 
                            className="btn-primary"
                            style={{ 
                                width: '100%', 
                                padding: '16px', 
                                fontSize: '1rem', 
                                marginTop: '1rem',
                                opacity: (loading || rateLimitInfo !== null || !LoginFallbacks.network.isOnline) ? 0.7 : 1,
                                cursor: (loading || rateLimitInfo !== null || !LoginFallbacks.network.isOnline) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Signing in...' : 
                             !LoginFallbacks.network.isOnline ? 'Offline' : 
                             rateLimitInfo ? 'Too Many Attempts' : 'Sign In'}
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