import { addTimestampToMessage } from './utils.js';

(function () {
    'use strict';

    class BluetoothStreamService {
        constructor() {
            this.device = null;
            this.server = null;
            this._characteristics = new Map();
        }

        connect(deviceNamePrefix, serviceUuid) {
            let filters = [];
            let options = {};
            filters.push({ namePrefix: deviceNamePrefix });
            options.filters = filters;

            // Add required service UUIDs to optionalServices
            options.optionalServices = [serviceUuid];

            return navigator.bluetooth.requestDevice(options)
                .then(device => {
                    this.device = device;
                    return device.gatt.connect();
                })
                .then(server => {
                    console.log(addTimestampToMessage('Connected to device'))
                    this.server = server;
                })
                .catch(error => {
                    console.error(addTimestampToMessage('Error in connect(): ' + error));
                    throw error;
                });
        }

        subscribeToNotifications(serviceUuid, characteristicUuid) {
            return this.server.getPrimaryService(serviceUuid)
                .then(service => {
                    // Cache the characteristic for future use
                    return this._cacheCharacteristic(service, characteristicUuid);
                })
                .then(() => {
                    // Retrieve the cached characteristic
                    const characteristic = this._characteristics.get(characteristicUuid);

                    if (!characteristic) {
                        return Promise.reject(new Error(`Characteristic ${characteristicUuid} not found.`));
                    }

                    // Start notifications for the characteristic
                    return characteristic.startNotifications()
                        .then(() => {
                            console.log(addTimestampToMessage('Notifications started for characteristic: ' + characteristicUuid));
                            return characteristic;
                        });
                });
        }

        parseNotification(value) {
            // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
            value = value.buffer ? value : new DataView(value);
            let oneByteValue = value.getUint8(0);
            console.log(addTimestampToMessage('Notification value: ' + oneByteValue));

            return oneByteValue;
        }

        /* Utils */

        _cacheCharacteristic(service, characteristicUuid) {
            return service.getCharacteristic(characteristicUuid)
                .then(characteristic => {
                    this._characteristics.set(characteristicUuid, characteristic);
                });
        }
        _readCharacteristicValue(characteristicUuid) {
            let characteristic = this._characteristics.get(characteristicUuid);
            return characteristic.readValue()
                .then(value => {
                    // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
                    value = value.buffer ? value : new DataView(value);
                    return value;
                });
        }
        _writeCharacteristicValue(characteristicUuid, value) {
            let characteristic = this._characteristics.get(characteristicUuid);
            return characteristic.writeValue(value);
        }
        _startNotifications(characteristicUuid) {
            let characteristic = this._characteristics.get(characteristicUuid);
            // Returns characteristic to set up characteristicvaluechanged event
            // handlers in the resolved promise.
            return characteristic.startNotifications()
                .then(() => characteristic);
        }
        _stopNotifications(characteristicUuid) {
            let characteristic = this._characteristics.get(characteristicUuid);
            // Returns characteristic to remove characteristicvaluechanged event
            // handlers in the resolved promise.
            return characteristic.stopNotifications()
                .then(() => characteristic);
        }
    }

    window.bluetoothStreamService = new BluetoothStreamService();

})();