/**
 * /Users/lesedimalapile/Downloads/okz-frontend/src/session/session.js
 * Manages user credentials and authentication status via browser cookies.
 */

const COOKIE_NAME = 'okz_user_session';
const DAYS_TO_EXPIRY = 7; // Session lasts 1 week

export const sessionManager = {
    /**
     * Saves the user object and sets authenticated status
     * @param {Object} userData - The user data returned from the API
     */
    saveSession: (userData) => {
        const sessionData = {
            user: userData,
            isAuthenticated: true,
            createdAt: new Date().toISOString()
        };

        // Convert to string and encode for cookie safety
        const serializedData = encodeURIComponent(JSON.stringify(sessionData));
        
        // Calculate expiry
        const date = new Date();
        date.setTime(date.getTime() + (DAYS_TO_EXPIRY * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();

        // Save cookie
        document.cookie = `${COOKIE_NAME}=${serializedData}; ${expires}; path=/; SameSite=Strict`;
    },

    /**
     * Retrieves the session from the cookie
     * @returns {Object|null} The session data or null if not found
     */
    getSession: () => {
        const name = COOKIE_NAME + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');

        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i].trim();
            if (cookie.indexOf(name) === 0) {
                try {
                    return JSON.parse(cookie.substring(name.length, cookie.length));
                } catch (error) {
                    console.error("Failed to parse session cookie:", error);
                    return null;
                }
            }
        }
        return null;
    },

    /**
     * Deletes the session cookie (Log out)
     */
    endSession: () => {
        document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    },

    /**
     * Checks if the current session is valid
     * @returns {boolean} True if session exists and is authenticated
     */
    isValidSession: () => {
        const session = sessionManager.getSession();
        return !!(session && session.isAuthenticated && session.user);
    }
};