const BASE_URL = "https://api.github.com";

/**
 * Fetch GitHub user profile
 */
export const getUser = async (username) => {
  const res = await fetch(`${BASE_URL}/users/${username}`);

  if (!res.ok) {
    throw new Error("User not found");
  }

  return res.json();
};

/**
 * Fetch user's repositories
 */
export const getRepos = async (username) => {
  const res = await fetch(
    `${BASE_URL}/users/${username}/repos?sort=updated&per_page=6`
  );

  if (!res.ok) {
    throw new Error("Repositories not found");
  }

  return res.json();
};
export const getStarredRepos = async (username) => {
  const res = await fetch(
    `https://api.github.com/users/${username}/starred?per_page=100`
  );

  if (!res.ok) {
    throw new Error("Starred repos not found");
  }

  return res.json();
};

