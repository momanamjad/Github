# GitHub Clone (React + Vite)

This repository is a front‑end simulation of GitHub built with React and Vite. It already contains:

- UI components for browsing a user's repositories, viewing details, and listing files.
- A storageService that saves user and repo metadata in localStorage.
- A userData.json file with default data to populate storage.
- A " New Repository\ page (NewRepoPage.jsx) where users can add a repo object.
- Integration with the real GitHub REST API for repo details and contents when a live GitHub username is provided.

---

## 🔧 Where the project stands today

- Repositories are stored in localStorage under the key github_repositories.
- New repos pushed from the UI are appended to that list, but they contain only metadata (name, description, etc.).
- When viewing a repo, the app currently fetches getRepoContents from GitHub, not from local data.
- There is **no file/folder tree persisted for the repos you create locally**.

The sections below describe how to take the next steps toward a more complete, GitHub‑like experience.

---

## 🗂️ After a new repository is created

To make the \New Repository\ flow feel like a real GitHub platform you need to:

1. **Extend the repository model** to include a file system tree.
"""
# GitHub Clone — File System & New Repository Flow (Step-by-step)

This guide explains how to add a simulated repository file system so repositories created in the app behave like real GitHub repos (files, folders, create/edit/delete, and a persistence layer).

Goal: when a user creates a new repository in the app, the repo gets an editable file/folder tree that persists and is used by the UI instead of calling GitHub for contents.

Prerequisites
- Node + npm (project already uses Vite).
- Familiarity with React components in `src/components` and the current `storageService.js` and `userData.json` files.

Overview — high level steps
1. Extend the repository model to include a `fileTree` (or `contents`) property.
2. Implement a `fileSystemService` with recursive helpers for tree operations.
3. Persist the tree in `localStorage` (or separate keys) and wire it into `storageService`.
4. Update the UI (NewRepoPage, RepoDetails, file explorer, file editor) to use the simulated tree.
5. Add tests and documentation.

Detailed plan and examples

1) Schema: extend repository objects

Add a `fileTree` key to every repo created locally. Example minimal structure:

```json
{
	"id": 10,
	"name": "my-new-repo",
	"description": "...",
	"owner": { "login": "localUser", "id": 1 },
	"default_branch": "main",
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
			"content": "# My repo\n"
		}
	]
}
```

Notes:
- `path` is the full path relative to repo root.
- `children` exists only for directories.
- `content` is a plain string for files (later you can add metadata: encoding, size, lastModified).

2) fileSystemService — responsibilities and APIs

Create `src/services/fileSystemService.js` exporting pure functions that operate on a tree and persist changes.

Essential functions:
- `initRepoTree(repoId, initialTree)` — create and persist an empty or starter tree.
- `getTree(repoId)` — load tree from storage.
- `addNode(repoId, parentPath, node)` — add file or directory.
- `updateNode(repoId, path, changes)` — rename or change file content.
- `deleteNode(repoId, path)` — remove file or directory (recursively).
- `moveNode(repoId, fromPath, toParentPath)` — move node.

Recursive helpers (in-file examples)

addNode helper (returns true if added):

```js
function addNodeToTree(tree, parentPath, newNode) {
	for (const node of tree) {
		if (node.path === parentPath && node.type === 'dir') {
			node.children = node.children || [];
			node.children.push(newNode);
			return true;
		}
		if (node.type === 'dir' && node.children) {
			const added = addNodeToTree(node.children, parentPath, newNode);
			if (added) return true;
		}
	}
	return false;
}
```

deleteNode helper (returns new filtered tree):

```js
function deleteNodeFromTree(tree, targetPath) {
	return tree.filter(node => {
		if (node.path === targetPath) return false;
		if (node.type === 'dir' && node.children) {
			node.children = deleteNodeFromTree(node.children, targetPath);
		}
		return true;
	});
}
```

findNode helper (returns node or null):

```js
function findNode(tree, targetPath) {
	for (const node of tree) {
		if (node.path === targetPath) return node;
		if (node.type === 'dir' && node.children) {
			const found = findNode(node.children, targetPath);
			if (found) return found;
		}
	}
	return null;
}
```

3) Persistence: where and how to store trees

Options:
- Embed `fileTree` inside the repo object stored under `github_repositories` (simpler).
- Store tree separately under `github_fs_${repoId}` (better for snapshotting and commits).

Recommendation: start by embedding the tree inside the repository object to minimize refactors. If you plan to support commits/snapshots, switch to separate keys later.

How to wire into `storageService.js`:
- When `addRepository()` creates a new repo, set `fileTree` to an initial array (empty or with README and src).
- Provide `getRepoTree(repoId)` and `saveRepoTree(repoId, tree)` helper wrappers in `storageService` (or delegate to `fileSystemService`).

Example: initialize in `addRepository`:

```js
const initialTree = [
	{ type: 'file', name: 'README.md', path: 'README.md', content: `# ${newRepo.name}\n` },
	{ type: 'dir', name: 'src', path: 'src', children: [] }
];
repoWithId.fileTree = initialTree;
```

4) UI: reading and editing the tree

Changes required:
- `NewRepoPage.jsx`: after creating repo metadata, ensure the repo includes `fileTree` (use `addRepository`).
- `RepoDetails.jsx`: when showing a repo that is owned by the local user, prefer `getRepoTree(repoId)` (or from repo object) instead of `getRepoContents` from the external API.
- `RepoFileList.jsx`: update to render nested directories and expand/collapse children.
- Add `FileExplorer` component to navigate directories and select files.
- Add `FileEditor` or reuse existing editor component to view/edit `content`.
- Add modals/components for: create file/folder, rename, move, delete, and commit (optional).

Simple RepoDetails flow example:

1. Load `repo` metadata via existing logic.
2. If `repo.owner.login === localUser.login` OR repo has `fileTree`, call `getRepoTree(repo.id)` and pass it to `RepoFileList`.
3. Wire file actions to `fileSystemService` which will persist changes and return updated tree.

5) Example operation: creating a file

- UI calls `fileSystemService.addNode(repoId, parentPath, { type: 'file', name, path, content })`.
- Service loads tree, runs `addNodeToTree`, persists updated tree and returns it.
- UI updates state and re-renders.

6) Edge cases and behavior

- Path collisions: prevent creating a file with the same `path`.
- Moving directories: ensure children paths update to reflect new parent.
- Deleting directories: delete recursively and confirm destructive actions in UI.
- Large content: consider storing only summary in localStorage and full contents in separate DB when scaling.

7) Tests and documentation

- Unit test recursive helpers (`addNodeToTree`, `deleteNodeFromTree`, `findNode`) using Jest.
- Integration tests for `fileSystemService` (simulate adding, renaming, moving).
- Update `Docomentations/ADD_REPOSITORY_TUTORIAL.md` and add a new `Docomentations/FILESYSTEM.md` describing the model and APIs.

8) Migration to a backend (optional future step)

- Create an API (Node/Express) to store repo trees in a database (MongoDB or PostgreSQL).
- Keep the same service API surface (`getTree`, `addNode`, `updateNode`) but call the backend for persistence.
- Add authentication to prevent cross-user modifications.

Performance & scaling notes
- localStorage is limited (~5–10MB depending on the browser) — fine for demos, not for real projects.
- For large trees, paginate directory listings and lazy-load file contents.
- Normalize tree for large datasets (store nodes in a map and keep parent/child references) if you need performance.

Security
- Ensure only the repository owner (local user) can modify the embedded tree.
- Sanitize file content if you ever render markdown/HTML to avoid XSS.

Next steps checklist (concrete)
1. Create `src/services/fileSystemService.js` with `getTree/addNode/updateNode/deleteNode/moveNode` and unit tests.
2. Update `storageService.addRepository()` to initialize `fileTree` for new repos.
3. Update `NewRepoPage.jsx` to include required fields and call `addRepository`.
4. Modify `RepoDetails.jsx` to prefer local `fileTree` for owned repos.
5. Implement `FileExplorer` and `FileEditor` components; wire actions to service APIs.
6. Add docs in `Docomentations/FILESYSTEM.md` and example JSON samples.

If you want, I can scaffold `src/services/fileSystemService.js` now and update `storageService.addRepository()` to initialize `fileTree` automatically. Which would you like me to do next?

"""
