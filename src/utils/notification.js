// Notification system for OKZ Sports

class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.getElementById("notification-container");

        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "notification-container";
            this.container.className = "notification-container";
            document.body.appendChild(this.container);

            const style = document.createElement("style");
            style.textContent = this.getStyles();
            document.head.appendChild(style);
        }
    }

    getStyles() {
        return `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            }

            .notification {
                background: #ffffff;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-left: 4px solid #2563eb;
                animation: slideIn 0.3s ease;
                display: flex;
                gap: 12px;
            }

            .notification-info { border-color: #2563eb; }
            .notification-success { border-color: #10b981; }
            .notification-warning { border-color: #f59e0b; }
            .notification-error { border-color: #ef4444; }

            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to   { transform: translateX(0); opacity: 1; }
            }

            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to   { transform: translateX(100%); opacity: 0; }
            }
        `;
    }

    show({ title, message, type = "info", duration = 5000 }) {
        const el = document.createElement("div");
        el.className = `notification notification-${type}`;

        el.innerHTML = `
            <div>
                <strong>${title}</strong>
                <div>${message}</div>
            </div>
            <button style="margin-left:auto;">×</button>
        `;

        this.container.appendChild(el);

        el.querySelector("button").onclick = () => this.hide(el);

        if (duration > 0) {
            setTimeout(() => this.hide(el), duration);
        }

        return el;
    }

    hide(el) {
        el.style.animation = "slideOut 0.3s ease";
        setTimeout(() => el.remove(), 300);
    }
}

const notificationSystem = new NotificationSystem();

export function showNotification(notification) {
    return notificationSystem.show(notification);
}

export { NotificationSystem };
