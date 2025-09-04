# Shor Chats

A static web application for visualizing and exploring Mattermost chat exports in JSON format.

## 🚀 Live Demo

The application is automatically deployed to GitHub Pages: [View Live Demo](https://[your-username].github.io/[your-repo-name]/)

## 📋 Features

- **Chat Visualization**: View Mattermost JSON exports in a familiar chat interface
- **File Browser**: Easily navigate between different chat files
- **Search**: Find specific chats quickly
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Theme**: Optimized for comfortable viewing

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Deployment**: GitHub Pages with GitHub Actions
- **No dependencies**: Pure web technologies, no build process required

## 📁 Project Structure

```
├── web/                    # Main application directory
│   ├── index.html         # Main HTML file
│   ├── app.js             # Application logic
│   ├── styles.css         # Styling
│   └── data/              # JSON chat files and manifest
├── .github/workflows/     # GitHub Actions for deployment
└── README.md             # This file
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd [your-repo-name]
   ```

2. **Serve locally**
   ```bash
   cd web
   python -m http.server 8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

## 📦 Deployment

This project is configured for automatic deployment to GitHub Pages:

1. **Push to main branch** - triggers automatic deployment
2. **GitHub Actions** builds and deploys the `web/` directory
3. **Live site** available at your GitHub Pages URL

## 🔧 Adding New Chat Files

1. Add your JSON files to `web/data/`
2. Update `web/data/manifest.json` with the new filenames
3. Commit and push to deploy

## 🙏 Credits

Built by [Nicu Calcea](https://nicu.md/)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
