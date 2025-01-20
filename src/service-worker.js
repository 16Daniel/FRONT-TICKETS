// Evento de instalación
self.addEventListener('install', event => {
    console.log('Service Worker instalado.');
});

// Evento para manejar notificaciones push
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Título por defecto';
    const options = {
        body: data.body || 'Cuerpo del mensaje.',
        icon: data.icon || 'assets/icons/icon-192x192.png',
        badge: data.badge || 'assets/icons/icon-72x72.png',
        data: { urlt: 'tickets/y'}
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Evento para manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
    const urlToOpen = event.notification.data?.urlt;
    event.notification.close();
    event.waitUntil(
        clients.openWindow(urlToOpen) // Cambia por la URL de tu aplicación
    );
});