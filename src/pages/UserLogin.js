/**
 * src/pages/UserLogin.js
 * User Authentication Page
 */

import { authApi } from '../api/auth.js';

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
                email: form.email.value.trim(),
                password: form.password.value
            };

            try {
                // 2. Call Auth API
                const res = await authApi.login(credentials);

                if (res.status === 'success') {
                    // 3. Store Auth Data
                    // Expecting backend to return { data: { token: "...", user: {...} } }
                    localStorage.setItem('accessToken', res.data.token);
                    localStorage.setItem('user', JSON.stringify(res.data.user));

                    // 4. Redirect to Dashboard or Booking page
                    window.location.hash = '#/booking'; 
                } else {
                    // Handle "Invalid credentials" or other 400/401 errors
                    alert(res.message || 'Login failed. Please check your email and password.');
                    btn.disabled = false;
                    btn.innerText = 'Login';
                }
            } catch (err) {
                alert('An unexpected error occurred. Please try again later.');
                btn.disabled = false;
                btn.innerText = 'Login';
            }
        });
    }
};