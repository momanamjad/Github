# Filesystem Data Model

Local repositories now include a `fileTree` property that represents the
structure of folders and files in the project. This tree is stored in
`github_repositories` alongside the rest of the repo metadata and is
used by UI components that render folders, open files, and eventually
perform edits/commits.

## Node schema

```ts
interface FileNode {
  type: 'file';
  name: string;
  path: string;        // full path relative to repo root
  content: string;     // plain text (future: encoding, size, lastModified)
}

interface DirNode {
  type: 'dir';
  name: string;
  path: string;        // full path relative to repo root
  children: FileSystemNode[];
}

type FileSystemNode = FileNode | DirNode;
```

- `path` uniquely identifies the node and is used by helpers to traverse
the tree when adding, renaming, or deleting items.
- Only directories have the `children` array.
- Only files have the `content` string.

## Default structure for new repositories

When a repository is created via the UI (`addRepository()`), the
service attaches a minimal tree automatically:

```json
{
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
      "content": "# <repo-name>\n"
    }
  ]
}
```

The README file content includes the repository name. Components such as
`RepoFileList` or a future `FileExplorer` can safely call
`getTree(repoId)` and expect an array back even if the repo is empty.

## Backwards compatibility

Existing seeded repositories (from `userData.json`) are decorated with a
basic `fileTree` during `initializeStorage()` so that legacy data does
not break new UI.  The getter `getTree(repoId)` returns an empty array if
no tree is found, which is also safe.

## Future work

- Helpers to add/rename/delete/move nodes (see `fileSystemService.js`).
- Persist large trees in a separate storage key (`github_fs_{repoId}`).
- UI components for editing files and committing changes.
- Encoding detection, file size, last modified metadata.

This document should be referenced whenever the repository data model is
modified or when building tooling around the virtual filesystem.