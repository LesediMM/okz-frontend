/**
 * OKZ Sports - Main Layout Component
 * Developed by S.R.C Laboratories
 * Main application layout wrapper
 */

import Navbar from './Navbar.js';
import Footer from './Footer.js';
import LoadingSpinner from './LoadingSpinner.js';

export default function Layout(props) {
    const {
        user,
        admin,
        currentPath,
        onNavigate,
        onLogout,
        onMenuToggle
    } = props;
    
    const container = document.createElement('div');
    container.className = 'layout';
    
    // Create layout elements
    const navbar = Navbar({
        user,
        admin,
        currentPath,
        onNavigate,
        onLogout,
        onMenuToggle
    });
    
    const footer = Footer({
        onNavigate
    });
    
    // Render function
    const render = (content) => {
        container.innerHTML = '';
        
        // Add navbar
        const navbarElement = navbar.render();
        container.appendChild(navbarElement);
        
        // Add main content
        const main = document.createElement('main');
        main.className = 'main-content';
        
        if (content && content.render) {
            const contentElement = content.render();
            if (contentElement) {
                main.appendChild(contentElement);
            }
        } else if (content) {
            main.appendChild(content);
        }
        
        container.appendChild(main);
        
        // Add footer
        const footerElement = footer.render();
        container.appendChild(footerElement);
        
        return container;
    };
    
    // Initialize component
    const init = () => {
        if (navbar.init) navbar.init();
        if (footer.init) footer.init();
    };
    
    // Update layout when user/admin state changes
    const update = (newProps) => {
        if (newProps.user !== user || newProps.admin !== admin || newProps.currentPath !== currentPath) {
            if (navbar.update) {
                navbar.update(newProps);
            }
        }
    };
    
    return {
        render,
        init,
        update
    };
}