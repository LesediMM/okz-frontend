/**
 * src/api/auth.js
 * Identity and Access Management Service
 * Developed by S.R.C Laboratories
 */

import { request } from './index.js';

export const authApi = {
    /**
     * Create a new user account
     * @param {Object} userData - { fullName, email, password, phoneNumber }
     */
    register: async (userData) => {
        // Sends POST request to https://okz.onrender.com/api/v1/register
        return await request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    /**
     * Authenticate a user and receive access tokens
     * @param {Object} credentials - { email, password }
     */
    login: async (credentials) => {
        // Sends POST request to https://okz.onrender.com/api/v1/login
        return await request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    /**
     * Verify if the current accessToken is still valid
     * Used by the App initialization to check if the user is logged in
     */
    status: async () => {
        // Sends GET request to https://okz.onrender.com/api/v1/login/status
        return await request('/login/status', {
            method: 'GET'
        });
    },

    /**
     * Exchange a Refresh Token for a new Access Token
     * Used when the current session is about to expire
     * @param {string} refreshToken 
     */
    refresh: async (refreshToken) => {
        // Sends POST request to https://okz.onrender.com/api/v1/login/refresh
        return await request('/login/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        });
    },

    /**
     * Check if an email is already taken before submitting the form
     * Useful for real-time validation in the registration UI
     * @param {string} email 
     */
    checkEmail: async (email) => {
        // Sends GET request to https://okz.onrender.com/api/v1/register/check-email?email=...
        return await request(`/register/check-email?email=${encodeURIComponent(email)}`, {
            method: 'GET'
        });
    }
};