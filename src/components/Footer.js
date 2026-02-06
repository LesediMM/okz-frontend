/**
 * OKZ Sports - Footer Component
 * Developed by S.R.C Laboratories
 * Application footer with links and information
 */

export default function Footer(props) {
    const { onNavigate } = props;
    
    const container = document.createElement('footer');
    container.className = 'footer';
    
    // Current year for copyright
    const currentYear = new Date().getFullYear();
    
    // Render function
    const render = () => {
        container.innerHTML = `
            <div class="footer-container">
                <!-- Main Footer Content -->
                <div class="footer-main">
                    <!-- Company Info -->
                    <div class="footer-section">
                        <div class="footer-logo">
                            <div class="logo-icon">
                                <i class="fas fa-tennis-ball"></i>
                                <i class="fas fa-table-tennis-paddle-ball"></i>
                            </div>
                            <h3 class="logo-text">OKZ Sports</h3>
                        </div>
                        <p class="footer-description">
                            Premium court booking system for paddle and tennis enthusiasts.
                            2 paddle courts and 3 tennis courts available at 400 EGP/hour.
                        </p>
                        <div class="footer-social">
                            <a href="#" class="social-link" title="Facebook">
                                <i class="fab fa-facebook"></i>
                            </a>
                            <a href="#" class="social-link" title="Instagram">
                                <i class="fab fa-instagram"></i>
                            </a>
                            <a href="#" class="social-link" title="Twitter">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a href="#" class="social-link" title="LinkedIn">
                                <i class="fab fa-linkedin"></i>
                            </a>
                        </div>
                    </div>
                    
                    <!-- Quick Links -->
                    <div class="footer-section">
                        <h4 class="footer-title">Quick Links</h4>
                        <ul class="footer-links">
                            <li><a href="/" class="footer-link" id="footer-home">Home</a></li>
                            <li><a href="/booking" class="footer-link" id="footer-booking">Book a Court</a></li>
                            <li><a href="/my-bookings" class="footer-link" id="footer-my-bookings">My Bookings</a></li>
                            <li><a href="/login" class="footer-link" id="footer-login">User Login</a></li>
                            <li><a href="/register" class="footer-link" id="footer-register">User Sign Up</a></li>
                            <li><a href="/admin/login" class="footer-link" id="footer-admin">Admin Login</a></li>
                        </ul>
                    </div>
                    
                    <!-- Court Information -->
                    <div class="footer-section">
                        <h4 class="footer-title">Court Information</h4>
                        <ul class="footer-info">
                            <li>
                                <i class="fas fa-map-marker-alt"></i>
                                <span>Cairo, Egypt</span>
                            </li>
                            <li>
                                <i class="fas fa-clock"></i>
                                <span>8:00 AM - 10:00 PM Daily</span>
                            </li>
                            <li>
                                <i class="fas fa-money-bill-wave"></i>
                                <span>400 EGP per hour</span>
                            </li>
                            <li>
                                <i class="fas fa-phone"></i>
                                <span>+20 123 456 7890</span>
                            </li>
                            <li>
                                <i class="fas fa-envelope"></i>
                                <span>support@okz-sports.com</span>
                            </li>
                        </ul>
                    </div>
                    
                    <!-- Newsletter -->
                    <div class="footer-section">
                        <h4 class="footer-title">Stay Updated</h4>
                        <p class="footer-text">Subscribe to our newsletter for updates and promotions.</p>
                        <form class="newsletter-form" id="newsletter-form">
                            <div class="form-group">
                                <input type="email" 
                                       class="form-control" 
                                       placeholder="Your email address"
                                       required
                                       id="newsletter-email">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </form>
                        <p class="newsletter-note">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </div>
                </div>
                
                <!-- Footer Bottom -->
                <div class="footer-bottom">
                    <div class="footer-bottom-content">
                        <p class="copyright">
                            &copy; ${currentYear} OKZ Sports. Developed by S.R.C Laboratories. All rights reserved.
                        </p>
                        <div class="footer-bottom-links">
                            <a href="#" class="footer-bottom-link" id="privacy-policy">Privacy Policy</a>
                            <a href="#" class="footer-bottom-link" id="terms-of-service">Terms of Service</a>
                            <a href="#" class="footer-bottom-link" id="cookie-policy">Cookie Policy</a>
                            <a href="#" class="footer-bottom-link" id="sitemap">Sitemap</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return container;
    };
    
    // Initialize component
    const init = () => {
        setupEventListeners();
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Footer navigation links
        const footerLinks = container.querySelectorAll('.footer-link');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && onNavigate) {
                    onNavigate(href);
                }
            });
        });
        
        // Newsletter form
        const newsletterForm = container.querySelector('#newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        }
        
        // Social links (open in new tab)
        const socialLinks = container.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // In a real app, these would link to actual social media pages
                alert('Social media links would open in a real application.');
            });
        });
        
        // Footer bottom links
        const bottomLinks = container.querySelectorAll('.footer-bottom-link');
        bottomLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showLegalModal(link.id);
            });
        });
    };
    
    // Handle newsletter submission
    const handleNewsletterSubscribe = async (email) => {
        // In a real app, this would call an API
        console.log('Newsletter subscription:', email);
        
        // Show success message
        const newsletterForm = container.querySelector('#newsletter-form');
        if (newsletterForm) {
            newsletterForm.innerHTML = `
                <div class="newsletter-success">
                    <i class="fas fa-check-circle"></i>
                    <p>Thank you for subscribing!</p>
                </div>
            `;
        }
        
        // Reset after 5 seconds
        setTimeout(() => {
            if (container.querySelector('.newsletter-form')) {
                container.querySelector('.newsletter-form').innerHTML = `
                    <div class="form-group">
                        <input type="email" 
                               class="form-control" 
                               placeholder="Your email address"
                               required
                               id="newsletter-email">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                `;
                
                // Re-attach event listener
                const form = container.querySelector('#newsletter-form');
                if (form) {
                    form.addEventListener('submit', handleNewsletterSubmit);
                }
            }
        }, 5000);
    };
    
    // Handle newsletter form submission
    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        
        const emailInput = container.querySelector('#newsletter-email');
        if (!emailInput || !emailInput.value) return;
        
        const email = emailInput.value.trim();
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailInput.classList.add('error');
            return;
        }
        
        emailInput.classList.remove('error');
        handleNewsletterSubscribe(email);
    };
    
    // Show legal modal
    const showLegalModal = (modalType) => {
        const modals = {
            'privacy-policy': {
                title: 'Privacy Policy',
                content: `
                    <p>OKZ Sports respects your privacy and is committed to protecting your personal data.</p>
                    <h4>Data Collection</h4>
                    <p>We collect information you provide when you create an account, make bookings, or contact us.</p>
                    <h4>Data Usage</h4>
                    <p>Your data is used to provide services, process bookings, and improve your experience.</p>
                    <h4>Data Protection</h4>
                    <p>We implement security measures to protect your personal information.</p>
                    <p>For full details, contact: privacy@okz-sports.com</p>
                `
            },
            'terms-of-service': {
                title: 'Terms of Service',
                content: `
                    <p>By using OKZ Sports, you agree to these terms and conditions.</p>
                    <h4>Booking Policy</h4>
                    <p>Bookings must be paid for within 30 minutes of creation. Cancellations must be made at least 2 hours in advance.</p>
                    <h4>Court Rules</h4>
                    <p>Users must arrive 15 minutes before their booking time. Proper sports attire is required.</p>
                    <h4>Liability</h4>
                    <p>OKZ Sports is not responsible for personal injury or loss of property.</p>
                    <p>For questions, contact: legal@okz-sports.com</p>
                `
            },
            'cookie-policy': {
                title: 'Cookie Policy',
                content: `
                    <p>We use cookies to improve your browsing experience on OKZ Sports.</p>
                    <h4>Essential Cookies</h4>
                    <p>Required for the website to function properly (authentication, sessions).</p>
                    <h4>Analytics Cookies</h4>
                    <p>Help us understand how visitors interact with our website.</p>
                    <h4>Preference Cookies</h4>
                    <p>Remember your settings and preferences for future visits.</p>
                    <p>You can manage cookies in your browser settings.</p>
                `
            },
            'sitemap': {
                title: 'Sitemap',
                content: `
                    <h4>Main Pages</h4>
                    <ul>
                        <li>Home Page</li>
                        <li>User Login</li>
                        <li>User Registration</li>
                        <li>Book a Court</li>
                        <li>My Bookings</li>
                        <li>User Dashboard</li>
                        <li>Admin Login</li>
                        <li>Admin Dashboard</li>
                        <li>Booking Management</li>
                    </ul>
                    <h4>Legal Pages</h4>
                    <ul>
                        <li>Privacy Policy</li>
                        <li>Terms of Service</li>
                        <li>Cookie Policy</li>
                    </ul>
                `
            }
        };
        
        const modal = modals[modalType];
        if (modal) {
            alert(`${modal.title}\n\n${modal.content.replace(/<[^>]*>/g, '')}`);
        }
    };
    
    return {
        render,
        init
    };
}