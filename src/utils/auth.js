/**
 * OKZ Sports - Authentication Utilities
 * Developed by S.R.C Laboratories
 * Authentication state management and token handling
 */

// Storage keys
const STORAGE_KEYS = {
    TOKEN: 'okz_token',
    REFRESH_TOKEN: 'okz_refresh_token',
    ADMIN_TOKEN: 'okz_admin_token',
    USER: 'okz_user',
    ADMIN: 'okz_admin',
    LAST_LOGIN: 'okz_last_login',
    SESSION_EXPIRY: 'okz_session_expiry'
};

// Session timeout (15 minutes for users, 8 hours for admins)
const SESSION_TIMEOUTS = {
    USER: 15 * 60 * 1000, // 15 minutes
    ADMIN: 8 * 60 * 60 * 1000 // 8 hours
};

/**
 * Check if user is authenticated
 * @returns {boolean} Is authenticated
 */
export function isAuthenticated() {
    const token = getToken();
    if (!token) return false;
    
    // Check if session is expired
    if (isSessionExpired()) {
        clearAuth();
        return false;
    }
    
    return true;
}

/**
 * Check if admin is authenticated
 * @returns {boolean} Is admin authenticated
 */
export function isAdminAuthenticated() {
    const token = getAdminToken();
    if (!token) return false;
    
    // Check if admin session is expired
    if (isAdminSessionExpired()) {
        clearAdminAuth();
        return false;
    }
    
    return true;
}

/**
 * Get user token from storage
 * @returns {string|null} Token
 */
export function getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/**
 * Get admin token from storage
 * @returns {string|null} Admin token
 */
export function getAdminToken() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
}

/**
 * Get refresh token from storage
 * @returns {string|null} Refresh token
 */
export function getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Set user authentication tokens
 * @param {string} token - Access token
 * @param {string} refreshToken - Refresh token
 */
export function setTokens(token, refreshToken) {
    if (token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, Date.now().toString());
        
        // Set session expiry for user (15 minutes)
        const expiry = Date.now() + SESSION_TIMEOUTS.USER;
        localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiry.toString());
    }
    
    if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
}

/**
 * Set admin authentication token
 * @param {string} token - Admin access token
 */
export function setAdminToken(token) {
    if (token) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, Date.now().toString());
        
        // Set session expiry for admin (8 hours)
        const expiry = Date.now() + SESSION_TIMEOUTS.ADMIN;
        localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiry.toString());
    }
}

/**
 * Get current user data
 * @returns {Object|null} User data
 */
export function getUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userJson) return null;
    
    try {
        return JSON.parse(userJson);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

/**
 * Get current admin data
 * @returns {Object|null} Admin data
 */
export function getAdmin() {
    const adminJson = localStorage.getItem(STORAGE_KEYS.ADMIN);
    if (!adminJson) return null;
    
    try {
        return JSON.parse(adminJson);
    } catch (error) {
        console.error('Error parsing admin data:', error);
        return null;
    }
}

/**
 * Set user data
 * @param {Object} user - User object
 */
export function setUser(user) {
    if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
}

/**
 * Set admin data
 * @param {Object} admin - Admin object
 */
export function setAdmin(admin) {
    if (admin) {
        localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(admin));
    }
}

/**
 * Clear all authentication data (logout)
 */
export function clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
    localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
}

/**
 * Clear admin authentication data
 */
export function clearAdminAuth() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN);
    localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
    localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
}

/**
 * Clear all authentication (both user and admin)
 */
export function clearAllAuth() {
    clearAuth();
    clearAdminAuth();
}

/**
 * Check if user session is expired
 * @returns {boolean} Is expired
 */
export function isSessionExpired() {
    const expiry = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);
    if (!expiry) return true;
    
    return Date.now() > parseInt(expiry);
}

/**
 * Check if admin session is expired
 * @returns {boolean} Is expired
 */
export function isAdminSessionExpired() {
    const expiry = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);
    if (!expiry) return true;
    
    return Date.now() > parseInt(expiry);
}

/**
 * Get remaining session time in minutes
 * @returns {number} Minutes remaining
 */
export function getSessionTimeRemaining() {
    if (!isAuthenticated()) return 0;
    
    const expiry = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);
    if (!expiry) return 0;
    
    const remaining = parseInt(expiry) - Date.now();
    return Math.max(0, Math.floor(remaining / 60000)); // Convert to minutes
}

/**
 * Refresh session (extend expiry)
 */
export function refreshSession() {
    if (isAuthenticated()) {
        const expiry = Date.now() + SESSION_TIMEOUTS.USER;
        localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiry.toString());
        return true;
    }
    
    if (isAdminAuthenticated()) {
        const expiry = Date.now() + SESSION_TIMEOUTS.ADMIN;
        localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiry.toString());
        return true;
    }
    
    return false;
}

/**
 * Validate JWT token (basic validation)
 * @param {string} token - JWT token
 * @returns {boolean} Is valid token format
 */
export function isValidToken(token) {
    if (!token || typeof token !== 'string') return false;
    
    // Basic JWT format validation (3 parts separated by dots)
    const parts = token.split('.');
    return parts.length === 3;
}

/**
 * Parse JWT token payload
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload
 */
export function parseTokenPayload(token) {
    if (!isValidToken(token)) return null;
    
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
}

/**
 * Check if token has required permissions
 * @param {string} token - JWT token
 * @param {Array} requiredPermissions - Required permissions
 * @returns {boolean} Has permissions
 */
export function hasPermissions(token, requiredPermissions = []) {
    if (!requiredPermissions.length) return true;
    
    const payload = parseTokenPayload(token);
    if (!payload || !payload.permissions) return false;
    
    return requiredPermissions.every(perm => payload.permissions.includes(perm));
}

/**
 * Check if user has specific role
 * @param {string} role - Required role
 * @returns {boolean} Has role
 */
export function hasRole(role) {
    const user = getUser();
    if (!user) return false;
    
    return user.role === role;
}

/**
 * Check if admin has specific permissions
 * @param {Array} permissions - Required permissions
 * @returns {boolean} Has permissions
 */
export function adminHasPermissions(permissions = []) {
    const admin = getAdmin();
    if (!admin || !admin.permissions) return false;
    
    return permissions.every(perm => admin.permissions.includes(perm));
}

/**
 * Get user ID from token
 * @returns {string|null} User ID
 */
export function getUserId() {
    const token = getToken();
    if (!token) return null;
    
    const payload = parseTokenPayload(token);
    return payload?.userId || payload?.id || null;
}

/**
 * Get admin ID from token
 * @returns {string|null} Admin ID
 */
export function getAdminId() {
    const token = getAdminToken();
    if (!token) return null;
    
    const payload = parseTokenPayload(token);
    return payload?.adminId || payload?.id || null;
}

/**
 * Get user email from stored data
 * @returns {string|null} Email
 */
export function getUserEmail() {
    const user = getUser();
    return user?.email || null;
}

/**
 * Get admin username from stored data
 * @returns {string|null} Username
 */
export function getAdminUsername() {
    const admin = getAdmin();
    return admin?.username || null;
}

/**
 * Setup session refresh interval
 * @param {Function} refreshCallback - Callback when session is refreshed
 * @returns {number} Interval ID
 */
export function setupSessionRefresh(refreshCallback) {
    // Refresh session every minute
    return setInterval(() => {
        if (refreshSession() && refreshCallback) {
            refreshCallback();
        }
    }, 60000); // Check every minute
}

/**
 * Setup session expiry warning
 * @param {Function} warningCallback - Callback when session is about to expire
 * @param {number} warningMinutes - Minutes before expiry to show warning
 * @returns {number} Interval ID
 */
export function setupSessionExpiryWarning(warningCallback, warningMinutes = 5) {
    return setInterval(() => {
        const remaining = getSessionTimeRemaining();
        
        if (remaining > 0 && remaining <= warningMinutes) {
            if (warningCallback) {
                warningCallback(remaining);
            }
        }
    }, 30000); // Check every 30 seconds
}

/**
 * Validate login credentials locally
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {Object} Validation result
 */
export function validateCredentials(email, password) {
    const errors = [];
    
    if (!email || !email.trim()) {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!password || !password.trim()) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate admin credentials locally
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} Validation result
 */
export function validateAdminCredentials(username, password) {
    const errors = [];
    
    if (!username || !username.trim()) {
        errors.push('Username is required');
    }
    
    if (!password || !password.trim()) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Handle login success
 * @param {Object} response - API response
 * @returns {Object} Processed login data
 */
export function handleLoginSuccess(response) {
    const { data } = response;
    
    if (data?.tokens?.accessToken) {
        setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    }
    
    if (data?.user) {
        setUser(data.user);
    }
    
    return {
        success: true,
        user: data?.user,
        tokens: data?.tokens
    };
}

/**
 * Handle admin login success
 * @param {Object} response - API response
 * @returns {Object} Processed login data
 */
export function handleAdminLoginSuccess(response) {
    const { data } = response;
    
    if (data?.token) {
        setAdminToken(data.token);
    }
    
    if (data?.user) {
        setAdmin(data.user);
    }
    
    return {
        success: true,
        admin: data?.user,
        token: data?.token
    };
}

/**
 * Handle logout
 * @param {boolean} isAdmin - Is admin logout
 */
export function handleLogout(isAdmin = false) {
    if (isAdmin) {
        clearAdminAuth();
    } else {
        clearAuth();
    }
}

/**
 * Check if should redirect to login
 * @param {string} currentPath - Current route path
 * @returns {boolean} Should redirect
 */
export function shouldRedirectToLogin(currentPath) {
    const protectedPaths = ['/dashboard', '/booking', '/my-bookings'];
    const adminPaths = ['/admin/dashboard', '/admin/bookings'];
    
    if (protectedPaths.includes(currentPath) && !isAuthenticated()) {
        return true;
    }
    
    if (adminPaths.includes(currentPath) && !isAdminAuthenticated()) {
        return true;
    }
    
    return false;
}

/**
 * Get redirect path after login
 * @param {boolean} isAdmin - Is admin login
 * @returns {string} Redirect path
 */
export function getLoginRedirectPath(isAdmin = false) {
    if (isAdmin) {
        return '/admin/dashboard';
    }
    
    // Check for stored redirect path
    const redirect = sessionStorage.getItem('login_redirect');
    if (redirect && redirect !== '/login' && redirect !== '/admin/login') {
        sessionStorage.removeItem('login_redirect');
        return redirect;
    }
    
    return '/dashboard';
}

/**
 * Store redirect path before login
 * @param {string} path - Path to redirect to after login
 */
export function storeRedirectPath(path) {
    if (path && path !== '/login' && path !== '/admin/login') {
        sessionStorage.setItem('login_redirect', path);
    }
}

/**
 * Get authorization header for API requests
 * @param {boolean} isAdmin - Use admin token
 * @returns {Object} Authorization header
 */
export function getAuthHeader(isAdmin = false) {
    const token = isAdmin ? getAdminToken() : getToken();
    
    if (!token) return {};
    
    return {
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export function validatePassword(password) {
    const errors = [];
    const requirements = [];
    
    if (!password) {
        errors.push('Password is required');
        return { isValid: false, errors, requirements };
    }
    
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
        requirements.push('At least 6 characters');
    } else {
        requirements.push('✓ At least 6 characters');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
        requirements.push('One lowercase letter');
    } else {
        requirements.push('✓ One lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
        requirements.push('One uppercase letter');
    } else {
        requirements.push('✓ One uppercase letter');
    }
    
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
        requirements.push('One number');
    } else {
        requirements.push('✓ One number');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        requirements,
        score: Math.min(4, 4 - errors.length) // Score out of 4
    };
}

// Export storage keys and timeouts for external use
export { STORAGE_KEYS, SESSION_TIMEOUTS };

// Default export
export default {
    isAuthenticated,
    isAdminAuthenticated,
    getToken,
    getAdminToken,
    getRefreshToken,
    setTokens,
    setAdminToken,
    getUser,
    getAdmin,
    setUser,
    setAdmin,
    clearAuth,
    clearAdminAuth,
    clearAllAuth,
    isSessionExpired,
    isAdminSessionExpired,
    getSessionTimeRemaining,
    refreshSession,
    isValidToken,
    parseTokenPayload,
    hasPermissions,
    hasRole,
    adminHasPermissions,
    getUserId,
    getAdminId,
    getUserEmail,
    getAdminUsername,
    setupSessionRefresh,
    setupSessionExpiryWarning,
    validateCredentials,
    validateAdminCredentials,
    handleLoginSuccess,
    handleAdminLoginSuccess,
    handleLogout,
    shouldRedirectToLogin,
    getLoginRedirectPath,
    storeRedirectPath,
    getAuthHeader,
    validatePassword,
    STORAGE_KEYS,
    SESSION_TIMEOUTS
};