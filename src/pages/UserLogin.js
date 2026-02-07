/**
 * src/pages/UserLogin.js
 * User Authentication Page - Updated for User ID System
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

            btn.disabled = true;
            btn.innerText = 'Authenticating...';

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

                if (response.ok && res.status === 'success') {
                    /**
                     * USER ID SYSTEM UPDATE:
                     * We no longer use tokens. We store the userId directly.
                     */
                    const userId = res.data && res.data.userId;
                    const userData = res.data && res.data.user;

                    if (!userId) {
                        throw new Error('User ID missing from server response');
                    }

                    // 1. Store ID for API authentication headers
                    localStorage.setItem('okz_user_id', userId);
                    
                    // 2. Store User details for UI display
                    localStorage.setItem('user', JSON.stringify(userData || { email: credentials.email }));

                    // 3. Clear any old tokens just in case
                    localStorage.removeItem('accessToken');

                    // 4. Redirect
                    window.location.hash = '#/booking';
                    window.location.reload();
                    
                } else {
                    alert(res.message || 'Login failed. Please check your credentials.');
                    btn.disabled = false;
                    btn.innerText = 'Login';
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('Connection error. Please try again.');
                btn.disabled = false;
                btn.innerText = 'Login';
            }
        });
    }
};