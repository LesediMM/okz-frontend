/**
 * src/pages/AdminLogin.js
 * Simplified Admin Verification
 */

export default {
    render: () => `
        <div class="auth-page">
            <div class="auth-header">
                <h2>Admin Portal</h2>
                <p>Please enter your administrative credentials to continue.</p>
            </div>
            
            <form id="admin-login-form" class="auth-form">
                <div class="form-group">
                    <label for="admin-key">Admin Secret Key</label>
                    <input type="password" id="admin-key" placeholder="Enter Admin Secret Key" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Verify Admin</button>
            </form>

            <div class="auth-footer">
                <p><a href="#/login">Return to User Login</a></p>
            </div>
        </div>
    `,
    afterRender: () => {
        const form = document.getElementById('admin-login-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const adminKey = document.getElementById('admin-key').value;

            // Simple validation or key storage if your backend requires it
            // For now, we follow your flow to redirect to the dashboard
            if (adminKey) {
                // You might want to store a temporary flag, though real admin 
                // security should come from the JWT token in your dashboard fetch.
                localStorage.setItem('isAdmin', 'true');
                window.location.hash = '#/admin/dashboard';
            } else {
                alert('Please enter a valid secret key.');
            }
        });
    }
};