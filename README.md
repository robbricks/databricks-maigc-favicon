# URL Display Chrome Extension

A simple Chrome extension that displays the current tab's URL in a popup.

## Features
- Displays the current tab's URL in a popup
- Updates automatically when switching tabs
- Clean and simple interface

## Installation
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage
1. Click the extension icon in your Chrome toolbar
2. The popup will display the current tab's URL
3. The URL updates automatically when you switch tabs

## Development
The extension consists of the following files:
- `manifest.json`: Extension configuration
- `popup.html`: Popup interface
- `popup.js`: Handles URL display in popup
- `background.js`: Listens for tab updates

## Permissions
This extension requires the following permissions:
- `tabs`: To access tab information
- `activeTab`: To get the current tab's URL
