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

### Rust Terminal CLI
* **Global Auth Session:** Persistent login token configuration mapped to home directories.
* **Dynamic Dir Scanning:** Safe, workspace-scoped directory inspection mapped to active folder paths.
* **Push Sync:** Automatically scans local files, respects ignores (`.git`, `node_modules`), and pushes updates to the server.
* **Pull Sync:** Connects to the database and reconstructs directories/files recursively onto local folders.

---

## 🚀 Quick Setup Guide

### 1. The Web Interface
1. Visit the hosted web app (or start it locally at `http://localhost:5173`).
2. Register a user account and sign in.
3. Click the **+ New** button to create a repository. If you plan to sync a local codebase, **uncheck "Add a README file"** to initialize it empty.

### 2. Setting Up the Rust CLI
To map files between your computer and the server:

1. **Download the CLI:**
   Go to the [CLI Releases Page](https://github.com/momanamjad/CLI/releases) and download the optimized `github-cli.exe` executable for Windows.
2. **Move the Binary:** Place `github-cli.exe` inside your target project directory (or add it to your system's Environment `PATH` to run it globally).
3. **Login in the terminal:**
   Open PowerShell/CMD in your folder and run:
   ```bash
   .\github-cli.exe login your-email@example.com yourpassword
   ```
4. **Link the Directory:**
   Copy your repository's ID from the Quick Setup screen in the browser and link it:
   ```bash
   .\github-cli.exe remote-link <repository_id>
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

---

## 🛠️ CLI Command Catalog

* `login <email> <pwd>` — Save authentication credentials to global configuration.
* `remote-link <repo_id>` — Link local directory to a server repository.
* `remote-create <name> [desc]` — Register a new repository on the server and link it locally.
* `remote-push` — Sync local files up to the web repository.
* `remote-pull` — Download and pull web repository changes to local disk.
* `stats` — Displays lines of code, file counts, and language breakdown.
* `deps` — Visualizes local dependencies inside a formatted table.
* `git-status` / `git-log` — Review local git status and commit streams.
* `secret-set <key> <val>` — Set or update encrypted repository secrets.
* `secret-list` — List the names of all registered secrets.
* `secret-delete <key>` — Delete a secret from the repository vault.
