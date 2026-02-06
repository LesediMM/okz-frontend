// Global error handling for OKZ Sports

import { showNotification } from "./notification";

/**
 * Sets up global error handlers for the application
 */
export function setupErrorHandling() {
    // Catch uncaught JavaScript errors
    window.addEventListener("error", (event) => {
        console.error("Global error caught:", {
            message: event.message,
            source: event.filename,
            line: event.lineno,
            column: event.colno,
            error: event.error
        });

        // Ignore known non-critical browser errors
        if (
            event.message?.includes("ResizeObserver") ||
            event.message?.includes("target closed")
        ) {
            return;
        }

        showNotification({
            type: "error",
            title: "Application Error",
            message: "Something went wrong. Please try again.",
            duration: 5000
        });
    });

    // Catch unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
        console.error("Unhandled promise rejection:", event.reason);

        // Ignore network fetch failures (handled separately)
        if (
            event.reason instanceof TypeError &&
            event.reason.message?.includes("Failed to fetch")
        ) {
            return;
        }

        showNotification({
            type: "error",
            title: "Operation Failed",
            message: event.reason?.message || "Something went wrong.",
            duration: 5000
        });
    });

    // Global fetch wrapper for server errors
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);

            if (!response.ok && response.status >= 500) {
                throw new Error(`Server error (${response.status})`);
            }

            return response;
        } catch (error) {
            console.error("Fetch error:", error);

            if (
                error.message?.includes("Failed to fetch") ||
                error.message?.includes("NetworkError")
            ) {
                showNotification({
                    type: "warning",
                    title: "Network Error",
                    message: "Please check your internet connection.",
                    duration: 5000
                });
            }

            throw error;
        }
    };
}

/**
 * Handles API-related errors and shows user-friendly messages
 */
export function handleApiError(error) {
    console.error("API Error:", error);

    let title = "Error";
    let message = "An error occurred. Please try again.";

    const errorText = error?.message?.toLowerCase() || "";

    if (errorText.includes("network") || errorText.includes("failed to fetch")) {
        title = "Connection Error";
        message = "Cannot connect to the server. Please check your internet connection.";
    } else if (errorText.includes("401") || errorText.includes("unauthorized")) {
        title = "Authentication Error";
        message = "Your session has expired. Please log in again.";

        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");

        setTimeout(() => {
            window.location.href = "/login";
        }, 2000);
    } else if (errorText.includes("404")) {
        title = "Not Found";
        message = "The requested resource was not found.";
    } else if (errorText.includes("409")) {
        title = "Conflict";
        message = "This operation could not be completed due to a conflict.";
    } else if (errorText.includes("validation")) {
        title = "Validation Error";
        message = "Please check your input and try again.";
    }

    showNotification({
        type: "error",
        title,
        message,
        duration: 5000
    });

    return {
        success: false,
        error: error?.message || "Unknown error",
        userMessage: message
    };
}

/**
 * Handles form validation errors and highlights fields
 */
export function handleValidationError(errors = []) {
    // Remove previous validation errors
    document.querySelectorAll(".form-error").forEach(el => el.remove());
    document.querySelectorAll(".input-error").forEach(el => {
        el.classList.remove("input-error");
    });

    // Apply new validation errors
    errors.forEach(({ field, message }) => {
        const input = document.querySelector(`[name="${field}"]`);
        if (!input) return;

        input.classList.add("input-error");

        const errorEl = document.createElement("div");
        errorEl.className = "form-error";
        errorEl.textContent = message;
        errorEl.style.color = "#ef4444";
        errorEl.style.fontSize = "14px";
        errorEl.style.marginTop = "4px";

        input.parentElement?.appendChild(errorEl);
    });

    if (errors.length > 0) {
        showNotification({
            type: "error",
            title: "Validation Error",
            message: "Please fix the highlighted errors.",
            duration: 5000
        });
    }
}
