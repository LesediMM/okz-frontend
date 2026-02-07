import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const UserRegister = () => {
    const navigate = useNavigate();
    
    // Local state for form fields
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const res = await response.json();

            if (response.ok && res.status === 'success') {
                alert('✅ Registration successful! Please login.');
                navigate('/login'); // Automatic navigation via React Router
            } else {
                const errorMessage = res.message || 'Registration failed.';
                alert(`Error: ${errorMessage}`);
                setLoading(false);
            }
        } catch (err) {
            console.error('Registration error:', err);
            alert('Connection error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-header">
                <h2>Join OKZ Sports</h2>
                <p>Create an account to book Padel and Tennis courts</p>
            </div>
            
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input 
                        type="text" 
                        name="fullName" 
                        placeholder="Enter your full name" 
                        value={formData.fullName}
                        onChange={handleChange}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="name@example.com" 
                        value={formData.email}
                        onChange={handleChange}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Min. 6 chars (1 Upper, 1 Lower, 1 Number)" 
                        value={formData.password}
                        onChange={handleChange}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input 
                        type="tel" 
                        name="phoneNumber" 
                        placeholder="e.g. 01012345678" 
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required 
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary btn-block" 
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>

            <div className="auth-footer">
                <p>Already have an account? <Link to="/login" className="btn-link">Login here</Link></p>
            </div>
        </div>
    );
};

export default UserRegister;