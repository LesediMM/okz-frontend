/**
 * src/api/index.js
 * Central API Configuration & Request Wrapper
 * Developed by S.R.C Laboratories
 */

// Your production backend URL
export const API_BASE_URL = 'https://okz.onrender.com/api/v1';

/**
 * Global request wrapper to handle headers, auth, and common errors.
 * Ensures that 4xx and 5xx errors are caught and returned as readable messages.
 * * @param {string} endpoint - The API path (e.g., '/bookings')
 * @param {object} options - Fetch options (method, body, etc.)
 */
export const request = async (endpoint, options = {}) => {
    // 1. Prepare standard headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // 2. Attach User Auth Token if available
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

        // 4. Handle Unauthorized/Expired tokens (401)
        if (response.status === 401) {
            console.warn(`[Auth] Session expired or unauthorized at ${endpoint}`);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            
            // Only redirect if not already attempting to login
            if (!window.location.hash.includes('/login')) {
                window.location.hash = '#/login';
            }
        }

        // Try to parse the JSON response
        const data = await response.json();

        // 5. Catch HTTP Error Statuses (400, 403, 404, 500)
        // This is critical for capturing validation errors (e.g., why registration failed)
        if (!response.ok) {
            throw new Error(data.message || `Server Error (Status ${response.status})`);
        }

        // 6. Catch Backend-specific error flags
        if (data.status === 'error') {
            throw new Error(data.message || 'An internal processing error occurred');
        }

        return data;

    } catch (error) {
        // Detailed logging for developers
        console.error(`[API Error] ${endpoint}:`, error.message);

        // Return a consistent error object to the calling component
        return {
            status: 'error',
            message: error.message || 'Unable to connect to the server. Please check your internet.'
        };
    }
};