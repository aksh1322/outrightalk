if ('function' === typeof importScripts) {
    importScripts(
      'https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js'
    );
    /* global workbox */
    if (workbox) {
      console.log('Workbox is loaded');
   
      /* injection point for manifest files.  */
      workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
   
  /* custom cache rules*/
  workbox.routing.registerNavigationRoute('/index.html', {
        blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/],
      });
   
  workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|ico)$/,
    workbox.strategies.cacheFirst({
        cacheName: 'images',
        plugins: [
        new workbox.expiration.Plugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
        ],
    }));

    workbox.routing.registerRoute(
        /\.(?:js|css|json|html|xml)$/,
        workbox.strategies.cacheFirst({
            cacheName: 'assets',
            plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
            }),
            ],
        }));
    workbox.routing.registerRoute(
        /\/api\/v1/,
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'api-cache',
            plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [200],
                headers: {
                'X-Is-Cacheable': 'true',
                },
            })
            ]
        })
    );
    workbox.routing.registerRoute(
        /\.(?:eot|svg|ttf|woff)$/,
        workbox.strategies.cacheFirst({
            cacheName: 'fonts',
            plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
            }),
            ],
        }));
} else {
    console.log('Workbox could not be loaded. No Offline support');
}
}