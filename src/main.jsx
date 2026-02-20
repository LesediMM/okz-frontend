/**
 * src/main.js
 * Entry point - REACT ROUTER & ZERO-STORAGE VERSION
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Pointing to your new App.jsx
import './styles/global.css'; // Importing your existing styles

// ===== FALLBACKS - Isolated inline (no extra files) =====
const MainFallbacks = {
    // Check if DOM is ready
    isDOMReady: () => {
        return document.readyState === 'complete' || document.readyState === 'interactive';
    },

    // Wait for DOM if not ready
    waitForDOM: () => {
        return new Promise((resolve) => {
            if (MainFallbacks.isDOMReady()) {
                resolve();
            } else {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            }
        });
    },

    // Fallback container if main container missing
    createFallbackContainer() {
        console.warn('[Main] #app container not found, creating fallback');
        const fallbackContainer = document.createElement('div');
        fallbackContainer.id = 'app-fallback';
        fallbackContainer.style.cssText = `
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        document.body.appendChild(fallbackContainer);
        return fallbackContainer;
    },

    // Error fallback UI
    renderErrorFallback(container, error) {
        const fallbackUI = `
            <div style="text-align: center; padding: 40px; max-width: 500px; margin: 0 auto;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎾</div>
                <h1 style="color: #1a2b56; margin-bottom: 1rem;">OKZ Sports</h1>
                <p style="color: #666; margin-bottom: 2rem;">Unable to start application. Please refresh the page.</p>
                <button onclick="window.location.reload()" style="
                    background: #1a2b56;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    font-weight: 600;
                ">Refresh Page</button>
                <p style="color: #999; font-size: 0.8rem; margin-top: 2rem;">
                    Error: ${error?.message || 'Unknown error'}
                </p>
            </div>
        `;
        
        if (container) {
            container.innerHTML = fallbackUI;
        } else {
            document.body.innerHTML = fallbackUI;
        }
    },

    // Performance monitoring
    performance: {
        startTime: performance.now(),
        
        mark(name) {
            if (process.env.NODE_ENV === 'development') {
                performance.mark(name);
            }
        },
        
        measure(name, startMark, endMark) {
            if (process.env.NODE_ENV === 'development') {
                try {
                    performance.measure(name, startMark, endMark);
                } catch (e) {}
            }
        },
        
        logLoadTime() {
            const loadTime = performance.now() - this.startTime;
            console.log(`[Performance] App loaded in ${loadTime.toFixed(2)}ms`);
        }
    },

    // Retry mounting with backoff
    async mountWithRetry(mountFn, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await mountFn();
            } catch (err) {
                const isLast = i === maxRetries - 1;
                if (isLast) throw err;
                
                const wait = 1000 * Math.pow(2, i);
                console.log(`[Main] Mount retry ${i + 1}/${maxRetries} in ${wait}ms`);
                await new Promise(r => setTimeout(r, wait));
            }
        }
    },

    // Browser compatibility check
    checkBrowserSupport() {
        const checks = {
            react: typeof React !== 'undefined',
            reactDOM: typeof ReactDOM !== 'undefined',
            promise: typeof Promise !== 'undefined',
            fetch: typeof window.fetch !== 'undefined',
            localStorage: (() => { try { return !!window.localStorage; } catch(e) { return false; } })(),
            cookies: navigator.cookieEnabled
        };
        
        const supported = Object.values(checks).every(Boolean);
        
        if (!supported) {
            console.warn('[Main] Browser compatibility issues:', 
                Object.entries(checks).filter(([_, v]) => !v).map(([k]) => k)
            );
        }
        
        return { supported, checks };
    },

    // Error logging
    errors: [],
    
    logError(type, error, context = {}) {
        const errorEntry = {
            type,
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.errors.push(errorEntry);
        console.error(`[Main] ${type}:`, error?.message || error);
        
        // Keep last 10 errors
        if (this.errors.length > 10) {
            this.errors.shift();
        }
    },

    // Recovery actions
    recovery: {
        attempted: false,
        
        attempt() {
            if (this.attempted) return false;
            this.attempted = true;
            
            console.log('[Main] Attempting recovery...');
            
            // Clear any corrupted state
            try {
                sessionStorage.clear();
            } catch (e) {}
            
            return true;
        }
    }
};

// Mark initial performance point
MainFallbacks.performance.mark('main-start');
// ===== END FALLBACKS =====

// 1. Target the 'app' div from your index.html
let container;

// FAIL HARD: Check browser support first
const browserCheck = MainFallbacks.checkBrowserSupport();
if (!browserCheck.supported) {
    console.error('[Main] Unsupported browser features:', browserCheck.checks);
    // Continue anyway, but log warning
}

// FAIL SAFE: Wait for DOM to be ready
MainFallbacks.waitForDOM().then(() => {
    // FAIL HARD: Try to get container with retry
    return MainFallbacks.mountWithRetry(async () => {
        container = document.getElementById('app');
        
        // FAIL SAFE: Create fallback if container missing
        if (!container) {
            container = MainFallbacks.createFallbackContainer();
            MainFallbacks.logError('container-missing', new Error('#app not found'));
        }
        
        return container;
    });
}).then(() => {
    // 2. Initialize the React Root
    let root;
    
    try {
        root = ReactDOM.createRoot(container);
        MainFallbacks.performance.mark('root-created');
    } catch (error) {
        // FAIL SAFE: Handle ReactDOM.createRoot failure
        MainFallbacks.logError('create-root', error);
        MainFallbacks.renderErrorFallback(container, error);
        return;
    }

    // 3. Render the application
    try {
        // FAIL HARD: Attempt render with error tracking
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
        
        MainFallbacks.performance.mark('app-rendered');
        MainFallbacks.performance.measure('app-load', 'main-start', 'app-rendered');
        MainFallbacks.performance.logLoadTime();
        
        console.log('✅ OKZ Sports: React Bootstrapping complete.');

        // FAIL SAFE: Report successful load
        if (window.reportWebVitals) {
            import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getCLS(window.reportWebVitals);
                getFID(window.reportWebVitals);
                getFCP(window.reportWebVitals);
                getLCP(window.reportWebVitals);
                getTTFB(window.reportWebVitals);
            }).catch(() => {});
        }

    } catch (error) {
        // FAIL SAFE: Handle render failure
        MainFallbacks.logError('render', error);
        
        // FAIL HARD: Attempt recovery once
        if (MainFallbacks.recovery.attempt()) {
            console.log('[Main] Recovery attempted, please refresh');
            MainFallbacks.renderErrorFallback(container, {
                message: 'Application failed to start. Please refresh.'
            });
        } else {
            MainFallbacks.renderErrorFallback(container, error);
        }
    }
}).catch((error) => {
    // FAIL SAFE: Ultimate fallback for any initialization error
    MainFallbacks.logError('initialization', error);
    MainFallbacks.renderErrorFallback(null, error);
});

// ===== OPTIONAL FALLBACK METHODS (exposed for debugging) =====

// Expose health check in development
if (process.env.NODE_ENV === 'development') {
    window.__OKZ_DEBUG__ = {
        getErrors: () => MainFallbacks.errors,
        getPerformance: () => ({
            loadTime: performance.now() - MainFallbacks.performance.startTime,
            marks: performance.getEntriesByType('mark').map(m => ({ name: m.name, time: m.startTime }))
        }),
        checkBrowser: () => MainFallbacks.checkBrowserSupport(),
        forceRecovery: () => MainFallbacks.recovery.attempt(),
        version: '1.0.0'
    };
    console.log('[Debug] OKZ debug tools available at window.__OKZ_DEBUG__');
}

// Handle unhandled errors at window level
window.addEventListener('error', (event) => {
    MainFallbacks.logError('window-error', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
    MainFallbacks.logError('unhandled-rejection', event.reason);
});