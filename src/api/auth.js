/**
 * src/api/auth.js
 * Identity and Access Management Service
 */

import { request } from './index.js';

export const authApi = {
    /**
     * Create a new user account
     * @param {Object} userData - { email, password, fullName, phoneNumber }
     */
    register: async (userData) => {
        // POST /api/v1/register
        return await request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    /**
     * Authenticate a user and receive tokens
     * @param {Object} credentials - { email, password }
     */
    login: async (credentials) => {
        // POST /api/v1/login
        const response = await request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        // If successful, tokens are handled in the component or interceptor
        return response;
    },

    /**
     * Verify if the current accessToken is still valid
     * Used by App.init() on page refresh
     */
    status: async () => {
        // GET /api/v1/login/status
        return await request('/login/status', {
            method: 'GET'
        });
    },

    /**
     * Exchange a Refresh Token for a new Access Token
     * @param {string} refreshToken 
     */
    refresh: async (refreshToken) => {
        // POST /api/v1/login/refresh
        return await request('/login/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        });
    },

    /**
     * Check if an email is already taken before submitting registration
     * @param {string} email 
     */
    checkEmail: async (email) => {
        // GET /api/v1/register/check-email?email=...
        return await request(`/register/check-email?email=${encodeURIComponent(email)}`, {
            method: 'GET'
        });
    }
};