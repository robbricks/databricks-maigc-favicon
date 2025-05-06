# Custom Favicon Changer

A Chrome extension that changes the favicon of a webpage to green when the URL contains a user-defined keyword.

## Features
- Changes the favicon to green when the URL contains a user-defined keyword
- Simple and user-friendly interface

## Installation
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage
1. Click the extension icon in your Chrome toolbar
2. The extension will change the favicon to green if the URL contains the user-defined keyword

## Development
The extension consists of the following files:
- `manifest.json`: Extension configuration
- `popup.html`: Popup interface
- `popup.js`: Handles user interaction
- `content.js`: Changes the favicon based on URL
- `background.js`: Listens for tab updates

## Permissions
This extension requires the following permissions:
- `activeTab`: To access the current tab's URL
- `storage`: To store user-defined keywords
