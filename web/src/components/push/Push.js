import { Component } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default class Push extends Component {
    
    componentDidMount() {
        window.Notification.requestPermission().then(perm => {
            if(perm === 'granted'){
                navigator.serviceWorker.getRegistration(`${process.env.PUBLIC_URL}/sw.js`).then(sw => {                    
                    fetch('/api/push')
                    .then(_response => _response.json())
                    .then(response => {
                        return response['key'];
                    })
                    .then(key => {
                        this.subscribePushManager(sw, key, false);
                    });
                });
            }
        });
    }

    async subscribePushManager(sw, key, twice) {
        var options = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(key)
        };
        
        await sw.pushManager.subscribe(options).then(() => {
            sw.pushManager.getSubscription().then(pms => {
                fetch('/api/push', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: localStorage.getItem('@notificc/access_token'),
                        subscription: pms
                    })
                })
                .catch(() => {
                    toast.error('Error while trying to save push details.');
                });
            });
        }).catch(err => {
            // Already registered, unregister and try again, last time
            if(err instanceof DOMException && twice === false){
                sw.pushManager.getSubscription().then(pms => {
                    pms.unsubscribe();
                }).then(() => {
                    this.subscribePushManager(sw, key, true);
                })
            }
        });
        
    }

    render() {
        return null;
    }
}
