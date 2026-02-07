/**
 * src/pages/MyBookings.js
 * User Booking History Page - 100% Manual Routing Version
 * Updated with sessionStorage and proper headers
 */

import UserLogin from './UserLogin.js';
import Booking from './Booking.js';

export default {
    render: () => `
        <div class="my-bookings-container">
            <div class="booking-header">
                <h2>My Bookings</h2>
                <p>Track your upcoming and past reservations.</p>
            </div>
            <div id="booking-list" class="booking-list">
                <p class="loading">Fetching your bookings...</p>
            </div>
        </div>
    `,

    afterRender: async () => {
        console.log('🔧 MyBookings afterRender started...');
        
        const container = document.getElementById('booking-list');
        const appContainer = document.getElementById('app');
        
        // 1. Get User ID from sessionStorage first, then localStorage
        const sessionUserId = sessionStorage.getItem('okz_user_id');
        const localUserId = localStorage.getItem('okz_user_id');
        const userId = sessionUserId || localUserId;
        
        console.log('📋 MyBookings - User ID from storage:', userId);
        console.log('SessionStorage:', sessionUserId);
        console.log('LocalStorage:', localUserId);

        if (!userId) {
            console.log('❌ No user ID found, showing login prompt');
            container.innerHTML = `
                <div class="auth-notice">
                    <p>Please <button id="mybookings-to-login" class="btn-link">login</button> to view your court reservations.</p>
                </div>`;
            
            document.getElementById('mybookings-to-login')?.addEventListener('click', () => {
                console.log('🔐 Navigating to login...');
                appContainer.innerHTML = UserLogin.render();
                if (UserLogin.afterRender) UserLogin.afterRender();
            });
            return;
        }

        try {
            console.log('📤 Fetching bookings for user:', userId);
            console.log('Request headers:', {
                'x-user-id': userId,
                'X-User-ID': userId,
                'Origin': 'https://okz-frontend.onrender.com',
                'Content-Type': 'application/json'
            });
            
            // 2. Fetch using correct endpoint with proper headers
            const response = await fetch('https://okz.onrender.com/api/v1/bookings', {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'x-user-id': userId,        // lowercase - backend expects this
                    'X-User-ID': userId,        // uppercase - for case-sensitive browsers
                    'Origin': 'https://okz-frontend.onrender.com',
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 MyBookings fetch - Status:', response.status);
            console.log('📥 MyBookings fetch - Headers:', [...response.headers.entries()]);
            
            // Check if response is OK before parsing JSON
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('📥 MyBookings fetch - Response:', result);

            if (response.ok && result.status === 'success') {
                const bookings = result.data.bookings;
                console.log(`✅ Found ${bookings?.length || 0} bookings`);

                if (!bookings || bookings.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <p>No bookings found. Ready to hit the court?</p>
                            <button id="mybookings-to-book" class="btn btn-primary">Book a Court Now</button>
                        </div>`;
                    
                    document.getElementById('mybookings-to-book')?.addEventListener('click', () => {
                        console.log('📅 Navigating to Booking page...');
                        appContainer.innerHTML = Booking.render();
                        // Booking uses a setTimeout internally in its render, but we call afterRender for consistency
                        if (Booking.afterRender) {
                            // Give Booking's setTimeout a moment to run
                            setTimeout(() => {
                                if (Booking.afterRender) Booking.afterRender();
                            }, 100);
                        }
                    });
                    return;
                }

                // 3. Render the booking cards
                console.log('🎨 Rendering booking cards...');
                container.innerHTML = bookings.map(b => {
                    // Format the date nicely
                    let formattedDate;
                    try {
                        const dateObj = new Date(b.date);
                        formattedDate = dateObj.toLocaleDateString('en-GB', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                    } catch (e) {
                        formattedDate = b.date || 'Date not available';
                    }
                    
                    return `
                    <div class="booking-card ${b.status === 'cancelled' ? 'cancelled' : ''}">
                        <div class="booking-details">
                            <span class="court-badge ${b.courtType}">${b.courtType.toUpperCase()}</span>
                            <strong>Court ${b.courtNumber}</strong>
                            <p class="booking-time">
                                📅 ${formattedDate}<br>
                                ⏰ ${b.timeSlot} (${b.duration} Hour${b.duration > 1 ? 's' : ''})
                            </p>
                        </div>
                        <div class="booking-meta">
                            <span class="status-badge status-${b.status}">${b.status.toUpperCase()}</span>
                            <p class="booking-price">${b.totalPrice} EGP</p>
                            ${b.paymentStatus === 'pending' ? '<span class="payment-warning">⚠️ Payment Pending</span>' : ''}
                        </div>
                    </div>
                    `;
                }).join('');
                
                console.log('✅ Booking cards rendered successfully');
                
            } else {
                console.error('❌ API returned error status:', result);
                container.innerHTML = `
                    <div class="error-state">
                        <p class="error">Error: ${result.message || 'Failed to load bookings.'}</p>
                        <button id="retry-bookings-btn" class="btn btn-outline">Retry</button>
                    </div>`;
                
                document.getElementById('retry-bookings-btn')?.addEventListener('click', () => {
                    console.log('🔄 Retrying fetch...');
                    // Clear and retry
                    container.innerHTML = '<p class="loading">Fetching your bookings...</p>';
                    // Re-run afterRender
                    setTimeout(() => this.afterRender(), 100);
                });
            }
        } catch (err) {
            console.error('❌ MyBookings Error:', err);
            container.innerHTML = `
                <div class="error-state">
                    <p class="error">Unable to connect to server: ${err.message}</p>
                    <button id="retry-bookings-btn" class="btn btn-outline">Retry</button>
                    <button id="mybookings-to-login-error" class="btn-link">Try logging in again</button>
                </div>`;
            
            // Retry button
            document.getElementById('retry-bookings-btn')?.addEventListener('click', () => {
                console.log('🔄 Retrying fetch after error...');
                container.innerHTML = '<p class="loading">Fetching your bookings...</p>';
                setTimeout(() => this.afterRender(), 100);
            });
            
            // Login again button
            document.getElementById('mybookings-to-login-error')?.addEventListener('click', () => {
                console.log('🔐 Navigating to login from error state...');
                appContainer.innerHTML = UserLogin.render();
                if (UserLogin.afterRender) UserLogin.afterRender();
            });
        }
    }
};