# File Dispatcher GUI

**Category**: Desktop (Electron)

A cross-platform desktop application for organizing and managing files with AI-powered categorization and duplicate detection.

## Features (Planned)
- Drag-and-drop file organization
- AI-powered file categorization
- Duplicate file detection
- Large file finder
- Custom organization rules
- Batch rename with patterns
- Undo/redo support
- Preview pane

## Tech Stack
- Electron + React
- Workers AI for file categorization
- Native file system APIs
- xxhash for duplicate detection

## Getting Started

```bash
npm install
npm run dev        # Development mode
npm run build      # Build desktop app
```

## Downloads

Coming soon - releases for:
- Windows (.exe)
- macOS (.dmg)
- Linux (.AppImage, .deb)

## Project Structure

```
FDG/
├── src/
│   ├── main.js         # Electron main process
│   └── renderer/       # React frontend
├── public/
└── package.json
```

## License

MIT
