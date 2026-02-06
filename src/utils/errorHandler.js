cat > /Users/lesedimalapile/Downloads/okz-frontend/src/utils/errorHandler.js << 'EOF'
// Global error handling for OKZ Sports

export function setupErrorHandling() {
    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
        console.error('Global error caught:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
        
        // Don't show error for known non-critical errors
        if (event.message.includes('ResizeObserver') || 
            event.message.includes('target closed')) {
            return;
        }
        
        // Show user-friendly error notification
        if (typeof showNotification === 'function') {
            showNotification({
                type: 'error',
                title: 'Application Error',
                message: 'Something went wrong. Please try again.',
                duration: 5000
            });
        }
        
        // You could send this to an error tracking service
        // trackError(event.error);
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Don't show for network errors (they're handled elsewhere)
        if (event.reason instanceof TypeError && 
            event.reason.message.includes('Failed to fetch')) {
            return;
        }
        
        // Show user-friendly error
        if (typeof showNotification === 'function') {
            showNotification({
                type: 'error',
                title: 'Operation Failed',
                message: event.reason.message || 'Something went wrong.',
                duration: 5000
            });
        }
    });
    
    // Handle fetch errors globally
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        try {
            const response = await originalFetch.apply(this, args);
            
            // Handle non-OK responses
            if (!response.ok && response.status >= 500) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            
            // Only show notification for network errors
            if (error.message.includes('Failed to fetch') || 
                error.message.includes('NetworkError')) {
                if (typeof showNotification === 'function') {
                    showNotification({
                        type: 'warning',
                        title: 'Network Error',
                        message: 'Please check your internet connection.',
                        duration: 5000
                    });
                }
            }
            
            throw error;
        }
    };
}

// API error handler utility
export function handleApiError(error) {
    console.error('API Error:', error);
    
    let userMessage = 'An error occurred. Please try again.';
    let title = 'Error';
    
    if (error.message.includes('NetworkError') || 
        error.message.includes('Failed to fetch')) {
        title = 'Connection Error';
        userMessage = 'Cannot connect to server. Please check your internet connection.';
    } else if (error.message.includes('401') || 
               error.message.includes('unauthorized')) {
        title = 'Authentication Error';
        userMessage = 'Your session has expired. Please login again.';
        // Clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        setTimeout(() => window.location.href = '/login', 2000);
    } else if (error.message.includes('404')) {
        title = 'Not Found';
        userMessage = 'The requested resource was not found.';
    } else if (error.message.includes('409')) {
        title = 'Conflict';
        userMessage = 'This time slot is no longer available.';
    } else if (error.message.includes('validation') || 
               error.message.includes('Validation')) {
        title = 'Validation Error';
        userMessage = 'Please check your input and try again.';
    }
    
    if (typeof showNotification === 'function') {
        showNotification({
            type: 'error',
            title: title,
            message: userMessage,
            duration: 5000
        });
    }
    
    return {
        success: false,
        error: error.message,
        userMessage
    };
}

// Form validation error handler
export function handleValidationError(errors) {
    // Clear previous error highlights
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    document.querySelectorAll('.input-error').forEach(el => {
        el.classList.remove('input-error');
    });
    
    // Add new error highlights
    errors.forEach(error => {
        const input = document.querySelector(`[name="${error.field}"]`);
        if (input) {
            input.classList.add('input-error');
            
            const errorEl = document.createElement('div');
            errorEl.className = 'form-error';
            errorEl.textContent = error.message;
            errorEl.style.color = '#ef4444';
            errorEl.style.fontSize = '14px';
            errorEl.style.marginTop = '4px';
            
            input.parentNode.appendChild(errorEl);
        }
    });
    
    if (typeof showNotification === 'function') {
        showNotification({
            type: 'error',
            title: 'Validation Error',
            message: 'Please fix the errors in the form.',
            duration: 5000
        });
    }
}
EOF