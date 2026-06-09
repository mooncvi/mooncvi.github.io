/*
=========================================
AOI Optical Calculator V7
Service Worker
=========================================
*/

const CACHE_NAME = 'aoi-optics-v7-cache-v1';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

/*
=========================================
INSTALL
=========================================
*/
self.addEventListener('install', event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );

    self.skipWaiting();

});

/*
=========================================
ACTIVATE
=========================================
*/
self.addEventListener('activate', event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if (key !== CACHE_NAME) {

                            console.log(
                                '[SW] Delete Old Cache:',
                                key
                            );

                            return caches.delete(key);

                        }

                    })

                );

            })

    );

    self.clients.claim();

});

/*
=========================================
FETCH
=========================================
*/
self.addEventListener('fetch', event => {

    const request = event.request;

    /*
    HTML
    Network First
    */

    if (request.mode === 'navigate') {

        event.respondWith(

            fetch(request)
                .then(response => {

                    const clone = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(request, clone);
                        });

                    return response;

                })
                .catch(() => {

                    return caches.match(request)
                        .then(cacheResponse => {

                            return (
                                cacheResponse ||
                                caches.match('./index.html')
                            );

                        });

                })

        );

        return;

    }

    /*
    CSS JS Image
    Cache First
    */

    event.respondWith(

        caches.match(request)
            .then(cacheResponse => {

                if (cacheResponse) {
                    return cacheResponse;
                }

                return fetch(request)
                    .then(networkResponse => {

                        if (
                            request.method === 'GET'
                        ) {

                            const clone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        clone
                                    );

                                });

                        }

                        return networkResponse;

                    });

            })

    );

});
