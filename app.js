
// Application State
let listings = [];
let filteredListings = [];
let currentFilters = {
    category: 'all',
    tags: [],
    search: ''
};

// Performance optimizations
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cache = new Map();
let lastCacheTime = 0;
let searchTimeout;

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
        location: 'Main Campus, Dorm 5',
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
        location: 'Student Center, Room 12',
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
        id: 'kibs-digital-marketing',
        name: "Kibs beauty and sensation",
        category: 'goods',
        type: 'good',
        description: 'Kibs beauty, offers beauty products and perfume, make up products and some natural products like slimming teamy mission hear is to boost confidence on my clients and eradicate stigma as beauty is concerned.',
        contactMethod: 'phone',
        contactInfo: '0794518414',
        instagram: 'https://instagram.com/deon_digital',
        location: 'Njoro, Egerton,eldoret deliivery',
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
        location: 'Cafeteria, Table 8',
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
    const now = Date.now();
    
    // Check cache first
    if (cache.has('listings') && (now - lastCacheTime) < CACHE_DURATION) {
        listings = cache.get('listings');
        filteredListings = [...listings];
        return;
    }
    
    // Clear old data and force load new sample listings
    localStorage.removeItem('student_hustles');
    listings = [...sampleListings];
    saveListings();
    filteredListings = [...listings];
    
    // Cache the results
    cache.set('listings', listings);
    lastCacheTime = now;
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
    
    // AI Assistant functionality
    setupAIAssistant();
    
    // Like functionality
    setupLikeButtons();
    
    
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
    const desktopSidebar = document.getElementById('desktopSidebar');
    const desktopSidebarClose = document.getElementById('desktopSidebarClose');
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            // Check if we're on mobile or desktop
            if (window.innerWidth <= 768) {
                toggleMobileMenu();
            } else {
                toggleDesktopSidebar();
            }
        });
    }
    if (desktopSidebarClose) desktopSidebarClose.addEventListener('click', closeDesktopSidebar);
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
    
    // Close desktop sidebar when clicking on links
    document.querySelectorAll('.desktop-sidebar-nav .nav-link').forEach(link => {
        link.addEventListener('click', closeDesktopSidebar);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

/**
 * Handle search input
 */
function handleSearch(e) {
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    // Set new timeout for debounced search
    searchTimeout = setTimeout(() => {
        currentFilters.search = e.target.value.toLowerCase();
        filterListings();
    }, 300); // 300ms delay
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
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        
        // Batch DOM updates
        requestAnimationFrame(() => {
            tempDiv.innerHTML = listingsToShow.map(listing => createBusinessCard(listing)).join('');
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }
            elements.businessGrid.innerHTML = '';
            elements.businessGrid.appendChild(fragment);
        });
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
    
}

/**
 * Create HTML for a business card
 */
function createBusinessCard(listing) {
    const imageSrc = listing.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjlGQUZCIi8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0xMzUgODVIMTY1VjExNUgxMzVWODVaIiBmaWxsPSIjMTA5OTgxIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjE0Ij5CdXNpbmVzcyBJbWFnZTwvdGV4dD4KPC9zdmc+';
    
    return `
        <article class="business-card" data-id="${listing.id}">
            <div class="business-content">
                <img src="${imageSrc}" alt="${listing.name}" class="business-image" loading="lazy" decoding="async" fetchpriority="low">
                <div class="business-info">
                    <div class="business-header">
                        <h3 class="business-name">${escapeHtml(listing.name)}</h3>
                        <span class="category-badge">${listing.category}</span>
                    </div>
                    ${listing.location ? `
                        <div class="business-location">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            <span>${escapeHtml(listing.location)}</span>
                        </div>
                    ` : ''}
                    <div class="business-status ${listing.status || 'available'}">${(listing.status || 'available') === 'available' ? 'Available' : 'Closed'}</div>
                    <p class="business-description">${escapeHtml(listing.description)}</p>
                    <div class="business-rating">
                        <div class="rating-stars">${generateStarRating(listing.rating || 0)}</div>
                        <span class="rating-text">${(listing.rating || 0).toFixed(1)} (${listing.reviewCount || 0} reviews)</span>
                    </div>
                    <div class="business-actions">
                        <button class="btn btn-like" aria-label="Like this business" data-business-id="${listing.id}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="heart-icon">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span class="like-count">${getLikeCount(listing.id)}</span>
                        </button>
                        <button class="btn btn-share" aria-label="Share this business" data-business-id="${listing.id}" data-business-name="${escapeHtml(listing.name)}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="share-icon">
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                            </svg>
                        </button>
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
            
            // Create new business
            const businessData = {
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
            
            saveListings();
            
            // Update display
            filterListings();
            
            // Clear form
            elements.submitForm.reset();
            clearFormPreview();
            
            // Reset submit button text
            const submitBtn = elements.submitForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Post Your Hustle';
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
 * Toggle desktop sidebar
 */
function toggleDesktopSidebar() {
    const desktopSidebar = document.getElementById('desktopSidebar');
    const hamburger = document.getElementById('hamburgerBtn');
    
    if (desktopSidebar && hamburger) {
        desktopSidebar.classList.toggle('open');
        hamburger.classList.toggle('active');
    }
    
    // Prevent body scroll when sidebar is open
    if (desktopSidebar.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

/**
 * Close desktop sidebar
 */
function closeDesktopSidebar() {
    const desktopSidebar = document.getElementById('desktopSidebar');
    const hamburger = document.getElementById('hamburgerBtn');
    
    if (desktopSidebar && hamburger) {
        desktopSidebar.classList.remove('open');
        hamburger.classList.remove('active');
    }
    document.body.style.overflow = '';
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
        // Check if we're offline and show appropriate message
        if (!navigator.onLine) {
            showOfflineBusinessProfile(businessId);
            return;
        }
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
            ${business.location ? `
                <div class="business-profile-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>${escapeHtml(business.location)}</span>
                </div>
            ` : ''}
            <div class="business-profile-status ${business.status || 'available'}">
                ${business.status === 'closed' ? 'Currently Closed' : 'Available Now'}
            </div>
            <div class="business-profile-actions">
                <button class="btn btn-like" aria-label="Like this business" data-business-id="${business.id}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="heart-icon">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span class="like-count">${getLikeCount(business.id)}</span>
                </button>
                <button class="btn btn-share" aria-label="Share this business" data-business-id="${business.id}" data-business-name="${escapeHtml(business.name)}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="share-icon">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                    </svg>
                </button>
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
 * Show offline business profile message
 */
function showOfflineBusinessProfile(businessId) {
    const profileCard = document.getElementById('businessProfileCard');
    if (!profileCard) return;
    
    profileCard.innerHTML = `
        <div class="offline-business-profile">
            <div class="offline-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </div>
            <h1>Business Profile Unavailable Offline</h1>
            <p>This business profile is not available while offline. Please check your internet connection and try again.</p>
            <div class="offline-actions">
                <button class="btn btn-primary" onclick="window.history.back()">Go Back</button>
                <button class="btn btn-secondary" onclick="window.location.href='index.html'">Go Home</button>
            </div>
            <div class="offline-tip">
                <p><strong>Tip:</strong> Browse businesses while online to cache them for offline viewing!</p>
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

/**
 * Like functionality
 */
function getLikeCount(businessId) {
    const likes = JSON.parse(localStorage.getItem('businessLikes') || '{}');
    return likes[businessId] || 0;
}

function isLiked(businessId) {
    const likedBusinesses = JSON.parse(localStorage.getItem('likedBusinesses') || '[]');
    return likedBusinesses.includes(businessId);
}

function toggleLike(businessId) {
    const likedBusinesses = JSON.parse(localStorage.getItem('likedBusinesses') || '[]');
    const likes = JSON.parse(localStorage.getItem('businessLikes') || '{}');
    
    const isCurrentlyLiked = likedBusinesses.includes(businessId);
    
    if (isCurrentlyLiked) {
        // Unlike
        const newLikedBusinesses = likedBusinesses.filter(id => id !== businessId);
        localStorage.setItem('likedBusinesses', JSON.stringify(newLikedBusinesses));
        likes[businessId] = Math.max(0, (likes[businessId] || 0) - 1);
    } else {
        // Like
        likedBusinesses.push(businessId);
        localStorage.setItem('likedBusinesses', JSON.stringify(likedBusinesses));
        likes[businessId] = (likes[businessId] || 0) + 1;
    }
    
    localStorage.setItem('businessLikes', JSON.stringify(likes));
    return !isCurrentlyLiked;
}

function setupLikeButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-like')) {
            const button = e.target.closest('.btn-like');
            const businessId = button.dataset.businessId;
            const heartIcon = button.querySelector('.heart-icon');
            const likeCount = button.querySelector('.like-count');
            
            const isNowLiked = toggleLike(businessId);
            
            // Update UI
            if (isNowLiked) {
                heartIcon.style.fill = '#e91e63';
                heartIcon.style.transform = 'scale(1.2)';
                button.classList.add('liked');
            } else {
                heartIcon.style.fill = 'currentColor';
                heartIcon.style.transform = 'scale(1)';
                button.classList.remove('liked');
            }
            
            // Update count
            likeCount.textContent = getLikeCount(businessId);
            
            // Reset animation
            setTimeout(() => {
                heartIcon.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Handle share button clicks
        if (e.target.closest('.btn-share')) {
            const button = e.target.closest('.btn-share');
            const businessId = button.dataset.businessId;
            const businessName = button.dataset.businessName;
            
            shareBusiness(businessId, businessName);
        }
    });
}

function updateLikeButtons() {
    document.querySelectorAll('.btn-like').forEach(button => {
        const businessId = button.dataset.businessId;
        const heartIcon = button.querySelector('.heart-icon');
        const likeCount = button.querySelector('.like-count');
        
        if (isLiked(businessId)) {
            heartIcon.style.fill = '#e91e63';
            button.classList.add('liked');
        } else {
            heartIcon.style.fill = 'currentColor';
            button.classList.remove('liked');
        }
        
        likeCount.textContent = getLikeCount(businessId);
    });
}

/**
 * Share business functionality
 */
function shareBusiness(businessId, businessName) {
    const business = listings.find(listing => listing.id === businessId);
    if (!business) return;
    
    // Create share URL
    const shareUrl = `${window.location.origin}/business-profile.html?id=${businessId}`;
    
    // Create share text
    const shareText = `Check out this amazing student business: ${businessName} on Student Hustle Hub! 🚀\n\n${shareUrl}`;
    
    // Check if Web Share API is supported
    if (navigator.share) {
        // Use native Web Share API
        navigator.share({
            title: `${businessName} - Student Hustle Hub`,
            text: shareText,
            url: shareUrl
        }).then(() => {
            console.log('Business shared successfully');
            showToast('Business shared successfully!', 'success');
        }).catch((error) => {
            console.log('Error sharing:', error);
            // Fallback to copy to clipboard
            fallbackShare(shareText, shareUrl);
        });
    } else {
        // Fallback to copy to clipboard
        fallbackShare(shareText, shareUrl);
    }
}

function fallbackShare(shareText, shareUrl) {
    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Business link copied to clipboard!', 'success');
        }).catch(() => {
            // Final fallback - show share modal
            showShareModal(shareText, shareUrl);
        });
    } else {
        // Final fallback - show share modal
        showShareModal(shareText, shareUrl);
    }
}

function showShareModal(shareText, shareUrl) {
    // Create share modal
    const modal = document.createElement('div');
    modal.className = 'share-modal-overlay';
    modal.innerHTML = `
        <div class="share-modal">
            <div class="share-modal-header">
                <h3>Share Business</h3>
                <button class="share-modal-close" aria-label="Close share modal">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
            <div class="share-modal-content">
                <p>Copy this link to share with your colleagues:</p>
                <div class="share-url-container">
                    <input type="text" value="${shareUrl}" readonly class="share-url-input" id="shareUrlInput">
                    <button class="btn btn-primary" id="copyShareUrl">Copy Link</button>
                </div>
                <div class="share-social">
                    <p>Or share on social media:</p>
                    <div class="share-social-buttons">
                        <a href="https://wa.me/?text=${encodeURIComponent(shareText)}" target="_blank" class="btn btn-whatsapp">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                            WhatsApp
                        </a>
                        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}" target="_blank" class="btn btn-twitter">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                            Twitter
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Add event listeners
    modal.querySelector('.share-modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    });
    
    modal.querySelector('.share-modal-overlay').addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }
    });
    
    modal.querySelector('#copyShareUrl').addEventListener('click', () => {
        const input = modal.querySelector('#shareUrlInput');
        input.select();
        input.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            showToast('Link copied to clipboard!', 'success');
        } catch (err) {
            showToast('Failed to copy link', 'error');
        }
    });
}

/**
 * AI Assistant functionality
 */
function setupAIAssistant() {
    const aiBtn = document.getElementById('aiAssistantBtn');
    const aiModal = document.getElementById('aiChatModal');
    const aiCloseBtn = document.getElementById('aiCloseBtn');
    const aiChatMessages = document.getElementById('aiChatMessages');
    const questionChips = document.querySelectorAll('.question-chip');
    
    if (!aiBtn || !aiModal) return;
    
    // Mock responses for common questions
    const mockResponses = {
        'how-to-submit': {
            title: 'How to Submit Your Business',
            content: `To submit your business to Student Hustle Hub:

1. Click "Submit for Listing" button on the homepage
2. Fill out the form with your business details:
   Business name and description
   Category (Services, Goods, Food, etc.)
   Contact information (WhatsApp, Phone, or Email)
   Location (optional but helpful)
   Upload a business image

3. Submit the form - it's completely free

4. Your listing will be reviewed and appear on the platform within 24 hours

Pro tip: Add a clear description and good photos to attract more customers`
        },
        'categories': {
            title: 'Available Categories',
            content: `We support various business categories:

Services:
Tutoring and Academic help
Graphic Design and Web Development
Photography and Videography
Beauty and Personal care
Fitness and Wellness

Goods:
Handmade crafts and Jewelry
Clothing and Fashion
Electronics and Gadgets
Books and Study materials
Art and Decorations

Food:
Homemade meals and Snacks
Baked goods and Desserts
Beverages and Drinks
Meal prep services

Tutoring:
Academic subjects
Language learning
Test preparation
Skill development

Choose the category that best fits your business`
        },
        'contact': {
            title: 'How to Contact Businesses',
            content: `Contacting businesses is easy:

WhatsApp (Recommended):
Click the WhatsApp button on any business card
Opens directly in WhatsApp with pre-filled message
Fastest way to get responses

Phone:
Click the phone number to call directly
Great for urgent inquiries

Email:
Click the email address to open your email app
Good for detailed questions or proposals

Tips for better responses:
Be polite and professional
Mention you found them on Student Hustle Hub
Ask specific questions about their services
Include your budget if relevant

Remember: Always verify the business details before making payments`
        },
        'pricing': {
            title: 'Pricing Information',
            content: `It's Completely FREE

For Students:
List your business for FREE
No monthly fees or hidden costs
No commission on sales
Keep 100% of your earnings

What's included:
Professional business profile
Contact information display
Category listing
Search visibility
Mobile-friendly design

Future Premium Features (Coming Soon):
Featured listings
Business analytics
In-app messaging
Advanced targeting

Our Mission: Supporting student entrepreneurship without financial barriers

Note: We may introduce optional premium features in the future, but basic listing will always remain free`
        },
        'offline': {
            title: 'Offline Usage',
            content: `Yes! You can use Student Hustle Hub offline

What works offline:
Browse cached business listings
View business profiles
Access contact information
Read business descriptions
Use the search function (cached results)

What requires internet:
Submit new businesses
Real-time updates
Contact businesses (WhatsApp/Phone/Email)

How it works:
The app automatically caches content when you're online
Essential pages are available offline
You'll see an "offline" indicator when disconnected
Content syncs when you're back online

Pro tip: Browse businesses while online to cache them for offline use

This is a Progressive Web App (PWA) - you can even install it on your phone like a native app`
        }
    };
    
    // Open AI modal
    aiBtn.addEventListener('click', () => {
        aiModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close AI modal
    aiCloseBtn.addEventListener('click', closeAIModal);
    aiModal.addEventListener('click', (e) => {
        if (e.target === aiModal) {
            closeAIModal();
        }
    });
    
    // Handle question chips
    questionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const question = chip.dataset.question;
            if (mockResponses[question]) {
                addAIResponse(mockResponses[question]);
            }
        });
    });
    
    function closeAIModal() {
        aiModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function addAIResponse(response) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message';
        messageDiv.innerHTML = `
            <div class="ai-avatar-small">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"/>
                    <circle cx="8" cy="10" r="1"/>
                    <circle cx="12" cy="10" r="1"/>
                    <circle cx="16" cy="10" r="1"/>
                    <path d="M8 13H16V14H8V13Z"/>
                </svg>
            </div>
            <div class="message-content">
                <h4 style="margin: 0 0 8px 0; color: #0F3D3E; font-size: 1rem;">${response.title}</h4>
                <p style="white-space: pre-line; margin: 0;">${response.content}</p>
                <div style="margin-top: 12px; padding: 8px; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #0F3D3E;">
                    <small style="color: #0369a1; font-style: italic;">This is a mock response. The full AI will provide real-time, personalized answers!</small>
                </div>
            </div>
        `;
        
        aiChatMessages.appendChild(messageDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        
        // Add typing effect
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(10px)';
            messageDiv.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            }, 50);
        }, 100);
    }
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aiModal.classList.contains('active')) {
            closeAIModal();
        }
    });
}

// Service Worker Update Management
let swRegistration = null;
let updateAvailable = false;
let lastUpdateCheck = 0;
let updateCheckInterval = 5 * 60 * 1000; // Check every 5 minutes
let showUpdateButton = false;
let lastUpdateTime = 0;
let updateCooldown = 2 * 60 * 1000; // 2 minutes cooldown between updates
let isUpdating = false;

// Initialize service worker
async function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            swRegistration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully');
            
            // Listen for service worker updates
            swRegistration.addEventListener('updatefound', () => {
                console.log('Service Worker update found');
                const newWorker = swRegistration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('New service worker installed');
                        
                        // Check if enough time has passed since last update
                        const now = Date.now();
                        if (now - lastUpdateTime < updateCooldown) {
                            console.log('Update cooldown active, skipping update');
                            return;
                        }
                        
                        updateAvailable = true;
                        
                        // Check if we should show update button or update silently
                        if (shouldShowUpdateButton()) {
                            showSmartUpdateButton();
                        } else {
                            handleSilentUpdate();
                        }
                    }
                });
            });
            
            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'UPDATE_AVAILABLE') {
                    console.log('Update available from service worker');
                    
                    // Check if enough time has passed since last update
                    const now = Date.now();
                    if (now - lastUpdateTime < updateCooldown) {
                        console.log('Update cooldown active, skipping update');
                        return;
                    }
                    
                    updateAvailable = true;
                    
                    if (shouldShowUpdateButton()) {
                        showSmartUpdateButton();
                    } else {
                        handleSilentUpdate();
                    }
                }
            });
            
            // Check for updates periodically
            setInterval(checkForUpdates, updateCheckInterval);
            
            // Check for updates on page focus (when user returns to app)
            window.addEventListener('focus', () => {
                const now = Date.now();
                if (now - lastUpdateCheck > updateCheckInterval) {
                    checkForUpdates();
                }
            });
            
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

// Check for updates manually
async function checkForUpdates() {
    if (swRegistration && !isUpdating) {
        try {
            const now = Date.now();
            
            // Don't check if we're in cooldown period
            if (now - lastUpdateTime < updateCooldown) {
                console.log('Update check skipped - cooldown active');
                return;
            }
            
            lastUpdateCheck = now;
            await swRegistration.update();
        } catch (error) {
            console.log('Update check failed:', error);
        }
    }
}

// Determine if we should show update button instead of silent update
function shouldShowUpdateButton() {
    // Show update button if:
    // 1. User has been using the app for more than 2 minutes (not just browsing)
    // 2. It's been more than 1 hour since last update prompt
    // 3. User is actively using the app (not idle)
    
    const now = Date.now();
    const lastUpdatePrompt = localStorage.getItem('lastUpdatePrompt') || 0;
    const appStartTime = localStorage.getItem('appStartTime') || now;
    const timeSinceLastPrompt = now - parseInt(lastUpdatePrompt);
    const timeUsingApp = now - parseInt(appStartTime);
    
    // Don't show if user just started using the app
    if (timeUsingApp < 2 * 60 * 1000) { // Less than 2 minutes
        return false;
    }
    
    // Don't show if we prompted recently (less than 1 hour ago)
    if (timeSinceLastPrompt < 60 * 60 * 1000) { // Less than 1 hour
        return false;
    }
    
    // Show update button for better user control
    return true;
}

// Show smart update button that doesn't nag
function showSmartUpdateButton() {
    // Remove any existing update button
    const existingButton = document.getElementById('smartUpdateButton');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Create smart update button
    const updateButton = document.createElement('div');
    updateButton.id = 'smartUpdateButton';
    updateButton.innerHTML = `
        <div class="smart-update-banner">
            <div class="update-content">
                <div class="update-icon">🔄</div>
                <div class="update-text">
                    <strong>New features available!</strong>
                    <span>Tap to refresh and get the latest updates</span>
                </div>
                <button class="update-btn" onclick="applyUpdate()">Update</button>
                <button class="dismiss-btn" onclick="dismissUpdate()">Later</button>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .smart-update-banner {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #0F3D3E, #2D7A7B);
            color: white;
            padding: 12px 16px;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: slideDown 0.3s ease-out;
        }
        
        .update-content {
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 100%;
        }
        
        .update-icon {
            font-size: 20px;
            animation: spin 2s linear infinite;
        }
        
        .update-text {
            flex: 1;
            min-width: 0;
        }
        
        .update-text strong {
            display: block;
            font-size: 14px;
            margin-bottom: 2px;
        }
        
        .update-text span {
            font-size: 12px;
            opacity: 0.9;
        }
        
        .update-btn, .dismiss-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .update-btn {
            background: #4CAF50;
            color: white;
        }
        
        .update-btn:hover {
            background: #45a049;
            transform: translateY(-1px);
        }
        
        .dismiss-btn {
            background: rgba(255,255,255,0.2);
            color: white;
        }
        
        .dismiss-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
            .update-content {
                flex-direction: column;
                gap: 8px;
            }
            
            .update-text {
                text-align: center;
            }
            
            .update-btn, .dismiss-btn {
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(updateButton);
    
    // Auto-dismiss after 10 seconds if user doesn't interact
    setTimeout(() => {
        if (document.getElementById('smartUpdateButton')) {
            dismissUpdate();
        }
    }, 10000);
}

// Apply update when user clicks update button
function applyUpdate() {
    if (updateAvailable && swRegistration && swRegistration.waiting && !isUpdating) {
        isUpdating = true;
        lastUpdateTime = Date.now();
        
        // Record that user applied update
        localStorage.setItem('lastUpdatePrompt', Date.now().toString());
        
        // Clear old cache to ensure fresh content
        clearOldCache();
        
        // Tell the waiting service worker to skip waiting and become active
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Show loading state
        const updateBtn = document.querySelector('.update-btn');
        if (updateBtn) {
            updateBtn.textContent = 'Updating...';
            updateBtn.disabled = true;
        }
        
        // Reload the page to use the new service worker
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Dismiss update button
function dismissUpdate() {
    const updateButton = document.getElementById('smartUpdateButton');
    if (updateButton) {
        updateButton.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
            updateButton.remove();
        }, 300);
    }
    
    // Record dismissal time
    localStorage.setItem('lastUpdatePrompt', Date.now().toString());
    
    // Apply update silently in background after dismissal
    setTimeout(() => {
        handleSilentUpdate();
    }, 5000); // Wait 5 seconds then update silently
}

// Clear old cache to ensure fresh content
async function clearOldCache() {
    try {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            const oldCaches = cacheNames.filter(name => 
                name.includes('student-hustle-hub') && 
                !name.includes('v7') // Keep only current version
            );
            
            // Delete old caches
            await Promise.all(oldCaches.map(name => caches.delete(name)));
            console.log('Old caches cleared:', oldCaches);
        }
        
        // Clear localStorage cache markers
        localStorage.removeItem('lastUpdatePrompt');
        localStorage.removeItem('appStartTime');
        
        console.log('Cache cleared for fresh update');
    } catch (error) {
        console.log('Cache clearing failed:', error);
    }
}

// Handle silent updates
function handleSilentUpdate() {
    if (updateAvailable && swRegistration && swRegistration.waiting && !isUpdating) {
        isUpdating = true;
        lastUpdateTime = Date.now();
        
        // Clear old cache to ensure fresh content
        clearOldCache();
        
        // Tell the waiting service worker to skip waiting and become active
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page to use the new service worker
        setTimeout(() => {
            window.location.reload();
        }, 2000); // Wait 2 seconds before reloading
    }
}

// Force cache refresh for mobile devices
async function forceCacheRefresh() {
    try {
        // Clear all caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('All caches cleared for fresh start');
        }
        
        // Clear localStorage
        localStorage.clear();
        
        // Force reload with cache bypass
        window.location.reload(true);
    } catch (error) {
        console.log('Cache refresh failed:', error);
    }
}

// Check if we need to show update notification
function checkForUpdateNotification() {
    const lastVersion = localStorage.getItem('lastVersion');
    const currentVersion = 'v7';
    const lastUpdatePrompt = localStorage.getItem('lastUpdatePrompt');
    const now = Date.now();
    
    // Only show update notification if:
    // 1. Version has changed
    // 2. Haven't prompted in last 24 hours
    // 3. User has been using app for at least 1 minute
    if (lastVersion !== currentVersion) {
        const timeSinceLastPrompt = now - parseInt(lastUpdatePrompt || 0);
        const appStartTime = parseInt(localStorage.getItem('appStartTime') || now);
        const timeUsingApp = now - appStartTime;
        
        // Don't show if user just started or prompted recently
        if (timeUsingApp > 60000 && timeSinceLastPrompt > 24 * 60 * 60 * 1000) {
            showUpdateNotification();
            return true;
        }
    }
    return false;
}

// Show update notification with user control
function showUpdateNotification() {
    // Remove any existing notification
    const existingNotification = document.getElementById('updateNotification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create update notification
    const notification = document.createElement('div');
    notification.id = 'updateNotification';
    notification.innerHTML = `
        <div class="update-notification">
            <div class="update-content">
                <div class="update-icon">🔄</div>
                <div class="update-text">
                    <h4>App Update Available</h4>
                    <p>Get the latest features and improvements</p>
                </div>
                <div class="update-actions">
                    <button class="update-btn" onclick="applyUpdateNow()">Update Now</button>
                    <button class="clear-btn" onclick="clearCacheAndUpdate()">Clear & Update</button>
                    <button class="later-btn" onclick="dismissUpdateNotification()">Later</button>
                </div>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .update-notification {
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            background: linear-gradient(135deg, #0F3D3E, #2D7A7B);
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInDown 0.3s ease-out;
        }
        
        .update-content {
            padding: 20px;
        }
        
        .update-icon {
            font-size: 24px;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .update-text h4 {
            margin: 0 0 5px 0;
            font-size: 16px;
        }
        
        .update-text p {
            margin: 0 0 15px 0;
            font-size: 14px;
            opacity: 0.9;
        }
        
        .update-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .update-btn, .clear-btn, .later-btn {
            flex: 1;
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 80px;
        }
        
        .update-btn {
            background: #4CAF50;
            color: white;
        }
        
        .update-btn:hover {
            background: #45a049;
            transform: translateY(-1px);
        }
        
        .clear-btn {
            background: #FF9800;
            color: white;
        }
        
        .clear-btn:hover {
            background: #F57C00;
            transform: translateY(-1px);
        }
        
        .later-btn {
            background: rgba(255,255,255,0.2);
            color: white;
        }
        
        .later-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        @keyframes slideInDown {
            from { 
                transform: translateY(-100%);
                opacity: 0;
            }
            to { 
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        @media (max-width: 480px) {
            .update-notification {
                top: 10px;
                left: 10px;
                right: 10px;
            }
            
            .update-actions {
                flex-direction: column;
            }
            
            .update-btn, .clear-btn, .later-btn {
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto-dismiss after 15 seconds if user doesn't interact
    setTimeout(() => {
        if (document.getElementById('updateNotification')) {
            dismissUpdateNotification();
        }
    }, 15000);
}

// Apply update now (gentle update)
function applyUpdateNow() {
    localStorage.setItem('lastVersion', 'v7');
    localStorage.setItem('lastUpdatePrompt', Date.now().toString());
    
    // Remove notification
    const notification = document.getElementById('updateNotification');
    if (notification) {
        notification.remove();
    }
    
    // Show loading state
    showToast('🔄 Updating app...', 'success');
    
    // Reload after short delay
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Clear cache and update (nuclear option)
function clearCacheAndUpdate() {
    localStorage.setItem('lastVersion', 'v7');
    localStorage.setItem('lastUpdatePrompt', Date.now().toString());
    
    // Remove notification
    const notification = document.getElementById('updateNotification');
    if (notification) {
        notification.remove();
    }
    
    // Show loading state
    showToast('🧹 Clearing cache and updating...', 'success');
    
    // Clear cache and reload
    forceCacheRefresh();
}

// Dismiss update notification
function dismissUpdateNotification() {
    const notification = document.getElementById('updateNotification');
    if (notification) {
        notification.style.animation = 'slideOutUp 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
    
    // Record dismissal
    localStorage.setItem('lastUpdatePrompt', Date.now().toString());
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Track app start time for smart update logic
    if (!localStorage.getItem('appStartTime')) {
        localStorage.setItem('appStartTime', Date.now().toString());
    }
    
    // Check for update notification (non-intrusive)
    setTimeout(() => {
        checkForUpdateNotification();
    }, 2000); // Wait 2 seconds before checking
    
    init();
    initServiceWorker();
});
