// ─── Static Data Service ──────────────────────────────────────────
//
// This file provides constants and dynamic generators for the GitHub clone.
// OPTIMIZATION: userData.json is no longer eagerly imported at module level.
// Instead, the heavy data properties are lazy-loaded on first access,
// reducing initial bundle + parse time.

// Language colors — small enough to inline or load eagerly
let _languageColors = null;
export const getLanguageColors = async () => {
  if (!_languageColors) {
    const userData = await import('./userData.json');
    _languageColors = userData.languageColors;
  }
  return _languageColors;
};

// For backward compatibility, export a sync fallback
export const LANGUAGE_COLORS = {};

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

// Lazy-loaded static data accessors — only imported when explicitly accessed
let _userData = null;
const _loadUserData = async () => {
  if (!_userData) _userData = await import('./userData.json');
  return _userData;
};

// These were used for the default user 'momanamjad'
// but now we prefer pulling them from userData.json or storageService
export const getStaticUsers = async () => {
  const d = await _loadUserData();
  return { momanamjad: d.user };
};

export const getStaticRepos = async () => {
  const d = await _loadUserData();
  return { momanamjad: d.repositories };
};

export const getStaticStarredRepos = async () => {
  const d = await _loadUserData();
  return { momanamjad: d.starredRepositories };
};

export const getStaticPinnedRepos = async () => {
  const d = await _loadUserData();
  return { momanamjad: d.pinnedRepositories };
};

export const getStaticRepoContents = async () => {
  const d = await _loadUserData();
  return d.repositoryContents;
};
