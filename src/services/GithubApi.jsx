import { apiClient } from "./apiClient.js";
import {
  getStoredUser,
  getStoredRepositories,
  getStoredStarredRepos,
  getStoredPinnedRepos,
  getStoredRepoContents,
  initializeStorage,
} from "./storageService.js";
import { createUserData } from "./staticData.js";

// Ensure storage is initialized once (for fallback offline mode)
const storageReady = initializeStorage();

// Simulated delay for fallback mock data
const simulateDelay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// Authenticate / Login user
export const loginUser = async (email, password) => {
  const res = await apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (res?.data?.user) {
    localStorage.setItem("github_user", JSON.stringify(res.data.user));
  }
  return res.data;
};

// Register user
export const registerUser = async (login, email, password) => {
  const res = await apiClient("/auth/register", {
    method: "POST",
    body: JSON.stringify({ login, email, password }),
  });
  if (res?.data?.user) {
    localStorage.setItem("github_user", JSON.stringify(res.data.user));
  }
  return res.data;
};

// Pending requests cache for deduplication of concurrent requests
const pendingRequests = new Map();

// Get full user with repos and other associated data (deduplicated)
export const getUserWithRepos = async (username) => {
  if (pendingRequests.has(username)) {
    return pendingRequests.get(username);
  }
  const promise = apiClient(`/auth/user/${username}`)
    .then((res) => {
      pendingRequests.delete(username);
      return res;
    })
    .catch((err) => {
      pendingRequests.delete(username);
      throw err;
    });
  pendingRequests.set(username, promise);
  return promise;
};

// Get user profile
export const getUser = async (username) => {
  const res = await getUserWithRepos(username);
  return res?.data?.user ?? null;
};

// Get repositories
export const getRepos = async (username) => {
  const res = await getUserWithRepos(username);
  return res?.data?.repos || [];
};

// Get starred repositories
export const getStarredRepos = async (username) => {
  const res = await getUserWithRepos(username);
  return res?.data?.starredRepos || [];
};

// Get single repository details
export const getRepo = async (username, repoName) => {
  const res = await getUserWithRepos(username);
  const foundRepo = res?.data?.repos?.find(r => r.name.toLowerCase() === repoName.toLowerCase());
  if (foundRepo) {
    try {
      const detailRes = await apiClient(`/repos/${foundRepo._id || foundRepo.id}`);
      if (detailRes && detailRes.data) {
        return detailRes.data;
      }
    } catch (err) {
      console.error("Failed to fetch full repo details, using profile list data:", err);
    }
    return foundRepo;
  }
  throw new Error("Repo not found in user profile");
};

// Get repo contents
export const getRepoContents = async (user, repo, path = "") => {
  await storageReady;
  const contents = getStoredRepoContents(repo);
  if (!contents) {
    return [
      {
        name: "src",
        path: "src",
        type: "dir",
        html_url: `https://github.com/${user}/${repo}/tree/main/src`,
      },
      {
        name: "README.md",
        path: "README.md",
        type: "file",
        size: 2048,
        html_url: `https://github.com/${user}/${repo}/blob/main/README.md`,
      },
      {
        name: "package.json",
        path: "package.json",
        type: "file",
        size: 845,
        html_url: `https://github.com/${user}/${repo}/blob/main/package.json`,
      },
    ];
  }
  return contents;
};

// Get pinned repos
export const getPinnedRepos = async (username) => {
  const res = await getUserWithRepos(username);
  const pins = res?.data?.pins || [];
  return pins.map(pin => pin.repository).filter(Boolean);
};

// Create a new repository on the backend
export const createRepository = async (repoData) => {
  const res = await apiClient("/repos", {
    method: "POST",
    body: JSON.stringify(repoData),
  });
  return res.data;
};

// Toggle star on a repository
export const toggleStarRepo = async (repoId) => {
  const res = await apiClient(`/repos/${repoId}/star`, { method: "POST" });
  return res.data;
};

// Toggle pin on a repository
export const togglePinRepo = async (repoId) => {
  const res = await apiClient(`/repos/${repoId}/pin`, { method: "POST" });
  return res.data;
};

// Update repository (visibility, description, fileTree, etc.)
export const updateRepoApi = async (repoId, repoData) => {
  const res = await apiClient(`/repos/${repoId}`, {
    method: "PUT",
    body: JSON.stringify(repoData),
  });
  return res.data;
};

// Explore public repositories
export const getExploreRepos = async () => {
  const res = await apiClient("/repos/public/explore");
  return res?.data || [];
};

// Search repositories using query matching (including stars, forks, language, visibility)
export const searchReposApi = async (queryStr) => {
  const res = await apiClient(`/repos/search/query?q=${encodeURIComponent(queryStr)}`);
  return res?.data || [];
};

// Fetch user activity feed
export const getUserActivityFeed = async (page = 1, limit = 20, options = {}) => {
  const res = await apiClient(`/users/activity/feed?page=${page}&limit=${limit}`, options);
  return res?.data || { feed: [], total: 0 };
};

// Repository Wiki API wrapper functions
export const getWikiPages = async (repoId) => {
  const res = await apiClient(`/repos/${repoId}/wiki`);
  return res?.data || [];
};

export const getWikiPage = async (repoId, slug) => {
  const res = await apiClient(`/repos/${repoId}/wiki/${slug}`);
  return res?.data || null;
};

export const saveWikiPage = async (repoId, title, content) => {
  const res = await apiClient(`/repos/${repoId}/wiki`, {
    method: 'POST',
    body: JSON.stringify({ title, content })
  });
  return res?.data;
};

export const deleteWikiPage = async (repoId, slug) => {
  const res = await apiClient(`/repos/${repoId}/wiki/${slug}`, {
    method: 'DELETE'
  });
  return res?.data;
};

// Followers and Following API wrapper functions
export const getUserFollowers = async (userId, page = 1, limit = 10) => {
  const res = await apiClient(`/users/${userId}/followers?page=${page}&limit=${limit}`);
  return res || { data: [], pagination: { total: 0 } };
};

export const getUserFollowing = async (userId, page = 1, limit = 10) => {
  const res = await apiClient(`/users/${userId}/following?page=${page}&limit=${limit}`);
  return res || { data: [], pagination: { total: 0 } };
};

export const toggleFollowUser = async (userId) => {
  const res = await apiClient(`/users/${userId}/follow`, {
    method: 'POST'
  });
  return res?.data;
};

// PR Reviews API wrapper functions
export const submitPRReview = async (repoId, prId, state, body) => {
  const res = await apiClient(`/repos/${repoId}/pulls/${prId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ state, body })
  });
  return res?.data || [];
};

export const getPRReviews = async (repoId, prId) => {
  const res = await apiClient(`/repos/${repoId}/pulls/${prId}/reviews`);
  return res?.data || [];
};