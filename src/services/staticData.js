import userData from './userData.json';

/**
 * Static Data Service
 * 
 * This file provides constants and dynamic generators for the GitHub clone.
 * It uses userData.json as the base for seeded data.
 */

// Language colors mapping for UI
export const LANGUAGE_COLORS = userData.languageColors;

// Mock repository contents (API style)
export const STATIC_REPO_CONTENTS = userData.repositoryContents;

/**
 * Helper to generate user data for any username
 */
export const createUserData = (username) => ({
  login: username,
  id: Math.floor(Math.random() * 1000000),
  avatar_url: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 100000000)}?v=4`,
  type: "User",
  name: username.charAt(0).toUpperCase() + username.slice(1),
  bio: "Developer | Open Source Enthusiast",
  location: "World",
  public_repos: 10,
  followers: 5,
  following: 5,
  created_at: new Date().toISOString(),
  html_url: `https://github.com/${username}`,
});

/**
 * Helper function to generate repos for any username
 */
export const generateReposForUser = (username) => {
  const repoNames = ["awesome-project", "react-dashboard", "utils-library"];
  return repoNames.map((name, index) => ({
    id: 1000 + index,
    name: name,
    full_name: `${username}/${name}`,
    owner: {
      login: username,
      avatar_url: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 100000000)}?v=4`,
    },
    description: `A mock repository named ${name}`,
    stargazers_count: Math.floor(Math.random() * 500),
    language: index % 2 === 0 ? "JavaScript" : "Python",
    updated_at: new Date().toISOString(),
    visibility: "public",
  }));
};

// These were used for the default user 'momanamjad'
// but now we prefer pulling them from userData.json or storageService
export const STATIC_USERS = {
  momanamjad: userData.user,
};

export const STATIC_REPOS = {
  momanamjad: userData.repositories,
};

export const STATIC_STARRED_REPOS = {
  momanamjad: userData.starredRepositories,
};

export const STATIC_PINNED_REPOS = {
  momanamjad: userData.pinnedRepositories,
};
