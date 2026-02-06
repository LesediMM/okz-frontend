/**
 * OKZ Sports - Court Card Component
 * Developed by S.R.C Laboratories
 * Reusable court display card component
 */

export default function CourtCard(props) {
    const {
        type = 'paddle', // 'paddle' or 'tennis'
        number = 1,
        features = [],
        price = 400,
        available = true,
        onSelect = null,
        selected = false,
        compact = false
    } = props;
    
    const container = document.createElement('div');
    
    // Court type configurations
    const courtConfigs = {
        paddle: {
            icon: 'fas fa-table-tennis-paddle-ball',
            name: 'Paddle Court',
            color: '#2563eb',
            bgColor: '#dbeafe'
        },
        tennis: {
            icon: 'fas fa-baseball',
            name: 'Tennis Court',
            color: '#10b981',
            bgColor: '#d1fae5'
        }
    };
    
    // Render function
    const render = () => {
        const config = courtConfigs[type] || courtConfigs.paddle;
        
        container.className = `court-card ${type} ${selected ? 'selected' : ''} ${compact ? 'compact' : ''} ${!available ? 'unavailable' : ''}`;
        
        let featuresHTML = '';
        if (!compact && features.length > 0) {
            featuresHTML = `
                <ul class="court-features">
                    ${features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            `;
        }
        
        let availabilityBadge = '';
        if (!available) {
            availabilityBadge = `
                <div class="availability-badge unavailable">
                    <i class="fas fa-times"></i> Unavailable
                </div>
            `;
        } else if (compact) {
            availabilityBadge = `
                <div class="availability-badge available">
                    <i class="fas fa-check"></i> Available
                </div>
            `;
        }
        
        let actionButton = '';
        if (onSelect && available) {
            actionButton = `
                <button class="btn ${selected ? 'btn-primary' : 'btn-outline'} btn-sm court-select-btn">
                    ${selected ? 'Selected' : 'Select'}
                </button>
            `;
        }
        
        container.innerHTML = `
            <div class="court-card-header">
                <div class="court-icon" style="color: ${config.color}; background: ${config.bgColor}">
                    <i class="${config.icon}"></i>
                </div>
                ${availabilityBadge}
            </div>
            
            <div class="court-card-body">
                <h3 class="court-name">${config.name}</h3>
                <p class="court-number">Court ${number}</p>
                
                ${featuresHTML}
                
                <div class="court-price">
                    <span class="price-amount">${price}</span>
                    <span class="price-currency">EGP/hour</span>
                </div>
            </div>
            
            <div class="court-card-footer">
                ${actionButton}
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
        // Select button
        const selectButton = container.querySelector('.court-select-btn');
        if (selectButton) {
            selectButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (onSelect) {
                    onSelect({
                        type,
                        number,
                        price
                    });
                }
            });
        }
        
        // Whole card click (if not compact)
        if (!compact && onSelect && available) {
            container.addEventListener('click', () => {
                if (onSelect) {
                    onSelect({
                        type,
                        number,
                        price
                    });
                }
            });
        }
    };
    
    // Update selection state
    const updateSelection = (isSelected) => {
        if (isSelected) {
            container.classList.add('selected');
            const button = container.querySelector('.court-select-btn');
            if (button) {
                button.textContent = 'Selected';
                button.classList.remove('btn-outline');
                button.classList.add('btn-primary');
            }
        } else {
            container.classList.remove('selected');
            const button = container.querySelector('.court-select-btn');
            if (button) {
                button.textContent = 'Select';
                button.classList.remove('btn-primary');
                button.classList.add('btn-outline');
            }
        }
    };
    
    // Update availability
    const updateAvailability = (isAvailable) => {
        if (isAvailable) {
            container.classList.remove('unavailable');
            const badge = container.querySelector('.availability-badge');
            if (badge) {
                badge.className = 'availability-badge available';
                badge.innerHTML = '<i class="fas fa-check"></i> Available';
            }
            
            // Re-enable select button
            const button = container.querySelector('.court-select-btn');
            if (button) {
                button.disabled = false;
            }
        } else {
            container.classList.add('unavailable');
            const badge = container.querySelector('.availability-badge');
            if (badge) {
                badge.className = 'availability-badge unavailable';
                badge.innerHTML = '<i class="fas fa-times"></i> Unavailable';
            }
            
            // Disable select button
            const button = container.querySelector('.court-select-btn');
            if (button) {
                button.disabled = true;
            }
        }
    };
    
    // Get court data
    const getData = () => {
        return {
            type,
            number,
            price,
            available,
            name: courtConfigs[type]?.name || 'Court'
        };
    };
    
    // Factory methods for court types
    
    const createPaddleCourt = (number, options = {}) => {
        const defaultFeatures = [
            'Professional surface',
            'LED lighting',
            'Equipment rental available'
        ];
        
        return CourtCard({
            type: 'paddle',
            number,
            features: options.features || defaultFeatures,
            price: options.price || 400,
            available: options.available !== undefined ? options.available : true,
            onSelect: options.onSelect,
            selected: options.selected || false,
            compact: options.compact || false
        });
    };
    
    const createTennisCourt = (number, options = {}) => {
        const defaultFeatures = [
            'Clay surface',
            'Professional netting',
            'Coach services available'
        ];
        
        return CourtCard({
            type: 'tennis',
            number,
            features: options.features || defaultFeatures,
            price: options.price || 400,
            available: options.available !== undefined ? options.available : true,
            onSelect: options.onSelect,
            selected: options.selected || false,
            compact: options.compact || false
        });
    };
    
    // Create court grid
    const createCourtGrid = (courts, onCourtSelect = null) => {
        const grid = document.createElement('div');
        grid.className = 'court-grid';
        
        courts.forEach(court => {
            const courtCard = CourtCard({
                type: court.type,
                number: court.number,
                features: court.features,
                price: court.price,
                available: court.available,
                onSelect: onCourtSelect,
                selected: court.selected || false
            });
            
            grid.appendChild(courtCard.render());
            courtCard.init();
        });
        
        return grid;
    };
    
    return {
        render,
        init,
        updateSelection,
        updateAvailability,
        getData,
        createPaddleCourt,
        createTennisCourt,
        createCourtGrid
    };
}