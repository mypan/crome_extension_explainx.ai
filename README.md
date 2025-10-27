# Explainx - Webpage Summarizer Chrome Extension

An elegant Chrome extension that extracts and displays webpage content with a single click. Save, manage, and revisit your summaries with a beautiful, modern UI.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/react-18.2.0-61dafb)
![Webpack](https://img.shields.io/badge/webpack-5.75.0-8dd6f9)

## ✨ Features

- **🔘 Floating Button**: A beautiful circular button appears on the top-right of every webpage
- **📄 Content Extraction**: Automatically extracts and displays clean text content from webpages
- **💾 Save Summaries**: Save important page summaries for later reference
- **🔍 Search**: Easily search through your saved summaries
- **🎨 Modern UI**: Clean, shadcn-inspired design with smooth animations
- **📱 Responsive**: Works perfectly on all screen sizes
- **⚡ Fast**: Instant content extraction and display

## 🚀 Getting Started

### Installation for Development

1. **Clone the repository**
   ```bash
   cd chrome-boiler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `build` folder from this project

### Development Mode

For development with hot reloading:
```bash
npm start
```

## 📖 How to Use

### Creating a Summary

1. **Navigate to any webpage** you want to summarize
2. **Click the circular Explainx button** in the top-right corner of the page
3. **View the extracted content** in the dialog that appears
4. **Choose an action**:
   - **Save**: Store the summary for later
   - **Re-generate**: Extract the content again
   - **Discard**: Close without saving

### Managing Saved Summaries

1. **Click the extension icon** in Chrome's toolbar
2. **Browse your summaries** with:
   - Search functionality to find specific summaries
   - Click on titles to revisit the original webpage
   - Delete individual summaries
   - Clear all summaries at once

## 🛠️ Tech Stack

- **React 18**: Modern UI components
- **Webpack 5**: Module bundling
- **Chrome Extension Manifest V3**: Latest extension API
- **CSS3**: Custom styling with modern features
- **Chrome Storage API**: Persistent data storage

## 📁 Project Structure

```
chrome-boiler/
├── src/
│   ├── assets/
│   │   └── img/                 # Extension icons
│   ├── pages/
│   │   ├── Background/          # Background service worker
│   │   ├── Content/             # Content script & styles
│   │   │   ├── index.js         # Main content script logic
│   │   │   └── content.styles.css  # Injected styles
│   │   └── Popup/               # Extension popup
│   │       ├── Popup.jsx        # Popup React component
│   │       ├── Popup.css        # Popup styles
│   │       ├── index.html       # Popup HTML
│   │       └── index.jsx        # Popup entry point
│   └── manifest.json            # Extension manifest
├── utils/                       # Build utilities
├── webpack.config.js            # Webpack configuration
└── package.json                 # Dependencies & scripts
```

## 🎨 Features in Detail

### Content Extraction
- Intelligently removes ads, scripts, and navigation elements
- Cleans up whitespace and formatting
- Preserves readable text content
- Handles dynamic content

### Storage Management
- Stores up to 50 most recent summaries
- Each summary includes:
  - Page title
  - URL
  - Timestamp
  - Full content
  - Preview text (first 500 characters)

### UI/UX
- Smooth animations and transitions
- Hover effects and visual feedback
- Responsive design for all screen sizes
- Keyboard-friendly interactions
- Beautiful gradient color scheme

## 🔮 Future Enhancements

- **AI-Powered Summarization**: Integration with LLMs for intelligent summaries
- **Export Options**: Export summaries as PDF, Markdown, or text
- **Tags & Categories**: Organize summaries with custom tags
- **Cloud Sync**: Sync summaries across devices
- **Highlights**: Save and manage webpage highlights
- **Sharing**: Share summaries with others

## 📝 Scripts

- `npm run build` - Build the extension for production
- `npm start` - Start development server with hot reload
- `npm run prettier` - Format code with Prettier

## 🔧 Configuration

### Manifest Permissions
- `storage`: Save summaries locally
- `activeTab`: Access current page content

### Content Script Injection
- Runs on all HTTP/HTTPS pages
- Injects CSS automatically
- Non-intrusive design

## 🐛 Troubleshooting

### Extension not working?
1. Ensure you've loaded the `build` folder, not the project root
2. Check if the extension is enabled in `chrome://extensions/`
3. Reload the extension after making changes
4. Check the console for any errors

### Button not appearing?
1. Refresh the webpage after installing the extension
2. Check if the page is a restricted Chrome page (like chrome://)
3. Verify content script is injected in DevTools

### Summaries not saving?
1. Check Chrome storage permissions
2. Verify storage quota hasn't been exceeded
3. Check browser console for errors

## 📄 License

MIT License - feel free to use this project for learning or building your own extensions!

## 🤝 Contributing

Contributions are welcome! This is a boilerplate project designed to be extended and customized.

---

Built with ❤️ using React and Chrome Extension APIs
