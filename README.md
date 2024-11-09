# Web Bluetooth Clicker

A simple Web Bluetooth application combined with OTA-capable firmware that streams button press notifications to a connected device. This project showcases a web app that connects via Bluetooth to the firmware-enabled device, counts each button click, and displays the tally in real-time.

## Features

- **Web Bluetooth Connectivity**: Easily connect the web app to a compatible Bluetooth device.
- **Click Counter**: Each button press on the device is streamed as a notification, and the web app displays an updated click count.
- **OTA-Capable Firmware**: The firmware allows for over-the-air updates, making it easy to add improvements.

## Demo

![Demo of Web Bluetooth Clicker](docs/images/demo.gif)

## Getting Started

### Prerequisites

- A Bluetooth-enabled device with the provided firmware installed.
- A compatible web browser with Web Bluetooth API support (e.g., Chrome).

### Installation

1. Clone this repository.
1. Open index.html in a Web Bluetooth-compatible browser.
1. Load the OTA-capable firmware on your Bluetooth device.

### Usage

1. Open the web app in your browser.
1. Click the "Connect" button and select your Bluetooth device.
1. Start pressing the button on the device. Each click will be counted and displayed on the web app.
