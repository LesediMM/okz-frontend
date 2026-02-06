/**
 * OKZ Sports - API Client
 * Developed by S.R.C Laboratories
 * Main API configuration and HTTP client
 */

// API configuration
const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || '/api/v1',
    TIMEOUT: 30000, // 30 seconds
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// HTTP client class
class ApiClient {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.authToken = localStorage.getItem('okz_token');
        this.adminToken = localStorage.getItem('okz_admin_token');
    }
    
    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Prepare headers
        const headers = {
            ...API_CONFIG.HEADERS,
            ...options.headers
        };
        
        // Add authentication token if available
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        } else if (this.adminToken) {
            headers['Authorization'] = `Bearer ${this.adminToken}`;
        }
        
        // Setup request controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
        
        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Handle 401 Unauthorized (token expired)
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Session expired. Please login again.');
            }
            
            // Parse response
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                data = { message: 'Invalid response from server' };
            }
            
            // Throw error for non-2xx responses
            if (!response.ok) {
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }
            
            return data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            // Handle specific error types
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please try again.');
            }
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Please check your connection.');
            }
            
            throw error;
        }
    }
    
    // Handle unauthorized access (token expired)
    handleUnauthorized() {
        // Clear tokens
        localStorage.removeItem('okz_token');
        localStorage.removeItem('okz_admin_token');
        localStorage.removeItem('okz_user');
        localStorage.removeItem('okz_admin');
        
        // Dispatch event for app to handle
        window.dispatchEvent(new CustomEvent('auth-expired'));
    }
    
    // Set authentication token
    setAuthToken(token, isAdmin = false) {
        if (isAdmin) {
            this.adminToken = token;
            localStorage.setItem('okz_admin_token', token);
        } else {
            this.authToken = token;
            localStorage.setItem('okz_token', token);
        }
    }
    
    // Clear authentication tokens
    clearAuthTokens() {
        this.authToken = null;
        this.adminToken = null;
        localStorage.removeItem('okz_token');
        localStorage.removeItem('okz_admin_token');
        localStorage.removeItem('okz_user');
        localStorage.removeItem('okz_admin');
    }
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!this.authToken;
    }
    
    // Check if admin is authenticated
    isAdminAuthenticated() {
        return !!this.adminToken;
    }
    
    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }
    
    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    // PATCH request
    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
    
    // Upload file (multipart/form-data)
    async upload(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            headers: {
                // Don't set Content-Type for FormData (browser will set it with boundary)
            },
            body: formData
        });
    }
}

// Create global API instance
const api = new ApiClient();

// Export API instance and client class
export { api, ApiClient };

// Export default API instance
export default api;