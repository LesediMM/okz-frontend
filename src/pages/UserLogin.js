/**
 * src/pages/UserLogin.js
 * SELF-NAVIGATING VERSION - Handles component transitions internally
 */

import UserDashboard from './UserDashboard.js';

export default {
    render: () => `
        <div class="auth-page">
            <nav class="simple-nav">
                <a href="/">← Back to Home</a>
            </nav>
            
            <div class="auth-container">
                <h2>Login to OKZ Sports</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" placeholder="name@example.com" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" placeholder="Enter your password" required>
                    </div>
                    
                    <button type="submit" id="login-btn" class="btn btn-primary">Login</button>
                </form>
                
                <p class="auth-footer">
                    Don't have an account? <a href="/register">Register here</a>
                </p>
            </div>
        </div>
    `,

    afterRender: () => {
        const form = document.getElementById('login-form');
        const btn = document.getElementById('login-btn');
        const root = document.getElementById('main-container') || document.getElementById('root') || document.body;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            btn.disabled = true;
            btn.textContent = 'Logging in...';

            try {
                const response = await fetch('https://okz.onrender.com/api/v1/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': 'https://okz-frontend.onrender.com'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                
                if (response.ok) {
                    if (data.data && data.data.userId) {
                        // 1. Persist Session
                        localStorage.setItem('okz_user_id', data.data.userId);
                        localStorage.setItem('user', JSON.stringify(data.data.user || {}));
                        
                        // 2. SELF-NAVIGATE: Clear screen and render Dashboard
                        root.innerHTML = UserDashboard.render();
                        
                        // 3. EXECUTE LOGIC: Trigger the Dashboard's API calls
                        if (UserDashboard.afterRender) {
                            await UserDashboard.afterRender();
                        }
                    } else {
                        alert('Login successful but no user data received.');
                        btn.disabled = false;
                        btn.textContent = 'Login';
                    }
                } else {
                    alert(data.message || 'Login failed. Please check your credentials.');
                    btn.disabled = false;
                    btn.textContent = 'Login';
                }
                
            } catch (error) {
                console.error('Login Error:', error);
                alert('Network error. Please check your internet connection.');
                btn.disabled = false;
                btn.textContent = 'Login';
            }
        });
    }
};