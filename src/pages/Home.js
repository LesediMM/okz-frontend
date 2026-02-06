/**
 * OKZ Sports - Home Page
 * Developed by S.R.C Laboratories
 * Landing page for OKZ Sports court booking system
 */

export default function Home({ store, router, onNavigate }) {
    const container = document.createElement('div');
    container.className = 'home-page';
    
    // Render function
    const render = () => {
        const user = store.auth.getUser();
        const admin = store.auth.getAdmin();
        
        container.innerHTML = `
            <!-- Hero Section -->
            <section class="hero">
                <div class="container">
                    <div class="hero-content">
                        <h1>Book Your Court in Minutes</h1>
                        <p>Premium paddle and tennis courts at 400 EGP/hour. State-of-the-art facilities with flexible booking options.</p>
                        <div class="hero-buttons">
                            ${user ? 
                                `<button class="btn btn-primary btn-large" id="book-now">Book Now</button>` :
                                `<button class="btn btn-primary btn-large" id="get-started">Get Started</button>`
                            }
                            <button class="btn btn-outline btn-large" id="view-courts">View Courts</button>
                        </div>
                    </div>
                    <div class="hero-image">
                        <div class="court-placeholder">
                            <i class="fas fa-tennis-ball"></i>
                            <i class="fas fa-table-tennis-paddle-ball"></i>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Courts Section -->
            <section class="courts" id="courts-section">
                <div class="container">
                    <h2 class="section-title">Our Courts</h2>
                    <p class="section-subtitle">2 Paddle Courts & 3 Tennis Courts</p>
                    
                    <div class="court-grid" id="court-grid">
                        <!-- Courts will be dynamically loaded -->
                    </div>
                </div>
            </section>
            
            <!-- Booking Process -->
            <section class="booking-process">
                <div class="container">
                    <h2 class="section-title">How to Book</h2>
                    <div class="process-steps">
                        <div class="step">
                            <div class="step-number">1</div>
                            <h3>Create Account</h3>
                            <p>Sign up with your email and password</p>
                        </div>
                        <div class="step">
                            <div class="step-number">2</div>
                            <h3>Choose Court & Time</h3>
                            <p>Select from available slots</p>
                        </div>
                        <div class="step">
                            <div class="step-number">3</div>
                            <h3>Confirm Booking</h3>
                            <p>Complete payment to reserve</p>
                        </div>
                        <div class="step">
                            <div class="step-number">4</div>
                            <h3>Play!</h3>
                            <p>Arrive 15 minutes before your time</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Operating Hours -->
            <section class="hours-section">
                <div class="container">
                    <div class="hours-card">
                        <div class="hours-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="hours-content">
                            <h3>Daily: 8:00 AM - 10:00 PM</h3>
                            <p>Book up to 30 days in advance</p>
                            <p>Maximum 4 hours per booking</p>
                            <p class="price-tag">400 EGP/hour</p>
                        </div>
                        ${user ? 
                            `<button class="btn btn-primary" id="check-availability">Check Availability</button>` :
                            `<button class="btn btn-primary" id="login-to-book">Login to Book</button>`
                        }
                    </div>
                </div>
            </section>
        `;
        
        return container;
    };
    
    // Initialize component
    const init = () => {
        loadCourts();
        setupEventListeners();
    };
    
    // Load courts data
    const loadCourts = () => {
        const courtGrid = container.querySelector('#court-grid');
        if (!courtGrid) return;
        
        const courts = [
            {
                type: 'paddle',
                name: 'Paddle Courts',
                courts: 'Courts 1 & 2',
                features: [
                    'Professional surface',
                    'LED lighting',
                    'Equipment rental available'
                ],
                icon: 'fas fa-table-tennis-paddle-ball'
            },
            {
                type: 'tennis',
                name: 'Tennis Courts',
                courts: 'Courts 3, 4 & 5',
                features: [
                    'Clay surface',
                    'Professional netting',
                    'Coach services available'
                ],
                icon: 'fas fa-baseball'
            }
        ];
        
        courtGrid.innerHTML = courts.map(court => `
            <div class="court-card">
                <div class="court-icon">
                    <i class="${court.icon}"></i>
                </div>
                <h3>${court.name}</h3>
                <p>${court.courts}</p>
                <ul class="court-features">
                    ${court.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <div class="court-price">
                    <span class="price">400 EGP</span>
                    <span class="period">/ hour</span>
                </div>
            </div>
        `).join('');
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Book Now / Get Started button
        const bookBtn = container.querySelector('#book-now') || container.querySelector('#get-started');
        if (bookBtn) {
            bookBtn.addEventListener('click', () => {
                if (store.auth.isAuthenticated()) {
                    onNavigate('/booking');
                } else {
                    onNavigate('/register');
                }
            });
        }
        
        // View Courts button
        const viewCourtsBtn = container.querySelector('#view-courts');
        if (viewCourtsBtn) {
            viewCourtsBtn.addEventListener('click', () => {
                const courtsSection = container.querySelector('#courts-section');
                courtsSection.scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // Check Availability / Login to Book button
        const availabilityBtn = container.querySelector('#check-availability') || 
                                container.querySelector('#login-to-book');
        if (availabilityBtn) {
            availabilityBtn.addEventListener('click', () => {
                if (store.auth.isAuthenticated()) {
                    onNavigate('/booking');
                } else {
                    onNavigate('/login');
                }
            });
        }
    };
    
    return {
        render,
        init
    };
}