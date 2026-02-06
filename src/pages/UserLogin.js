/**
 * OKZ Sports - User Login Page
 * Developed by S.R.C Laboratories
 * User authentication page
 */

import { validateLogin, sanitizeFormData } from '../utils/validation.js';
import { showNotification } from '../utils/notification.js';

export default function UserLogin({ store, router, onNavigate, onShowNotification }) {
    const container = document.createElement('div');
    container.className = 'user-login-page';
    
    // Render function
    const render = () => {
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <a href="/" class="back-home" id="back-home">
                            <i class="fas fa-arrow-left"></i> Back to Home
                        </a>
                        <div class="auth-logo">
                            <div class="logo-icon">
                                <i class="fas fa-tennis-ball"></i>
                            </div>
                            <h2>Welcome Back</h2>
                            <p>Login to your OKZ Sports account</p>
                        </div>
                    </div>
                    
                    <form id="login-form" class="auth-form">
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                placeholder="Enter your email"
                                required
                                autocomplete="email"
                            >
                            <div class="error-message" id="email-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                placeholder="Enter your password"
                                required
                                autocomplete="current-password"
                            >
                            <div class="error-message" id="password-error"></div>
                        </div>
                        
                        <div class="form-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="remember-me" name="remember-me">
                                <span>Remember me</span>
                            </label>
                            <a href="#" id="forgot-password" class="forgot-link">
                                Forgot Password?
                            </a>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block" id="login-btn">
                            <span class="btn-text">Login</span>
                            <div class="spinner hidden" id="login-spinner"></div>
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Don't have an account? 
                            <a href="/register" id="register-link">Sign up here</a>
                        </p>
                        <div class="divider">
                            <span>or</span>
                        </div>
                        <a href="/admin/login" class="btn btn-outline btn-block" id="admin-login-link">
                            <i class="fas fa-lock"></i> Admin Login
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
        
        // Login form submission
        const loginForm = container.querySelector('#login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // Register link
        const registerLink = container.querySelector('#register-link');
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                onNavigate('/register');
            });
        }
        
        // Admin login link
        const adminLoginLink = container.querySelector('#admin-login-link');
        if (adminLoginLink) {
            adminLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                onNavigate('/admin/login');
            });
        }
        
        // Forgot password link
        const forgotPassword = container.querySelector('#forgot-password');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                showForgotPasswordModal();
            });
        }
    };
    
    // Setup form validation
    const setupFormValidation = () => {
        const emailInput = container.querySelector('#email');
        const passwordInput = container.querySelector('#password');
        
        if (emailInput) {
            emailInput.addEventListener('blur', validateEmail);
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('blur', validatePassword);
        }
    };
    
    // Validate email input
    const validateEmail = () => {
        const emailInput = container.querySelector('#email');
        const errorElement = container.querySelector('#email-error');
        
        if (!emailInput.value.trim()) {
            showError(emailInput, errorElement, 'Email is required');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            showError(emailInput, errorElement, 'Please enter a valid email address');
            return false;
        }
        
        clearError(emailInput, errorElement);
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
    
    // Handle login form submission
    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateEmail() || !validatePassword()) {
            return;
        }
        
        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
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
            // Call API to login
            const response = await store.api.auth.login(sanitizedData.email, sanitizedData.password);
            
            // Store user data
            store.auth.setUser(response.data.user);
            store.auth.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
            
            // Show success notification
            if (onShowNotification) {
                onShowNotification({
                    type: 'success',
                    title: 'Login Successful',
                    message: `Welcome back, ${response.data.user.fullName || response.data.user.email}!`,
                    duration: 3000
                });
            }
            
            // Redirect to dashboard
            setTimeout(() => {
                onNavigate('/dashboard');
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Show error notification
            if (onShowNotification) {
                onShowNotification({
                    type: 'error',
                    title: 'Login Failed',
                    message: error.message || 'Invalid email or password. Please try again.',
                    duration: 5000
                });
            }
            
            // Highlight form errors
            const emailInput = container.querySelector('#email');
            const passwordInput = container.querySelector('#password');
            const emailError = container.querySelector('#email-error');
            const passwordError = container.querySelector('#password-error');
            
            if (emailError) {
                showError(emailInput, emailError, 'Invalid email or password');
            }
            
            if (passwordError) {
                showError(passwordInput, passwordError, 'Invalid email or password');
            }
            
        } finally {
            // Reset button state
            if (loginBtn && btnText && spinner) {
                loginBtn.disabled = false;
                btnText.textContent = 'Login';
                spinner.classList.add('hidden');
            }
        }
    };
    
    // Show forgot password modal
    const showForgotPasswordModal = () => {
        if (onShowNotification) {
            onShowNotification({
                type: 'info',
                title: 'Forgot Password',
                message: 'Please contact support at support@okz-sports.com to reset your password.',
                duration: 5000
            });
        }
    };
    
    return {
        render,
        init
    };
}