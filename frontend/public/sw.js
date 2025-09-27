// Travel Planner Service Worker
// Handles offline support, caching, and push notifications

const CACHE_NAME = 'travel-planner-v1.0.0';
const STATIC_CACHE_NAME = 'travel-planner-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'travel-planner-dynamic-v1.0.0';

// Resources to cache for offline use
const STATIC_RESOURCES = [
  '/',
  '/trips',
  '/create',
  '/weather-test',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker: Static resources cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static resources', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('travel-planner-')) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (!url.origin.includes(self.location.origin) || url.protocol === 'chrome-extension:') {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Handle requests with network-first strategy
async function handleRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, checking cache:', request.url);
    const cachedResponse = await cache.match(request) || await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/') || await caches.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Push notification event handler
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'You have a new travel notification!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      options.body = pushData.body || options.body;
      options.title = pushData.title || 'Travel Planner';
    } catch (error) {
      console.error('Service Worker: Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('Travel Planner', options)
  );
});

// Notification click event handler
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(clients.openWindow('/'));
  } else if (event.action === 'dismiss') {
    console.log('Notification dismissed');
  } else {
    event.waitUntil(clients.openWindow('/'));
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'trip-sync') {
    event.waitUntil(syncTripData());
  }
});

// Sync trip data when back online
async function syncTripData() {
  try {
    const pendingChanges = JSON.parse(localStorage.getItem('pendingTripChanges') || '[]');
    
    if (pendingChanges.length === 0) {
      return;
    }
    
    for (const change of pendingChanges) {
      // In a real app, sync with backend API
      console.log('Service Worker: Syncing trip change:', change.id);
    }
    
    localStorage.removeItem('pendingTripChanges');
    console.log('Service Worker: Trip data sync completed');
    
  } catch (error) {
    console.error('Service Worker: Trip data sync failed:', error);
  }
}

console.log('Service Worker: Loaded and ready');
