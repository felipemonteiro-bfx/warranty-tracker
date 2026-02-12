/**
 * Service Worker - Notificações push disfarçadas de notícia (Sugestão 3)
 * Mostra push como "Nova Notícia" em vez de "Nova mensagem".
 */
self.addEventListener('push', function (event) {
  if (!event.data) return;
  let data = { title: 'Notícia em Tempo Real', body: '' };
  try {
    data = event.data.json();
  } catch (_) {
    data.body = event.data.text() || 'Atualização disponível.';
  }
  const title = data.title || 'Notícia em Tempo Real';
  const body = data.body || 'Toque para ver mais.';
  const url = data.url || '/';
  const options = {
    body,
    icon: '/window.svg',
    badge: '/window.svg',
    tag: 'stealth-news-' + Date.now(),
    requireInteraction: false,
    data: { url },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.indexOf(self.location.origin) === 0 && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
