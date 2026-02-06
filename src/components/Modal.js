/**
 * OKZ Sports - Modal Component
 * Developed by S.R.C Laboratories
 * Reusable modal dialog component
 */

export default function Modal(props = {}) {
    const {
        title = '',
        content = '',
        size = 'medium', // 'small', 'medium', 'large', 'fullscreen'
        showCloseButton = true,
        showBackdrop = true,
        closeOnBackdropClick = true,
        closeOnEsc = true,
        showFooter = true,
        footerButtons = [
            { text: 'Cancel', variant: 'outline', action: 'cancel' },
            { text: 'Confirm', variant: 'primary', action: 'confirm' }
        ],
        onClose = null,
        onConfirm = null,
        onCancel = null
    } = props;
    
    const container = document.createElement('div');
    let isOpen = false;
    
    // Size classes
    const sizeClasses = {
        small: 'modal-sm',
        medium: 'modal-md',
        large: 'modal-lg',
        fullscreen: 'modal-fullscreen'
    };
    
    // Render function
    const render = () => {
        container.className = 'modal';
        container.setAttribute('role', 'dialog');
        container.setAttribute('aria-modal', 'true');
        
        const sizeClass = sizeClasses[size] || sizeClasses.medium;
        
        let closeButtonHTML = '';
        if (showCloseButton) {
            closeButtonHTML = `
                <button class="modal-close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }
        
        let footerHTML = '';
        if (showFooter && footerButtons.length > 0) {
            footerHTML = `
                <div class="modal-footer">
                    ${footerButtons.map(button => `
                        <button class="btn btn-${button.variant}" 
                                data-action="${button.action}">
                            ${button.text}
                        </button>
                    `).join('')}
                </div>
            `;
        }
        
        container.innerHTML = `
            ${showBackdrop ? '<div class="modal-backdrop"></div>' : ''}
            
            <div class="modal-dialog ${sizeClass}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        ${closeButtonHTML}
                    </div>
                    
                    <div class="modal-body">
                        ${typeof content === 'string' ? content : ''}
                    </div>
                    
                    ${footerHTML}
                </div>
            </div>
        `;
        
        // Append content if it's an element
        if (typeof content !== 'string' && content instanceof Element) {
            const modalBody = container.querySelector('.modal-body');
            if (modalBody) {
                modalBody.innerHTML = '';
                modalBody.appendChild(content);
            }
        }
        
        return container;
    };
    
    // Open modal
    const open = (parentElement = document.body) => {
        if (isOpen) return;
        
        parentElement.appendChild(render());
        init();
        
        // Show modal with animation
        setTimeout(() => {
            container.classList.add('show');
            const modalDialog = container.querySelector('.modal-dialog');
            if (modalDialog) {
                modalDialog.classList.add('show');
            }
        }, 10);
        
        isOpen = true;
        return container;
    };
    
    // Close modal
    const close = () => {
        if (!isOpen) return;
        
        container.classList.remove('show');
        const modalDialog = container.querySelector('.modal-dialog');
        if (modalDialog) {
            modalDialog.classList.remove('show');
        }
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (container.parentElement) {
                container.parentElement.removeChild(container);
            }
            isOpen = false;
            
            if (onClose) {
                onClose();
            }
        }, 300); // Match CSS transition duration
        
        return container;
    };
    
    // Initialize component
    const init = () => {
        setupEventListeners();
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Close button
        const closeButton = container.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                close();
                if (onCancel) onCancel();
            });
        }
        
        // Backdrop click
        if (closeOnBackdropClick) {
            const backdrop = container.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', () => {
                    close();
                    if (onCancel) onCancel();
                });
            }
        }
        
        // Escape key
        if (closeOnEsc) {
            const handleEscKey = (e) => {
                if (e.key === 'Escape' && isOpen) {
                    close();
                    if (onCancel) onCancel();
                }
            };
            document.addEventListener('keydown', handleEscKey);
            
            // Clean up event listener
            container._escHandler = handleEscKey;
        }
        
        // Footer buttons
        const footerButtons = container.querySelectorAll('[data-action]');
        footerButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                
                switch (action) {
                    case 'confirm':
                        if (onConfirm) onConfirm();
                        close();
                        break;
                    case 'cancel':
                        if (onCancel) onCancel();
                        close();
                        break;
                    default:
                        close();
                        break;
                }
            });
        });
        
        // Prevent backdrop click from closing if clicking inside modal
        const modalContent = container.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    };
    
    // Update modal content
    const updateContent = (newContent) => {
        const modalBody = container.querySelector('.modal-body');
        if (modalBody) {
            if (typeof newContent === 'string') {
                modalBody.innerHTML = newContent;
            } else if (newContent instanceof Element) {
                modalBody.innerHTML = '';
                modalBody.appendChild(newContent);
            }
        }
    };
    
    // Update modal title
    const updateTitle = (newTitle) => {
        const modalTitle = container.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = newTitle;
        }
    };
    
    // Update footer buttons
    const updateFooterButtons = (newButtons) => {
        const modalFooter = container.querySelector('.modal-footer');
        if (modalFooter) {
            modalFooter.innerHTML = newButtons.map(button => `
                <button class="btn btn-${button.variant}" 
                        data-action="${button.action}">
                    ${button.text}
                </button>
            `).join('');
        }
    };
    
    // Check if modal is open
    const isModalOpen = () => {
        return isOpen;
    };
    
    // Clean up event listeners
    const destroy = () => {
        if (container._escHandler) {
            document.removeEventListener('keydown', container._escHandler);
        }
        close();
    };
    
    // Factory methods for common modal types
    
    const confirm = (title, message, options = {}) => {
        return Modal({
            title,
            content: `<p>${message}</p>`,
            footerButtons: [
                { text: 'Cancel', variant: 'outline', action: 'cancel' },
                { text: 'Confirm', variant: 'primary', action: 'confirm' }
            ],
            ...options
        });
    };
    
    const alert = (title, message, options = {}) => {
        return Modal({
            title,
            content: `<p>${message}</p>`,
            footerButtons: [
                { text: 'OK', variant: 'primary', action: 'confirm' }
            ],
            ...options
        });
    };
    
    const prompt = (title, placeholder = '', options = {}) => {
        const inputId = 'modal-prompt-input';
        const content = `
            <p>${options.message || ''}</p>
            <div class="form-group">
                <input type="text" 
                       id="${inputId}" 
                       class="form-control" 
                       placeholder="${placeholder}"
                       value="${options.defaultValue || ''}">
            </div>
        `;
        
        const modal = Modal({
            title,
            content,
            footerButtons: [
                { text: 'Cancel', variant: 'outline', action: 'cancel' },
                { text: 'Submit', variant: 'primary', action: 'confirm' }
            ],
            ...options
        });
        
        // Override onConfirm to get input value
        const originalOnConfirm = options.onConfirm;
        modal.onConfirm = () => {
            const input = document.getElementById(inputId);
            if (input && originalOnConfirm) {
                originalOnConfirm(input.value);
            }
        };
        
        return modal;
    };
    
    return {
        render,
        open,
        close,
        updateContent,
        updateTitle,
        updateFooterButtons,
        isModalOpen,
        destroy,
        confirm,
        alert,
        prompt
    };
}