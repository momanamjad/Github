import {
  getStoredUser,
  getStoredRepositories,
  getStoredStarredRepos,
  getStoredPinnedRepos,
  getStoredRepoContents,
  initializeStorage,
} from "./storageService.js";
import { createUserData } from "./staticData.js";

// Ensure storage is initialized once — no need to call in every function.
// initializeStorage() is already a singleton promise, so this is safe.
const storageReady = initializeStorage();

// Simulated delay to mimic API calls — reduced from 300ms to 100ms
const simulateDelay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

//  get user github profile from baseurl
export const getUser = async (username) => {
  await storageReady;
  await simulateDelay();

  // Get user from localStorage
  const user = getStoredUser();

  if (!user) {
    // Create a default user for any username if not found in storage
    return createUserData(username);
  }
  return user;
};

// Getting the  user repositories from localStorage
export const getRepos = async (_username) => {
  await storageReady;
  await simulateDelay();

  const repos = getStoredRepositories();
  if (!repos || repos.length === 0) {
    throw new Error("Repositories not found");
  }
  return repos;
};

export const getStarredRepos = async (_username) => {
  await storageReady;
  await simulateDelay();

  const starredRepos = getStoredStarredRepos();
  if (!starredRepos || starredRepos.length === 0) {
    throw new Error("Starred repos not found");
  }
  return starredRepos;
};

// for repository details on clicking repo
export const getRepo = async (username, repo) => {
  await storageReady;
  await simulateDelay();

  const repos = getStoredRepositories();
  if (!repos || repos.length === 0) {
    throw new Error("Repo not found");
  }
  const repoData = repos.find((r) => r.name === repo);
  if (!repoData) {
    throw new Error("Repo not found");
  }
  return repoData;
};

export const getRepoContents = async (user, repo, _path = "") => {
  await storageReady;
  await simulateDelay();

  const contents = getStoredRepoContents(repo);

  if (!contents) {
    // Return a default file structure if not found
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

// Export function to get pinned repos
export const getPinnedRepos = async (_username) => {
  await storageReady;
  await simulateDelay();

  return getStoredPinnedRepos();
};
