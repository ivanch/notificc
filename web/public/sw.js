/*
 * Service worker file
 */

/* eslint-disable-next-line no-restricted-globals */
self.addEventListener('push', function(event) {
    const body = JSON.parse(event.data.text());
    const options = {
        body: body['body'],
        'icon': '/favicon.ico',
    };
    /* eslint-disable-next-line no-restricted-globals */
    event.waitUntil(self.registration.showNotification(body['title'], options));
});