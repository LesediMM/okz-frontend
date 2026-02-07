/**
 * src/pages/UserLogin.js
 * Force-Navigation Version - Fixed
 */
import App from '../app.js';

export default {
    render: () => `
        <div class="auth-page">
            <div class="auth-header">
                <h2>Welcome Back</h2>
                <p>Login to manage your OKZ Sports bookings</p>
            </div>
            
            <form id="login-form" class="auth-form">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" placeholder="name@example.com" required>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required>
                </div>

                <button type="submit" id="login-btn" class="btn btn-primary btn-block">Login</button>
            </form>

            <div class="auth-footer">
                <p>Don't have an account? <a href="#/register">Register here</a></p>
            </div>
        </div>
    `,

    afterRender: () => {
        const form = document.getElementById('login-form');
        const btn = document.getElementById('login-btn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            btn.disabled = true;
            btn.innerText = 'Verifying...';

            const credentials = {
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value
            };

            try {
                const response = await fetch('https://okz.onrender.com/api/v1/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': 'https://okz-frontend.onrender.com'
                    },
                    body: JSON.stringify(credentials)
                });

                const res = await response.json();

                // Check for that 200 OK / Success status
                if (response.ok && res.status === 'success') {
                    const userId = res.data?.userId;
                    const userData = res.data?.user;

                    // 1. Mandatory Data Save
                    localStorage.setItem('okz_user_id', userId);
                    localStorage.setItem('user', JSON.stringify(userData));
                    
                    // 2. Clear old session data
                    localStorage.removeItem('accessToken');

                    // 3. Update App state immediately
                    if (typeof App !== 'undefined' && App.state) {
                        App.state.isAuthenticated = true;
                        App.state.user = userData;
                    }
                    
                    // 4. Navigate WITHOUT reloading
                    btn.innerText = 'Success! Redirecting...';
                    
                    // Give a moment for state to update, then navigate to home
                    setTimeout(() => {
                        window.location.hash = '#/';
                    }, 100);
                    
                } else {
                    alert(res.message || 'Invalid credentials.');
                    btn.disabled = false;
                    btn.innerText = 'Login';
                }
            } catch (err) {
                console.error('Force-Nav Login Error:', err);
                alert('Server unreachable. Is the backend awake?');
                btn.disabled = false;
                btn.innerText = 'Login';
            }
        });
    }
};