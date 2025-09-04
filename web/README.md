# Shor Chats - Mattermost JSON Visualizer

A static web application for visualizing and exploring Mattermost chat exports in JSON format.

## Features

- 📂 Browse through multiple chat files
- 💬 Chat-like interface for viewing conversations
- 🔍 Search functionality for finding specific chats
- 📱 Responsive design for mobile and desktop
- 🌙 Dark theme optimized for readability

## Live Demo

Visit the live application: [Your GitHub Pages URL will be here]

## How it Works

This application loads JSON files containing Mattermost chat exports and renders them in an intuitive chat interface. Each JSON file represents a channel or conversation with messages, timestamps, and user information.

## Local Development

To run locally:

```bash
# Clone the repository
git clone [your-repo-url]
cd [your-repo-name]

# Serve the web directory
cd web
python -m http.server 8000
# or
npx serve .
```

Then open http://localhost:8000 in your browser.

## Built With

- Vanilla HTML, CSS, and JavaScript
- No external dependencies
- Optimized for GitHub Pages deployment

---

Built by [Nicu Calcea](https://nicu.md/)
