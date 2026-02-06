import { authApi } from '../api/auth.js';

export default {
    render: () => `
        <div class="auth-page">
            <h2>User Login</h2>
            <form id="login-form">
                <input type="email" id="email" placeholder="Email" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit" class="btn btn-primary">Login</button>
            </form>
        </div>
    `,
    afterRender: () => {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await authApi.login({
                email: e.target.email.value,
                password: e.target.password.value
            });
            if (res.status === 'success') {
                localStorage.setItem('accessToken', res.data.tokens.accessToken);
                window.location.hash = '#/dashboard';
            } else alert(res.message);
        });
    }
};