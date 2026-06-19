
const STORAGE_KEYS = {
  USER: 'github_user',
  REPOSITORIES: 'github_repositories',
  PINNED_REPOS: 'github_pinned_repositories',
  STARRED_REPOS: 'github_starred_repositories',
  REPO_CONTENTS: 'github_repository_contents',
};

// ─── In-Memory Cache ──────────────────────────────────────────────
// JSON.parse on every read is expensive (especially for large repo
// arrays).  The cache stores the last-parsed value and the raw JSON
// string that produced it, so we only re-parse when localStorage has
// actually changed (e.g. from another tab).
const _cache = {};

function readCached(key) {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;

  // If the raw string hasn't changed, return the cached object
  if (_cache[key] && _cache[key].raw === raw) {
    return _cache[key].parsed;
  }

  try {
    const parsed = JSON.parse(raw);
    _cache[key] = { raw, parsed };
    return parsed;
  } catch {
    return null;
  }
}

function writeCached(key, value) {
  const raw = JSON.stringify(value);
  localStorage.setItem(key, raw);
  _cache[key] = { raw, parsed: value };
}

// ─── Initialization ───────────────────────────────────────────────
let _initPromise = null;   // Ensures we only initialize once

export const initializeStorage = () => {
  if (_initPromise) return _initPromise;
  _initPromise = Promise.resolve(true);
  return _initPromise;
};

/**
 * Get user profile from localStorage
 * @returns {Object} User profile object 
 */
export const getStoredUser = () => {
  try {
    return readCached(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error retrieving user from storage:', error);
    return null;
  }
};

/**
 * Update user profile in localStorage
 * @param {Object} userData - Updated user data
 */
export const updateStoredUser = (userData) => {
  try {
    writeCached(STORAGE_KEYS.USER, userData);
    return true;
  } catch (error) {
    console.error('Error updating user in storage:', error);
    return false;
  }
};

/**
 * Get user status from localStorage
 * @returns {Object} { emoji, text, isBusy }
 */
export const getStoredStatus = () => {
  try {
    const user = getStoredUser();
    return user?.status || { emoji: '', text: '', isBusy: false };
  } catch (error) {
    console.error('Error retrieving status from storage:', error);
    return { emoji: '', text: '', isBusy: false };
  }
};

/**
 * Update user status in localStorage
 * @param {Object} status - { emoji, text, isBusy }
 */
export const updateStoredStatus = (status) => {
  try {
    const user = getStoredUser();
    if (user) {
      const updatedUser = { ...user, status };
      updateStoredUser(updatedUser);
      // Dispatch custom event for cross-component sync
      window.dispatchEvent(new CustomEvent('github_status_updated', { detail: status }));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating status in storage:', error);
    return false;
  }
};

/**
 * Get all repositories from localStorage
 * @returns {Array} Array of repository objects
 */
export const getStoredRepositories = () => {
  try {
    // fileTree patching is handled at init time — this is a clean read-only path.
    return readCached(STORAGE_KEYS.REPOSITORIES) || [];
  } catch (error) {
    console.error('Error retrieving repositories from storage:', error);
    return [];
  }
};

/**
 * Add a new repository to localStorage
 * @param {Object} newRepo - New repository object to add
 * @returns {Array} Updated repositories array
 */
export const addRepository = (newRepo) => {
  try {
    const repos = getStoredRepositories();
    const user = getStoredUser();

    // Check if repository already exists (case-insensitive)
    const exists = repos.some(r => r.name.toLowerCase() === newRepo.name.toLowerCase());
    if (exists) {
      throw new Error(`The repository "${newRepo.name}" already exists on this account.`);
    }

    // Use incrementing numeric ID for compatibility, but a UUID for node_id
    const newId = repos.length > 0 ? Math.max(...repos.map(r => r.id)) + 1 : 1;

    const repoWithId = {
      ...newRepo,
      id: newId,
      node_id: crypto.randomUUID(),
      full_name: `${user?.login}/${newRepo.name}`,
      owner: {
        login: user?.login,
        id: user?.id,
        avatar_url: user?.avatar_url,
        type: 'User'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pushed_at:  new Date().toISOString(),
      visibility: 'public',
      fileTree: [
        { type: 'dir',  name: 'src',       path: 'src',       children: [] },
        { type: 'file', name: 'README.md', path: 'README.md', content: `# ${newRepo.name}\n` }
      ]
    };

    repos.push(repoWithId);
    writeCached(STORAGE_KEYS.REPOSITORIES, repos);
    return repos;
  } catch (error) {
    console.error('Error adding repository to storage:', error);
    return getStoredRepositories();
  }
};

/**
 * Delete a repository from localStorage
 * @param {number} repoId - ID of the repository to delete
 * @returns {Array} Updated repositories array
 */
export const deleteRepository = (repoId) => {
  try {
    const repos = getStoredRepositories();
    const filteredRepos = repos.filter(repo => repo.id !== repoId);

    writeCached(STORAGE_KEYS.REPOSITORIES, filteredRepos);

    return filteredRepos;
  } catch (error) {
    console.error('Error deleting repository from storage:', error);
    return getStoredRepositories();
  }
};

/**
 * Update a repository in localStorage
 * @param {number} repoId - ID of the repository to update
 * @param {Object} updatedData - Updated repository data
 * @returns {Array} Updated repositories array
 */
export const updateRepository = (repoId, updatedData) => {
  try {
    const repos = getStoredRepositories();
    const updatedRepos = repos.map(repo =>
      (repo.id === repoId || repo._id === repoId) ? { ...repo, ...updatedData, updated_at: new Date().toISOString() } : repo
    );

    writeCached(STORAGE_KEYS.REPOSITORIES, updatedRepos);

    // Sync fileTree updates to the backend DB if logged in
    const user = localStorage.getItem("github_user");
    if (user) {
      const targetRepo = updatedRepos.find(r => r.id === repoId || r._id === repoId);
      if (targetRepo && targetRepo._id) {
        import("./GithubApi.jsx").then(({ updateRepoApi }) => {
          updateRepoApi(targetRepo._id, { fileTree: targetRepo.fileTree }).catch(err => {
            console.error("Failed to sync fileTree update to backend database:", err);
          });
        });
      }
    }

    return updatedRepos;
  } catch (error) {
    console.error('Error updating repository in storage:', error);
    return getStoredRepositories();
  }
};

/**
 * Get pinned repositories from localStorage
 * @returns {Array} Array of pinned repository objects
 */
export const getStoredPinnedRepos = () => {
  try {
    return readCached(STORAGE_KEYS.PINNED_REPOS) || [];
  } catch (error) {
    console.error('Error retrieving pinned repos from storage:', error);
    return [];
  }
};

/**
 * Add a repository to pinned list
 * @param {Object} repo - Repository to pin
 * @returns {Array} Updated pinned repositories array
 */
export const pinRepository = (repo) => {
  try {
    const pinnedRepos = getStoredPinnedRepos();

    // Check if already pinned
    if (pinnedRepos.some(r => r.name === repo.name)) {
      return pinnedRepos;
    }

    const pinnedRepo = {
      name: repo.name,
      author: repo.owner.login,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
      languageColor: "#f1e05a",
      visibility: repo.visibility,
      url: repo.html_url,
    };

    pinnedRepos.push(pinnedRepo);
    writeCached(STORAGE_KEYS.PINNED_REPOS, pinnedRepos);

    return pinnedRepos;
  } catch (error) {
    console.error('Error pinning repository:', error);
    return getStoredPinnedRepos();
  }
};

/**
 * Remove a repository from pinned list
 * @param {string} repoName - Name of the repository to unpin
 * @returns {Array} Updated pinned repositories array
 */
export const unpinRepository = (repoName) => {
  try {
    const pinnedRepos = getStoredPinnedRepos();
    const filteredRepos = pinnedRepos.filter(repo => repo.name !== repoName);

    writeCached(STORAGE_KEYS.PINNED_REPOS, filteredRepos);

    return filteredRepos;
  } catch (error) {
    console.error('Error unpinning repository:', error);
    return getStoredPinnedRepos();
  }
};

/**
 * Get starred repositories from localStorage
 * @returns {Array} Array of starred repository objects
 */
export const getStoredStarredRepos = () => {
  try {
    return readCached(STORAGE_KEYS.STARRED_REPOS) || [];
  } catch (error) {
    console.error('Error retrieving starred repos from storage:', error);
    return [];
  }
};

/**
 * Add a repository to starred list
 * @param {Object} repo - Repository to star
 * @returns {Array} Updated starred repositories array
 */
export const starRepository = (repo) => {
  try {
    const starredRepos = getStoredStarredRepos();

    // Check if already starred
    if (starredRepos.some(r => r.full_name === repo.full_name)) {
      return starredRepos;
    }

    starredRepos.push(repo);
    writeCached(STORAGE_KEYS.STARRED_REPOS, starredRepos);

    // Also update the stargazers_count in the main repositories list
    const repos = getStoredRepositories();
    const updatedRepos = repos.map(r => 
      r.full_name === repo.full_name 
        ? { ...r, stargazers_count: (r.stargazers_count || 0) + 1 }
        : r
    );
    writeCached(STORAGE_KEYS.REPOSITORIES, updatedRepos);

    return starredRepos;
  } catch (error) {
    console.error('Error starring repository:', error);
    return getStoredStarredRepos();
  }
};

/**
 * Remove a repository from starred list
 * @param {string} repoFullName - Full name (owner/repo) of the repository to unstar
 * @returns {Array} Updated starred repositories array
 */
export const unstarRepository = (repoFullName) => {
  try {
    const starredRepos = getStoredStarredRepos();
    const filteredRepos = starredRepos.filter(repo => repo.full_name !== repoFullName);

    writeCached(STORAGE_KEYS.STARRED_REPOS, filteredRepos);

    // Also update the stargazers_count in the main repositories list
    const repos = getStoredRepositories();
    const updatedRepos = repos.map(r => 
      r.full_name === repoFullName 
        ? { ...r, stargazers_count: Math.max(0, (r.stargazers_count || 0) - 1) }
        : r
    );
    writeCached(STORAGE_KEYS.REPOSITORIES, updatedRepos);

    return filteredRepos;
  } catch (error) {
    console.error('Error unstarring repository:', error);
    return getStoredStarredRepos();
  }
};

/**
 * Get repository contents from localStorage
 * @param {string} repoName 
 */
export const getStoredRepoContents = (repoName) => {
  try {
    const allContents = readCached(STORAGE_KEYS.REPO_CONTENTS) || {};
    return allContents[repoName] || null;
  } catch (error) {
    console.error('Error retrieving repo contents:', error);
    return null;
  }
};

/**
 * Clear all data from localStorage
 * Useful for testing or resetting the app
 */
export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      delete _cache[key];
    });
    localStorage.removeItem('github_token');
    // Reset init promise so next mount re-seeds from JSON
    _initPromise = null;
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

/**
 * Get storage statistics
 * Shows what data is stored
 */
export const getStorageStats = () => {
  try {
    const user = getStoredUser();
    const repos = getStoredRepositories();
    const pinnedRepos = getStoredPinnedRepos();
    const starredRepos = getStoredStarredRepos();

    return {
      user: user ? user.login : 'No user',
      totalRepositories: repos.length,
      pinnedRepositories: pinnedRepos.length,
      starredRepositories: starredRepos.length,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return null;
  }
};
