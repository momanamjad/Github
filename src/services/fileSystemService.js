import { getStoredRepositories, updateRepository } from './storageService.js';

/**
 * Read the file tree for a repository. Always returns an array (empty if none).
 * @param {number} repoId
 * @returns {Array}
 */
export const getTree = (repoId) => {
  const repos = getStoredRepositories();
  const repo = repos.find(r => r.id === repoId);
  return repo?.fileTree || [];
};

/**
 * Persist an updated tree for a repository.
 * @param {number} repoId
 * @param {Array} tree
 * @returns {Array} the tree that was saved
 */
export const saveTree = (repoId, tree) => {
  const repos = getStoredRepositories();
  const updated = repos.map(r =>
    r.id === repoId ? { ...r, fileTree: tree } : r
  );
  localStorage.setItem('github_repositories', JSON.stringify(updated));
  return tree;
};

// recursive helpers ---------------------------------------------------------

function findNode(tree, targetPath) {
  for (const node of tree) {
    if (node.path === targetPath) return node;
    if (node.type === 'dir') {
      const inside = findNode(node.children, targetPath);
      if (inside) return inside;
    }
  }
  return null;
}

function addNodeToTree(tree, parentPath, newNode) {
  if (!parentPath || parentPath === '') {
    // add to root
    tree.push(newNode);
    return true;
  }
  for (const node of tree) {
    if (node.type === 'dir' && node.path === parentPath) {
      node.children.push(newNode);
      return true;
    }
    if (node.type === 'dir') {
      const added = addNodeToTree(node.children, parentPath, newNode);
      if (added) return true;
    }
  }
  return false;
}

function deleteNodeFromTree(tree, targetPath) {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.path === targetPath) {
      tree.splice(i, 1);
      return true;
    }
    if (node.type === 'dir') {
      const deleted = deleteNodeFromTree(node.children, targetPath);
      if (deleted) return true;
    }
  }
  return false;
}

// service methods ----------------------------------------------------------

/**
 * Add a file or directory node under a given parent path.
 * parentPath may be empty string or null to indicate root.
 */
export const addNode = (repoId, parentPath, newNode) => {
  const tree = getTree(repoId);
  // ensure no duplicate
  if (findNode(tree, newNode.path)) {
    throw new Error(`Path already exists: ${newNode.path}`);
  }
  addNodeToTree(tree, parentPath, newNode);
  saveTree(repoId, tree);
  return tree;
};

/**
 * Update a node's properties (rename or edit content)
 * newValues should contain fields to merge onto the node.
 */
export const updateNode = (repoId, path, newValues) => {
  const tree = getTree(repoId);
  const node = findNode(tree, path);
  if (!node) throw new Error(`Node not found: ${path}`);
  Object.assign(node, newValues);
  saveTree(repoId, tree);
  return tree;
};

/**
 * Delete a node (file or folder). Directories are removed recursively.
 */
export const deleteNode = (repoId, path) => {
  const tree = getTree(repoId);
  const removed = deleteNodeFromTree(tree, path);
  if (!removed) throw new Error(`Node not found: ${path}`);
  saveTree(repoId, tree);
  return tree;
};

/**
 * Move a node from one path to another (does not rename children).
 */
export const moveNode = (repoId, fromPath, toPath) => {
  const tree = getTree(repoId);
  const node = findNode(tree, fromPath);
  if (!node) throw new Error(`Source not found: ${fromPath}`);

  // remove from original location
  deleteNodeFromTree(tree, fromPath);

  // update path (and child paths if directory)
  const updatePaths = (n, base) => {
    n.path = n.path.replace(fromPath, toPath);
    if (n.type === 'dir') {
      n.children.forEach(child => updatePaths(child, base));
    }
  };
  updatePaths(node, toPath);

  addNodeToTree(tree, toPath.substring(0, toPath.lastIndexOf('/')), node);
  saveTree(repoId, tree);
  return tree;
};
