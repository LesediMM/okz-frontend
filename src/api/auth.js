/**
 * OKZ Sports - Authentication API
 * Developed by S.R.C Laboratories
 * Authentication-related API calls
 */

import { api } from './index.js';

// Authentication API methods
export const authApi = {
    // User registration
    async register(userData) {
        try {
            const response = await api.post('/register', userData);
            
            // Store user data if registration is successful
            if (response.data?.user) {
                localStorage.setItem('okz_user', JSON.stringify(response.data.user));
            }
            
            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
    
    // User login
    async login(email, password) {
        try {
            const response = await api.post('/login', { email, password });
            
            // Store tokens and user data
            if (response.data?.tokens?.accessToken) {
                api.setAuthToken(response.data.tokens.accessToken);
            }
            
            if (response.data?.user) {
                localStorage.setItem('okz_user', JSON.stringify(response.data.user));
            }
            
            // Store refresh token if provided
            if (response.data?.tokens?.refreshToken) {
                localStorage.setItem('okz_refresh_token', response.data.tokens.refreshToken);
            }
            
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    // Admin login
    async adminLogin(username, password) {
        try {
            const response = await api.post('/admin/login', { username, password });
            
            // Store admin token and data
            if (response.data?.token) {
                api.setAuthToken(response.data.token, true);
            }
            
            if (response.data?.user) {
                localStorage.setItem('okz_admin', JSON.stringify(response.data.user));
            }
            
            return response;
        } catch (error) {
            console.error('Admin login error:', error);
            throw error;
        }
    },
    
    // Logout
    async logout() {
        try {
            // Try to call logout endpoint if we have a refresh token
            const refreshToken = localStorage.getItem('okz_refresh_token');
            if (refreshToken) {
                await api.post('/login/logout', { refreshToken });
            }
        } catch (error) {
            // Log but don't throw - we'll clear local storage anyway
            console.warn('Logout endpoint error:', error.message);
        } finally {
            // Always clear local storage
            api.clearAuthTokens();
            localStorage.removeItem('okz_refresh_token');
            return { success: true, message: 'Logged out successfully' };
        }
    },
    
    // Refresh token
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('okz_refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }
            
            const response = await api.post('/login/refresh', { refreshToken });
            
            if (response.data?.accessToken) {
                api.setAuthToken(response.data.accessToken);
                return response;
            }
            
            throw new Error('No access token in response');
        } catch (error) {
            console.error('Token refresh error:', error);
            
            // If refresh fails, clear all auth data
            api.clearAuthTokens();
            localStorage.removeItem('okz_refresh_token');
            
            throw error;
        }
    },
    
    // Check if email is available
    async checkEmail(email) {
        try {
            const response = await api.get('/register/check-email', { email });
            return response;
        } catch (error) {
            console.error('Email check error:', error);
            throw error;
        }
    },
    
    // Get current user status
    async getStatus() {
        try {
            const response = await api.get('/login/status');
            return response;
        } catch (error) {
            console.error('Status check error:', error);
            throw error;
        }
    },
    
    // Update user profile
    async updateProfile(userId, profileData) {
        try {
            // Note: This endpoint needs to be implemented in the backend
            const response = await api.put(`/users/${userId}`, profileData);
            return response;
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    },
    
    // Change password
    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Note: This endpoint needs to be implemented in the backend
            const response = await api.put(`/users/${userId}/password`, {
                currentPassword,
                newPassword
            });
            return response;
        } catch (error) {
            console.error('Password change error:', error);
            throw error;
        }
    },
    
    // Request password reset
    async requestPasswordReset(email) {
        try {
            // Note: This endpoint needs to be implemented in the backend
            const response = await api.post('/password/reset', { email });
            return response;
        } catch (error) {
            console.error('Password reset request error:', error);
            throw error;
        }
    },
    
    // Reset password with token
    async resetPassword(token, newPassword) {
        try {
            // Note: This endpoint needs to be implemented in the backend
            const response = await api.post('/password/reset/confirm', {
                token,
                newPassword
            });
            return response;
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    },
    
    // Verify email
    async verifyEmail(token) {
        try {
            // Note: This endpoint needs to be implemented in the backend
            const response = await api.post('/email/verify', { token });
            return response;
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    },
    
    // Get user by ID (admin only)
    async getUser(userId) {
        try {
            // Note: This endpoint needs to be implemented in the backend
            const response = await api.get(`/admin/users/${userId}`);
            return response;
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    },
    
    // Get all users (admin only)
    async getUsers(params = {}) {
        try {
            // Note: This endpoint needs to be implemented in the backend
            const response = await api.get('/admin/users', params);
            return response;
        } catch (error) {
            console.error('Get users error:', error);
            throw error;
        }
    },
    
    // Update user status (admin only)
    async updateUserStatus(userId, status) {
        try {
            // Note: This endpoint needs to be implemented in the backend
            const response = await api.put(`/admin/users/${userId}/status`, { status });
            return response;
        } catch (error) {
            console.error('Update user status error:', error);
            throw error;
        }
    },
    
    // Delete user (admin only)
    async deleteUser(userId) {
        try {
            // Note: This endpoint needs to be implemented in the backend
            const response = await api.delete(`/admin/users/${userId}`);
            return response;
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    }
};

// Export auth API
export default authApi;