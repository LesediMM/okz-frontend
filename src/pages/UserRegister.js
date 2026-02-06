import { authApi } from '../api/auth.js';

export default {
    render: () => `
        <div class="auth-page">
            <h2>Join OKZ Sports</h2>
            <form id="register-form">
                <input type="text" id="fullName" placeholder="Full Name" required>
                <input type="email" id="email" placeholder="Email Address" required>
                <input type="password" id="password" placeholder="Password (Min 6 chars, A-z, 0-9)" required>
                <input type="tel" id="phoneNumber" placeholder="Phone Number (e.g. 010...)" required>
                <button type="submit" class="btn btn-primary">Register</button>
            </form>
            <p>Already have an account? <a href="#/login">Login here</a></p>
        </div>
    `,
    afterRender: () => {
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await authApi.register({
                fullName: e.target.fullName.value,
                email: e.target.email.value,
                password: e.target.password.value,
                phoneNumber: e.target.phoneNumber.value
            });
            if (res.status === 'success') window.location.hash = '#/login';
            else alert(res.message);
        });
    }
};