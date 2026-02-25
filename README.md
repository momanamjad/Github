# GitHub Clone (React + Vite)

**GitHub Clone** is a front‑end prototype of the GitHub web interface built using React and Vite. It’s intended as a learning project and a sandbox where you can:

- browse user profiles,
- list repositories,
- create and modify repositories,
- pin/star repos,
- view repo details and file listings,
- simulate local storage of data without a backend,
- and progressively add features until it behaves like a miniature GitHub.

> This README covers the current state, how to run the project, architectural notes, a detailed plan for persisting repository file/folder trees, and guidance for turning it into a full‑featured platform.

## 🧩 What’s in the repository today

- **React components** under src/components (features, common UI pieces, layout).
- **Routing** configured in App.jsx via 
eact-router-dom.
- **Local data store** (storageService.js) that uses localStorage keys:
  - github_user
  - github_repositories
  - github_pinned_repositories
  - github_starred_repositories
- **Default data** seeded from src/services/userData.json.
- **New repository flow** (NewRepoPage.jsx) for adding metadata to storage.
- **Partial API integration**: repo metadata and contents are fetched from GitHub when viewing a real username.
- **Pinned/starred repos** feature.
- **Familiar pages**: Home, Explore, Issues, Pull Requests, etc. (static placeholders).
- **File listing** is currently pulled from GitHub for all repos; local repo contents are not stored.

## ✅ Existing capabilities

- Add, delete, and edit repository metadata in localStorage.
- Pin or star repositories.
- Browse a static sidebar menu with GitHub-like sections.
- View repository details including readme rendered via GitHub API.
- Create a new repository via a form with options (visibility, license, etc.).
- When looking at someone else’s real GitHub repos, the app uses the public API.

## 🔧 Next-step roadmap (to make it “perfect”)

To evolve this into a close approximation of https://github.com, focus on the following layers:

1. **Local file system & commits**
   - Persist folders/files for every local repo.
   - Add simple commit modelling and history.
   - Render a tree explorer and a markdown editor.

2. **Branches & cloning**
   - Allow creating/renaming branches and switching between them.
   - Support a “clone” / “fork” operation (duplicate repo with separate tree).

3. **Issue tracker & pull requests**
   - Implement a basic issues database (stored in localStorage or backend).
   - Enable creating, labeling, and commenting on issues.
   - Simulate pull requests with diff view and approval workflow.

4. **Authentication & multiple users**
   - Add a login screen (mock or OAuth with GitHub).
   - Separate data per user; enforce permissions.
   - Support user profiles, followers, and stars.

5. **Backend & persistent storage**
   - Move away from localStorage → use Node/Express + MongoDB/PostgreSQL.
   - Expose REST endpoints or GraphQL for all data.
   - Consider Git server integration (e.g. the isomorphic-git library) for real git operations.

6. **Notifications, activity feed, search**
   - Add notifications for issues/PRs.
   - Provide global repo search and user search.

7. **UI polish & performance**
   - Add pagination, lazy loading, and responsive design.
   - Add error states and loaders.
   - Write comprehensive unit/integration tests with Jest/React Testing Library.

## 📁 Persisting file/folder tree for local repos

To make repositories behave like real GitHub projects, each local repo needs a searchable/editable tree of files that is saved across page reloads.  Clicking any local repo now opens an in‑app file explorer:
### Step-by-step implementation

1. **Extend the data model**
   - When ddRepository() runs (in storageService.js), attach a ileTree property:
     `js
     const initialTree = [
       { type: 'file', name: 'README.md', path: 'README.md', content: # \n },
       { type: 'dir', name: 'src', path: 'src', children: [] }
     ];
     repoWithId.fileTree = initialTree;
     `
   - ileTree is an array of nodes. Node schema:
     `	s
     interface FileNode { type: 'file'; name: string; path: string; content: string; }
     interface DirNode { type: 'dir'; name: string; path: string; children: FileSystemNode[]; }
     type FileSystemNode = FileNode | DirNode;
     `   

     The application now includes a **FileExplorer** component that renders
     this tree with expand/collapse affordances and simple buttons for creating,
     renaming, and deleting nodes. Clicking a file opens it in the
     **FileEditor**, which lets you modify the `content` string and save
     changes back to storage via the `fileSystemService`.

2. **Create ileSystemService.js**
   - Located in src/services.
   - Responsible for reading/writing the tree and providing helper functions: 
   - Responsible for reading/writing the tree and providing helper functions:
     - getTree(repoId), saveTree(repoId, tree)
     - ddNode(repoId, parentPath, node)
     - updateNode(repoId, path, changes) (rename/file edit)
     - deleteNode(repoId, path) and moveNode(repoId, fromPath, toPath)
   - Use recursive helpers:
     `js
     function addNodeToTree(tree, parentPath, newNode) { /*...*/ }
     function deleteNodeFromTree(tree, targetPath) { /*...*/ }
     function findNode(tree, targetPath) { /*...*/ }
     `
   - Optionally implement a separate storage key (github_fs_{repoId}) for large repos.

3. **Update UI components**
   - NewRepoPage.jsx: nothing extra besides ensuring the new repo includes ileTree (handled by service).
   - RepoDetails.jsx: detect owned local repo → call getTree(repo.id) instead of GitHub API.
   - RepoFileList.jsx: render nested lists and open directories. Add buttons for create/rename/delete.
   - Additional components:
     - FileExplorer.jsx: tree view with expand/collapse.
     - FileEditor.jsx: textarea or markdown preview to edit file content.
     - CreateFileModal.jsx, RenameModal.jsx, etc.

4. **Persistence & behavior**
   - All tree modifications should update storage via ileSystemService and cause state updates.
   - When deleting a folder, remove children recursively.
   - Prevent duplicate paths and show warnings.

5. **Testing**
   - Unit tests for recursive helpers and service functions.
   - Integration tests simulating user flows: create repo → add file → edit → reload.

6. **Documentation**
   - Update Docomentations/ with a FILESYSTEM.md explaining the model and APIs.
   - Add examples of JSON stored in localStorage.

### Example of ileSystemService.js structure

`js
import { getStoredRepositories, updateRepository } from './storageService';

export const getTree = (repoId) => {
  const repos = getStoredRepositories();
  const repo = repos.find(r => r.id === repoId);
  return repo?.fileTree || [];
};

export const saveTree = (repoId, tree) => {
  const repos = getStoredRepositories();
  const updated = repos.map(r => 
    r.id === repoId ? { ...r, fileTree: tree } : r
  );
  localStorage.setItem('github_repositories', JSON.stringify(updated));
  return tree;
};

// ...addNode, updateNode, deleteNode functions using recursive helpers
`

### File/folder example

`
/
├── README.md
└── src/
    ├── index.js
    └── components/
        └── App.jsx
`

## 📦 Project setup

`ash
git clone <this-repo>
cd github
npm install
npm run dev
`

Open http://localhost:5173 in your browser. The app will automatically populate localStorage on first load.

## 🗂 Folder structure

`
src/
  components/        # React UI + feature modules
  contexts/
  hooks/
  layout/
  lib/               # utilities
  pages/
  services/          # localStorage API, future backend client
  utils/
  assets/
`

When you create a repository via the UI, its metadata and ileTree are saved under github_repositories in localStorage. A typical entry:

`json
{
  "id": 3,
  "name": "awesome-project",
  "owner": { "login": "momanamjad" },
  // ...
  "fileTree": [
    {
      "type": "dir",
      "name": "src",
      "path": "src",
      "children": []
    },
    {
      "type": "file",
      "name": "README.md",
      "path": "README.md",
      "content": "# awesome-project"
    }
  ]
}
`

(See Docomentations/FILESYSTEM.md for more details — create this file as part of the next step.)

## ⚡ Roadmap

1. Implement file system service and UI.
2. Add basic commit/branch simulation.
3. Integrate a lightweight backend.
4. Add issues/PRs and notifications.
5. Add authentication and multi-user support.
6. Perform performance tuning (pagination, lazy load).
7. Polish UI and add tests.

> The existing README already contains earlier notes. Continue iterating by following the checklist above and updating documentation accordingly.

### 🏗️ Immediate next operations

With the file tree feature in place and edits being saved, the very next
concrete tasks you can tackle are:

- **Commit history** – capture snapshots of `fileTree` on every save and
  display a basic log with messages and timestamps.
- **Branch support** – add an array of branch objects and let users switch
  between them; updating the tree to match the active branch.
- **Replace `window.prompt` dialogs** in `FileExplorer` with proper modal
  components (create/rename/delete) to improve UX.
- **Breadcrumb navigation & Go‑to‑file** – show current path and allow
  jumping around the tree quickly.
- **Validation/duplicate prevention** – better error messages when paths
  collide or names are invalid.
- **Unit/integration tests** for `fileSystemService` and explorer/editor
  components so future refactors stay safe.

Working on these operations will solidify the virtual filesystem and set
up the next larger layers (branches, commits, collaboration).  Pick a
small piece and ship it; the underlying service stays the same, so UI
can evolve independently.

## 🤝 Contributing

1. Fork the repository and create a branch.
2. Run 
pm install and 
pm run dev to test changes.
3. Add/modify tests; run 
pm run test once available.
4. Submit a pull request with detailed description and screenshots.

## 📜 License


