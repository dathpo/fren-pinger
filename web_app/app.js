import { addTimestampToMessage } from './utils.js';

var canvas = document.querySelector('canvas');
var statusText = document.querySelector('#statusText');
var clickCounter = 0;

// App-specific constants
const deviceNamePrefix = 'Clicker'
const serviceUuid = 'a4de0201-a156-493c-83d8-845c40da5203';
const txCharacteristicUuid = 'a4de0202-a156-493c-83d8-845c40da5203';


statusText.addEventListener('click', function () {
    notifications = [];
    bluetoothStreamService.connect(deviceNamePrefix, serviceUuid)
        .then(() => {
            // Add event listener for device disconnection
            bluetoothStreamService.device.addEventListener('gattserverdisconnected', onDisconnected);

            // Reset click counter
            statusText.textContent = 'Clicks: 0';

            // Subscribe to notifications
            return bluetoothStreamService.subscribeToNotifications(serviceUuid, txCharacteristicUuid);
        })
        .then(characteristic => {
            handleNotification(characteristic);
        })
        .catch(error => {
            if (error.name !== 'NotFoundError') {
                statusText.textContent = `Error: ${error}`;
            }
        });
});

function handleNotification(notification) {
    notification.addEventListener('characteristicvaluechanged', event => {
        var notification = bluetoothStreamService.parseNotification(event.target.value);
        statusText.innerHTML = notification + ' &#x2764;';
        notifications.push(notification);
        increaseClickCounter();
    });
}

function onDisconnected(event) {
    statusText.textContent = 'Disconnected';
    console.log(addTimestampToMessage('Disconnected from device'));
}

var notifications = [];

function increaseClickCounter() {
    clickCounter += 1;
    statusText.textContent = 'Clicks: ' + clickCounter.toString();
}
