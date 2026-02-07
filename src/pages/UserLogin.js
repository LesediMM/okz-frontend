/**
 * src/pages/UserLogin.js
 * MANUAL ROUTING VERSION - Fixed to save user data before navigation
 * Uses sessionStorage for better security
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

            // Clear any previous session data first
            sessionStorage.removeItem('okz_user_id');
            sessionStorage.removeItem('user');
            localStorage.removeItem('okz_user_id');
            localStorage.removeItem('user');

            btn.disabled = true;
            btn.textContent = 'Logging in...';

            try {
                console.log('🔐 Attempting login for:', email);
                
                const response = await fetch('https://okz.onrender.com/api/v1/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': 'https://okz-frontend.onrender.com'
                    },
                    body: JSON.stringify({ email, password })
                });

                // --- PARSE RESPONSE ---
                const result = await response.json();
                console.log('📥 Login API response:', result);

                if (response.ok && result.status === 'success') {
                    
                    // ✅ CRITICAL: EXTRACT AND VALIDATE USER DATA
                    const userId = result.data?.userId;
                    const user = result.data?.user;
                    
                    if (!userId) {
                        console.error('❌ No userId in API response');
                        alert('Login successful but no user ID received. Please contact support.');
                        btn.disabled = false;
                        btn.textContent = 'Login';
                        return;
                    }
                    
                    console.log('✅ Login successful!');
                    console.log('User ID:', userId);
                    console.log('User object:', user);
                    
                    // ✅ SAVE TO SESSION STORAGE (more secure)
                    sessionStorage.setItem('okz_user_id', userId);
                    if (user) {
                        sessionStorage.setItem('user', JSON.stringify(user));
                    }
                    
                    // ✅ Also save to localStorage as backup
                    localStorage.setItem('okz_user_id', userId);
                    if (user) {
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                    
                    // ✅ VERIFY SAVED DATA
                    const savedUserId = sessionStorage.getItem('okz_user_id');
                    console.log('💾 Saved to sessionStorage:', savedUserId);
                    console.log('Matches original?', savedUserId === userId);
                    
                    // ✅ Update App.state
                    try {
                        const AppModule = await import('../app.js');
                        const App = AppModule.default;
                        App.state.user = user;
                        App.state.isAuthenticated = true;
                        console.log('✅ Updated App.state');
                    } catch (err) {
                        console.log('⚠️ Could not update App.state:', err);
                    }
                    
                    // ✅ NAVIGATE TO DASHBOARD
                    console.log('🚀 Navigating to Dashboard...');
                    appContainer.innerHTML = UserDashboard.render();
                    
                    if (UserDashboard.afterRender) {
                        try {
                            await UserDashboard.afterRender();
                        } catch (err) {
                            console.error('❌ Dashboard afterRender error:', err);
                            // Even if afterRender fails, at least we're on Dashboard
                        }
                    }
                    
                } else {
                    // Handle API error
                    console.error('❌ Login failed:', result);
                    const errorMessage = result.message || 'Login failed. Please check your credentials.';
                    alert(`Login failed: ${errorMessage}`);
                    btn.disabled = false;
                    btn.textContent = 'Login';
                }

            } catch (error) {
                console.error('❌ Network/Login Error:', error);
                alert('Network error. Please check your internet connection.');
                btn.disabled = false;
                btn.textContent = 'Login';
            }
        });
    }
};