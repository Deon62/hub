// Service Worker for Student Hustle Hub - Enhanced PWA Support
const CACHE_NAME = 'student-hustle-hub-v7';
const STATIC_CACHE = 'static-cache-v7';
const DYNAMIC_CACHE = 'dynamic-cache-v7';
const UPDATE_CHECK_INTERVAL = 5 * 60 * 1000; // Check for updates every 5 minutes

// Essential assets to cache immediately
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css?v=7',
    '/app.js?v=7',
    '/manifest.json',
    '/version.json',
    '/offline.html',
    '/assets/logo.png',
    '/profiles/deon.jpg',
    '/profiles/deon1.jpg',
    '/profiles/deon2.jpg',
    '/profiles/deon3.jpg',
    '/profiles/deon4.jpg',
    '/businesses.html',
    '/pricing.html',
    '/profile.html',
    '/dashboard.html',
    '/messages.html',
    '/business-profile.html'
];

// Install event - Cache essential assets
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching essential assets...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] Essential assets cached successfully');
                // Force activation of new service worker immediately
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Failed to cache essential assets:', error);
            })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Service worker activated successfully');
            // Take control of all clients immediately
            return self.clients.claim();
        }).then(() => {
            // Clear old caches aggressively for mobile
            return clearOldCachesAggressively();
        }).then(() => {
            // Notify clients that the service worker is ready
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_READY',
                        payload: { version: 'v7' }
                    });
                });
            });
        }).then(() => {
            // Start background update checking
            startBackgroundUpdateCheck();
        })
    );
});

// Fetch event - Enhanced caching strategy
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    console.log('[SW] Fetching:', request.url);
    
    event.respondWith(
        caches.match(request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    console.log('[SW] Serving from cache:', request.url);
                    return response;
                }
                
                // For business profile pages, try to serve the base template
                if (url.pathname === '/business-profile.html') {
                    console.log('[SW] Business profile page requested, serving base template');
                    return caches.match('/business-profile.html')
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // If not cached, fetch and cache it
                            return fetch('/business-profile.html')
                                .then(fetchResponse => {
                                    if (fetchResponse && fetchResponse.status === 200) {
                                        const responseToCache = fetchResponse.clone();
                                        caches.open(STATIC_CACHE)
                                            .then(cache => {
                                                console.log('[SW] Caching business profile template');
                                                cache.put('/business-profile.html', responseToCache);
                                            });
                                    }
                                    return fetchResponse;
                                });
                        });
                }
                
                // Try to fetch from network
                return fetch(request)
                    .then(fetchResponse => {
                        // Check if response is valid
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }
                        
                        // Clone the response
                        const responseToCache = fetchResponse.clone();
                        
                        // Cache dynamic content
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                console.log('[SW] Caching dynamic content:', request.url);
                                cache.put(request, responseToCache);
                            });
                        
                        return fetchResponse;
                    })
                    .catch(error => {
                        console.log('[SW] Network request failed:', request.url, error);
                        
                        // Special handling for business profile pages
                        if (url.pathname === '/business-profile.html') {
                            console.log('[SW] Serving business profile template offline');
                            return caches.match('/business-profile.html')
                                .then(cachedResponse => {
                                    if (cachedResponse) {
                                        return cachedResponse;
                                    }
                                    // Fallback to offline page if business profile not cached
                                    return caches.match('/offline.html');
                                });
                        }
                        
                        // Return offline fallback for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                        
                        // Return offline fallback for HTML pages
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                        
                        // For other requests, you might want to return a default response
                        throw error;
                    });
            })
    );
});

// Handle background sync (if supported)
self.addEventListener('sync', event => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle any background sync tasks here
            console.log('[SW] Processing background sync tasks...')
        );
    }
});

// Handle push notifications (if needed in future)
self.addEventListener('push', event => {
    console.log('[SW] Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/icons/icon-96x96.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/icon-96x96.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Student Hustle Hub', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Aggressive cache clearing for mobile devices
async function clearOldCachesAggressively() {
    try {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
            name.includes('student-hustle-hub') && 
            !name.includes('v7') // Keep only current version
        );
        
        // Delete old caches
        await Promise.all(oldCaches.map(name => caches.delete(name)));
        console.log('[SW] Aggressively cleared old caches:', oldCaches);
        
        // Also clear any caches with old version numbers
        const versionCaches = cacheNames.filter(name => 
            name.includes('v6') || name.includes('v5') || name.includes('v4')
        );
        
        await Promise.all(versionCaches.map(name => caches.delete(name)));
        console.log('[SW] Cleared version caches:', versionCaches);
        
    } catch (error) {
        console.log('[SW] Aggressive cache clearing failed:', error);
    }
}

// Background update checking
function startBackgroundUpdateCheck() {
    // Check for updates immediately
    checkForUpdates();
    
    // Set up periodic update checking
    setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);
}

async function checkForUpdates() {
    try {
        // Check if there's a new version available
        const response = await fetch('/version.json?' + Date.now());
        if (response.ok) {
            const versionData = await response.json();
            const currentVersion = await getCurrentVersion();
            
            // Compare versions
            if (shouldUpdate(versionData, currentVersion)) {
                console.log('[SW] Update available, updating cache silently');
                await updateCacheSilently();
            }
        }
    } catch (error) {
        console.log('[SW] Update check failed:', error);
    }
}

async function getCurrentVersion() {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const response = await cache.match('/version.json');
        if (response) {
            return await response.json();
        }
    } catch (error) {
        console.log('[SW] Could not get current version:', error);
    }
    return { version: '1.0.0', timestamp: 0 };
}

function shouldUpdate(newVersion, currentVersion) {
    // Only update if there's a significant version difference
    const timeDiff = newVersion.timestamp - currentVersion.timestamp;
    
    // Don't update if the difference is less than 1 minute (prevents constant updates)
    if (timeDiff < 60000) {
        console.log('[SW] Update skipped - too recent');
        return false;
    }
    
    // Compare version numbers and timestamps
    if (newVersion.timestamp > currentVersion.timestamp) {
        return true;
    }
    
    // Compare semantic versions
    const newVersionParts = newVersion.version.split('.').map(Number);
    const currentVersionParts = currentVersion.version.split('.').map(Number);
    
    for (let i = 0; i < Math.max(newVersionParts.length, currentVersionParts.length); i++) {
        const newPart = newVersionParts[i] || 0;
        const currentPart = currentVersionParts[i] || 0;
        
        if (newPart > currentPart) {
            return true;
        } else if (newPart < currentPart) {
            return false;
        }
    }
    
    return false;
}

async function updateCacheSilently() {
    try {
        // Open new cache
        const newCache = await caches.open(STATIC_CACHE);
        
        // Cache all essential assets
        await newCache.addAll(urlsToCache);
        
        // Clean up old caches
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => {
                if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                    return caches.delete(cacheName);
                }
            })
        );
        
        console.log('[SW] Cache updated silently');
        
        // Notify clients about the update
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'UPDATE_AVAILABLE',
                payload: { version: CACHE_NAME }
            });
        });
        
    } catch (error) {
        console.error('[SW] Silent update failed:', error);
    }
}

// Message handling for communication with main thread
self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        checkForUpdates();
    }
});
