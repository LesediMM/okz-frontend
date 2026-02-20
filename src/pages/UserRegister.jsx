import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css'; 

// ===== FALLBACKS - Isolated inline (no extra files) =====
const RegisterFallbacks = {
    // Track registration attempts per email (light circuit breaker)
    attemptTracker: new Map(),
    
    checkAttempts(email) {
        const attempts = this.attemptTracker.get(email?.toLowerCase());
        if (attempts) {
            // 3 attempts max in 30 minutes for registration
            if (attempts.count >= 3 && Date.now() - attempts.firstAttempt < 1800000) {
                return {
                    blocked: true,
                    remaining: 0,
                    resetIn: Math.ceil((1800000 - (Date.now() - attempts.firstAttempt)) / 60000)
                };
            }
            // Reset if older than 30 min
            if (Date.now() - attempts.firstAttempt > 1800000) {
                this.attemptTracker.delete(email?.toLowerCase());
            }
        }
        return { blocked: false, remaining: 3 - (attempts?.count || 0) };
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
    },

    // Password strength checker (FAIL HARD)
    checkPasswordStrength(password) {
        const checks = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };
        
        const strength = Object.values(checks).filter(Boolean).length;
        
        let message = '';
        if (strength < 3) {
            message = 'Password too weak. Use at least 8 chars, 1 uppercase, 1 number.';
        } else if (strength < 4) {
            message = 'Password could be stronger. Consider adding a special character.';
        }
        
        return { checks, strength, message };
    },

    // Retry with backoff
    async retry(fn, maxRetries = 2) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (err) {
                const isLast = i === maxRetries - 1;
                if (isLast) throw err;
                
                // Don't retry validation errors
                if (err.message?.includes('Validation')) throw err;
                
                const wait = 1000 * Math.pow(2, i);
                console.log(`🔄 Register retry ${i + 1}/${maxRetries} in ${wait}ms`);
                await new Promise(r => setTimeout(r, wait));
            }
        }
    },

    // Timeout wrapper (10 seconds - registration can be slower)
    async withTimeout(promise, ms = 10000) {
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

    // Field validation cache (to avoid repeated checks)
    validationCache: {
        email: new Set(),
        
        addEmail(email) {
            this.email.add(email.toLowerCase());
        },
        
        hasEmail(email) {
            return this.email.has(email.toLowerCase());
        }
    },

    // User-friendly messages
    messages: {
        rateLimit: 'Too many registration attempts. Please wait {minutes} minutes.',
        network: 'Network connection unavailable. Please check your internet.',
        timeout: 'Request timed out. The server might be waking up.',
        weakPassword: 'Please use a stronger password.',
        emailTaken: 'This email is already registered. Try logging in.',
        offline: 'You are offline. Please connect to the internet.',
        default: 'Registration failed. Please try again.'
    }
};

// Initialize
RegisterFallbacks.network.init();
// ===== END FALLBACKS =====

const UserRegister = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [rateLimitInfo, setRateLimitInfo] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState({ message: '', strength: 5 });

    // ✅ Helper Function (Matches Booking.jsx)
    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^[0-9+\s-]{8,15}$/;
        return phoneRegex.test(phone.trim());
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // FAIL HARD: Real-time password strength check
        if (name === 'password') {
            const strength = RegisterFallbacks.checkPasswordStrength(value);
            setPasswordStrength(strength);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setRateLimitInfo(null);

        // FAIL HARD: Check network first
        if (!RegisterFallbacks.network.isOnline) {
            setErrorMessage(RegisterFallbacks.messages.offline);
            return;
        }

        // 🛡️ FRONTEND VALIDATION GUARD (existing)
        if (!validatePhoneNumber(formData.phoneNumber)) {
            setErrorMessage("Please enter a valid phone number (8-15 digits, can include +, spaces, or hyphens)");
            return;
        }

        // FAIL HARD: Password strength check
        if (formData.password.length < 8) {
            setErrorMessage("Password must be at least 8 characters long");
            return;
        }

        // FAIL HARD: Check rate limiting
        const attemptCheck = RegisterFallbacks.checkAttempts(formData.email);
        if (attemptCheck.blocked) {
            const message = RegisterFallbacks.messages.rateLimit.replace(
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

        // FAIL SAFE: Quick cache check for duplicate email
        if (RegisterFallbacks.validationCache.hasEmail(formData.email)) {
            setErrorMessage(RegisterFallbacks.messages.emailTaken);
            return;
        }

        setLoading(true);

        try {
            // FAIL HARD: Add timeout and retry
            const response = await RegisterFallbacks.retry(async () => {
                return await RegisterFallbacks.withTimeout(
                    fetch('https://okz.onrender.com/api/v1/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    })
                );
            });

            const res = await response.json();

            if (response.ok && res.status === 'success') {
                // FAIL SAFE: Record successful registration
                RegisterFallbacks.recordAttempt(formData.email, true);
                navigate('/login');
            } else {
                // FAIL HARD: Record failed attempt
                RegisterFallbacks.recordAttempt(formData.email, false);
                
                // Cache email if duplicate error
                if (res.message?.includes('already exists') || res.errorCode === 'DUPLICATE_EMAIL') {
                    RegisterFallbacks.validationCache.addEmail(formData.email);
                }
                
                // 🛡️ THE ERROR KILLER (existing)
                const msg = res.errors && res.errors.length > 0 
                    ? res.errors[0].message 
                    : (res.message || 'Registration failed.');
                
                // Update remaining attempts
                const check = RegisterFallbacks.checkAttempts(formData.email);
                if (check.remaining > 0 && !msg.includes('already exists')) {
                    setErrorMessage(`${msg} (${check.remaining} attempts remaining)`);
                } else {
                    setErrorMessage(msg);
                }
                setLoading(false);
            }
        } catch (err) {
            console.error('Registration error:', err);
            
            // FAIL HARD: Record failed attempt
            RegisterFallbacks.recordAttempt(formData.email, false);
            
            // FAIL SAFE: Show appropriate error message
            if (err.message === 'Request timeout') {
                setErrorMessage(RegisterFallbacks.messages.timeout);
            } else if (!RegisterFallbacks.network.isOnline) {
                setErrorMessage(RegisterFallbacks.messages.offline);
            } else {
                setErrorMessage('Connection error. The server might be waking up.');
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
            {!RegisterFallbacks.network.isOnline && !rateLimitInfo && (
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
                    <div className="apple-logo-icon" style={{ color: 'var(--brand-navy)' }}>🎾</div>
                    <h2>Join OKZ</h2>
                    <p className="text-muted">Experience premier court management.</p>
                </div>

                {/* 🛡️ Dynamic Error Banner (existing) */}
                {errorMessage && (
                    <div className="error-banner apple-fade-in">
                        <span className="error-icon">⚠️</span>
                        {errorMessage}
                    </div>
                )}
                
                {/* FAIL SAFE: Password strength indicator */}
                {formData.password.length > 0 && passwordStrength.message && (
                    <div style={{
                        backgroundColor: passwordStrength.strength < 3 ? 'rgba(255,193,7,0.1)' : 'rgba(40,167,69,0.1)',
                        color: passwordStrength.strength < 3 ? '#856404' : '#155724',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        fontSize: '0.8rem',
                        border: `1px solid ${passwordStrength.strength < 3 ? '#ffc107' : '#28a745'}`
                    }}>
                        {passwordStrength.message}
                    </div>
                )}
                
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
                            disabled={loading || rateLimitInfo !== null || !RegisterFallbacks.network.isOnline}
                            style={{
                                opacity: (loading || rateLimitInfo !== null || !RegisterFallbacks.network.isOnline) ? 0.7 : 1
                            }}
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
                            disabled={loading || rateLimitInfo !== null || !RegisterFallbacks.network.isOnline}
                            style={{
                                opacity: (loading || rateLimitInfo !== null || !RegisterFallbacks.network.isOnline) ? 0.7 : 1
                            }}
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Min 8 chars, 1 Upper, 1 Number" 
                            value={formData.password}
                            onChange={handleChange}
                            required 
                            disabled={loading || rateLimitInfo !== null || !RegisterFallbacks.network.isOnline}
                            style={{
                                opacity: (loading || rateLimitInfo !== null || !RegisterFallbacks.network.isOnline) ? 0.7 : 1,
                                borderColor: formData.password && passwordStrength.strength < 3 ? '#ffc107' : undefined
                            }}
                        />
                    </div>

                    <div className="input-group">
                        <label>Phone Number</label>
                        <input 
                            type="tel" 
                            name="phoneNumber" 
                            placeholder="e.g., +20 123 456 7890" 
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            pattern="[0-9+\s-]{8,15}"
                            required 
                            disabled={loading || rateLimitInfo !== null || !RegisterFallbacks.network.isOnline}
                            style={{
                                opacity: (loading || rateLimitInfo !== null || !RegisterFallbacks.network.isOnline) ? 0.7 : 1
                            }}
                        />
                        <small className="field-hint" style={{ 
                            display: 'block', 
                            fontSize: '0.7rem', 
                            color: '#666', 
                            marginTop: '4px',
                            opacity: 0.7
                        }}>
                            8-15 digits, spaces and + allowed.
                        </small>
                    </div>

                    {/* FAIL SAFE: Rate limit info */}
                    {!rateLimitInfo && !errorMessage && RegisterFallbacks.network.isOnline && (
                        <div style={{
                            fontSize: '0.7rem',
                            color: '#666',
                            marginTop: '5px',
                            textAlign: 'right'
                        }}>
                            ⚡ 3 attempts per 30 minutes
                        </div>
                    )}

                    <div className="auth-actions">
                        <button 
                            type="submit" 
                            className={`btn-primary ${loading ? 'btn-loading' : ''}`}
                            style={{ 
                                width: '100%', 
                                padding: '16px', 
                                fontSize: '1rem',
                                opacity: (loading || rateLimitInfo !== null || !RegisterFallbacks.network.isOnline) ? 0.7 : 1,
                                cursor: (loading || rateLimitInfo !== null || !RegisterFallbacks.network.isOnline) ? 'not-allowed' : 'pointer'
                            }}
                            disabled={loading || rateLimitInfo !== null || !RegisterFallbacks.network.isOnline}
                        >
                            {loading ? 'Creating Account...' : 
                             !RegisterFallbacks.network.isOnline ? 'Offline' : 
                             rateLimitInfo ? 'Too Many Attempts' : 'Continue'}
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