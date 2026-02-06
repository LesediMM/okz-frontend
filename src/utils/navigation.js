/**
 * OKZ Sports - Navigation Utilities
 * Helper functions for navigation and routing
 */

// Create a navigation link element
export function createNavLink(path, label, options = {}) {
    const link = document.createElement("a");
    link.href = path;
    link.textContent = label;
    link.className = "nav-link";

    if (options.className) {
        link.className += " " + options.className;
    }

    if (options.icon) {
        const icon = document.createElement("i");
        icon.className = options.icon;
        link.prepend(icon);
        link.prepend(document.createTextNode(" "));
    }

    if (options.active) {
        link.classList.add("active");
    }

    if (typeof options.onClick === "function") {
        link.addEventListener("click", options.onClick);
    }

    return link;
}

// Create breadcrumb navigation data
export function createBreadcrumbs(path, routes = []) {
    const breadcrumbs = [];
    const pathParts = path.split("/").filter(Boolean);

    let currentPath = "";

    breadcrumbs.push({
        path: "/",
        label: "Home",
        icon: "fas fa-home"
    });

    pathParts.forEach((part, index) => {
        currentPath += "/" + part;
        const route = routes.find(r => r.path === currentPath);

        if (route) {
            breadcrumbs.push({
                path: currentPath,
                label: route.title || part.charAt(0).toUpperCase() + part.slice(1),
                icon: route.icon
            });
        } else if (index === pathParts.length - 1) {
            breadcrumbs.push({
                path: currentPath,
                label: part,
                icon: "fas fa-angle-right"
            });
        }
    });

    return breadcrumbs;
}

// Render breadcrumbs to DOM
export function renderBreadcrumbs(breadcrumbs = []) {
    const container = document.createElement("nav");
    container.className = "breadcrumbs";
    container.setAttribute("aria-label", "Breadcrumb");

    const list = document.createElement("ol");

    breadcrumbs.forEach((crumb, index) => {
        const listItem = document.createElement("li");

        if (index === breadcrumbs.length - 1) {
            listItem.className = "active";
            const span = document.createElement("span");

            if (crumb.icon) {
                const icon = document.createElement("i");
                icon.className = crumb.icon;
                span.appendChild(icon);
                span.appendChild(document.createTextNode(" "));
            }

            span.appendChild(document.createTextNode(crumb.label));
            listItem.appendChild(span);
        } else {
            const link = createNavLink(crumb.path, crumb.label, {
                icon: crumb.icon
            });
            listItem.appendChild(link);
        }

        list.appendChild(listItem);
    });

    container.appendChild(list);
    return container;
}

// Update active navigation links
export function updateActiveNavLinks(currentPath) {
    document.querySelectorAll(".nav-link").forEach(link => {
        const href = link.getAttribute("href");

        if (
            href === currentPath ||
            (href !== "/" && currentPath.startsWith(href))
        ) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

// Generate pagination controls
export function createPagination(currentPage, totalPages, onPageChange) {
    const container = document.createElement("div");
    container.className = "pagination";

    const ul = document.createElement("ul");

    // Previous button
    const prevLi = document.createElement("li");
    const prevButton = document.createElement("button");
    prevButton.className = "pagination-btn";
    prevButton.disabled = currentPage <= 1;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.addEventListener("click", () => onPageChange(currentPage - 1));
    prevLi.appendChild(prevButton);
    ul.appendChild(prevLi);

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let page = startPage; page <= endPage; page++) {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.className = "pagination-btn";

        if (page === currentPage) {
            button.classList.add("active");
        }

        button.textContent = page;
        button.addEventListener("click", () => onPageChange(page));

        li.appendChild(button);
        ul.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement("li");
    const nextButton = document.createElement("button");
    nextButton.className = "pagination-btn";
    nextButton.disabled = currentPage >= totalPages;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.addEventListener("click", () => onPageChange(currentPage + 1));
    nextLi.appendChild(nextButton);
    ul.appendChild(nextLi);

    container.appendChild(ul);
    return container;
}

// Create back button
export function createBackButton(router, fallbackPath = "/") {
    const button = document.createElement("button");
    button.className = "btn btn-outline btn-back";
    button.innerHTML = '<i class="fas fa-arrow-left"></i> Back';

    button.addEventListener("click", () => {
        if (window.history.length > 1 && typeof router?.goBack === "function") {
            router.goBack();
        } else if (typeof router?.navigate === "function") {
            router.navigate(fallbackPath);
        } else {
            window.location.href = fallbackPath;
        }
    });

    return button;
}

// Default export
export default {
    createNavLink,
    createBreadcrumbs,
    renderBreadcrumbs,
    updateActiveNavLinks,
    createPagination,
    createBackButton
};
