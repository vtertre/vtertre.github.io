const currentCache = 'vincenttertre-v2';
const filesToCache = [
  '/',
  '/robots.txt',
  '/manifest.json',
  '/assets/app/app.css',
  '/assets/app/app.js',
  '/assets/image/avatar.jpg',
  '/assets/image/favicon.ico',
  '/assets/icons/android-chrome-192x192.png',
  '/assets/icons/android-chrome-512x512.png'
];
const maxAgeRegExp = new RegExp(/max-age=(\d+)/);
const defaultExpirationInSeconds = 600;

self.addEventListener('install', event => event.waitUntil(
  caches.open(currentCache).then(cache => cache.addAll(filesToCache))
));

self.addEventListener('activate', event => {
  event.waitUntil(async function () {
    const keys = await caches.keys();
    return Promise.all(
      keys.map(key => {
        if (currentCache !== key) {
          return caches.delete(key);
        }
      })
    )
  }());
});

self.addEventListener('fetch', event => {
  event.respondWith(async function () {
    const cacheResponse = await caches.match(event.request);
    if (cacheResponse) {
      if (isExpired(cacheResponse)) {
        const refreshRequest = buildRefreshRequest(event.request, cacheResponse);
        try {
          const networkResponse = await fetch(refreshRequest);
          if (networkResponse.status === 304) {
            const result = cacheResponse.clone();
            renew(cacheResponse).then(renewedResponse => addToCache(refreshRequest, renewedResponse));
            return result;
          } else {
            const result = networkResponse.clone();
            addToCache(refreshRequest, networkResponse);
            return result;
          }
        } catch (error) {
          return cacheResponse;
        }
      }
      return cacheResponse;
    }
    return fetch(event.request);
  }());
});

function isExpired(cachedResponse) {
  const headers = cachedResponse.headers;
  if (headers.has('cache-control') && headers.has('date')) {
    const maxAge = headers.get('cache-control').match(maxAgeRegExp);
    const effectiveMaxAge = parseInt(maxAge ? maxAge[1] * 1000 : 0, 10);
    const cachedResponseDate = new Date(headers.get('date')).getTime();
    const now = new Date().getTime();
    return now - cachedResponseDate > effectiveMaxAge;
  }

  if (headers.has('expires')) {
    const expirationDate = new Date(headers.get('expires')).getTime();
    const now = new Date().getTime();
    return now > expirationDate;
  }
  return true;
}

async function renew(response) {
  const maxAge = response.headers.get('cache-control').match(maxAgeRegExp);
  const effectiveMaxAge = parseInt(maxAge ? maxAge[1] : defaultExpirationInSeconds, 10);
  const now = new Date();
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  headers.date = now.toUTCString();
  headers.expires = new Date(now.getTime() + effectiveMaxAge * 1000).toUTCString();
  const body = await response.blob();
  return new Response(body, { headers: headers });
}

async function addToCache(request, response) {
  const cache = await caches.open(currentCache);
  return cache.put(request, response);
}

function buildRefreshRequest(request, cachedResponse) {
  let headers;
  if (cachedResponse.headers.has('etag')) {
    headers = { 'if-none-match': cachedResponse.headers.get('etag') };
  } else {
    headers = {};
  }
  return new Request(request.url, { headers: headers });
}
