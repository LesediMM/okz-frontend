/**
 * src/api/index.js
 * Central API Configuration & Request Wrapper
 */

export const API_BASE_URL = 'https://okz.onrender.com/api/v1';

/**
 * Global request wrapper to handle headers, auth, and common errors
 * @param {string} endpoint - The API path (e.g., '/bookings')
 * @param {object} options - Fetch options (method, body, etc.)
 */
export const request = async (endpoint, options = {}) => {
    // 1. Prepare Headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // 2. Attach Auth Token if available in localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 3. Attach Admin Token for admin-specific paths
    if (endpoint.startsWith('/admin')) {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            headers['Authorization'] = `Bearer ${adminToken}`;
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // 4. Handle Global Error States
        if (response.status === 401) {
            // Token expired or invalid - clear local session
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            
            // Only redirect if we aren't already on the login page
            if (!window.location.hash.includes('/login')) {
                window.location.hash = '#/login';
            }
        }

        const data = await response.json();

        // 5. Handle Backend-level errors (even if status is 200)
        if (data.status === 'error') {
            throw new Error(data.message || 'An internal error occurred');
        }

        return data;
    } catch (error) {
        console.error(`[API Error] ${endpoint}:`, error.message);
        return {
            status: 'error',
            message: error.message || 'Network connection failed'
        };
    }
};