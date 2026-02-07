/**
 * src/pages/UserLogin.js
 * User Authentication Page - Fixed & Verified
 */

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
                <p><a href="#/forgot-password" class="text-muted">Forgot password?</a></p>
            </div>
        </div>
    `,

    afterRender: () => {
        const form = document.getElementById('login-form');
        const btn = document.getElementById('login-btn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Loading State
            btn.disabled = true;
            btn.innerText = 'Authenticating...';

            const credentials = {
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value
            };

            try {
                // 2. Call Auth API
                const response = await fetch('https://okz.onrender.com/api/v1/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });

                const res = await response.json();

                if (response.ok && res.status === 'success') {
                    /**
                     * FIXED LOGIC:
                     * Backend might send token as res.token OR res.data.token
                     * Backend might send user as res.user OR res.data.user
                     */
                    const token = res.token || (res.data && res.data.token);
                    const user = res.user || (res.data && res.data.user);

                    if (!token) {
                        throw new Error('Token missing from server response');
                    }

                    // 3. Store Auth Data securely
                    localStorage.setItem('accessToken', token);
                    localStorage.setItem('user', JSON.stringify(user || { email: credentials.email }));

                    // 4. Redirect & Refresh
                    // We use hash change first, then reload to ensure App.js sees the new localStorage
                    window.location.hash = '#/booking';
                    window.location.reload();
                    
                } else {
                    // Handle "Invalid credentials" or other errors
                    alert(res.message || 'Login failed. Please check your email and password.');
                    btn.disabled = false;
                    btn.innerText = 'Login';
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('An unexpected error occurred. Please verify your credentials and try again.');
                btn.disabled = false;
                btn.innerText = 'Login';
            }
        });
    }
};