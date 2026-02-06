/**
 * OKZ Sports - Admin Login Page
 * Developed by S.R.C Laboratories
 * Administrator authentication page
 */

import { validateAdminLogin, sanitizeFormData } from '../utils/validation.js';
import { showNotification } from '../utils/notification.js';

export default function AdminLogin({ store, router, onNavigate, onShowNotification }) {
    const container = document.createElement('div');
    container.className = 'admin-login-page';
    
    // Render function
    const render = () => {
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-card admin-card">
                    <div class="auth-header">
                        <a href="/" class="back-home" id="back-home">
                            <i class="fas fa-arrow-left"></i> Back to Home
                        </a>
                        <div class="auth-logo">
                            <div class="logo-icon admin">
                                <i class="fas fa-lock"></i>
                            </div>
                            <h2>Admin Portal</h2>
                            <p>OKZ Sports Court Management System</p>
                        </div>
                    </div>
                    
                    <form id="admin-login-form" class="auth-form">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                placeholder="Enter admin username"
                                required
                                autocomplete="username"
                            >
                            <div class="error-message" id="username-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                placeholder="Enter admin password"
                                required
                                autocomplete="current-password"
                            >
                            <div class="error-message" id="password-error"></div>
                        </div>
                        
                        <div class="form-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="remember-me" name="remember-me">
                                <span>Keep me logged in</span>
                            </label>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block" id="login-btn">
                            <span class="btn-text">Login as Admin</span>
                            <div class="spinner hidden" id="login-spinner"></div>
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <div class="security-notice">
                            <i class="fas fa-shield-alt"></i>
                            <p>Restricted access. Authorized personnel only.</p>
                        </div>
                        <div class="divider">
                            <span>or</span>
                        </div>
                        <a href="/login" class="btn btn-outline btn-block" id="user-login-link">
                            <i class="fas fa-user"></i> User Login
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        return container;
    };
    
    // Initialize component
    const init = () => {
        setupEventListeners();
        setupFormValidation();
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Back to home link
        const backHome = container.querySelector('#back-home');
        if (backHome) {
            backHome.addEventListener('click', (e) => {
                e.preventDefault();
                onNavigate('/');
            });
        }
        
        // Admin login form submission
        const loginForm = container.querySelector('#admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleAdminLogin);
        }
        
        // User login link
        const userLoginLink = container.querySelector('#user-login-link');
        if (userLoginLink) {
            userLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                onNavigate('/login');
            });
        }
    };
    
    // Setup form validation
    const setupFormValidation = () => {
        const usernameInput = container.querySelector('#username');
        const passwordInput = container.querySelector('#password');
        
        if (usernameInput) {
            usernameInput.addEventListener('blur', validateUsername);
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('blur', validatePassword);
        }
    };
    
    // Validate username input
    const validateUsername = () => {
        const usernameInput = container.querySelector('#username');
        const errorElement = container.querySelector('#username-error');
        
        if (!usernameInput.value.trim()) {
            showError(usernameInput, errorElement, 'Username is required');
            return false;
        }
        
        clearError(usernameInput, errorElement);
        return true;
    };
    
    // Validate password input
    const validatePassword = () => {
        const passwordInput = container.querySelector('#password');
        const errorElement = container.querySelector('#password-error');
        
        if (!passwordInput.value.trim()) {
            showError(passwordInput, errorElement, 'Password is required');
            return false;
        }
        
        if (passwordInput.value.length < 6) {
            showError(passwordInput, errorElement, 'Password must be at least 6 characters');
            return false;
        }
        
        clearError(passwordInput, errorElement);
        return true;
    };
    
    // Show error message
    const showError = (input, errorElement, message) => {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    };
    
    // Clear error message
    const clearError = (input, errorElement) => {
        input.classList.remove('error');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    };
    
    // Handle admin login form submission
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateUsername() || !validatePassword()) {
            return;
        }
        
        const formData = new FormData(e.target);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };
        
        // Sanitize data
        const sanitizedData = sanitizeFormData(data);
        
        // Show loading state
        const loginBtn = container.querySelector('#login-btn');
        const btnText = container.querySelector('.btn-text');
        const spinner = container.querySelector('#login-spinner');
        
        if (loginBtn && btnText && spinner) {
            loginBtn.disabled = true;
            btnText.textContent = 'Logging in...';
            spinner.classList.remove('hidden');
        }
        
        try {
            // Call API to login as admin
            const response = await store.api.auth.adminLogin(sanitizedData.username, sanitizedData.password);
            
            // Store admin data
            store.auth.setAdmin(response.data.user);
            store.auth.setAdminToken(response.data.token);
            
            // Show success notification
            if (onShowNotification) {
                onShowNotification({
                    type: 'success',
                    title: 'Admin Login Successful',
                    message: 'Welcome to the OKZ Sports admin portal.',
                    duration: 3000
                });
            }
            
            // Redirect to admin dashboard
            setTimeout(() => {
                onNavigate('/admin/dashboard');
            }, 1000);
            
        } catch (error) {
            console.error('Admin login error:', error);
            
            // Show error notification
            if (onShowNotification) {
                onShowNotification({
                    type: 'error',
                    title: 'Login Failed',
                    message: error.message || 'Invalid username or password.',
                    duration: 5000
                });
            }
            
            // Highlight form errors
            const usernameInput = container.querySelector('#username');
            const passwordInput = container.querySelector('#password');
            const usernameError = container.querySelector('#username-error');
            const passwordError = container.querySelector('#password-error');
            
            if (usernameError) {
                showError(usernameInput, usernameError, 'Invalid username or password');
            }
            
            if (passwordError) {
                showError(passwordInput, passwordError, 'Invalid username or password');
            }
            
        } finally {
            // Reset button state
            if (loginBtn && btnText && spinner) {
                loginBtn.disabled = false;
                btnText.textContent = 'Login as Admin';
                spinner.classList.add('hidden');
            }
        }
    };
    
    return {
        render,
        init
    };
}