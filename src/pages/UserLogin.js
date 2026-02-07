/**
 * src/pages/UserLogin.js
 * MANUAL ROUTING VERSION - Direct component injection
 * ULTRA-SIMPLE 200 OK NAVIGATION
 */

import UserDashboard from './UserDashboard.js';
import Home from './Home.js';
import UserRegister from './UserRegister.js';

export default {
    render: () => `
        <div class="auth-page">
            <nav class="simple-nav">
                <button id="back-home-btn" class="btn-link">← Back to Home</button>
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
                    Don't have an account? <button id="to-register-btn" class="btn-link">Register here</button>
                </p>
            </div>
        </div>
    `,

    afterRender: () => {
        const form = document.getElementById('login-form');
        const btn = document.getElementById('login-btn');
        const backBtn = document.getElementById('back-home-btn');
        const regBtn = document.getElementById('to-register-btn');
        const appContainer = document.getElementById('app');

        // --- MANUAL NAVIGATION HANDLERS ---
        backBtn.addEventListener('click', () => {
            appContainer.innerHTML = Home.render();
            if (Home.afterRender) Home.afterRender();
        });

        regBtn.addEventListener('click', () => {
            appContainer.innerHTML = UserRegister.render();
            if (UserRegister.afterRender) UserRegister.afterRender();
        });

        // --- FORM SUBMISSION LOGIC ---
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

                // --- ULTRA SIMPLE NAVIGATION ---
                // ONLY REQUIRE 200 OK TO GO TO DASHBOARD
                if (response.ok) {
                    appContainer.innerHTML = UserDashboard.render();
                    if (UserDashboard.afterRender) {
                        try {
                            await UserDashboard.afterRender();
                        } catch (err) {
                            console.error('Dashboard afterRender error:', err);
                        }
                    }
                } else {
                    // Optional: simple alert for failed login
                    alert('Login failed. Please check your credentials.');
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
