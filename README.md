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
 Add a contents (or ileTree) property to the repo object.
2. **Persist the tree** with the rest of the repo data in localStorage (or a backend later).
3. **Expose APIs / services** for creating, reading, updating and deleting files/folders inside that tree.
4. **Update the UI** (RepoDetails, explorer components, file editor) to use the local tree instead of hitting the GitHub API.

### Suggested JSON structure for a repo's file system

`json
{
 id: 7,
 name: my-new-repo,
 description: ...,   
 // existing metadata …
 contents: [
 {
 type: dir,
 name: src,
 path: src,
 children: [
 {
 type: dir,
 name: components,
 path: src/components,
 children: [
 {
 type: file,
 name: App.jsx,
 path: src/components/App.jsx,
 content: // react code…
 }
 ]
 }
 ]
 },
 {
 type: file,
 name: README.md,
 path: README.md,
 content: # …
 }
 ]
}
`

Initially you can keep content as a simple string. Later you may want to model commits or versioning separately.

---

## 🔁 Recursion and tree manipulation

Files and folders naturally form a tree, and most operations are easiest to implement with recursion.

#### Adding a file or folder
Traverse the tree until you reach the target parent directory; once found, push the new node into its children array:

`js
function addNode(tree, parentPath, newNode) {
 for (const node of tree) {
 if (node.path === parentPath ; node.type === 'dir') {
 node.children = node.children ; [];
 node.children.push(newNode);
 return true;
 }
 if (node.type === 'dir' ; node.children) {
 const added = addNode(node.children, parentPath, newNode);
 if (added) return true;
 }
 }
 return false; // parent not found
}
`

Recursion is used again for deleting, renaming, or constructing a flat list of paths. For example, to delete a node:

`js
function deleteNode(tree, targetPath) {
 return tree.filter(node => {
 if (node.path === targetPath) return false;
 if (node.type === 'dir' ; node.children) {
 node.children = deleteNode(node.children, targetPath);
 }
 return true;
 });
}
`

When the user supplies a path with multiple segments (\src/components/ui\), split it and call the recursive helper segment‑by‑segment, creating intermediary directories on demand.

---

## 🧱 File System Simulation (core GitHub logic)

### What is it?
It means building a layer that behaves like a repository's file system: a mutable tree with operations such as create/delete/rename/move files and folders, and eventually the ability to commit/branch those changes.

### Is it a good approach?
**Yes, for a clone-style project.** It gives you a contained, testable domain where you can implement the features you care about without relying on GitHub's backend. This layer becomes the \source of truth\ for all in‑app repository actions.

Pros:
- Enables offline and demo mode – users can add files in your app without network requests.
- Mirrors GitHub UI patterns more closely; easier to add file editor, tree navigation, etc.
- Lays groundwork for future features: commits, pull requests, forking, etc.

Caveats:
- Complexity grows quickly once you add versioning/branches. If you don't need real git semantics, keep it simple (a JSON tree with timestamps).
- Storing large trees in localStorage is fine for small demos but not scalable. Plan to migrate to a real backend (Node/Express + database) if you outgrow it.
- You’re essentially re‑implementing parts of Git. Decide whether to simulate just the filesystem, or also diff/merge logic.

### Implementation tips
1. **Create a dedicated service** (ileSystemService.js or extend storageService). It should export high‑level functions: createRepoTree(repoId), ddFile(repoId, parentPath, name, content), 
eadFile(repoId, filePath), moveNode, deleteNode, etc.
2. **Persistence strategy**: either embed the tree inside the repo object (update ddRepository, updateRepository, etc.) or store it separately under a key like github_fs_. Using separate keys makes it easier to snapshot trees for commits.
3. **UI changes**: update NewRepoPage to initialize an empty tree, update RepoDetails to load from your local tree when the repo is owned by the local user, and add components for editing/creating files and folders.
4. **Testing and docs**: add unit tests for your recursive helpers and update documentation (see Docomentations/*) with instructions on the file system model.

---

## ✅ Next steps checklist
1. [ ] Design or extend the repo schema with contents/ileTree.
2. [ ] Implement recursion helpers for tree operations.
3. [ ] Persist the tree in localStorage (or backend).
4. [ ] Update new‑repo flow to create an initial tree.
5. [ ] Modify RepoDetails to read from the simulated file system and allow adding/editing.
6. [ ] Document the algorithm and service in Docomentations/, and update README accordingly.
7. [ ] Consider backend migration and Git semantics as longer‑term goals.

---

Keep building! With a file system layer in place you'll be well on your way to a full‑featured GitHub clone.
