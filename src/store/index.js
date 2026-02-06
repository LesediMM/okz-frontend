/**
 * OKZ Sports - Application Store
 * Developed by S.R.C Laboratories
 * Centralized state management
 */

export function createStore() {
    console.log('🔄 Initializing store...');

    // Simple reactive state
    const state = {
        user: null,
        admin: null
    };

    // Listeners
    const userListeners = [];
    const adminListeners = [];

    // Auth management
    const auth = {
        // User auth
        getUser() {
            return state.user;
        },
        isAuthenticated() {
            return !!state.user;
        },
        onAuthChange(callback) {
            if (typeof callback === 'function') userListeners.push(callback);
        },
        login(userData) {
            state.user = userData;
            userListeners.forEach(cb => cb(state.user));
        },
        logout() {
            return new Promise((resolve) => {
                state.user = null;
                state.admin = null;
                userListeners.forEach(cb => cb(null));
                adminListeners.forEach(cb => cb(null));
                resolve();
            });
        },
        clearAuth() {
            state.user = null;
            userListeners.forEach(cb => cb(null));
        },

        // Admin auth
        getAdmin() {
            return state.admin;
        },
        isAdminAuthenticated() {
            return !!state.admin;
        },
        onAdminAuthChange(callback) {
            if (typeof callback === 'function') adminListeners.push(callback);
        },
        loginAdmin(adminData) {
            state.admin = adminData;
            adminListeners.forEach(cb => cb(state.admin));
        }
    };

    // You can extend the store with other modules here
    const store = {
        state,
        auth
    };

    console.log('✅ Store initialized');
    return store;
}

// Export default
export default { createStore };
