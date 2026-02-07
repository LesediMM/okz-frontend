/**
 * src/pages/UserRegister.js
 * User Registration Page - 100% Manual Routing Version
 */

import UserLogin from './UserLogin.js';

export default {
    render: () => `
        <div class="auth-page">
            <div class="auth-header">
                <h2>Join OKZ Sports</h2>
                <p>Create an account to book Paddle and Tennis courts</p>
            </div>
            
            <form id="register-form" class="auth-form">
                <div class="form-group">
                    <label for="fullName">Full Name</label>
                    <input type="text" id="fullName" name="fullName" placeholder="Enter your full name" required>
                </div>

                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" placeholder="name@example.com" required>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Min. 6 chars (1 Upper, 1 Lower, 1 Number)" required>
                </div>

                <div class="form-group">
                    <label for="phoneNumber">Phone Number</label>
                    <input type="tel" id="phoneNumber" name="phoneNumber" placeholder="e.g. 01012345678" required>
                </div>

                <button type="submit" id="reg-btn" class="btn btn-primary btn-block">Register</button>
            </form>

            <div class="auth-footer">
                <p>Already have an account? <button id="to-login-btn" class="btn-link">Login here</button></p>
            </div>
        </div>
    `,

    afterRender: () => {
        const form = document.getElementById('register-form');
        const btn = document.getElementById('reg-btn');
        const loginRedirectBtn = document.getElementById('to-login-btn');
        const appContainer = document.getElementById('app');

        // Manual Navigation to Login
        loginRedirectBtn.addEventListener('click', () => {
            appContainer.innerHTML = UserLogin.render();
            if (UserLogin.afterRender) UserLogin.afterRender();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            btn.disabled = true;
            btn.innerText = 'Creating Account...';

            const userData = {
                fullName: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
                phoneNumber: document.getElementById('phoneNumber').value.trim()
            };

            try {
                const response = await fetch('https://okz.onrender.com/api/v1/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': 'https://okz-frontend.onrender.com'
                    },
                    body: JSON.stringify(userData)
                });

                const res = await response.json();

                if (response.ok && res.status === 'success') {
                    // Store the User ID immediately
                    if (res.data && res.data.user && res.data.user.userId) {
                        localStorage.setItem('okz_user_id', res.data.user.userId);
                        localStorage.setItem('okz_user_email', res.data.user.email);
                    }

                    alert('Registration successful! Please login.');
                    
                    // --- MANUAL NAVIGATION TO LOGIN ---
                    appContainer.innerHTML = UserLogin.render();
                    if (UserLogin.afterRender) {
                        await UserLogin.afterRender();
                    }
                } else {
                    alert(res.message || 'Registration failed.');
                    btn.disabled = false;
                    btn.innerText = 'Register';
                }
            } catch (err) {
                console.error('Registration error:', err);
                alert('Connection error.');
                btn.disabled = false;
                btn.innerText = 'Register';
            }
        });
    }
};