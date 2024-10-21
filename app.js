import { addTimestampToMessage } from './utils.js';

var canvas = document.querySelector('canvas');
var statusText = document.querySelector('#statusText');

// App-specific constants
const deviceNamePrefix = 'Motion'
const serviceUuid = 'a4de0101-a156-493c-83d8-845c40da5203';
const txCharacteristicUuid = 'a4de0102-a156-493c-83d8-845c40da5203';


statusText.addEventListener('click', function () {
    statusText.textContent = 'Breathe...';
    notifications = [];
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
            statusText.textContent = `Error: ${error}`;
        });

});

function handleNotification(notification) {
    notification.addEventListener('characteristicvaluechanged', event => {
        var notification = bluetoothStreamService.parseNotification(event.target.value);
        statusText.innerHTML = notification + ' &#x2764;';
        notifications.push(notification);
        drawWaves();
    });
}

function onDisconnected(event) {
    console.log(addTimestampToMessage('Disconnected from device'));
}

var notifications = [];
var mode = 'bar';

canvas.addEventListener('click', event => {
    mode = mode === 'bar' ? 'line' : 'bar';
    drawWaves();
});

function drawWaves() {
    requestAnimationFrame(() => {
        canvas.width = parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
        canvas.height = parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;

        var context = canvas.getContext('2d');
        var margin = 2;
        var max = Math.max(0, Math.round(canvas.width / 11));
        var offset = Math.max(0, notifications.length - max);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = '#00796B';
        if (mode === 'bar') {
            for (var i = 0; i < Math.max(notifications.length, max); i++) {
                var barHeight = Math.round(notifications[i + offset] * canvas.height / 200);
                context.rect(11 * i + margin, canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
                context.stroke();
            }
        } else if (mode === 'line') {
            context.beginPath();
            context.lineWidth = 6;
            context.lineJoin = 'round';
            context.shadowBlur = '1';
            context.shadowColor = '#333';
            context.shadowOffsetY = '1';
            for (var i = 0; i < Math.max(notifications.length, max); i++) {
                var lineHeight = Math.round(notifications[i + offset] * canvas.height / 200);
                if (i === 0) {
                    context.moveTo(11 * i, canvas.height - lineHeight);
                } else {
                    context.lineTo(11 * i, canvas.height - lineHeight);
                }
                context.stroke();
            }
        }
    });
}

window.onresize = drawWaves;

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        drawWaves();
    }
});