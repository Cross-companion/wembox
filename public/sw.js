const version = 'v1';
const VAPID_PUBLIC_KEY =
  'BEupSbOpRl884f0QwBROp7SGWE--XMwcleVyMGKN7y0IGWd-xL3hOgFpWnQrEo5UJBLqWYFdOHT7mIwdUXH4E4Q';

const sw_caches = {
  assets: {
    name: `${version}assets`,
  },
  images: {
    name: `${version}images`,
    limit: 70,
  },
  pages: {
    name: `${version}pages`,
    limit: 10,
  },
};

const preinstall = [
  '/',
  '/Imgs/app-images/logo-30x30.png',
  '/CSS/style.css',
  '/js/utils/socket.io.js',
  '/js/controllers/appController.js',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(sw_caches.assets.name).then(async function (cache) {
      return cache.addAll(preinstall);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => {
              return !key.startsWith(version);
            })
            .map((key) => {
              return caches.delete(key);
            })
        );
      })
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', async (event) => {
  const destination = event.request.destination;
  // console.log(destination, event.request.url);
  // const res = await app_cache.match('/CSS/style.css');
  // console.log(res);
  // You can handle requests here
});

self.addEventListener('message', (messageEvent) => {
  if (messageEvent.data == 'clean up') {
    for (let key in sw_caches) {
      if (sw_caches[key].limit != undefined) {
        trimCache(sw_caches[key].name, sw_caches[key].limit);
      }
    }
  }
});

function trimCache(cache_name, limit) {
  caches.open(cache_name).then((cache) => {
    cache.keys().then((items) => {
      if (items.length > limit) {
        (async function () {
          let i = 0,
            end = items.length - limit;
          while (i < end) {
            console.log('deleting item', i, items[i]);
            cache.delete(items[i++]);
          }
        })();
      }
    });
  });
}

self.addEventListener('push', function (event) {
  console.log(self, self?.scope);
  console.log('////----/////');
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Default title';
  const options = {
    body: data.body || 'Default body',
    icon: data.icon || '/default-icon.png',
    // badge: data.badge || '/badge-icon.png',
    // tag: data.tag || 'default-tag',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('message', (event) => {
  if (event.data.action === 'subcribe_notifications') {
    subscribeNotification();
  }
});

function subscribeNotification() {
  self.registration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    })
    .then((subscription) => {
      fetch('/api/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    });
}
