import { addTimestampToMessage } from './utils.js';

var statusText = document.querySelector('#statusText');
var clickCounter = -1;

// App-specific constants
const deviceNamePrefix = 'Clicker'
const serviceUuid = 'a4de0201-a156-493c-83d8-845c40da5203';
const txCharacteristicUuid = 'a4de0202-a156-493c-83d8-845c40da5203';


statusText.addEventListener('click', function () {
	bluetoothStreamService.connect(deviceNamePrefix, serviceUuid)
		.then(() => {
			// Add event listener for device disconnection
			bluetoothStreamService.device.addEventListener('gattserverdisconnected', onDisconnected);

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
		increaseClickCounter(notification);
	});
}

function onDisconnected(event) {
	statusText.textContent = 'Disconnected';
	console.log(addTimestampToMessage('Disconnected from device'));
}

function increaseClickCounter(temperature) {
	clickCounter += 1;
	statusText.innerHTML = 'Clicks: ' + clickCounter.toString() + '<br>Temperature: ' + temperature.toString() + ' °C';
}
