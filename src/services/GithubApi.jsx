import { apiClient } from "./apiClient.js";
import {
  getStoredRepoContents,
  initializeStorage,
} from "./storageService.js";

// Ensure storage is initialized once (for fallback offline mode)
const storageReady = initializeStorage();

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

import { queryClient } from '../lib/queryClient';
import {
  queryKeys,
  fetchUserWithRepos,
  fetchRepo,
  prefetchUserQuery,
  prefetchRepoQuery,
} from '../hooks/useQueries';

// One-time cleanup of legacy localStorage/sessionStorage cache keys
if (typeof window !== 'undefined') {
  try {
    ['localStorage', 'sessionStorage'].forEach((type) => {
      const storage = window[type];
      if (!storage) return;
      for (let i = storage.length - 1; i >= 0; i--) {
        const k = storage.key(i);
        if (k && (k.startsWith('gh_profile_') || k.startsWith('gh_repo_') || k === 'gh_repo_lru_order')) {
          storage.removeItem(k);
        }
      }
    });
  } catch {}
}

// Synchronous cache reader helpers (0ms latency, RAM-powered via TanStack Query)
export const getCachedUserWithRepos = (username) => {
  if (!username) return null;
  return queryClient.getQueryData(queryKeys.user(username)) ?? null;
};

export const getCachedUser = (username) => {
  const data = getCachedUserWithRepos(username);
  return data?.data?.user ?? data?.user ?? null;
};

export const getCachedRepos = (username) => {
  const data = getCachedUserWithRepos(username);
  return data?.data?.repos ?? data?.repos ?? null;
};

export const getCachedRepo = (username, repoName) => {
  if (!username || !repoName) return null;
  return queryClient.getQueryData(queryKeys.repo(username, repoName)) ?? null;
};

export const invalidateUserCache = (username) => {
  if (username) {
    queryClient.invalidateQueries({ queryKey: queryKeys.user(username) });
  } else {
    queryClient.clear();
  }
};

export const clearClientCache = () => {
  queryClient.clear();
};

// Get full user with repos and other associated data (TanStack Query managed, in-memory)
export const getUserWithRepos = async (username, forceFresh = false) => {
  if (!username) return null;
  if (forceFresh) {
    return queryClient.fetchQuery({
      queryKey: queryKeys.user(username),
      queryFn: () => fetchUserWithRepos(username),
    });
  }
  return queryClient.ensureQueryData({
    queryKey: queryKeys.user(username),
    queryFn: () => fetchUserWithRepos(username),
  });
};

// Prefetch helper for instant onHover clicks (TanStack Query prefetch)
export const prefetchUser = (username) => {
  if (!username) return;
  prefetchUserQuery(username);
};

export const prefetchRepo = (username, repoName) => {
  if (!username || !repoName) return;
  prefetchRepoQuery(username, repoName);
};

// Get user profile
export const getUser = async (username) => {
  const res = await getUserWithRepos(username);
  return res?.data?.user ?? res?.user ?? null;
};

// Get repositories
export const getRepos = async (username) => {
  const res = await getUserWithRepos(username);
  return res?.data?.repos ?? res?.repos ?? [];
};

// Get starred repositories
export const getStarredRepos = async (username) => {
  const res = await getUserWithRepos(username);
  return res?.data?.starredRepos ?? res?.starredRepos ?? [];
};

// Get single repository details (TanStack Query managed, in-memory)
export const getRepo = async (username, repoName, forceFresh = false) => {
  if (!username || !repoName) return null;
  if (forceFresh) {
    return queryClient.fetchQuery({
      queryKey: queryKeys.repo(username, repoName),
      queryFn: () => fetchRepo(username, repoName),
    });
  }
  return queryClient.ensureQueryData({
    queryKey: queryKeys.repo(username, repoName),
    queryFn: () => fetchRepo(username, repoName),
  });
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