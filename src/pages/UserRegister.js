/**
 * OKZ Sports - User Registration Page
 * Developed by S.R.C Laboratories
 * User registration page
 */

import { validateRegistration, sanitizeFormData, validatePasswordStrength } from '../utils/validation.js';
import { showNotification } from '../utils/notification.js';

export default function UserRegister({ store, router, onNavigate, onShowNotification }) {
    const container = document.createElement('div');
    container.className = 'user-register-page';
    
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
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <h2>Create Account</h2>
                            <p>Join OKZ Sports to book courts</p>
                        </div>
                    </div>
                    
                    <form id="register-form" class="auth-form">
                        <div class="form-group">
                            <label for="email">Email Address *</label>
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
                            <label for="password">Password *</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                placeholder="Create a password"
                                required
                                autocomplete="new-password"
                            >
                            <div class="password-strength" id="password-strength"></div>
                            <div class="error-message" id="password-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password *</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                placeholder="Confirm your password"
                                required
                                autocomplete="new-password"
                            >
                            <div class="error-message" id="confirm-password-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="fullName">Full Name</label>
                            <input 
                                type="text" 
                                id="fullName" 
                                name="fullName" 
                                placeholder="Enter your full name"
                                autocomplete="name"
                            >
                            <div class="error-message" id="fullname-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="phoneNumber">Phone Number</label>
                            <input 
                                type="tel" 
                                id="phoneNumber" 
                                name="phoneNumber" 
                                placeholder="Enter your phone number"
                                autocomplete="tel"
                            >
                            <div class="error-message" id="phone-error"></div>
                        </div>
                        
                        <div class="form-group terms-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="terms" name="terms" required>
                                <span>I agree to the <a href="#" id="terms-link">Terms of Service</a> and <a href="#" id="privacy-link">Privacy Policy</a></span>
                            </label>
                            <div class="error-message" id="terms-error"></div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block" id="register-btn">
                            <span class="btn-text">Create Account</span>
                            <div class="spinner hidden" id="register-spinner"></div>
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Already have an account? 
                            <a href="/login" id="login-link">Login here</a>
                        </p>
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
        
        // Registration form submission
        const registerForm = container.querySelector('#register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegistration);
        }
        
        // Login link
        const loginLink = container.querySelector('#login-link');
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                onNavigate('/login');
            });
        }
        
        // Terms and Privacy links
        const termsLink = container.querySelector('#terms-link');
        const privacyLink = container.querySelector('#privacy-link');
        
        if (termsLink) {
            termsLink.addEventListener('click', (e) => {
                e.preventDefault();
                showTermsModal();
            });
        }
        
        if (privacyLink) {
            privacyLink.addEventListener('click', (e) => {
                e.preventDefault();
                showPrivacyModal();
            });
        }
        
        // Password strength indicator
        const passwordInput = container.querySelector('#password');
        if (passwordInput) {
            passwordInput.addEventListener('input', updatePasswordStrength);
        }
        
        // Confirm password validation
        const confirmPasswordInput = container.querySelector('#confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
        }
    };
    
    // Setup form validation
    const setupFormValidation = () => {
        const emailInput = container.querySelector('#email');
        const passwordInput = container.querySelector('#password');
        const fullNameInput = container.querySelector('#fullName');
        const phoneInput = container.querySelector('#phoneNumber');
        
        if (emailInput) {
            emailInput.addEventListener('blur', validateEmail);
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('blur', validatePassword);
        }
        
        if (fullNameInput) {
            fullNameInput.addEventListener('blur', validateFullName);
        }
        
        if (phoneInput) {
            phoneInput.addEventListener('blur', validatePhone);
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
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!passwordRegex.test(passwordInput.value)) {
            showError(passwordInput, errorElement, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
            return false;
        }
        
        clearError(passwordInput, errorElement);
        return true;
    };
    
    // Validate full name input
    const validateFullName = () => {
        const fullNameInput = container.querySelector('#fullName');
        const errorElement = container.querySelector('#fullname-error');
        
        if (fullNameInput.value.trim() && fullNameInput.value.trim().length < 2) {
            showError(fullNameInput, errorElement, 'Full name must be at least 2 characters');
            return false;
        }
        
        clearError(fullNameInput, errorElement);
        return true;
    };
    
    // Validate phone input
    const validatePhone = () => {
        const phoneInput = container.querySelector('#phoneNumber');
        const errorElement = container.querySelector('#phone-error');
        
        if (phoneInput.value.trim()) {
            const phoneRegex = /^[0-9\-\+]{9,15}$/;
            if (!phoneRegex.test(phoneInput.value)) {
                showError(phoneInput, errorElement, 'Please enter a valid phone number');
                return false;
            }
        }
        
        clearError(phoneInput, errorElement);
        return true;
    };
    
    // Validate confirm password
    const validateConfirmPassword = () => {
        const passwordInput = container.querySelector('#password');
        const confirmInput = container.querySelector('#confirmPassword');
        const errorElement = container.querySelector('#confirm-password-error');
        
        if (!confirmInput.value.trim()) {
            showError(confirmInput, errorElement, 'Please confirm your password');
            return false;
        }
        
        if (passwordInput.value !== confirmInput.value) {
            showError(confirmInput, errorElement, 'Passwords do not match');
            return false;
        }
        
        clearError(confirmInput, errorElement);
        return true;
    };
    
    // Validate terms checkbox
    const validateTerms = () => {
        const termsCheckbox = container.querySelector('#terms');
        const errorElement = container.querySelector('#terms-error');
        
        if (!termsCheckbox.checked) {
            showError(termsCheckbox, errorElement, 'You must agree to the terms and conditions');
            return false;
        }
        
        clearError(termsCheckbox, errorElement);
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
    
    // Update password strength indicator
    const updatePasswordStrength = () => {
        const passwordInput = container.querySelector('#password');
        const strengthElement = container.querySelector('#password-strength');
        
        if (!passwordInput || !strengthElement) return;
        
        const password = passwordInput.value;
        const strength = validatePasswordStrength(password);
        
        strengthElement.innerHTML = `
            <div class="strength-meter">
                <div class="strength-bar" style="width: ${(strength.score / 4) * 100}%"></div>
            </div>
            <div class="strength-text">${strength.feedback.join(', ')}</div>
        `;
        
        strengthElement.className = 'password-strength';
        strengthElement.classList.add(`strength-${Math.floor(strength.score)}`);
    };
    
    // Handle registration form submission
    const handleRegistration = async (e) => {
        e.preventDefault();
        
        // Validate all fields
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmValid = validateConfirmPassword();
        const isFullNameValid = validateFullName();
        const isPhoneValid = validatePhone();
        const isTermsValid = validateTerms();
        
        if (!isEmailValid || !isPasswordValid || !isConfirmValid || !isFullNameValid || !isPhoneValid || !isTermsValid) {
            return;
        }
        
        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            fullName: formData.get('fullName') || '',
            phoneNumber: formData.get('phoneNumber') || ''
        };
        
        // Remove confirmPassword from data
        delete data.confirmPassword;
        
        // Sanitize data
        const sanitizedData = sanitizeFormData(data);
        
        // Show loading state
        const registerBtn = container.querySelector('#register-btn');
        const btnText = container.querySelector('.btn-text');
        const spinner = container.querySelector('#register-spinner');
        
        if (registerBtn && btnText && spinner) {
            registerBtn.disabled = true;
            btnText.textContent = 'Creating Account...';
            spinner.classList.remove('hidden');
        }
        
        try {
            // Call API to register
            const response = await store.api.auth.register(sanitizedData);
            
            // Show success notification
            if (onShowNotification) {
                onShowNotification({
                    type: 'success',
                    title: 'Account Created',
                    message: 'Welcome to OKZ Sports! Your account has been created successfully.',
                    duration: 3000
                });
            }
            
            // Auto-login after registration
            try {
                const loginResponse = await store.api.auth.login(sanitizedData.email, sanitizedData.password);
                
                // Store user data
                store.auth.setUser(loginResponse.data.user);
                store.auth.setTokens(loginResponse.data.tokens.accessToken, loginResponse.data.tokens.refreshToken);
                
                // Show welcome notification
                if (onShowNotification) {
                    onShowNotification({
                        type: 'success',
                        title: 'Welcome!',
                        message: `You're now logged in. Ready to book your first court?`,
                        duration: 3000
                    });
                }
                
                // Redirect to dashboard
                setTimeout(() => {
                    onNavigate('/dashboard');
                }, 1500);
                
            } catch (loginError) {
                // If auto-login fails, redirect to login page
                if (onShowNotification) {
                    onShowNotification({
                        type: 'info',
                        title: 'Account Created',
                        message: 'Please login with your new credentials.',
                        duration: 3000
                    });
                }
                
                setTimeout(() => {
                    onNavigate('/login');
                }, 1500);
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            
            // Show error notification
            if (onShowNotification) {
                onShowNotification({
                    type: 'error',
                    title: 'Registration Failed',
                    message: error.message || 'Failed to create account. Please try again.',
                    duration: 5000
                });
            }
            
            // Handle duplicate email error
            if (error.message.includes('Email already exists') || error.message.includes('DUPLICATE_EMAIL')) {
                const emailInput = container.querySelector('#email');
                const emailError = container.querySelector('#email-error');
                showError(emailInput, emailError, 'An account with this email already exists');
            }
            
        } finally {
            // Reset button state
            if (registerBtn && btnText && spinner) {
                registerBtn.disabled = false;
                btnText.textContent = 'Create Account';
                spinner.classList.add('hidden');
            }
        }
    };
    
    // Show terms modal
    const showTermsModal = () => {
        if (onShowNotification) {
            onShowNotification({
                type: 'info',
                title: 'Terms of Service',
                message: 'By using OKZ Sports, you agree to our terms. Contact support@okz-sports.com for details.',
                duration: 5000
            });
        }
    };
    
    // Show privacy modal
    const showPrivacyModal = () => {
        if (onShowNotification) {
            onShowNotification({
                type: 'info',
                title: 'Privacy Policy',
                message: 'We value your privacy. Your data is secure with us. Contact privacy@okz-sports.com for concerns.',
                duration: 5000
            });
        }
    };
    
    return {
        render,
        init
    };
}