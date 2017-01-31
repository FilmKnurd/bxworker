self.addEventListener('install', function(event) {
	console.log('Installing Service Worker');
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
 	event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
	broadcast('[Service Worker] Push Received.');
	broadcast('[Service Worker] Push had this data: ' + event.data.text());

	var title = 'BX Pusher';
	var options = {
		body: 'Yay it works.',
		icon: 'images/icon.png',
		badge: 'images/badge.png'
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationClick', function(event) {
	broadcast('[Service Worker] Notification click Received.');

  	event.notification.close();
});

function broadcast(message) {
	clients.matchAll().then(function(clients) {
		clients.forEach(function(client) {
			send_message(client, message).then(function(m) {
				console.log(m);
			});
		});
	});
}

function send_message(client, message) {
	return new Promise( function(resolve, reject) {
        var channel = new MessageChannel();

        channel.port1.onmessage = function(event) {
            if (event.data.error){
                reject(event.data.error);
            }else {
                resolve(event.data);
            }
        };

        client.postMessage(message, [channel.port2]);
    });
}