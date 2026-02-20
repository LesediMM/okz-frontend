/**
 * /Users/lesedimalapile/Downloads/okz-frontend/src/session/session.js
 * Manages user credentials and authentication status via browser cookies.
 */

// ===== FALLBACKS - Isolated inline (no extra files) =====
const SessionFallbacks = {
    // Memory fallback when cookies are unavailable/blocked
    memorySession: null,
    
    // Check if cookies are enabled
    areCookiesEnabled: () => {
        try {
            document.cookie = "testcookie=1; SameSite=Strict";
            const enabled = document.cookie.indexOf("testcookie") !== -1;
            document.cookie = "testcookie=1; expires=Thu, 01 Jan 1970 00:00:00 UTC";
            return enabled;
        } catch (e) {
            return false;
        }
    },

    // Session size checker (prevents oversized cookies)
    MAX_SESSION_SIZE: 4000, // 4KB max for cookies
    
    checkSessionSize(data) {
        try {
            const size = new Blob([JSON.stringify(data)]).size;
            return size <= this.MAX_SESSION_SIZE;
        } catch (e) {
            return false;
        }
    },

    // Session validator (checks structure)
    validateSession(session) {
        if (!session || typeof session !== 'object') return false;
        if (!session.user || typeof session.user !== 'object') return false;
        if (typeof session.isAuthenticated !== 'boolean') return false;
        if (session.createdAt && isNaN(new Date(session.createdAt).getTime())) return false;
        
        // Validate required user fields
        const requiredUserFields = ['email'];
        for (const field of requiredUserFields) {
            if (!session.user[field]) return false;
        }
        
        return true;
    },

    // Session corruption repair
    repairSession(session) {
        if (!session || typeof session !== 'object') return null;
        
        // Create a clean session object
        const repaired = {
            isAuthenticated: !!(session.isAuthenticated && session.user),
            createdAt: session.createdAt || new Date().toISOString()
        };
        
        // Clean user object
        if (session.user && typeof session.user === 'object') {
            repaired.user = {
                email: session.user.email || '',
                fullName: session.user.fullName || '',
                role: session.user.role || 'user',
                phoneNumber: session.user.phoneNumber || ''
            };
        } else {
            return null;
        }
        
        return repaired;
    },

    // Session backup to localStorage (FAIL SAFE)
    backupToStorage(session) {
        try {
            localStorage.setItem('okz_session_backup', JSON.stringify({
                session,
                timestamp: Date.now()
            }));
        } catch (e) {
            // Ignore storage errors
        }
    },

    // Restore from backup (FAIL SAFE)
    restoreFromBackup() {
        try {
            const backup = localStorage.getItem('okz_session_backup');
            if (backup) {
                const { session, timestamp } = JSON.parse(backup);
                // Only restore if backup is less than 24 hours old
                if (Date.now() - timestamp < 86400000) {
                    return session;
                }
            }
        } catch (e) {}
        return null;
    },

    // Error messages for logging
    logError(type, error) {
        console.error(`[Session Fallback] ${type}:`, error?.message || error);
    }
};
// ===== END FALLBACKS =====

const COOKIE_NAME = 'okz_user_session';
const DAYS_TO_EXPIRY = 7; // Session lasts 1 week

// FAIL SAFE: Check cookies on module load
const cookiesEnabled = SessionFallbacks.areCookiesEnabled();
if (!cookiesEnabled) {
    console.warn('[Session] Cookies disabled, falling back to memory storage');
}

export const sessionManager = {
    /**
     * Saves the user object and sets authenticated status
     * @param {Object} userData - The user data returned from the API
     */
    saveSession: (userData) => {
        try {
            const sessionData = {
                user: userData,
                isAuthenticated: true,
                createdAt: new Date().toISOString()
            };

            // FAIL HARD: Validate session data
            if (!userData || !userData.email) {
                SessionFallbacks.logError('save-validation', 'Invalid user data');
                return false;
            }

            // FAIL HARD: Check session size
            if (!SessionFallbacks.checkSessionSize(sessionData)) {
                SessionFallbacks.logError('save-size', 'Session too large');
                // Try to save minimal version
                const minimalSession = {
                    user: {
                        email: userData.email,
                        fullName: userData.fullName || '',
                        role: userData.role || 'user'
                    },
                    isAuthenticated: true,
                    createdAt: new Date().toISOString()
                };
                
                if (SessionFallbacks.checkSessionSize(minimalSession)) {
                    sessionData.user = minimalSession.user;
                } else {
                    throw new Error('Session too large even after minimization');
                }
            }

            // FAIL SAFE: Backup to localStorage
            SessionFallbacks.backupToStorage(sessionData);

            // Try cookie storage first
            if (cookiesEnabled) {
                try {
                    const serializedData = encodeURIComponent(JSON.stringify(sessionData));
                    const date = new Date();
                    date.setTime(date.getTime() + (DAYS_TO_EXPIRY * 24 * 60 * 60 * 1000));
                    const expires = "expires=" + date.toUTCString();

                    document.cookie = `${COOKIE_NAME}=${serializedData}; ${expires}; path=/; SameSite=Strict`;
                    
                    // Verify cookie was set
                    if (document.cookie.indexOf(COOKIE_NAME) === -1) {
                        throw new Error('Cookie not set');
                    }
                    
                    return true;
                } catch (cookieError) {
                    SessionFallbacks.logError('save-cookie', cookieError);
                    // Fall through to memory fallback
                }
            }

            // FAIL SAFE: Memory fallback
            SessionFallbacks.memorySession = sessionData;
            SessionFallbacks.logError('save-memory', 'Using memory fallback');
            return true;

        } catch (error) {
            SessionFallbacks.logError('save', error);
            return false;
        }
    },

    /**
     * Retrieves the session from the cookie
     * @returns {Object|null} The session data or null if not found
     */
    getSession: () => {
        try {
            let sessionData = null;

            // Try cookie first if enabled
            if (cookiesEnabled) {
                try {
                    const name = COOKIE_NAME + "=";
                    const decodedCookie = decodeURIComponent(document.cookie);
                    const cookieArray = decodedCookie.split(';');

                    for (let i = 0; i < cookieArray.length; i++) {
                        let cookie = cookieArray[i].trim();
                        if (cookie.indexOf(name) === 0) {
                            const rawData = cookie.substring(name.length, cookie.length);
                            sessionData = JSON.parse(rawData);
                            break;
                        }
                    }
                } catch (cookieError) {
                    SessionFallbacks.logError('get-cookie', cookieError);
                }
            }

            // FAIL SAFE: Try memory fallback
            if (!sessionData && SessionFallbacks.memorySession) {
                sessionData = SessionFallbacks.memorySession;
                SessionFallbacks.logError('get-memory', 'Retrieved from memory');
            }

            // FAIL SAFE: Try backup if still nothing
            if (!sessionData) {
                sessionData = SessionFallbacks.restoreFromBackup();
                if (sessionData) {
                    SessionFallbacks.logError('get-backup', 'Restored from backup');
                }
            }

            // FAIL SAFE: Validate and repair if needed
            if (sessionData) {
                if (!SessionFallbacks.validateSession(sessionData)) {
                    SessionFallbacks.logError('get-validation', 'Invalid session, attempting repair');
                    sessionData = SessionFallbacks.repairSession(sessionData);
                    
                    // If repair succeeded, save the repaired version
                    if (sessionData) {
                        this.saveSession(sessionData.user);
                    }
                }
            }

            return sessionData;

        } catch (error) {
            SessionFallbacks.logError('get', error);
            return null;
        }
    },

    /**
     * Deletes the session cookie (Log out)
     */
    endSession: () => {
        try {
            // Clear cookie
            document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            
            // FAIL SAFE: Clear memory fallback
            SessionFallbacks.memorySession = null;
            
            // FAIL SAFE: Clear backup
            try {
                localStorage.removeItem('okz_session_backup');
            } catch (e) {}
            
            return true;
        } catch (error) {
            SessionFallbacks.logError('end', error);
            return false;
        }
    },

    /**
     * Checks if the current session is valid
     * @returns {boolean} True if session exists and is authenticated
     */
    isValidSession: () => {
        try {
            const session = sessionManager.getSession();
            
            // FAIL HARD: Validate session structure
            if (!session) return false;
            
            // Check required fields
            const isValid = !!(
                session && 
                session.isAuthenticated === true && 
                session.user && 
                session.user.email
            );
            
            // FAIL SAFE: Check if session is too old (optional)
            if (isValid && session.createdAt) {
                const age = Date.now() - new Date(session.createdAt).getTime();
                const maxAge = DAYS_TO_EXPIRY * 24 * 60 * 60 * 1000;
                if (age > maxAge) {
                    SessionFallbacks.logError('isValid-expired', 'Session expired');
                    this.endSession();
                    return false;
                }
            }
            
            return isValid;
            
        } catch (error) {
            SessionFallbacks.logError('isValid', error);
            return false;
        }
    },

    // ===== OPTIONAL FALLBACK METHODS (don't affect core) =====
    
    /**
     * Gets session status with diagnostic info (for debugging)
     */
    getSessionStatus: () => {
        return {
            hasSession: !!sessionManager.getSession(),
            cookiesEnabled,
            hasMemoryFallback: !!SessionFallbacks.memorySession,
            hasBackup: !!SessionFallbacks.restoreFromBackup(),
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Force refresh session from backup
     */
    refreshFromBackup: () => {
        const backup = SessionFallbacks.restoreFromBackup();
        if (backup) {
            sessionManager.saveSession(backup.user);
            return true;
        }
        return false;
    }
};