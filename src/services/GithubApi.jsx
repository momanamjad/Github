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

// Persistent client cache with Stale-While-Revalidate (SWR) support
const PROFILE_STORAGE_PREFIX = 'gh_profile_';
const REPO_STORAGE_PREFIX = 'gh_repo_';
const profileCache = new Map();
const repoCache = new Map();
const pendingRequests = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds fresh TTL

// Storage helpers
const readPersisted = (prefix, key) => {
  try {
    const raw = localStorage.getItem(prefix + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writePersisted = (prefix, key, data, timestamp) => {
  try {
    localStorage.setItem(prefix + key, JSON.stringify({ data, timestamp }));
  } catch (e) {
    // Silently continue if quota exceeded
  }
};

// Synchronous cache reader helpers (0ms latency)
export const getCachedUserWithRepos = (username) => {
  if (!username) return null;
  const key = username.toLowerCase();
  let entry = profileCache.get(key);
  if (!entry) {
    const persisted = readPersisted(PROFILE_STORAGE_PREFIX, key);
    if (persisted && persisted.data) {
      profileCache.set(key, persisted);
      entry = persisted;
    }
  }
  return entry ? entry.data : null;
};

export const getCachedUser = (username) => {
  const data = getCachedUserWithRepos(username);
  return data?.data?.user ?? null;
};

export const getCachedRepos = (username) => {
  const data = getCachedUserWithRepos(username);
  return data?.data?.repos ?? null;
};

export const getCachedRepo = (username, repoName) => {
  if (!username || !repoName) return null;
  const key = `${username.toLowerCase()}/${repoName.toLowerCase()}`;
  let entry = repoCache.get(key);
  if (!entry) {
    const persisted = readPersisted(REPO_STORAGE_PREFIX, key);
    if (persisted && persisted.data) {
      repoCache.set(key, persisted);
      entry = persisted;
    }
  }
  return entry ? entry.data : null;
};

export const invalidateUserCache = (username) => {
  if (username) {
    const key = username.toLowerCase();
    profileCache.delete(key);
    pendingRequests.delete(key);
    try {
      localStorage.removeItem(PROFILE_STORAGE_PREFIX + key);
    } catch {}
  } else {
    profileCache.clear();
    repoCache.clear();
    pendingRequests.clear();
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith(PROFILE_STORAGE_PREFIX) || k.startsWith(REPO_STORAGE_PREFIX))) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
  }
};

// Get full user with repos and other associated data (SWR cached & deduplicated)
export const getUserWithRepos = async (username, forceFresh = false) => {
  if (!username) return null;
  const key = username.toLowerCase();

  // Check in-memory or persisted cache
  let entry = profileCache.get(key);
  if (!entry) {
    const persisted = readPersisted(PROFILE_STORAGE_PREFIX, key);
    if (persisted && persisted.data) {
      profileCache.set(key, persisted);
      entry = persisted;
    }
  }

  // If cached, return immediately (0ms) and revalidate in background if stale
  if (!forceFresh && entry) {
    const isFresh = (Date.now() - entry.timestamp) < CACHE_TTL;
    if (isFresh) {
      return entry.data;
    }
    // Stale-While-Revalidate in background
    if (!pendingRequests.has(key)) {
      const bgPromise = apiClient(`/auth/user/${username}`)
        .then((res) => {
          const timestamp = Date.now();
          profileCache.set(key, { data: res, timestamp });
          writePersisted(PROFILE_STORAGE_PREFIX, key, res, timestamp);
          pendingRequests.delete(key);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('github_profile_revalidated', { detail: { username: key } }));
          }
          return res;
        })
        .catch(() => {
          pendingRequests.delete(key);
        });
      pendingRequests.set(key, bgPromise);
    }
    return entry.data;
  }

  // Deduplicate concurrent in-flight requests
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = apiClient(`/auth/user/${username}`)
    .then((res) => {
      const timestamp = Date.now();
      profileCache.set(key, { data: res, timestamp });
      writePersisted(PROFILE_STORAGE_PREFIX, key, res, timestamp);
      pendingRequests.delete(key);
      return res;
    })
    .catch((err) => {
      pendingRequests.delete(key);
      throw err;
    });
  pendingRequests.set(key, promise);
  return promise;
};

// Prefetch helper for instant onHover clicks
export const prefetchUser = (username) => {
  if (!username) return;
  const key = username.toLowerCase();
  if (!profileCache.has(key) && !pendingRequests.has(key)) {
    getUserWithRepos(username).catch(() => {});
  }
};

export const prefetchRepo = (username, repoName) => {
  if (!username || !repoName) return;
  const key = `${username.toLowerCase()}/${repoName.toLowerCase()}`;
  if (!repoCache.has(key)) {
    getRepo(username, repoName).catch(() => {});
  }
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

// Get single repository details (with SWR caching)
export const getRepo = async (username, repoName, forceFresh = false) => {
  if (!username || !repoName) return null;
  const key = `${username.toLowerCase()}/${repoName.toLowerCase()}`;

  // Check cache first
  let cachedEntry = repoCache.get(key);
  if (!cachedEntry) {
    const persisted = readPersisted(REPO_STORAGE_PREFIX, key);
    if (persisted && persisted.data) {
      repoCache.set(key, persisted);
      cachedEntry = persisted;
    }
  }

  if (!forceFresh && cachedEntry) {
    const isFresh = (Date.now() - cachedEntry.timestamp) < CACHE_TTL;
    if (isFresh) {
      return cachedEntry.data;
    }
  }

  // Direct fast lookup via indexed endpoint
  try {
    const detailRes = await apiClient(`/repos/owner/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}`);
    if (detailRes && detailRes.data) {
      const timestamp = Date.now();
      repoCache.set(key, { data: detailRes.data, timestamp });
      writePersisted(REPO_STORAGE_PREFIX, key, detailRes.data, timestamp);
      return detailRes.data;
    }
  } catch (err) {
    // If direct lookup fails or 404s, fall back to checking user profile
  }

  if (cachedEntry) {
    return cachedEntry.data;
  }

  const res = await getUserWithRepos(username);
  const foundRepo = res?.data?.repos?.find(r => r.name.toLowerCase() === repoName.toLowerCase());
  if (foundRepo) {
    try {
      const detailRes = await apiClient(`/repos/${foundRepo._id || foundRepo.id}`);
      if (detailRes && detailRes.data) {
        const timestamp = Date.now();
        repoCache.set(key, { data: detailRes.data, timestamp });
        writePersisted(REPO_STORAGE_PREFIX, key, detailRes.data, timestamp);
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
  invalidateUserCache();
  return res.data;
};

// Toggle star on a repository
export const toggleStarRepo = async (repoId) => {
  const res = await apiClient(`/repos/${repoId}/star`, { method: "POST" });
  invalidateUserCache();
  return res.data;
};

// Toggle pin on a repository
export const togglePinRepo = async (repoId) => {
  const res = await apiClient(`/repos/${repoId}/pin`, { method: "POST" });
  invalidateUserCache();
  return res.data;
};

// Update repository (visibility, description, fileTree, etc.)
export const updateRepoApi = async (repoId, repoData) => {
  const res = await apiClient(`/repos/${repoId}`, {
    method: "PUT",
    body: JSON.stringify(repoData),
  });
  invalidateUserCache();
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