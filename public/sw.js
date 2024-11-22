// import socket from './js/utils/socket';

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
  '/Imgs/app-images/logo-72x72.png',
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

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'New Message';
  const options = {
    body: data.body,
    icon: data.icon,
    image: data.image,
    badge: data.badge || '/Imgs/app-images/logo-72x72.png',
    data: { contactId: data.contactId },
    // tag: data.tag || 'default-tag',
  };

  event.waitUntil(
    (async () => {
      const { isOnline } = await checkAppIsOpen();

      await self.registration.showNotification(title, options);

      if (!isOnline) {
        fetch(`/api/v1/chat/update/${data.sentBy}/delivered`);
        fetch(`/api/v1/socket/deliver-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sentBy: data.sentBy,
            receivedBy: data.receivedBy,
            chatData: data.chatData,
          }),
        });
      }
    })()
  );
});

async function checkAppIsOpen() {
  const allClients = await clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  const isOnline = allClients.length > 0;

  const appIsOpen = allClients.some(
    (client) => client.visibilityState === 'visible'
  );

  return { appIsOpen, isOnline };
}

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const contactId = event.notification?.data?.contactId;

  if (!contactId) {
    event.waitUntil(
      clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          if (clientList.length > 0) {
            return clientList[0].focus();
          } else {
            return clients.openWindow('/'); // Default to homepage
          }
        })
    );
  } else {
    event.waitUntil(
      clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          if (clientList.length > 0) {
            clientList[0].focus();
            clientList[0].postMessage({
              action: 'open_chat',
              contactId,
            });
            return;
          } else {
            clients.openWindow(`/?chats=${contactId}`);
            return;
          }
        })
    );
  }
});
