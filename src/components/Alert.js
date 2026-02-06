/**
 * OKZ Sports - Alert Component
 * Developed by S.R.C Laboratories
 * Reusable alert/notification component
 */

export default function Alert(props = {}) {
    const {
        type = 'info', // 'info', 'success', 'warning', 'error'
        title = '',
        message = '',
        duration = 0, // 0 = no auto-dismiss
        dismissible = true,
        icon = true,
        actions = [] // Array of { text, onClick, variant }
    } = props;
    
    const container = document.createElement('div');
    
    // Type configurations
    const typeConfigs = {
        info: {
            icon: 'fas fa-info-circle',
            class: 'alert-info',
            color: '#2563eb'
        },
        success: {
            icon: 'fas fa-check-circle',
            class: 'alert-success',
            color: '#10b981'
        },
        warning: {
            icon: 'fas fa-exclamation-triangle',
            class: 'alert-warning',
            color: '#f59e0b'
        },
        error: {
            icon: 'fas fa-times-circle',
            class: 'alert-error',
            color: '#ef4444'
        }
    };
    
    // Render function
    const render = () => {
        const config = typeConfigs[type] || typeConfigs.info;
        
        container.className = `alert ${config.class}`;
        container.setAttribute('role', 'alert');
        
        let iconHTML = '';
        if (icon) {
            iconHTML = `<div class="alert-icon"><i class="${config.icon}"></i></div>`;
        }
        
        let titleHTML = '';
        if (title) {
            titleHTML = `<h4 class="alert-title">${title}</h4>`;
        }
        
        let messageHTML = '';
        if (message) {
            messageHTML = `<div class="alert-message">${message}</div>`;
        }
        
        let actionsHTML = '';
        if (actions.length > 0) {
            actionsHTML = `
                <div class="alert-actions">
                    ${actions.map(action => `
                        <button class="btn btn-${action.variant || 'outline'} btn-sm" 
                                data-action="${action.text}">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            `;
        }
        
        let dismissHTML = '';
        if (dismissible) {
            dismissHTML = `
                <button class="alert-close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }
        
        container.innerHTML = `
            ${iconHTML}
            <div class="alert-content">
                ${titleHTML}
                ${messageHTML}
                ${actionsHTML}
            </div>
            ${dismissHTML}
        `;
        
        return container;
    };
    
    // Show alert
    const show = (parentElement = document.body) => {
        parentElement.appendChild(render());
        init();
        
        // Auto-dismiss if duration is set
        if (duration > 0) {
            setTimeout(() => {
                dismiss();
            }, duration);
        }
        
        return container;
    };
    
    // Initialize component
    const init = () => {
        setupEventListeners();
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Close button
        const closeButton = container.querySelector('.alert-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                dismiss();
            });
        }
        
        // Action buttons
        const actionButtons = container.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            const actionText = button.getAttribute('data-action');
            const action = actions.find(a => a.text === actionText);
            
            if (action && action.onClick) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    action.onClick();
                    dismiss();
                });
            }
        });
        
        // Auto-dismiss on click (optional)
        container.addEventListener('click', (e) => {
            if (e.target === container && dismissible) {
                dismiss();
            }
        });
    };
    
    // Dismiss alert
    const dismiss = () => {
        container.classList.add('dismissing');
        
        setTimeout(() => {
            if (container.parentElement) {
                container.parentElement.removeChild(container);
            }
        }, 300); // Match CSS transition duration
    };
    
    // Update alert content
    const update = (newProps) => {
        Object.assign(props, newProps);
        container.innerHTML = '';
        container.appendChild(render());
        init();
    };
    
    // Create info alert
    const info = (title, message, options = {}) => {
        return Alert({
            type: 'info',
            title,
            message,
            ...options
        });
    };
    
    // Create success alert
    const success = (title, message, options = {}) => {
        return Alert({
            type: 'success',
            title,
            message,
            ...options
        });
    };
    
    // Create warning alert
    const warning = (title, message, options = {}) => {
        return Alert({
            type: 'warning',
            title,
            message,
            ...options
        });
    };
    
    // Create error alert
    const error = (title, message, options = {}) => {
        return Alert({
            type: 'error',
            title,
            message,
            ...options
        });
    };
    
    // Show toast notification (auto-dismissing)
    const toast = (type, message, duration = 5000) => {
        return Alert({
            type,
            message,
            duration,
            dismissible: true,
            icon: true
        }).show();
    };
    
    return {
        render,
        show,
        dismiss,
        update,
        info,
        success,
        warning,
        error,
        toast
    };
}