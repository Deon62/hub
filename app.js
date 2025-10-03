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

// DOM Elements
const elements = {
    businessGrid: document.getElementById('businessGrid'),
    searchInput: document.getElementById('searchInput'),
    resultsCount: document.getElementById('resultsCount'),
    emptyState: document.getElementById('emptyState'),
    profileModal: document.getElementById('profileModal'),
    submitModal: document.getElementById('submitModal'),
    submitForm: document.getElementById('submitForm'),
    exportBtn: document.getElementById('exportBtn'),
    toastContainer: document.getElementById('toastContainer')
};

// Sample Data - 3 businesses as specified
const sampleListings = [
    {
        id: 'mosi-mini-shop',
        name: "Mosi's Mini Shop",
        category: 'goods',
        type: 'goods',
        description: 'Premium perfumes, accessories, and lifestyle products. Imported fragrances from top brands at student-friendly prices. Perfect for gifting or treating yourself!',
        contactMethod: 'whatsapp',
        contactInfo: '+254712345678',
        instagram: 'https://instagram.com/mosi_mini_shop',
        location: 'Main Campus, Dorm 3',
        tags: ['budget', 'delivery'],
        image: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'njeris-salon',
        name: "Njeri's Salon",
        category: 'beauty',
        type: 'service',
        description: 'Professional hair styling, braiding, and beauty services. Experienced stylist specializing in natural hair care and trendy styles. Book your appointment today!',
        contactMethod: 'phone',
        contactInfo: '+254723456789',
        instagram: 'https://instagram.com/njeris_salon',
        location: 'Off-campus, 5 mins walk',
        tags: ['discount'],
        image: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'kips-bites',
        name: "Kip's Bites",
        category: 'food',
        type: 'service',
        description: 'Homemade snacks, fresh juices, and campus delivery. Healthy, affordable meals made with love. Perfect for busy students who want quality food delivered right to their door.',
        contactMethod: 'whatsapp',
        contactInfo: '+254734567890',
        instagram: 'https://instagram.com/kips_bites',
        location: 'Campus delivery available',
        tags: ['delivery', 'budget'],
        image: null,
        createdAt: new Date().toISOString()
    }
];

/**
 * Initialize the application
 */
function init() {
    loadListings();
    setupEventListeners();
    renderListings();
    updateResultsCount();
}

/**
 * Load listings from localStorage or seed with sample data
 */
function loadListings() {
    const stored = localStorage.getItem('student_hustles');
    if (stored) {
        try {
            listings = JSON.parse(stored);
        } catch (error) {
            console.error('Error parsing stored listings:', error);
            listings = [...sampleListings];
        }
    } else {
        listings = [...sampleListings];
        saveListings();
    }
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
    elements.searchInput.addEventListener('input', handleSearch);
    
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
    const closeSubmitModal = document.getElementById('closeSubmitModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const cancelSubmit = document.getElementById('cancelSubmit');
    
    if (postHustleBtn) postHustleBtn.addEventListener('click', openSubmitModal);
    if (heroPostBtn) heroPostBtn.addEventListener('click', openSubmitModal);
    if (footerPostBtn) footerPostBtn.addEventListener('click', openSubmitModal);
    if (closeSubmitModal) closeSubmitModal.addEventListener('click', closeSubmitModal);
    if (closeProfileModal) closeProfileModal.addEventListener('click', closeProfileModal);
    if (cancelSubmit) cancelSubmit.addEventListener('click', closeSubmitModal);
    
    // Form submission
    if (elements.submitForm) elements.submitForm.addEventListener('submit', handleFormSubmit);
    
    // Export functionality
    if (elements.exportBtn) elements.exportBtn.addEventListener('click', exportListings);
    
    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', toggleFAQ);
    });
    
    // Program card toggle functionality
    setupProgramCards();
    
    // Tag input functionality
    const addTagBtn = document.getElementById('addTagBtn');
    const tagInput = document.getElementById('tagInput');
    const imageInput = document.getElementById('image');
    
    if (addTagBtn) addTagBtn.addEventListener('click', addTag);
    if (tagInput) {
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });
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
    if (filteredListings.length === 0) {
        elements.businessGrid.style.display = 'none';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.businessGrid.style.display = 'grid';
    elements.emptyState.style.display = 'none';
    
    elements.businessGrid.innerHTML = filteredListings.map(listing => createBusinessCard(listing)).join('');
    
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
            <img src="${imageSrc}" alt="${listing.name}" class="business-image" loading="lazy">
            <div class="business-content">
                <div class="business-header">
                    <h3 class="business-name">${escapeHtml(listing.name)}</h3>
                    <span class="category-badge">${listing.category}</span>
                </div>
                <p class="business-description">${escapeHtml(listing.description)}</p>
                <div class="business-actions">
                    ${listing.contactMethod === 'whatsapp' ? 
                        `<button class="btn btn-whatsapp" aria-label="Contact via WhatsApp">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                            WhatsApp
                        </button>` : 
                        `<button class="btn btn-secondary" disabled>Contact</button>`
                    }
                    <button class="btn btn-profile" aria-label="View profile">
                        View Profile
                    </button>
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
    
    elements.profileModal.setAttribute('aria-hidden', 'false');
    elements.profileModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * Close profile modal
 */
function closeProfileModal() {
    elements.profileModal.setAttribute('aria-hidden', 'true');
    elements.profileModal.classList.remove('show');
    document.body.style.overflow = '';
}

/**
 * Open submit modal
 */
function openSubmitModal() {
    elements.submitModal.setAttribute('aria-hidden', 'false');
    elements.submitModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Reset form
    elements.submitForm.reset();
    clearFormErrors();
    document.getElementById('tagList').innerHTML = '';
    document.getElementById('imagePreview').innerHTML = '';
}

/**
 * Close submit modal
 */
function closeSubmitModal() {
    elements.submitModal.setAttribute('aria-hidden', 'true');
    elements.submitModal.classList.remove('show');
    document.body.style.overflow = '';
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(elements.submitForm);
    const tags = Array.from(document.querySelectorAll('.tag-item')).map(tag => 
        tag.querySelector('.tag-text').textContent
    );
    
    const newListing = {
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
        createdAt: new Date().toISOString()
    };
    
    // Add to listings
    listings.unshift(newListing);
    saveListings();
    
    // Update display
    filterListings();
    
    // Show success message
    showToast('Your business has been posted successfully!', 'success');
    
    // Close modal
    closeSubmitModal();
    
    // Offer to download as JSON
    setTimeout(() => {
        if (confirm('Would you like to download your listing as a JSON file?')) {
            downloadListingAsJSON(newListing);
        }
    }, 1000);
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
    
    field.closest('.form-group').classList.add('error');
    errorElement.textContent = message;
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
    const count = filteredListings.length;
    const text = count === 1 ? '1 listing found' : `${count} listings found`;
    elements.resultsCount.textContent = text;
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    
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
    
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
}

/**
 * Handle keyboard navigation
 */
function handleKeyboardNavigation(e) {
    // Close modals with Escape key
    if (e.key === 'Escape') {
        if (elements.profileModal.classList.contains('show')) {
            closeProfileModal();
        } else if (elements.submitModal.classList.contains('show')) {
            closeSubmitModal();
        } else if (document.getElementById('mobileMenu').classList.contains('open')) {
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
    
    const icon = type === 'success' ? '✓' : '⚠';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-content">
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
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
 * Setup program cards toggle functionality
 */
function setupProgramCards() {
    const programCards = document.querySelectorAll('.program-card');
    console.log('Found program cards:', programCards.length); // Debug log
    
    if (programCards.length === 0) {
        console.log('No program cards found, retrying in 100ms...');
        setTimeout(setupProgramCards, 100);
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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
