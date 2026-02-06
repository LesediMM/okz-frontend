/**
 * OKZ Sports - Loading Spinner Component
 * Developed by S.R.C Laboratories
 * Reusable loading spinner component
 */

export default function LoadingSpinner(props = {}) {
    const {
        size = 'medium', // 'small', 'medium', 'large'
        color = 'primary', // 'primary', 'white', 'gray'
        message = '',
        fullscreen = false,
        overlay = false
    } = props;
    
    const container = document.createElement('div');
    
    // Size classes
    const sizeClasses = {
        small: 'spinner-small',
        medium: 'spinner-medium',
        large: 'spinner-large'
    };
    
    // Color classes
    const colorClasses = {
        primary: 'spinner-primary',
        white: 'spinner-white',
        gray: 'spinner-gray'
    };
    
    // Render function
    const render = () => {
        const sizeClass = sizeClasses[size] || sizeClasses.medium;
        const colorClass = colorClasses[color] || colorClasses.primary;
        
        if (fullscreen) {
            container.className = 'loading-fullscreen';
            container.innerHTML = `
                <div class="fullscreen-content">
                    <div class="spinner ${sizeClass} ${colorClass}"></div>
                    ${message ? `<p class="loading-message">${message}</p>` : ''}
                </div>
            `;
        } else if (overlay) {
            container.className = 'loading-overlay';
            container.innerHTML = `
                <div class="overlay-content">
                    <div class="spinner ${sizeClass} ${colorClass}"></div>
                    ${message ? `<p class="loading-message">${message}</p>` : ''}
                </div>
            `;
        } else {
            container.className = 'loading-spinner';
            container.innerHTML = `
                <div class="spinner ${sizeClass} ${colorClass}"></div>
                ${message ? `<span class="loading-text">${message}</span>` : ''}
            `;
        }
        
        return container;
    };
    
    // Show loading spinner
    const show = (parentElement) => {
        if (parentElement) {
            parentElement.innerHTML = '';
            parentElement.appendChild(render());
        }
        return container;
    };
    
    // Hide loading spinner
    const hide = () => {
        if (container.parentElement) {
            container.parentElement.removeChild(container);
        }
    };
    
    // Update message
    const updateMessage = (newMessage) => {
        const messageElement = container.querySelector('.loading-message') || 
                              container.querySelector('.loading-text');
        if (messageElement) {
            messageElement.textContent = newMessage;
        }
    };
    
    // Create a fullscreen loading overlay
    const showFullscreen = (message = '') => {
        const fullscreenSpinner = LoadingSpinner({
            size: 'large',
            color: 'primary',
            message: message,
            fullscreen: true
        });
        
        document.body.appendChild(fullscreenSpinner.render());
        return fullscreenSpinner;
    };
    
    // Create an overlay loading spinner
    const showOverlay = (parentElement, message = '') => {
        const overlaySpinner = LoadingSpinner({
            size: 'medium',
            color: 'primary',
            message: message,
            overlay: true
        });
        
        if (parentElement) {
            parentElement.style.position = 'relative';
            parentElement.appendChild(overlaySpinner.render());
        }
        
        return overlaySpinner;
    };
    
    // Create inline loading spinner
    const showInline = (parentElement, message = '') => {
        const inlineSpinner = LoadingSpinner({
            size: 'small',
            color: 'gray',
            message: message
        });
        
        if (parentElement) {
            parentElement.appendChild(inlineSpinner.render());
        }
        
        return inlineSpinner;
    };
    
    return {
        render,
        show,
        hide,
        updateMessage,
        showFullscreen,
        showOverlay,
        showInline
    };
}