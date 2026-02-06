/**
 * OKZ Sports - Main Application Entry Point
 * Developed by S.R.C Laboratories
 * Entry point for the OKZ Sports frontend application
 */

import { createApp } from './app.js';
import { showNotification } from './utils/notification.js';
import { setupErrorHandling } from './utils/errorHandler.js';

// Production API base URL only
const API_BASE = 'https://okz.onrender.com/api/v1';

// Global application state
let appInstance = null;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Show initial loading state
        showAppLoading(true);
        
        // Log production mode
        console.log('🚀 OKZ Sports - Production Mode');
        console.log('📡 API URL:', API_BASE);
        console.log('⏰ Load Time:', new Date().toISOString());
        
        // Set up global error handling
        setupErrorHandling();
        
        // Check API health before initializing app
        await checkAPIHealth();
        
        // Create and mount the application
        appInstance = createApp();
        appInstance.mount('#app');
        
        // Show welcome message for first-time visitors
        if (!localStorage.getItem('okz_welcome_shown')) {
            setTimeout(() => {
                showNotification({
                    type: 'info',
                    title: 'Welcome to OKZ Sports!',
                    message: 'Book your court in minutes. 2 paddle courts and 3 tennis courts available.',
                    duration: 5000
                });
                localStorage.setItem('okz_welcome_shown', 'true');
            }, 1000);
        }
        
        // Log successful initialization
        console.log('✅ OKZ Sports Application initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        
        // Show error to user
        document.getElementById('app').innerHTML = `
            <div class="error-container">
                <div class="error-content">
                    <h1><i class="fas fa-exclamation-triangle"></i> Application Error</h1>
                    <p>Failed to initialize the OKZ Sports application.</p>
                    <p class="error-details">${error.message}</p>
                    <p class="api-url">API URL: ${API_BASE}</p>
                    <div class="error-actions">
                        <button onclick="window.location.reload()" class="btn btn-primary">
                            <i class="fas fa-redo"></i> Reload Page
                        </button>
                        <button onclick="showHelp()" class="btn btn-outline">
                            <i class="fas fa-question-circle"></i> Get Help
                        </button>
                    </div>
                    <div class="error-tips">
                        <h3>Troubleshooting Tips:</h3>
                        <ul>
                            <li>Check your internet connection</li>
                            <li>Clear browser cache and reload</li>
                            <li>Try using a different browser</li>
                            <li>Contact support if problem persists</li>
                            <li>API Endpoint: ${API_BASE}/status</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        // Add inline styles for error page
        const style = document.createElement('style');
        style.textContent = `
            .error-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 20px;
            }
            .error-content {
                background: white;
                border-radius: 12px;
                padding: 40px;
                max-width: 500px;
                width: 100%;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                text-align: center;
            }
            .error-content h1 {
                color: #ef4444;
                margin-bottom: 20px;
            }
            .error-content p {
                margin-bottom: 15px;
                color: #64748b;
            }
            .error-details {
                background: #fef2f2;
                padding: 10px;
                border-radius: 6px;
                font-family: monospace;
                font-size: 12px;
                color: #dc2626;
                margin: 20px 0;
            }
            .api-url {
                background: #e0f2fe;
                padding: 10px;
                border-radius: 6px;
                font-family: monospace;
                font-size: 12px;
                color: #0369a1;
                margin: 10px 0;
            }
            .error-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin: 25px 0;
            }
            .error-tips {
                text-align: left;
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin-top: 25px;
            }
            .error-tips h3 {
                color: #475569;
                margin-bottom: 10px;
                font-size: 16px;
            }
            .error-tips ul {
                margin: 0;
                padding-left: 20px;
                color: #64748b;
            }
            .error-tips li {
                margin-bottom: 5px;
            }
            .btn {
                padding: 10px 20px;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
            }
            .btn-primary {
                background: #2563eb;
                color: white;
            }
            .btn-outline {
                background: transparent;
                border: 2px solid #2563eb;
                color: #2563eb;
            }
        `;
        document.head.appendChild(style);
        
        // Define helper function
        window.showHelp = function() {
            alert(`Contact support:\n📧 support@okz-sports.com\n📞 +20 123 456 7890\n\nAPI Issues:\nProduction: ${API_BASE}/status`);
        };
    } finally {
        // Hide loading screen
        showAppLoading(false);
    }
});

// Check API health status
async function checkAPIHealth() {
    try {
        console.log('🔍 Checking API health at:', `${API_BASE}/status`);
        
        const response = await fetch(`${API_BASE}/status`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('❌ API Response Status:', response.status, response.statusText);
            throw new Error(`API server responded with ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ API Status:', data.status);
        console.log('🏓 Courts Available:', data.system?.courts?.total || 'Unknown');
        console.log('📊 API Version:', data.version || 'Unknown');
        
        // Update page title with court count
        if (data.system?.courts?.total) {
            document.title = `OKZ Sports - ${data.system.courts.total} Courts Available`;
        }
        
        return true;
    } catch (error) {
        console.error('⚠️ API health check failed:', error.message);
        console.error('📡 Failed URL:', `${API_BASE}/status`);
        
        // Show warning but don't block app initialization
        setTimeout(() => {
            showNotification({
                type: 'warning',
                title: 'API Connection Issue',
                message: `Cannot connect to API at ${API_BASE}. Some features may be limited.`,
                duration: 5000
            });
        }, 2000);
        
        return false;
    }
}

// Show/hide app loading screen
function showAppLoading(show) {
    const appElement = document.getElementById('app');
    if (!appElement) return;
    
    if (show) {
        // Loading state is already in the initial HTML
        return;
    } else {
        // Remove loading styles gradually
        const loadingElement = appElement.querySelector('.loading-fullscreen');
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            loadingElement.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (loadingElement.parentNode) {
                    loadingElement.remove();
                }
            }, 300);
        }
    }
}

// Handle online/offline status
window.addEventListener('online', () => {
    showNotification({
        type: 'success',
        title: 'You\'re back online!',
        message: 'Connection restored.',
        duration: 3000
    });
});

window.addEventListener('offline', () => {
    showNotification({
        type: 'warning',
        title: 'You\'re offline',
        message: 'Some features may not work.',
        duration: 5000
    });
});

// Add global helper functions
window.OKZ = {
    version: '1.0.0',
    environment: 'production',
    apiBaseUrl: API_BASE,
    
    // Utility functions
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-GB', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP'
        }).format(amount);
    },
    
    // Navigation helper
    navigateTo(path) {
        if (appInstance && appInstance.router) {
            appInstance.router.navigate(path);
        } else {
            window.location.href = path;
        }
    },
    
    // Logout function
    async logout() {
        try {
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('user');
            localStorage.removeItem('admin');
            localStorage.removeItem('okz_token');
            localStorage.removeItem('okz_admin_token');
            localStorage.removeItem('okz_refresh_token');
            
            // Show logout notification
            showNotification({
                type: 'success',
                title: 'Logged out successfully',
                message: 'You have been logged out.',
                duration: 3000
            });
            
            // Navigate to home
            this.navigateTo('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    },
    
    // Test API connection
    async testApiConnection() {
        try {
            const response = await fetch(`${API_BASE}/status`);
            if (response.ok) {
                return { success: true, message: 'API is reachable' };
            } else {
                return { success: false, message: `API responded with ${response.status}` };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

// Create placeholder notification utility if not imported
if (typeof showNotification === 'undefined') {
    window.showNotification = function(notification) {
        console.log('Notification:', notification);
        // Create a simple notification element
        const container = document.getElementById('notification-container') || 
                         (() => {
                             const div = document.createElement('div');
                             div.id = 'notification-container';
                             document.body.appendChild(div);
                             return div;
                         })();
        
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification notification-${notification.type}`;
        notificationEl.innerHTML = `
            <div class="notification-content">
                <strong>${notification.title}</strong>
                <p>${notification.message}</p>
            </div>
            ${notification.action ? 
                `<button class="notification-action">${notification.action.text}</button>` : 
                ''}
        `;
        
        container.appendChild(notificationEl);
        
        // Auto-remove after duration
        setTimeout(() => {
            notificationEl.style.opacity = '0';
            setTimeout(() => notificationEl.remove(), 300);
        }, notification.duration || 3000);
    };
}

// Create placeholder error handler if not imported
if (typeof setupErrorHandling === 'undefined') {
    window.setupErrorHandling = function() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });
        
        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    };
}

// Export for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createApp };
}