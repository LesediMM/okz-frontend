export default {
    render: () => `
        <div class="auth-page">
            <h2>Admin Portal</h2>
            <form id="admin-login-form">
                <input type="password" id="admin-key" placeholder="Enter Admin Secret Key" required>
                <button type="submit" class="btn btn-primary">Verify Admin</button>
            </form>
        </div>
    `,
    afterRender: () => {
        document.getElementById('admin-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            // Admins use a different login flow as per backend
            window.location.hash = '#/admin/dashboard';
        });
    }
};