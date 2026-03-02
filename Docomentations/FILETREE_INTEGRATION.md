# File Tree Integration & Persistence

This document explains in detail how the file tree feature was wired into
`RepoDetails.jsx` and how file edits are saved back into storage.  It
covers the service APIs, component structure, and the data flow that makes
"what I type in the editor stays there".

---

## 1. Data Model Recap

Every local repository object stored under the `github_repositories` key
now has a `fileTree` property.  It's an **array of nodes** where each node
is either a `FileNode` or a `DirNode`:

```ts
interface FileNode {
  type: 'file';
  name: string;
  path: string;        // full path relative to repo root
  content: string;     // plain text file contents
}

interface DirNode {
  type: 'dir';
  name: string;
  path: string;
  children: FileSystemNode[];
}

type FileSystemNode = FileNode | DirNode;
```

The `storageService.addRepository()` function attaches a minimal tree when a
new repo is created; `getStoredRepositories()` now patches old repos that
didn't have a tree.

---

## 2. filesystemService.js – API for manipulating the tree

Located at `src/services/fileSystemService.js`, this module exports helpers
used by the UI components:

* `getTree(repoId)` – returns the tree or `[]` if missing.                          
* `saveTree(repoId, tree)` – replaces the repo's `fileTree` and persists it.
* `addNode(repoId, parentPath, newNode)` – add a file or directory.
* `updateNode(repoId, path, newValues)` – merge new fields onto a node.
* `deleteNode(repoId, path)` – remove a node (recurses into children).
* `moveNode(repoId, fromPath, toPath)` – rename or relocate a node.

Under the hood there are recursive helpers that traverse the tree to find
or modify nodes.  All service functions call `saveTree` to persist changes
via `storageService.updateRepository`.

---

## 3. Rendering & interaction – RepoDetails.jsx

`RepoDetails` used to simply fetch from GitHub and show `RepoFileList`.  It
now detects whether the repository is **owned locally** by checking for a
`fileTree` property on the data returned by `getRepo`.

If a tree exists, the component:

1. Calls `getTree(repo.id)` to load the current structure into state.
2. Renders two new components side by side:
   * `<FileExplorer>` – shows the nested tree with controls.
   * `<FileEditor>` – opens a selected file in a textarea for editing.
3. Provides the explorer with callbacks:
   * `onSelect(node)` to receive click events when the user chooses a file.
   * `refreshTree()` which re‑reads the tree from storage after mutations.
4. Passes the selected file and a save handler to the editor.

Here is the relevant JSX snippet:

```jsx
{repoData?.fileTree ? (
  <div className="flex gap-8">
    <div className="w-1/3 bg-github-panel p-4 rounded">
      <FileExplorer
        repoId={repoData.id}
        tree={fileTree}
        onSelect={handleSelect}
        refreshTree={refreshTree}
      />
    </div>
    <div className="flex-1">
      {selectedFile ? (
        <FileEditor
          repoId={repoData.id}
          file={selectedFile}
          onSave={handleSaveFile}
        />
      ) : (
        <p className="p-4 text-github-muted">Select a file to view/edit</p>
      )}
    </div>
  </div>
) : (
  <RepoFileList files={files} />
)}
```

The `handleSaveFile` function simply updates the local copy of the selected
file so the UI reflects the saved content:

```jsx
const handleSaveFile = (path, newContent) => {
  if (selectedFile && selectedFile.path === path) {
    setSelectedFile({ ...selectedFile, content: newContent });
  }
};
```

(Note: the actual persistence happens inside `FileEditor` via
`updateNode`.)

---

## 4. Explorer & editor components

### FileExplorer.jsx

* Recursively renders directories and files.
* Toggles open state via an `openDirs` map in component state.
* Buttons use `window.prompt` for simplicity to create/rename nodes.
* Calls `addNode`, `moveNode`, and `deleteNode` from the service and then
  invokes `refreshTree()` to get the latest structure.

### FileEditor.jsx

* Takes `repoId` and a `file` object (with `path` and `content`).
* Holds editable `content` state, updates it on change.
* `onSave` handler writes back via `updateNode(repoId, file.path, {content})`
  and alerts the user.

A minimal implementation like this already provides a working CRUD
workflow; you can later replace prompts with proper modals.

---

## 5. Persisting user input

Because the editor uses `updateNode`, any change the user types is merged
into the corresponding file object in `localStorage`.  `storageService` will
serialize the entire repository list on each change, so the data survives
page reloads and even closing the browser.

Example localStorage entry after editing a file:

```json
{
  "id": 7,
  "name": "sample",
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
      "content": "# sample\nUpdated content here"
    }
  ],
  …
}
```

All operations are synchronous (since they interact with localStorage),
so the UI updates immediately.

---

## 6. Extending the system

This architecture makes it straightforward to add more features:

* Replace prompt dialogs with custom modal components.
* Add a breadcrumb bar showing the current directory path.
* Implement file search or drag‑and‑drop moves.
* Add commit objects that snapshot `fileTree` on each save.

Each UI enhancement can continue to call the same service functions,
keeping business logic decoupled from presentation.

---

With this step-by-step guide you should be able to understand exactly how
the file tree system plugs into the existing repo detail view and why
editing a file persists the changes.  Feel free to point back to this
file as you continue to expand the feature set.