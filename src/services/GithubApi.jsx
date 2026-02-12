import {
  STATIC_USERS,
  STATIC_REPOS,
  STATIC_REPO_CONTENTS,
  getStaticRepos,
  getStaticPinnedRepos,
  getStaticStarredRepos,
} from "./staticData.js";

// Simulated delay to mimic API calls
const simulateDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

//  get user github profile from baseurl
export const getUser = async (username) => {
  await simulateDelay();
  const user = STATIC_USERS[username];
  if (!user) {
    // Create a default user for any username if not found
    return {
      login: username,
      id: Math.floor(Math.random() * 1000000),
      avatar_url: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 100000000)}?v=4`,
      name: username.charAt(0).toUpperCase() + username.slice(1),
      company: null,
      blog: "",
      location: "Earth",
      email: null,
      bio: "Developer | Open Source Enthusiast",
      twitter_username: null,
      public_repos: 45,
      public_gists: 2,
      followers: 125,
      following: 50,
      created_at: "2020-09-15T10:20:00Z",
      updated_at: "2024-12-15T10:20:00Z",
      html_url: `https://github.com/${username}`,
      type: "User",
    };
  }
  return user;
};

// Getting the  user repositories from api
export const getRepos = async (username) => {
  await simulateDelay();
  const repos = getStaticRepos(username);
  if (!repos || repos.length === 0) {
    throw new Error("Repositories not found");
  }
  return repos;
};

export const getStarredRepos = async (username) => {
  await simulateDelay();
  const starredRepos = getStaticStarredRepos(username);
  if (!starredRepos || starredRepos.length === 0) {
    throw new Error("Starred repos not found");
  }
  return starredRepos;
};

// for repository details on clicking repo
export const getRepo = async (username, repo) => {
  await simulateDelay();
  const repos = getStaticRepos(username);
  if (!repos || repos.length === 0) {
    throw new Error("Repo not found");
  }
  const repoData = repos.find((r) => r.name === repo);
  if (!repoData) {
    throw new Error("Repo not found");
  }
  return repoData;
};

export const getRepoContents = async (user, repo, path = "") => {
  await simulateDelay();
  const contents = STATIC_REPO_CONTENTS[repo];
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
export const getPinnedRepos = async (username) => {
  await simulateDelay();
  return getStaticPinnedRepos(username);
};
