# Rubis Snip Browser Extension

<div align="center">
  <strong>Right-click. Paste. Share.</strong>
  <p>A browser extension that makes sharing text snippets fast and simple</p>
</div>

## 🚀 Features

- **One-click sharing**: Right-click on any selected text and choose "Save to Rubis"
- **Instant clipboard copy**: Share links are automatically copied to your clipboard
- **Privacy controls**: Choose between public and private snippets
- **Custom access**: Create custom access and owner keys for better security
- **Title customization**: Add descriptive titles to your shared content
- **Format support**: Works with plain text, markdown, and code snippets

## 📋 Installation

### Development Mode

1. Clone this repository: `git clone https://github.com/qrexpy/RubisSnip.git`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top right
4. Click "Load unpacked" and select the extension folder
5. The Rubis Snip extension should now be installed and ready to use

## 🔧 How to Use

1. Select any text on a webpage
2. Right-click and select "Save to Rubis" from the context menu
3. The text will be uploaded to Rubis and the share link will be copied to your clipboard
4. Paste the link anywhere to share your snippet with others

## ⚙️ Settings

Click on the Rubis Snip icon in your browser toolbar to access settings:

| Setting | Description |
|---------|-------------|
| **Default Title** | Set a default title for your scraps (optional) |
| **Privacy** | Choose between public or private scraps |
| **Access Key** | For private scraps, set a custom access key |
| **Owner Key** | Set a custom key to manage your scraps later |
| **Remember Keys** | Remember the owner key of your last created scrap |

## 🔌 API Integration

This extension integrates with the Rubis API v2:

- **API Endpoint**: `https://api.rubis.app/v2/scrap`
- **No API Key Required**: Freely use the service without authentication
- **Privacy Options**: Create public or private scraps with optional access keys
- **Content Management**: Owner keys allow editing/deleting scraps later

## 💻 Development

### Project Structure

```
rubis-snip/
├── manifest.json          # Extension configuration
├── src/
│   ├── css/               # Stylesheets
│   │   └── settings.css   # Settings UI styles
│   ├── icons/             # Extension icons
│   ├── js/                # JavaScript files
│   │   ├── background.js  # Background script for API & context menu
│   │   └── content.js     # Content script for notifications
│   └── popup/             # Settings popup
│       ├── settings.html  # Settings UI
│       └── settings.js    # Settings logic
```

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## 🙏 Credits

Created for use with the [Rubis API](https://rubis.app/)