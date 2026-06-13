import { getStoredRepositories, updateRepository } from './storageService.js';
import { apiClient } from './apiClient.js';

// Helper to determine if the repoId is a backend MongoDB ObjectId
const isBackendRepo = (repoId) => {
  return typeof repoId === 'string' && /^[0-9a-fA-F]{24}$/.test(repoId);
};

/**
 * Read the file tree for a repository.
 */
export const getTree = async (repoId) => {
  if (isBackendRepo(repoId)) {
    try {
      const res = await apiClient(`/repos/${repoId}/contents`);
      return res.data || [];
    } catch (err) {
      console.error('Error fetching tree from backend, falling back to local storage:', err);
    }
  }
  const repos = getStoredRepositories();
  const repo = repos.find(r => r.id === repoId || r._id === repoId);
  return repo?.fileTree || [];
};

/**
 * Persist an updated tree for a repository (local storage fallback only).
 */
export const saveTree = (repoId, tree) => {
  updateRepository(repoId, { fileTree: tree });
  return tree;
};

// recursive helpers for local storage ---------------------------------------------------------
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
 */
export const addNode = async (repoId, parentPath, newNode) => {
  if (isBackendRepo(repoId)) {
    const res = await apiClient(`/repos/${repoId}/contents`, {
      method: 'POST',
      body: JSON.stringify({
        name: newNode.name,
        path: newNode.path,
        type: newNode.type,
        content: newNode.content || '',
        parentPath: parentPath || ''
      })
    });
    return res.data;
  }

  const tree = await getTree(repoId);
  if (findNode(tree, newNode.path)) {
    throw new Error(`Path already exists: ${newNode.path}`);
  }
  addNodeToTree(tree, parentPath, newNode);
  saveTree(repoId, tree);
  return tree;
};

/**
 * Update a node's properties (rename or edit content)
 */
export const updateNode = async (repoId, path, newValues) => {
  if (isBackendRepo(repoId)) {
    const res = await apiClient(`/repos/${repoId}/contents`, {
      method: 'PUT',
      body: JSON.stringify({
        oldPath: path,
        name: newValues.name,
        path: newValues.path,
        content: newValues.content
      })
    });
    return res.data;
  }

  const tree = await getTree(repoId);
  const node = findNode(tree, path);
  if (!node) throw new Error(`Node not found: ${path}`);
  Object.assign(node, newValues);
  saveTree(repoId, tree);
  return tree;
};

/**
 * Delete a node (file or folder).
 */
export const deleteNode = async (repoId, path) => {
  if (isBackendRepo(repoId)) {
    const res = await apiClient(`/repos/${repoId}/contents`, {
      method: 'DELETE',
      body: JSON.stringify({ path })
    });
    return res.data;
  }

  const tree = await getTree(repoId);
  const removed = deleteNodeFromTree(tree, path);
  if (!removed) throw new Error(`Node not found: ${path}`);
  saveTree(repoId, tree);
  return tree;
};

/**
 * Move/rename a node.
 */
export const moveNode = async (repoId, fromPath, toPath) => {
  if (isBackendRepo(repoId)) {
    const res = await apiClient(`/repos/${repoId}/contents`, {
      method: 'PUT',
      body: JSON.stringify({
        oldPath: fromPath,
        path: toPath,
        name: toPath.split('/').pop()
      })
    });
    return res.data;
  }

  const tree = await getTree(repoId);
  const node = findNode(tree, fromPath);
  if (!node) throw new Error(`Source not found: ${fromPath}`);

  deleteNodeFromTree(tree, fromPath);

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
