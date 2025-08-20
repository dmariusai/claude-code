/**
 * Service Worker for Evercare AI Emergency Alert System
 * Enables offline functionality and caching for critical emergency features
 */

const CACHE_NAME = 'evercare-ai-v1.0.0';
const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    'https://cdn.tailwindcss.com'
];

// Install event - cache critical assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching critical assets');
                return cache.addAll(CRITICAL_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response as it can only be consumed once
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If offline and no cache, return a basic offline page
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Background sync for emergency alerts when connection is restored
self.addEventListener('sync', event => {
    if (event.tag === 'emergency-alert') {
        event.waitUntil(sendQueuedEmergencyAlerts());
    }
});

// Handle emergency alerts when offline
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'EMERGENCY_ALERT') {
        // Store emergency alert data for later transmission
        storeEmergencyAlert(event.data.alertData);
        
        // Try to send immediately, queue for background sync if offline
        sendEmergencyAlert(event.data.alertData)
            .catch(() => {
                // Register for background sync to retry when online
                self.registration.sync.register('emergency-alert');
            });
    }
});

/**
 * Store emergency alert data locally
 * @param {Object} alertData - Emergency alert information
 */
function storeEmergencyAlert(alertData) {
    const alertWithTimestamp = {
        ...alertData,
        timestamp: Date.now(),
        id: generateAlertId()
    };
    
    // Store in IndexedDB or localStorage
    if ('indexedDB' in self) {
        // Use IndexedDB for more robust storage
        storeInIndexedDB(alertWithTimestamp);
    } else {
        // Fallback to localStorage
        const alerts = JSON.parse(localStorage.getItem('pendingAlerts') || '[]');
        alerts.push(alertWithTimestamp);
        localStorage.setItem('pendingAlerts', JSON.stringify(alerts));
    }
}

/**
 * Send emergency alert to notification service
 * @param {Object} alertData - Emergency alert information
 * @returns {Promise} Promise that resolves when alert is sent
 */
function sendEmergencyAlert(alertData) {
    return fetch('/api/emergency-alert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData)
    });
}

/**
 * Send all queued emergency alerts
 * @returns {Promise} Promise that resolves when all alerts are sent
 */
function sendQueuedEmergencyAlerts() {
    // Retrieve stored alerts and attempt to send them
    const alerts = JSON.parse(localStorage.getItem('pendingAlerts') || '[]');
    
    const sendPromises = alerts.map(alert => 
        sendEmergencyAlert(alert)
            .then(() => {
                // Remove from queue on successful send
                removeAlertFromQueue(alert.id);
                return true;
            })
            .catch(error => {
                console.error('Failed to send alert:', error);
                return false;
            })
    );
    
    return Promise.all(sendPromises);
}

/**
 * Remove alert from queue after successful transmission
 * @param {string} alertId - ID of the alert to remove
 */
function removeAlertFromQueue(alertId) {
    const alerts = JSON.parse(localStorage.getItem('pendingAlerts') || '[]');
    const filteredAlerts = alerts.filter(alert => alert.id !== alertId);
    localStorage.setItem('pendingAlerts', JSON.stringify(filteredAlerts));
}

/**
 * Generate unique alert ID
 * @returns {string} Unique identifier
 */
function generateAlertId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Store alert data in IndexedDB
 * @param {Object} alertData - Alert data to store
 */
function storeInIndexedDB(alertData) {
    const request = indexedDB.open('EverCareDB', 1);
    
    request.onerror = () => {
        console.error('IndexedDB error');
    };
    
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('alerts')) {
            db.createObjectStore('alerts', { keyPath: 'id' });
        }
    };
    
    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['alerts'], 'readwrite');
        const store = transaction.objectStore('alerts');
        store.add(alertData);
    };
}
