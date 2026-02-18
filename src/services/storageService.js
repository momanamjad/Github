// localStorage Service for managing user data
// This service handles all localStorage operations for the GitHub Clone app

const STORAGE_KEYS = {
  USER: 'github_user',
  REPOSITORIES: 'github_repositories',
  PINNED_REPOS: 'github_pinned_repositories',
  STARRED_REPOS: 'github_starred_repositories',
};

/**
 * Initialize localStorage with default user data
 * This should be called once when the app loads
 */
export const initializeStorage = async () => {
  try {
    const existingUser = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (!existingUser) {
      const userData = await import('./userData.json');
      
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData.user));
      localStorage.setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify(userData.repositories));
      localStorage.setItem(STORAGE_KEYS.PINNED_REPOS, JSON.stringify(userData.pinnedRepositories));
      localStorage.setItem(STORAGE_KEYS.STARRED_REPOS, JSON.stringify(userData.starredRepositories));
      
      console.log('✅ localStorage initialized with default data');
      return true;
    }
    
    console.log('✅ localStorage already contains data');
    return true;
  } catch (error) {
    console.error('❌ Error initializing localStorage:', error);
    return false;
  }
};

/**
 * Get user profile from localStorage
 * @returns {Object} User profile object
 */
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
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
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    console.log('✅ User data updated in localStorage');
    return true;
  } catch (error) {
    console.error('Error updating user in storage:', error);
    return false;
  }
};

/**
 * Get all repositories from localStorage
 * @returns {Array} Array of repository objects
 */
export const getStoredRepositories = () => {
  try {
    const repos = localStorage.getItem(STORAGE_KEYS.REPOSITORIES);
    return repos ? JSON.parse(repos) : [];
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
    
    // Generate unique ID for the new repo
    const newId = repos.length > 0 ? Math.max(...repos.map(r => r.id)) + 1 : 1;
    
    const repoWithId = {
      ...newRepo,
      id: newId,
      node_id: `R_kgDOGrJ_${String.fromCharCode(65 + newId)}g`,
      owner: {
        login: getStoredUser().login,
        id: getStoredUser().id,
        avatar_url: getStoredUser().avatar_url,
        type: "User"
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pushed_at: new Date().toISOString(),
      visibility: 'public',
    };
    
    repos.push(repoWithId);
    localStorage.setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify(repos));
    
    console.log(`✅ Repository "${newRepo.name}" added to localStorage`);
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
    
    localStorage.setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify(filteredRepos));
    console.log(`✅ Repository with ID ${repoId} deleted from localStorage`);
    
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
      repo.id === repoId ? { ...repo, ...updatedData, updated_at: new Date().toISOString() } : repo
    );
    
    localStorage.setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify(updatedRepos));
    console.log(`✅ Repository with ID ${repoId} updated in localStorage`);
    
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
    const pinnedRepos = localStorage.getItem(STORAGE_KEYS.PINNED_REPOS);
    return pinnedRepos ? JSON.parse(pinnedRepos) : [];
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
      console.log(`Repository "${repo.name}" is already pinned`);
      return pinnedRepos;
    }
    
    const pinnedRepo = {
      name: repo.name,
      author: repo.owner.login,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
      languageColor: "#f1e05a", // Default color, can be updated
      visibility: repo.visibility,
      url: repo.html_url,
    };
    
    pinnedRepos.push(pinnedRepo);
    localStorage.setItem(STORAGE_KEYS.PINNED_REPOS, JSON.stringify(pinnedRepos));
    console.log(`✅ Repository "${repo.name}" pinned`);
    
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
    
    localStorage.setItem(STORAGE_KEYS.PINNED_REPOS, JSON.stringify(filteredRepos));
    console.log(`✅ Repository "${repoName}" unpinned`);
    
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
    const starredRepos = localStorage.getItem(STORAGE_KEYS.STARRED_REPOS);
    return starredRepos ? JSON.parse(starredRepos) : [];
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
      console.log(`Repository "${repo.name}" is already starred`);
      return starredRepos;
    }
    
    starredRepos.push(repo);
    localStorage.setItem(STORAGE_KEYS.STARRED_REPOS, JSON.stringify(starredRepos));
    console.log(`✅ Repository "${repo.name}" starred`);
    
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
    
    localStorage.setItem(STORAGE_KEYS.STARRED_REPOS, JSON.stringify(filteredRepos));
    console.log(`✅ Repository "${repoFullName}" unstarred`);
    
    return filteredRepos;
  } catch (error) {
    console.error('Error unstarring repository:', error);
    return getStoredStarredRepos();
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
    });
    console.log('✅ All localStorage data cleared');
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
