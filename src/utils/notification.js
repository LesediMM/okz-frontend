cat > /Users/lesedimalapile/Downloads/okz-frontend/src/utils/notification.js << 'EOF'
// Notification system for OKZ Sports

class NotificationSystem {
    constructor() {
        this.container = null;
        this.queue = [];
        this.isShowing = false;
        this.init();
    }
    
    init() {
        // Create notification container if it doesn't exist
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = this.getStyles();
            document.head.appendChild(style);
        }
    }
    
    getStyles() {
        return `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            }
            
            .notification {
                background: white;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-left: 4px solid #2563eb;
                animation: slideIn 0.3s ease;
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }
            
            .notification-info { border-color: #2563eb; }
            .notification-success { border-color: #10b981; }
            .notification-warning { border-color: #f59e0b; }
            .notification-error { border-color: #ef4444; }
            
            .notification-icon {
                font-size: 20px;
                margin-top: 2px;
            }
            
            .notification-info .notification-icon { color: #2563eb; }
            .notification-success .notification-icon { color: #10b981; }
            .notification-warning .notification-icon { color: #f59e0b; }
            .notification-error .notification-icon { color: #ef4444; }
            
            .notification-content {
                flex: 1;
            }
            
            .notification-title {
                font-weight: 600;
                margin-bottom: 4px;
                color: #1e293b;
            }
            
            .notification-message {
                color: #64748b;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                font-size: 18px;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notification-close:hover {
                color: #475569;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
    }
    
    show(notification) {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification notification-${notification.type}`;
        
        const iconMap = {
            'info': 'fas fa-info-circle',
            'success': 'fas fa-check-circle',
            'warning': 'fas fa-exclamation-triangle',
            'error': 'fas fa-times-circle'
        };
        
        notificationEl.innerHTML = `
            <div class="notification-icon">
                <i class="${iconMap[notification.type]}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.container.appendChild(notificationEl);
        
        // Add close functionality
        const closeBtn = notificationEl.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hide(notificationEl);
        });
        
        // Auto-hide after duration
        const duration = notification.duration || 5000;
        if (duration > 0) {
            setTimeout(() => {
                this.hide(notificationEl);
            }, duration);
        }
        
        return notificationEl;
    }
    
    hide(notificationEl) {
        notificationEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.remove();
            }
        }, 300);
    }
}

// Create global instance
const notificationSystem = new NotificationSystem();

// Export function
export function showNotification(notification) {
    return notificationSystem.show(notification);
}

// Export class for testing
export { NotificationSystem };
EOF