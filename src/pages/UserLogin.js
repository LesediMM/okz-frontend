/**
 * src/pages/UserLogin.js
 * MANUAL ROUTING VERSION - Fixed to save user data before navigation
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

        // --- FIXED FORM SUBMISSION LOGIC ---
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

                // --- FIX: PARSE RESPONSE AND SAVE USER DATA ---
                const result = await response.json();
                console.log('Login API response:', result);

                if (response.ok && result.status === 'success') {
                    
                    // ✅ CRITICAL: SAVE USER DATA BEFORE NAVIGATION
                    // Save the user ID from API response
                    if (result.data && result.data.userId) {
                        localStorage.setItem('okz_user_id', result.data.userId);
                        console.log('Saved userId:', result.data.userId);
                    }
                    
                    // Save the full user object from API response
                    if (result.data && result.data.user) {
                        localStorage.setItem('user', JSON.stringify(result.data.user));
                        console.log('Saved user:', result.data.user);
                    }
                    
                    // Also update App.state if possible
                    try {
                        const AppModule = await import('../app.js');
                        const App = AppModule.default;
                        App.state.user = result.data.user;
                        App.state.isAuthenticated = true;
                        console.log('Updated App.state');
                    } catch (err) {
                        console.log('Note: Could not update App.state, continuing anyway');
                    }
                    
                    // ✅ NOW navigate to Dashboard with saved data
                    console.log('Navigating to Dashboard...');
                    appContainer.innerHTML = UserDashboard.render();
                    
                    if (UserDashboard.afterRender) {
                        try {
                            await UserDashboard.afterRender();
                        } catch (err) {
                            console.error('Dashboard afterRender error:', err);
                        }
                    }
                    
                } else {
                    // Handle API error (even with 200 status)
                    const errorMessage = result.message || 'Login failed. Please check your credentials.';
                    alert(errorMessage);
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