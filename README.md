# GitHub Clone with Rust CLI Sync

A production-ready, full-featured clone of `github.com` built with modern React (Frontend), Node/Express (Backend), and a custom Rust terminal command-line tool (CLI) for bidirectional workspace synchronization.

---

## 🌟 Key Features

### Web Client
* **Complete Workspace Management:** View repository codebases, commit histories, tag collections, and multiple branches.
* **Kanban Projects Board:** Drag-and-drop task cards across *To Do*, *In Progress*, and *Done* states.
* **GitHub Actions Emulator:** Trigger builds and test runs to watch deployment execution logs in a terminal console.
* **Secrets Vault:** Save production tokens securely using encrypted, write-only AES-256-cbc database management.
* **Issue Templates & Filtering:** Structure bug reports or feature requests using Markdown outlines and query lists via colored badges.
* **Avatar Uploads & WS Notifications:** Customize user profile icons using local uploads and receive instant notification alerts powered by Socket.io.
* **Optimized Rendering & Bundles:** Split context hooks (Auth, Repos, UI) preventing redraw cascades, lazy routes wrapping, custom caching with PWA caching, and theme toggling hooks.

---

## 🚀 Quick Setup & Build Guide

### Frontend Development
To run the frontend client locally:
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Run the hot-reloading development server:
   ```bash
   npm run dev
   ```

### Production Build & PWA Testing
To compile the optimized bundle with split chunk modules, custom assets inlining, and offline PWA service worker configurations:
1. Compile the production assets:
   ```bash
   npm run build
   ```
2. Preview the compiled production build locally:
   ```bash
   npm run preview
   ```

---

## 🔄 Bidirectional Synchronization

Once linked, use these commands in your local directory to sync work:

### Push local files to Web Client
Scans your local files (respecting ignores like `target` and `node_modules`) and updates the remote file tree:
```bash
.\github-cli.exe remote-push
```

### Pull remote web files to computer
Downloads files modified in the browser editor and writes/structures them into your local folders:
```bash
.\github-cli.exe remote-pull
```

