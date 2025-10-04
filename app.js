/**
 * Student Hustle Hub - Main Application Logic
 * A client-side directory for student businesses and side hustles
 */

// Application State
let listings = [];
let filteredListings = [];
let currentFilters = {
    category: 'all',
    tags: [],
    search: ''
};

// Check if we're on the home page or businesses page
const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
const isBusinessesPage = window.location.pathname.endsWith('businesses.html');
const isBusinessProfilePage = window.location.pathname.endsWith('business-profile.html');

// DOM Elements - will be initialized in init function
let elements = {};


// Sample Data - 5 businesses for launch
const sampleListings = [
    {
        id: 'deon-tech-solutions',
        name: "Flink",
        category: 'tech',
        type: 'service',
        description: 'Professional web development, mobile app creation, and digital solutions for students and small businesses. Specializing in modern, responsive websites and custom software development.',
        contactMethod: 'whatsapp',
        contactInfo: '+254702248984',
        instagram: 'https://instagram.com/deon_tech_solutions',
        location: 'Remote & On-campus',
        tags: ['budget', 'discount'],
        image: 'profiles/deon.jpg',
        rating: 4.9,
        reviewCount: 32,
        status: 'available',
        createdAt: new Date().toISOString()
    },
    {
        id: 'deon-graphics-design',
        name: "BlueMoon",
        category: 'Space',
        type: 'service',
        description: 'Bluemoon is focused on developing Rockets for space exploration and sells parts for them.',
        contactMethod: 'email',
        contactInfo: '625deon@gmail.com',
        instagram: 'https://instagram.com/deon_graphics',
        location: 'Remote & On-campus',
        tags: ['budget', 'discount'],
        image: 'profiles/deon1.jpg',
        rating: 4.7,
        reviewCount: 28,
        status: 'available',
        createdAt: new Date().toISOString()
    },
    {
        id: 'deon-tutoring-services',
        name: "Bigtee T-shirts ",
        category: 'Fashion',
        type: 'service',
        description: 'Expert in making T-shirts for any occasions, get custom designs made for you.',
        contactMethod: 'phone',
        contactInfo: '+254788256115',
        instagram: 'https://instagram.com/deon_tutoring',
        location: 'On-campus & Online',
        tags: ['discount', 'budget'],
        image: 'profiles/deon2.jpg',
        rating: 4.8,
        reviewCount: 41,
        status: 'available',
        createdAt: new Date().toISOString()
    },
    {
        id: 'deon-digital-marketing',
        name: "BMW's Digital Marketing",
        category: 'services',
        type: 'service',
        description: 'BMW is a student-run business that sells BMW parts and accessories.we believe in the power of community and we are committed to providing the best products and services to our customers.',
        contactMethod: 'email',
        contactInfo: 'orinadeon@gmail.com',
        instagram: 'https://instagram.com/deon_digital',
        location: 'Remote & On-campus',
        tags: ['budget', 'discount'],
        image: 'profiles/deon3.jpg',
        rating: 4.6,
        reviewCount: 19,
        status: 'available',
        createdAt: new Date().toISOString()
    },
    {
        id: 'pinakle-consulting',
        name: "Pinakle Consulting Services",
        category: 'tech',
        type: 'service',
        description: 'Professional business consulting and project management services. Specializing in startup development, business strategy, and digital transformation. Helping students turn ideas into successful ventures.',
        contactMethod: 'email',
        contactInfo: 'pinakleorgltd@gmail.com',
        instagram: 'https://instagram.com/pinakle_consulting',
        location: 'Remote & On-campus',
        tags: ['discount', 'budget'],
        image: 'profiles/deon4.jpg',
        rating: 4.9,
        reviewCount: 35,
        status: 'available',
        createdAt: new Date().toISOString()
    }
];

/**
 * Initialize the application
 */
function init() {
    // Initialize DOM elements
    elements = {
        businessGrid: document.getElementById('businessGrid') || document.getElementById('featuredBusinessGrid'),
        searchInput: document.getElementById('searchInput'),
        resultsCount: document.getElementById('resultsCount'),
        emptyState: document.getElementById('emptyState'),
        profileModal: document.getElementById('profileModal'),
        submitModal: document.getElementById('submitModal'),
        submitForm: document.getElementById('submitForm'),
        exportBtn: document.getElementById('exportBtn'),
        toastContainer: document.getElementById('toastContainer')
    };
    
    
    loadListings();
    setupEventListeners();
    renderListings();
    updateResultsCount();
}

/**
 * Load listings from localStorage or seed with sample data
 */
function loadListings() {
    // Clear old data and force load new sample listings
    localStorage.removeItem('student_hustles');
    listings = [...sampleListings];
    saveListings();
    filteredListings = [...listings];
}

/**
 * Save listings to localStorage
 */
function saveListings() {
    try {
        localStorage.setItem('student_hustles', JSON.stringify(listings));
    } catch (error) {
        console.error('Error saving listings:', error);
        showToast('Error saving data. Storage might be full.', 'error');
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Search functionality
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', handleSearch);
    }
    
    // Category filters
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', handleCategoryFilter);
    });
    
    // Tag filters
    document.querySelectorAll('.tag-chip').forEach(chip => {
        chip.addEventListener('click', handleTagFilter);
    });
    
    // Modal controls
    const postHustleBtn = document.getElementById('postHustleBtn');
    const heroPostBtn = document.getElementById('heroPostBtn');
    const footerPostBtn = document.getElementById('footerPostBtn');
    const closeSubmitModalBtn = document.getElementById('closeSubmitModal');
    const closeProfileModalBtn = document.getElementById('closeProfileModal');
    const cancelSubmit = document.getElementById('cancelSubmit');
    
    if (postHustleBtn) postHustleBtn.addEventListener('click', openSubmitModal);
    if (heroPostBtn) heroPostBtn.addEventListener('click', openSubmitModal);
    if (footerPostBtn) footerPostBtn.addEventListener('click', openSubmitModal);
    if (closeSubmitModalBtn) closeSubmitModalBtn.addEventListener('click', closeSubmitModal);
    if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', closeProfileModal);
    if (cancelSubmit) cancelSubmit.addEventListener('click', closeSubmitModal);
    
    // Form submission
    if (elements.submitForm) {
        console.log('Setting up form submit listener');
        elements.submitForm.addEventListener('submit', handleFormSubmit);
    } else {
        console.log('Submit form not found!');
    }
    
    // Export functionality
    if (elements.exportBtn) elements.exportBtn.addEventListener('click', exportListings);
    
    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', toggleFAQ);
    });
    
    // Program card toggle functionality
    setupProgramCards();
    
    // FAQ cards now use the same functionality as program cards
    
    // Business profile page functionality
    setupBusinessProfilePage();
    
    // Testimonials scrolling functionality
    setupTestimonialsScrolling();
    
    
    // Tag dropdown functionality
    const tagsSelect = document.getElementById('tags');
    const otherTagInput = document.getElementById('otherTagInput');
    const customTagInput = document.getElementById('customTag');
    const imageInput = document.getElementById('image');
    
    if (tagsSelect) {
        tagsSelect.addEventListener('change', handleTagChange);
    }
    
    // Image preview
    if (imageInput) imageInput.addEventListener('change', handleImagePreview);
    
    // Modal backdrop clicks
    if (elements.profileModal) {
        elements.profileModal.addEventListener('click', (e) => {
            if (e.target === elements.profileModal) closeProfileModal();
        });
    }
    if (elements.submitModal) {
        elements.submitModal.addEventListener('click', (e) => {
            if (e.target === elements.submitModal) closeSubmitModal();
        });
    }
    
    // Hamburger menu
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobilePostBtn = document.getElementById('mobilePostBtn');
    
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMobileMenu);
    if (mobilePostBtn) {
        mobilePostBtn.addEventListener('click', () => {
            openSubmitModal();
            closeMobileMenu();
        });
    }
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

/**
 * Handle search input
 */
function handleSearch(e) {
    currentFilters.search = e.target.value.toLowerCase();
    filterListings();
}

/**
 * Handle category filter selection
 */
function handleCategoryFilter(e) {
    const category = e.target.dataset.category;
    
    // Update active state
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    e.target.classList.add('active');
    
    currentFilters.category = category;
    filterListings();
}

/**
 * Handle tag filter selection
 */
function handleTagFilter(e) {
    const tag = e.target.dataset.tag;
    
    // Remove active state from all tag chips
    document.querySelectorAll('.tag-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // Add active state to clicked chip
    e.target.classList.add('active');
    
    // Update filters - only allow one tag at a time
    currentFilters.tags = [tag];
    
    filterListings();
}

/**
 * Filter listings based on current filters
 */
function filterListings() {
    filteredListings = listings.filter(listing => {
        // Category filter
        if (currentFilters.category !== 'all' && listing.category !== currentFilters.category) {
            return false;
        }
        
        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search;
            const searchableText = `${listing.name} ${listing.description} ${listing.category}`.toLowerCase();
            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }
        
        // Tag filter
        if (currentFilters.tags.length > 0) {
            const hasMatchingTag = currentFilters.tags.some(tag => 
                listing.tags && listing.tags.includes(tag)
            );
            if (!hasMatchingTag) {
                return false;
            }
        }
        
        return true;
    });
    
    renderListings();
    updateResultsCount();
}

/**
 * Render listings to the grid
 */
function renderListings() {
    // Determine which listings to show based on the page
    let listingsToShow = filteredListings;
    
    if (isHomePage) {
        // Show only first 3 businesses as featured on home page
        listingsToShow = filteredListings.slice(0, 3);
    }
    
    if (listingsToShow.length === 0) {
        if (elements.businessGrid) {
            elements.businessGrid.style.display = 'none';
        }
        if (elements.emptyState) {
            elements.emptyState.style.display = 'block';
        }
        return;
    }
    
    if (elements.businessGrid) {
        elements.businessGrid.style.display = 'grid';
        elements.businessGrid.innerHTML = listingsToShow.map(listing => createBusinessCard(listing)).join('');
    }
    
    if (elements.emptyState) {
        elements.emptyState.style.display = 'none';
    }
    
    // Add event listeners to new cards
    document.querySelectorAll('.btn-profile').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const listingId = e.target.closest('.business-card').dataset.id;
            openProfileModal(listingId);
        });
    });
    
    document.querySelectorAll('.btn-whatsapp').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const listingId = e.target.closest('.business-card').dataset.id;
            const listing = listings.find(l => l.id === listingId);
            if (listing && listing.contactMethod === 'whatsapp') {
                window.open(`https://wa.me/${listing.contactInfo.replace(/\D/g, '')}`, '_blank');
            }
        });
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const businessId = e.target.closest('.btn-delete').dataset.businessId;
            deleteBusiness(businessId);
        });
    });
    
    // Add event listeners for edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const businessId = e.target.closest('.btn-edit').dataset.businessId;
            editBusiness(businessId);
        });
    });
}

/**
 * Create HTML for a business card
 */
function createBusinessCard(listing) {
    const imageSrc = listing.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjlGQUZCIi8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0xMzUgODVIMTY1VjExNUgxMzVWODVaIiBmaWxsPSIjMTA5OTgxIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjE0Ij5CdXNpbmVzcyBJbWFnZTwvdGV4dD4KPC9zdmc+';
    
    return `
        <article class="business-card" data-id="${listing.id}">
            <div class="business-content">
                <img src="${imageSrc}" alt="${listing.name}" class="business-image" loading="lazy">
                <div class="business-info">
                    <div class="business-header">
                        <h3 class="business-name">${escapeHtml(listing.name)}</h3>
                        <span class="category-badge">${listing.category}</span>
                    </div>
                    <div class="business-status ${listing.status || 'available'}">${(listing.status || 'available') === 'available' ? 'Available' : 'Closed'}</div>
                    <p class="business-description">${escapeHtml(listing.description)}</p>
                    <div class="business-rating">
                        <div class="rating-stars">${generateStarRating(listing.rating || 0)}</div>
                        <span class="rating-text">${(listing.rating || 0).toFixed(1)} (${listing.reviewCount || 0} reviews)</span>
                    </div>
                    <div class="business-actions">
                    ${listing.contactMethod === 'whatsapp' ? 
                        `<button class="btn btn-whatsapp" aria-label="Contact via WhatsApp">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                        </button>` : 
                        `<button class="btn btn-secondary" disabled>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                        </button>`
                    }
                    ${isUserCreatedBusiness(listing) ? 
                        `<button class="btn btn-edit" aria-label="Edit business" data-business-id="${listing.id}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                        </button>
                        <button class="btn btn-delete" aria-label="Delete business" data-business-id="${listing.id}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>` : ''
                    }
                    <a href="business-profile.html?id=${listing.id}" class="view-bsn-link">View BSN</a>
                    </div>
                </div>
            </div>
        </article>
    `;
}

/**
 * Open profile modal
 */
function openProfileModal(listingId) {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    
    const imageSrc = listing.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjlGQUZCIi8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTE4NSAxMzVIMjE1VjE2NUgxODVWMTM1WiIgZmlsbD0iIzEwOTk4MSIvPgo8dGV4dCB4PSIyMDAiIHk9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSIxNiI+QnVzaW5lc3MgSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
    
    const contactItems = [];
    if (listing.contactMethod === 'whatsapp') {
        contactItems.push(`
            <div class="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <a href="https://wa.me/${listing.contactInfo.replace(/\D/g, '')}" target="_blank" rel="noopener">
                    ${escapeHtml(listing.contactInfo)}
                </a>
            </div>
        `);
    } else if (listing.contactMethod === 'phone') {
        contactItems.push(`
            <div class="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a href="tel:${listing.contactInfo}">${escapeHtml(listing.contactInfo)}</a>
            </div>
        `);
    } else if (listing.contactMethod === 'email') {
        contactItems.push(`
            <div class="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                <a href="mailto:${listing.contactInfo}">${escapeHtml(listing.contactInfo)}</a>
            </div>
        `);
    }
    
    if (listing.instagram) {
        contactItems.push(`
            <div class="contact-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <a href="${listing.instagram}" target="_blank" rel="noopener">Instagram</a>
            </div>
        `);
    }
    
    const tagsHtml = listing.tags && listing.tags.length > 0 ? 
        `<div class="tags">
            ${listing.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>` : '';
    
    document.getElementById('profileContent').innerHTML = `
        <img src="${imageSrc}" alt="${listing.name}" class="profile-image">
        <div class="profile-details">
            <h4>${escapeHtml(listing.name)}</h4>
            <p><strong>Category:</strong> ${listing.category}</p>
            <p><strong>Type:</strong> ${listing.type}</p>
            ${listing.location ? `<p><strong>Location:</strong> ${escapeHtml(listing.location)}</p>` : ''}
            <p>${escapeHtml(listing.description)}</p>
        </div>
        <div class="contact-info">
            <h4>Contact Information</h4>
            ${contactItems.join('')}
        </div>
        ${tagsHtml}
        ${listing.contactMethod === 'whatsapp' ? 
            `<button class="btn btn-primary btn-large" onclick="window.open('https://wa.me/${listing.contactInfo.replace(/\D/g, '')}', '_blank')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Contact via WhatsApp
            </button>` : ''
        }
    `;
    
    if (elements.profileModal) {
        elements.profileModal.setAttribute('aria-hidden', 'false');
        elements.profileModal.classList.add('show');
    }
    document.body.style.overflow = 'hidden';
    
    // Focus the close button for accessibility
    setTimeout(() => {
        const closeBtn = document.getElementById('closeProfileModal');
        if (closeBtn) closeBtn.focus();
    }, 100);
}

/**
 * Close profile modal
 */
function closeProfileModal() {
    if (elements.profileModal) {
        elements.profileModal.setAttribute('aria-hidden', 'true');
        elements.profileModal.classList.remove('show');
    }
    document.body.style.overflow = '';
    
    // Remove focus from any focused element inside the modal
    const focusedElement = document.activeElement;
    if (focusedElement && elements.profileModal && elements.profileModal.contains(focusedElement)) {
        focusedElement.blur();
    }
}

/**
 * Open submit modal
 */
function openSubmitModal() {
    // Check if submit modal exists (not all pages have it)
    if (!elements.submitModal) {
        console.log('Submit modal not found on this page, redirecting to home page');
        // Redirect to home page where the modal exists
        window.location.href = 'index.html#post-hustle';
        return;
    }
    
    elements.submitModal.setAttribute('aria-hidden', 'false');
    elements.submitModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Focus the close button for accessibility
    setTimeout(() => {
        const closeBtn = document.getElementById('closeSubmitModal');
        if (closeBtn) closeBtn.focus();
    }, 100);
    
    // Reset form if it exists
    if (elements.submitForm) {
        elements.submitForm.reset();
        clearFormErrors();
        
        // Clear tag list if it exists
        const tagList = document.getElementById('tagList');
        if (tagList) {
            tagList.innerHTML = '';
        }
        
        // Clear image preview if it exists
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
        }
        
        // Clear custom tag input if it exists
        const otherTagInput = document.getElementById('otherTagInput');
        if (otherTagInput) {
            otherTagInput.style.display = 'none';
        }
        
        // Reset submit button to default state
        const submitBtn = elements.submitForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Post Your Hustle';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
    }
}

/**
 * Close submit modal
 */
function closeSubmitModal() {
    if (elements.submitModal) {
        elements.submitModal.setAttribute('aria-hidden', 'true');
        elements.submitModal.classList.remove('show');
    }
    document.body.style.overflow = '';
    
    // Remove focus from any focused element inside the modal
    const focusedElement = document.activeElement;
    if (focusedElement && elements.submitModal && elements.submitModal.contains(focusedElement)) {
        focusedElement.blur();
    }
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Form submitted!'); // Debug log
    
    // Prevent multiple submissions
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn.disabled) {
        console.log('Submit button is disabled, preventing submission');
        return;
    }
    
    if (!validateForm()) {
        console.log('Form validation failed');
        return;
    }
    
    // Set processing state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.cursor = 'not-allowed';
    
    // Simulate processing time
    setTimeout(() => {
        try {
            const formData = new FormData(elements.submitForm);
            const tagsSelect = document.getElementById('tags');
            const customTagInput = document.getElementById('customTag');
            let tags = [];
            
            if (tagsSelect.value === 'other' && customTagInput.value.trim()) {
                tags = [customTagInput.value.trim()];
            } else if (tagsSelect.value && tagsSelect.value !== 'other') {
                tags = [tagsSelect.value];
            }
            
            const isEditing = elements.submitForm.dataset.editingId;
            let businessData;
            
            if (isEditing) {
                // Update existing business
                const existingBusiness = listings.find(l => l.id === isEditing);
                businessData = {
                    ...existingBusiness,
                    name: formData.get('businessName'),
                    category: formData.get('category'),
                    type: formData.get('type'),
                    description: formData.get('description'),
                    contactMethod: formData.get('contactMethod'),
                    contactInfo: formData.get('contactInfo'),
                    instagram: formData.get('instagram') || null,
                    location: formData.get('location') || null,
                    tags: tags,
                    image: document.getElementById('imagePreview').querySelector('img')?.src || existingBusiness.image,
                    updatedAt: new Date().toISOString()
                };
                
                // Update in listings
                const businessIndex = listings.findIndex(l => l.id === isEditing);
                if (businessIndex !== -1) {
                    listings[businessIndex] = businessData;
                }
                
                showToast('🎉 Business updated successfully!', 'success');
            } else {
                // Create new business
                businessData = {
                    id: generateId(),
                    name: formData.get('businessName'),
                    category: formData.get('category'),
                    type: formData.get('type'),
                    description: formData.get('description'),
                    contactMethod: formData.get('contactMethod'),
                    contactInfo: formData.get('contactInfo'),
                    instagram: formData.get('instagram') || null,
                    location: formData.get('location') || null,
                    tags: tags,
                    image: document.getElementById('imagePreview').querySelector('img')?.src || null,
                    rating: 0,
                    reviewCount: 0,
                    status: 'available',
                    createdAt: new Date().toISOString()
                };
                
                // Add to listings
                listings.unshift(businessData);
                
                showToast('🎉 Business posted successfully! Redirecting to home...', 'success');
                
                // Navigate to home page after delay for new businesses
                setTimeout(() => {
                    if (isBusinessesPage) {
                        window.location.href = 'index.html';
                    }
                }, 2000);
            }
            
            saveListings();
            
            // Update display
            filterListings();
            
            // Clear form
            elements.submitForm.reset();
            clearFormPreview();
            delete elements.submitForm.dataset.editingId;
            
            // Reset submit button text
            const submitBtn = elements.submitForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Submit Business';
            }
            
            // Close modal
            closeSubmitModal();
            
        } catch (error) {
            console.error('Error submitting business:', error);
            showToast('Error posting business. Please try again.', 'error');
            resetSubmitButton(submitBtn, originalText);
        }
    }, 2000); // 2 second processing time
}

/**
 * Reset submit button to original state
 */
function resetSubmitButton(button, originalText) {
    button.disabled = false;
    button.textContent = originalText;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
}

/**
 * Clear form preview elements
 */
function clearFormPreview() {
    const tagList = document.getElementById('tagList');
    if (tagList) {
        tagList.innerHTML = '';
    }
    
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.innerHTML = '';
    }
}

/**
 * Check if a business was created by the user (not a sample business)
 */
function isUserCreatedBusiness(listing) {
    // Sample businesses have specific IDs, user-created ones have generated IDs
    const sampleBusinessIds = ['deon-tech-solutions', 'deon-graphics-design', 'deon-tutoring-services', 'deon-digital-marketing', 'pinakle-consulting'];
    return !sampleBusinessIds.includes(listing.id);
}

/**
 * Generate star rating HTML
 */
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<svg class="star" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    
    // Half star
    if (hasHalfStar) {
        stars += '<svg class="star" viewBox="0 0 24 24"><defs><linearGradient id="half"><stop offset="50%" stop-color="#ffc107"/><stop offset="50%" stop-color="#e9ecef"/></linearGradient></defs><path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<svg class="star empty" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    
    return stars;
}

/**
 * Delete a business listing
 */
function deleteBusiness(businessId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
        return;
    }
    
    // Find and remove the business from listings
    const businessIndex = listings.findIndex(listing => listing.id === businessId);
    if (businessIndex === -1) {
        showToast('Business not found', 'error');
        return;
    }
    
    // Remove from listings
    listings.splice(businessIndex, 1);
    
    // Update filtered listings
    filteredListings = [...listings];
    
    // Save to localStorage
    saveListings();
    
    // Update display
    renderListings();
    updateResultsCount();
    
    // Show success message
    showToast('Business deleted successfully', 'success');
}

/**
 * Edit a business listing
 */
function editBusiness(businessId) {
    const business = listings.find(listing => listing.id === businessId);
    if (!business) {
        showToast('Business not found', 'error');
        return;
    }
    
    // Open the submit modal
    openSubmitModal();
    
    // Populate the form with existing data
    setTimeout(() => {
        const form = elements.submitForm;
        if (form) {
            form.businessName.value = business.name || '';
            form.category.value = business.category || '';
            form.type.value = business.type || '';
            form.description.value = business.description || '';
            form.contactMethod.value = business.contactMethod || '';
            form.contactInfo.value = business.contactInfo || '';
            form.instagram.value = business.instagram || '';
            form.location.value = business.location || '';
            
            // Set tags
            if (business.tags && business.tags.length > 0) {
                form.tags.value = business.tags[0] || '';
            }
            
            // Store the business ID for updating
            form.dataset.editingId = businessId;
            
            // Change submit button text
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Update Business';
            }
        }
    }, 100);
}

/**
 * Validate form inputs
 */
function validateForm() {
    let isValid = true;
    const form = elements.submitForm;
    
    // Clear previous errors
    clearFormErrors();
    
    // Required fields
    const requiredFields = ['businessName', 'category', 'type', 'description', 'contactMethod', 'contactInfo'];
    
    requiredFields.forEach(fieldName => {
        const field = form[fieldName];
        const value = field.value.trim();
        
        if (!value) {
            showFieldError(fieldName, 'This field is required');
            isValid = false;
        }
    });
    
    // Validate contact info format
    const contactMethod = form.contactMethod.value;
    const contactInfo = form.contactInfo.value.trim();
    
    if (contactInfo) {
        if (contactMethod === 'whatsapp' || contactMethod === 'phone') {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(contactInfo.replace(/\s/g, ''))) {
                showFieldError('contactInfo', 'Please enter a valid phone number');
                isValid = false;
            }
        } else if (contactMethod === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(contactInfo)) {
                showFieldError('contactInfo', 'Please enter a valid email address');
                isValid = false;
            }
        }
    }
    
    // Validate Instagram URL if provided
    const instagram = form.instagram.value.trim();
    if (instagram) {
        try {
            new URL(instagram);
        } catch {
            showFieldError('instagram', 'Please enter a valid URL');
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Show field error
 */
function showFieldError(fieldName, message) {
    const field = elements.submitForm[fieldName];
    const errorElement = document.getElementById(`${fieldName}Error`);
    
    if (field) {
        field.closest('.form-group').classList.add('error');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
    }
}

/**
 * Clear all form errors
 */
function clearFormErrors() {
    document.querySelectorAll('.form-group.error').forEach(group => {
        group.classList.remove('error');
    });
    document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
    });
}

/**
 * Add tag to the form
 */
function addTag() {
    const tagInput = document.getElementById('tagInput');
    const tagText = tagInput.value.trim().toLowerCase();
    
    if (!tagText) return;
    
    // Check if tag already exists
    const existingTags = Array.from(document.querySelectorAll('.tag-text')).map(tag => 
        tag.textContent.toLowerCase()
    );
    
    if (existingTags.includes(tagText)) {
        showToast('Tag already exists', 'error');
        return;
    }
    
    const tagList = document.getElementById('tagList');
    const tagElement = document.createElement('div');
    tagElement.className = 'tag-item';
    tagElement.innerHTML = `
        <span class="tag-text">${escapeHtml(tagText)}</span>
        <button type="button" class="tag-remove" onclick="this.parentElement.remove()">×</button>
    `;
    
    tagList.appendChild(tagElement);
    tagInput.value = '';
}

/**
 * Handle image preview
 */
function handleImagePreview(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

/**
 * Toggle FAQ item
 */
function toggleFAQ(e) {
    const question = e.target;
    const answer = question.nextElementSibling;
    const isExpanded = question.getAttribute('aria-expanded') === 'true';
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-question').forEach(q => {
        if (q !== question) {
            q.setAttribute('aria-expanded', 'false');
            q.nextElementSibling.classList.remove('open');
        }
    });
    
    // Toggle current item
    question.setAttribute('aria-expanded', !isExpanded);
    answer.classList.toggle('open');
}

/**
 * Export all listings as JSON
 */
function exportListings() {
    const dataStr = JSON.stringify(listings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student-hustles-listings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Listings exported successfully!', 'success');
}

/**
 * Download single listing as JSON
 */
function downloadListingAsJSON(listing) {
    const dataStr = JSON.stringify(listing, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${listing.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-listing.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Update results count
 */
function updateResultsCount() {
    if (elements.resultsCount) {
        const count = filteredListings.length;
        const text = count === 1 ? '1 listing found' : `${count} listings found`;
        elements.resultsCount.textContent = text;
    }
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
    }
    
    // Prevent body scroll when menu is open
    if (mobileMenu.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (hamburger && mobileMenu) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
    }
    document.body.style.overflow = '';
}

/**
 * Handle keyboard navigation
 */
function handleKeyboardNavigation(e) {
    // Close modals with Escape key
    if (e.key === 'Escape') {
        if (elements.profileModal && elements.profileModal.classList.contains('show')) {
            closeProfileModal();
        } else if (elements.submitModal && elements.submitModal.classList.contains('show')) {
            closeSubmitModal();
        } else if (document.getElementById('mobileMenu') && document.getElementById('mobileMenu').classList.contains('open')) {
            closeMobileMenu();
        }
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '🎉' : '⚠';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-content">
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    if (elements.toastContainer) {
        elements.toastContainer.appendChild(toast);
    }
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove after longer time for success messages
    const autoRemoveTime = type === 'success' ? 8000 : 5000;
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, autoRemoveTime);
}

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Handle tag dropdown change
 */
function handleTagChange() {
    const tagsSelect = document.getElementById('tags');
    const otherTagInput = document.getElementById('otherTagInput');
    
    if (tagsSelect.value === 'other') {
        otherTagInput.style.display = 'block';
    } else {
        otherTagInput.style.display = 'none';
    }
}

/**
 * Setup program cards toggle functionality
 */
function setupProgramCards(retryCount = 0) {
    const programCards = document.querySelectorAll('.program-card');
    console.log('Found program cards:', programCards.length); // Debug log
    
    if (programCards.length === 0 && retryCount < 5) {
        console.log('No program cards found, retrying in 100ms...');
        setTimeout(() => setupProgramCards(retryCount + 1), 100);
        return;
    }
    
    if (programCards.length === 0) {
        console.log('No program cards found after 5 retries, giving up.');
        return;
    }
    
    programCards.forEach((card, index) => {
        const header = card.querySelector('.program-header');
        console.log(`Setting up card ${index + 1}:`, header); // Debug log
        
        if (!header) {
            console.error(`No header found for card ${index + 1}`);
            return;
        }
        
        header.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Card clicked:', index + 1); // Debug log
            
            // Close other open cards
            programCards.forEach(otherCard => {
                if (otherCard !== card && otherCard.classList.contains('active')) {
                    otherCard.classList.remove('active');
                }
            });
            
            // Toggle current card
            card.classList.toggle('active');
            console.log('Card active state:', card.classList.contains('active')); // Debug log
        });
    });
}

// FAQ cards now use the same functionality as program cards (setupProgramCards function)

/**
 * Render business profile page
 */
function renderBusinessProfile() {
    if (!isBusinessProfilePage) return;
    
    // Get business ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const businessId = urlParams.get('id');
    
    if (!businessId) {
        // Redirect to businesses page if no ID provided
        window.location.href = 'businesses.html';
        return;
    }
    
    // Find the business
    const business = listings.find(listing => listing.id === businessId);
    
    if (!business) {
        // Redirect to businesses page if business not found
        window.location.href = 'businesses.html';
        return;
    }
    
    // Render the business profile
    const profileCard = document.getElementById('businessProfileCard');
    if (!profileCard) return;
    
    const ratingStars = generateStarRating(business.rating || 0);
    
    profileCard.innerHTML = `
        <div class="business-profile-header">
            <img src="${business.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center'}" 
                 alt="${business.name}" class="business-profile-image">
            <h1 class="business-profile-name">${business.name}</h1>
            <p class="business-profile-category">${business.category}</p>
            <div class="business-profile-status ${business.status || 'available'}">
                ${business.status === 'closed' ? 'Currently Closed' : 'Available Now'}
            </div>
        </div>
        
        <div class="business-profile-content">
            <h2 class="business-profile-section-title">About This Business</h2>
            <p class="business-profile-description">${business.description}</p>
            
            <div class="business-profile-rating">
                <div class="business-rating-stars">${ratingStars}</div>
                <span class="business-rating-text">${business.rating || 0}/5 (${business.reviewCount || 0} reviews)</span>
            </div>
            
            <h2 class="business-profile-section-title">Contact Information</h2>
            <div class="business-profile-details">
                <div class="business-detail-item">
                    <div class="business-detail-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                    </div>
                    <div class="business-detail-content">
                        <h4>Phone</h4>
                        <p>${business.contactMethod || 'Contact via WhatsApp'}</p>
                    </div>
                </div>
                
                <div class="business-detail-item">
                    <div class="business-detail-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <div class="business-detail-content">
                        <h4>Type</h4>
                        <p>${business.type || 'Service'}</p>
                    </div>
                </div>
                
                <div class="business-detail-item">
                    <div class="business-detail-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    <div class="business-detail-content">
                        <h4>Category</h4>
                        <p>${business.category}</p>
                    </div>
                </div>
                
                <div class="business-detail-item">
                    <div class="business-detail-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                    </div>
                    <div class="business-detail-content">
                        <h4>Status</h4>
                        <p>${business.status === 'closed' ? 'Currently Closed' : 'Available Now'}</p>
                    </div>
                </div>
            </div>
            
            <div class="business-profile-actions">
                ${business.contactMethod === 'whatsapp' ? 
                    `<a href="https://wa.me/${business.contactInfo.replace(/\D/g, '')}" 
                       class="btn btn-primary" target="_blank" rel="noopener noreferrer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        Contact via WhatsApp
                    </a>` : 
                    business.contactMethod === 'phone' ?
                    `<a href="tel:${business.contactInfo}" 
                       class="btn btn-primary" target="_blank" rel="noopener noreferrer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                        Call Now
                    </a>` :
                    business.contactMethod === 'email' ?
                    `<a href="mailto:${business.contactInfo}" 
                       class="btn btn-primary" target="_blank" rel="noopener noreferrer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        Send Email
                    </a>` :
                    `<a href="#" class="btn btn-primary" onclick="alert('Contact method not available')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Contact Business
                    </a>`
                }
                <button class="btn btn-secondary" onclick="window.history.back()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    Go Back
                </button>
            </div>
        </div>
    `;
}

/**
 * Setup business profile page functionality
 */
function setupBusinessProfilePage() {
    if (!isBusinessProfilePage) return;
    
    // Setup back button
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }
    
    // Render the business profile
    renderBusinessProfile();
}

/**
 * Setup testimonials scrolling functionality
 */
function setupTestimonialsScrolling() {
    const testimonialsTrack = document.getElementById('testimonialsTrack');
    if (!testimonialsTrack) return;
    
    // Ensure smooth scrolling animation
    const testimonialsContainer = testimonialsTrack.parentElement;
    if (testimonialsContainer) {
        // Add smooth scrolling behavior
        testimonialsContainer.style.overflow = 'hidden';
        
        // Pause animation on hover for better UX
        testimonialsContainer.addEventListener('mouseenter', () => {
            testimonialsTrack.style.animationPlayState = 'paused';
        });
        
        testimonialsContainer.addEventListener('mouseleave', () => {
            testimonialsTrack.style.animationPlayState = 'running';
        });
    }
    
    // Ensure the animation restarts properly
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                testimonialsTrack.style.animationPlayState = 'running';
            }
        });
    });
    
    observer.observe(testimonialsTrack);
}


// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
