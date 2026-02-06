/**
 * src/pages/UserRegister.js
 * User Registration Page
 */

import { authApi } from '../api/auth.js';

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
                    <input type="password" id="password" name="password" placeholder="Min. 6 characters" required>
                </div>

                <div class="form-group">
                    <label for="phoneNumber">Phone Number</label>
                    <input type="tel" id="phoneNumber" name="phoneNumber" placeholder="e.g. 01012345678" required>
                </div>

                <button type="submit" id="reg-btn" class="btn btn-primary btn-block">Register</button>
            </form>

            <div class="auth-footer">
                <p>Already have an account? <a href="#/login">Login here</a></p>
            </div>
        </div>
    `,

    afterRender: () => {
        const form = document.getElementById('register-form');
        const btn = document.getElementById('reg-btn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Enter Loading State
            btn.disabled = true;
            btn.innerText = 'Creating Account...';

            // 2. Extract data directly from form elements
            const userData = {
                fullName: form.fullName.value.trim(),
                email: form.email.value.trim(),
                password: form.password.value,
                phoneNumber: form.phoneNumber.value.trim()
            };

            // 3. Call the API
            try {
                const res = await authApi.register(userData);

                if (res.status === 'success') {
                    alert('Registration successful! Redirecting to login...');
                    window.location.hash = '#/login';
                } else {
                    // This catches the 400 error message (like "Email already exists")
                    alert(res.message || 'Registration failed. Please check your details.');
                    btn.disabled = false;
                    btn.innerText = 'Register';
                }
            } catch (err) {
                alert('A network error occurred. Please try again.');
                btn.disabled = false;
                btn.innerText = 'Register';
            }
        });
    }
};