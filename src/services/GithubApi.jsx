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
  if (res?.data?.token) {
    localStorage.setItem("github_token", res.data.token);
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
  if (res?.data?.token) {
    localStorage.setItem("github_token", res.data.token);
    localStorage.setItem("github_user", JSON.stringify(res.data.user));
  }
  return res.data;
};

// Get user profile
export const getUser = async (username) => {
  try {
    const res = await apiClient(`/auth/user/${username}`);
    return res.data.user;
  } catch (err) {
    console.warn("Backend getUser failed, falling back to local storage:", err.message);
    await storageReady;
    await simulateDelay();
    const user = getStoredUser();
    if (!user) {
      return createUserData(username);
    }
    return user;
  }
};

// Get repositories
export const getRepos = async (username) => {
  try {
    // Attempt to load from user's public profile repos
    const res = await apiClient(`/auth/user/${username}`);
    if (res?.data?.repos) {
      return res.data.repos;
    }
    // Fallback to general repos route
    const generalRes = await apiClient("/repos");
    return generalRes.data || [];
  } catch (err) {
    console.warn("Backend getRepos failed, falling back to local storage:", err.message);
    await storageReady;
    await simulateDelay();
    const repos = getStoredRepositories();
    if (!repos || repos.length === 0) {
      throw new Error("Repositories not found");
    }
    return repos;
  }
};

// Get starred repositories
export const getStarredRepos = async (username) => {
  try {
    const res = await apiClient(`/auth/user/${username}`);
    // Extract repos that are starred (if backend includes a list of user's stars/starred repos)
    if (res?.data?.starredRepos) {
      return res.data.starredRepos;
    }
    // Alternatively, filter public repos for starred ones or return public repos as mock fallback
    return res.data.repos?.filter(r => r.stars_count > 0) || [];
  } catch (err) {
    console.warn("Backend getStarredRepos failed, falling back to local storage:", err.message);
    await storageReady;
    await simulateDelay();
    const starredRepos = getStoredStarredRepos();
    if (!starredRepos || starredRepos.length === 0) {
      throw new Error("Starred repos not found");
    }
    return starredRepos;
  }
};

// Get single repository details
export const getRepo = async (username, repoName) => {
  try {
    // Search repos or get by ID/name
    const res = await apiClient(`/auth/user/${username}`);
    const foundRepo = res.data.repos?.find(r => r.name.toLowerCase() === repoName.toLowerCase());
    if (foundRepo) return foundRepo;
    throw new Error("Repo not found in user profile");
  } catch (err) {
    console.warn("Backend getRepo failed, falling back to local storage:", err.message);
    await storageReady;
    await simulateDelay();
    const repos = getStoredRepositories();
    const repoData = repos.find((r) => r.name.toLowerCase() === repoName.toLowerCase());
    if (!repoData) {
      throw new Error("Repo not found");
    }
    return repoData;
  }
};

// Get repo contents
export const getRepoContents = async (user, repo, path = "") => {
  // Currently file tree structure is static or local storage based.
  // We keep this using the local/storage schema to prevent code disruption.
  await storageReady;
  await simulateDelay();
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
  try {
    const res = await apiClient(`/auth/user/${username}`);
    return res.data.pins || [];
  } catch (err) {
    console.warn("Backend getPinnedRepos failed, falling back to local storage:", err.message);
    await storageReady;
    await simulateDelay();
    return getStoredPinnedRepos();
  }
};