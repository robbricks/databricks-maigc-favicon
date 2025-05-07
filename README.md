# Don't Destroy Prod (✖╭╮✖)

A Chrome extension that helps prevent accidental changes to production environments by providing clear visual indicators of the current environment.

## Features

- **Environment Indicators**: Visual cues to identify the current environment:
  - Colored top bar
  - Custom favicon
  - Draggable environment watermark
- **Customizable Keywords**: Add your own keywords to match different environments
- **Color Coding**: Assign different colors to different environments
- **Dark Mode**: Toggle between light and dark themes
- **Easy Configuration**: Simple interface to manage all settings

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon to open the settings panel
2. Add keywords that match your environment URLs (e.g., "prod", "staging", "dev")
3. Assign colors and environment names to each keyword
4. Toggle features as needed:
   - Show Top Bar: Displays a colored bar at the top of the page
   - Enable Favicon Exchange: Changes the favicon color
   - Show Environment Watermark: Displays a draggable watermark

## Features in Detail

### Top Bar
A thin colored bar at the top of the page that indicates the current environment. The color matches your configured environment color.

### Favicon
The page favicon changes to match the environment color, making it easy to identify the environment even when the tab is not active.

### Environment Watermark
A draggable watermark that shows the current environment name. You can:
- Drag it anywhere on the page
- Toggle its visibility
- Customize its appearance

### Dark Mode
Toggle between light and dark themes for the extension popup. The setting persists across sessions.

## Configuration

### Adding Keywords
1. Click "Add Keyword" in the settings panel
2. Enter the keyword that appears in your environment URLs
3. Select a color for the environment
4. Choose the environment name (prod, staging, dev, test)

### Managing Settings
- Toggle features on/off using the switches
- Remove keywords using the X button
- Save changes using the "Save Settings" button

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have suggestions, please open an issue in the GitHub repository.

## Privacy

This extension:
- Does not collect any user data
- Does not track user behavior
- Only stores settings locally in your browser
- Does not communicate with any external servers

## Credits

Created with ❤️ to help prevent production accidents.
