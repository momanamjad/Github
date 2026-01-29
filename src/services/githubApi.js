const BASE_URL = "https://api.github.com";

//  get user github profile from baseurl
export const getUser = async (username) => {
  const res = await fetch(`${BASE_URL}/users/${username}`);

  if (!res.ok) {
    throw new Error("User not found");
  }

  return res.json();
};

  // Getting the  user repositories from api
 
export const getRepos = async (username) => {
  const res = await fetch(
    `${BASE_URL}/users/${username}/repos?per_page=100&sort=updated`
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
// for repository details on clicking repo
export const getRepo = async (username, repo) => {
  const res = await fetch(
    `https://api.github.com/repos/${username}/${repo}`
  );
  if (!res.ok) throw new Error("Repo not found");
  return res.json();
};

export const getRepoContents = async (user, repo, path = "") => {
  const res = await fetch(
    `${BASE_URL}/repos/${user}/${repo}/contents/${path}`
  );
  if (!res.ok) throw new Error("Contents not found");
  return res.json();
};
