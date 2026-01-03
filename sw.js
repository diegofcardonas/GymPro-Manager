
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {
    title: 'GymPro Manager',
    body: 'Tienes una nueva actualización en tu cuenta.',
    icon: '/logo192.png'
  };

  const options = {
    body: data.body,
    icon: data.icon || 'https://ui-avatars.com/api/?name=Gym+Pro&background=0D8ABC&color=fff',
    badge: 'https://ui-avatars.com/api/?name=GP&background=0D8ABC&color=fff',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Ver ahora' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});
