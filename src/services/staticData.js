// Static data to replace API calls
// This file contains mock GitHub data for development

// Helper function to create user data for any username
const createUserData = (username) => ({
  login: username,
  id: Math.floor(Math.random() * 1000000),
  avatar_url: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 100000000)}?v=4`,
  gravatar_id: "",
  url: `https://api.github.com/users/${username}`,
  html_url: `https://github.com/${username}`,
  followers_url: `https://api.github.com/users/${username}/followers`,
  following_url: `https://api.github.com/users/${username}/following{/other_user}`,
  gists_url: `https://api.github.com/users/${username}/gists{/gist_id}`,
  starred_url: `https://api.github.com/users/${username}/starred{/owner}{/repo}`,
  subscriptions_url: `https://api.github.com/users/${username}/subscriptions`,
  organizations_url: `https://api.github.com/users/${username}/orgs`,
  repos_url: `https://api.github.com/users/${username}/repos`,
  events_url: `https://api.github.com/users/${username}/events{/privacy}`,
  received_events_url: `https://api.github.com/users/${username}/received_events`,
  type: "User",
  site_admin: false,
  name: username.charAt(0).toUpperCase() + username.slice(1),
  company: null,
  blog: "",
  location: "Pakistan",
  email: null,
  bio: "Full Stack Developer | React | Node.js | Cloud",
  twitter_username: null,
  public_repos: 45,
  public_gists: 2,
  followers: 125,
  following: 50,
  created_at: "2020-09-15T10:20:00Z",
  updated_at: "2024-12-15T10:20:00Z",
});

export const STATIC_USERS = {
  momanamjad: createUserData("momanamjad"),
};

export const STATIC_REPOS = {
  momanamjad: [
    {
      id: 1,
      node_id: "R_kgDOGrJ_Ag",
      name: "github-clone",
      full_name: "momanamjad/github-clone",
      private: false,
      owner: {
        login: "momanamjad",
        id: 72067045,
        avatar_url: "https://avatars.githubusercontent.com/u/72067045?v=4",
        type: "User",
      },
      html_url: "https://github.com/momanamjad/github-clone",
      description: "A beautiful GitHub clone built with React and Vite",
      fork: false,
      created_at: "2023-01-15T10:20:00Z",
      updated_at: "2024-12-15T10:20:00Z",
      pushed_at: "2024-12-15T10:20:00Z",
      homepage: "https://github-clone.netlify.app",
      size: 2048,
      stargazers_count: 342,
      watchers_count: 342,
      language: "JavaScript",
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: false,
      has_pages: false,
      forks_count: 23,
      archived: false,
      disabled: false,
      open_issues_count: 5,
      license: { key: "mit", name: "MIT License" },
      forks: 23,
      open_issues: 5,
      watchers: 342,
      default_branch: "main",
      mirror_url: null,
      visibility: "public",
      topics: ["github", "clone", "react", "vite"],
    },
    {
      id: 2,
      node_id: "R_kgDOGrJ_Bg",
      name: "react-portfolio",
      full_name: "momanamjad/react-portfolio",
      private: false,
      owner: {
        login: "momanamjad",
        id: 72067045,
        avatar_url: "https://avatars.githubusercontent.com/u/72067045?v=4",
        type: "User",
      },
      html_url: "https://github.com/momanamjad/react-portfolio",
      description: "Personal portfolio built with React and Tailwind CSS",
      fork: false,
      created_at: "2022-06-20T10:20:00Z",
      updated_at: "2024-11-20T10:20:00Z",
      pushed_at: "2024-11-20T10:20:00Z",
      homepage: "https://monam-portfolio.netlify.app",
      size: 1024,
      stargazers_count: 128,
      watchers_count: 128,
      language: "JavaScript",
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: false,
      has_pages: true,
      forks_count: 12,
      archived: false,
      disabled: false,
      open_issues_count: 2,
      license: { key: "mit", name: "MIT License" },
      forks: 12,
      open_issues: 2,
      watchers: 128,
      default_branch: "main",
      mirror_url: null,
      visibility: "public",
      topics: ["portfolio", "react", "tailwindcss"],
    },
    {
      id: 3,
      node_id: "R_kgDOGrJ_Cg",
      name: "nextjs-ecommerce",
      full_name: "momanamjad/nextjs-ecommerce",
      private: false,
      owner: {
        login: "momanamjad",
        id: 72067045,
        avatar_url: "https://avatars.githubusercontent.com/u/72067045?v=4",
        type: "User",
      },
      html_url: "https://github.com/momanamjad/nextjs-ecommerce",
      description: "Full-stack e-commerce platform with Next.js and MongoDB",
      fork: false,
      created_at: "2023-03-10T10:20:00Z",
      updated_at: "2024-12-10T10:20:00Z",
      pushed_at: "2024-12-10T10:20:00Z",
      homepage: "https://nextjs-store.netlify.app",
      size: 3072,
      stargazers_count: 256,
      watchers_count: 256,
      language: "JavaScript",
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: false,
      has_pages: false,
      forks_count: 34,
      archived: false,
      disabled: false,
      open_issues_count: 8,
      license: { key: "mit", name: "MIT License" },
      forks: 34,
      open_issues: 8,
      watchers: 256,
      default_branch: "main",
      mirror_url: null,
      visibility: "public",
      topics: ["nextjs", "ecommerce", "mongodb"],
    },
    {
      id: 4,
      node_id: "R_kgDOGrJ_Dg",
      name: "nodejs-rest-api",
      full_name: "momanamjad/nodejs-rest-api",
      private: false,
      owner: {
        login: "momanamjad",
        id: 72067045,
        avatar_url: "https://avatars.githubusercontent.com/u/72067045?v=4",
        type: "User",
      },
      html_url: "https://github.com/momanamjad/nodejs-rest-api",
      description: "RESTful API built with Node.js and Express",
      fork: false,
      created_at: "2022-11-05T10:20:00Z",
      updated_at: "2024-12-05T10:20:00Z",
      pushed_at: "2024-12-05T10:20:00Z",
      homepage: null,
      size: 512,
      stargazers_count: 89,
      watchers_count: 89,
      language: "JavaScript",
      has_issues: true,
      has_projects: false,
      has_downloads: true,
      has_wiki: false,
      has_pages: false,
      forks_count: 15,
      archived: false,
      disabled: false,
      open_issues_count: 3,
      license: { key: "mit", name: "MIT License" },
      forks: 15,
      open_issues: 3,
      watchers: 89,
      default_branch: "main",
      mirror_url: null,
      visibility: "public",
      topics: ["nodejs", "express", "rest-api"],
    },
    {
      id: 5,
      node_id: "R_kgDOGrJ_Eg",
      name: "python-data-science",
      full_name: "momanamjad/python-data-science",
      private: false,
      owner: {
        login: "momanamjad",
        id: 72067045,
        avatar_url: "https://avatars.githubusercontent.com/u/72067045?v=4",
        type: "User",
      },
      html_url: "https://github.com/momanamjad/python-data-science",
      description: "Data Science projects with Python, Pandas, and Scikit-learn",
      fork: false,
      created_at: "2023-02-12T10:20:00Z",
      updated_at: "2024-12-12T10:20:00Z",
      pushed_at: "2024-12-12T10:20:00Z",
      homepage: null,
      size: 4096,
      stargazers_count: 203,
      watchers_count: 203,
      language: "Python",
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: true,
      has_pages: false,
      forks_count: 45,
      archived: false,
      disabled: false,
      open_issues_count: 6,
      license: { key: "mit", name: "MIT License" },
      forks: 45,
      open_issues: 6,
      watchers: 203,
      default_branch: "main",
      mirror_url: null,
      visibility: "public",
      topics: ["python", "data-science", "machine-learning"],
    },
  ],
};

export const STATIC_STARRED_REPOS = {
  momanamjad: [
    {
      id: 101,
      name: "react",
      full_name: "facebook/react",
      owner: {
        login: "facebook",
        avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
        type: "Organization",
      },
      html_url: "https://github.com/facebook/react",
      description: "A JavaScript library for building user interfaces",
      stargazers_count: 200000,
      language: "JavaScript",
      forks_count: 41000,
      archived: false,
      visibility: "public",
    },
    {
      id: 102,
      name: "vue",
      full_name: "vuejs/vue",
      owner: {
        login: "vuejs",
        avatar_url: "https://avatars.githubusercontent.com/u/6128107?v=4",
        type: "Organization",
      },
      html_url: "https://github.com/vuejs/vue",
      description: "The Progressive JavaScript Framework",
      stargazers_count: 205000,
      language: "JavaScript",
      forks_count: 33000,
      archived: false,
      visibility: "public",
    },
    {
      id: 103,
      name: "nodejs",
      full_name: "nodejs/node",
      owner: {
        login: "nodejs",
        avatar_url: "https://avatars.githubusercontent.com/u/16383701?v=4",
        type: "Organization",
      },
      html_url: "https://github.com/nodejs/node",
      description: "Node.js JavaScript runtime",
      stargazers_count: 95000,
      language: "C++",
      forks_count: 24000,
      archived: false,
      visibility: "public",
    },
  ],
};

export const STATIC_REPO_CONTENTS = {
  "github-clone": [
    {
      name: "src",
      path: "src",
      sha: "abc123def456",
      size: 0,
      url: "https://api.github.com/repos/momanamjad/github-clone/contents/src",
      html_url: "https://github.com/momanamjad/github-clone/tree/main/src",
      git_url: "https://api.github.com/repos/momanamjad/github-clone/git/trees/abc123",
      type: "dir",
      _links: {
        self: "https://api.github.com/repos/momanamjad/github-clone/contents/src",
        git: "https://api.github.com/repos/momanamjad/github-clone/git/trees/abc123",
        html: "https://github.com/momanamjad/github-clone/tree/main/src",
      },
    },
    {
      name: "public",
      path: "public",
      sha: "def456ghi789",
      size: 0,
      url: "https://api.github.com/repos/momanamjad/github-clone/contents/public",
      html_url: "https://github.com/momanamjad/github-clone/tree/main/public",
      git_url: "https://api.github.com/repos/momanamjad/github-clone/git/trees/def456",
      type: "dir",
      _links: {
        self: "https://api.github.com/repos/momanamjad/github-clone/contents/public",
        git: "https://api.github.com/repos/momanamjad/github-clone/git/trees/def456",
        html: "https://github.com/momanamjad/github-clone/tree/main/public",
      },
    },
    {
      name: "package.json",
      path: "package.json",
      sha: "ghi789jkl012",
      size: 845,
      url: "https://api.github.com/repos/momanamjad/github-clone/contents/package.json",
      html_url: "https://github.com/momanamjad/github-clone/blob/main/package.json",
      git_url: "https://api.github.com/repos/momanamjad/github-clone/git/blobs/ghi789",
      type: "file",
      _links: {
        self: "https://api.github.com/repos/momanamjad/github-clone/contents/package.json",
        git: "https://api.github.com/repos/momanamjad/github-clone/git/blobs/ghi789",
        html: "https://github.com/momanamjad/github-clone/blob/main/package.json",
      },
    },
    {
      name: "README.md",
      path: "README.md",
      sha: "jkl012mno345",
      size: 2048,
      url: "https://api.github.com/repos/momanamjad/github-clone/contents/README.md",
      html_url: "https://github.com/momanamjad/github-clone/blob/main/README.md",
      git_url: "https://api.github.com/repos/momanamjad/github-clone/git/blobs/jkl012",
      type: "file",
      _links: {
        self: "https://api.github.com/repos/momanamjad/github-clone/contents/README.md",
        git: "https://api.github.com/repos/momanamjad/github-clone/git/blobs/jkl012",
        html: "https://github.com/momanamjad/github-clone/blob/main/README.md",
      },
    },
  ],
};

// Helper function to generate repos for any username
const generateReposForUser = (username) => {
  const repoNames = ["github-clone", "react-portfolio", "nextjs-ecommerce", "nodejs-rest-api", "python-data-science"];
  const descriptions = [
    "A beautiful GitHub clone built with React and Vite",
    "Personal portfolio built with React and Tailwind CSS",
    "Full-stack e-commerce platform with Next.js and MongoDB",
    "RESTful API built with Node.js and Express",
    "Data Science projects with Python, Pandas, and Scikit-learn"
  ];
  const languages = ["JavaScript", "JavaScript", "JavaScript", "JavaScript", "Python"];
  const colors = ["#f1e05a", "#f1e05a", "#f1e05a", "#f1e05a", "#3572A5"];

  return repoNames.map((name, index) => ({
    id: index + 1,
    node_id: `R_kgDOGrJ_${String.fromCharCode(65 + index)}g`,
    name: name,
    full_name: `${username}/${name}`,
    private: false,
    owner: {
      login: username,
      id: Math.floor(Math.random() * 1000000),
      avatar_url: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 100000000)}?v=4`,
      type: "User",
    },
    html_url: `https://github.com/${username}/${name}`,
    description: descriptions[index],
    fork: false,
    created_at: "2023-01-15T10:20:00Z",
    updated_at: "2024-12-15T10:20:00Z",
    pushed_at: "2024-12-15T10:20:00Z",
    homepage: null,
    size: 2048,
    stargazers_count: 200 + index * 50,
    watchers_count: 200 + index * 50,
    language: languages[index],
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: false,
    has_pages: false,
    forks_count: 20 + index * 5,
    archived: false,
    disabled: false,
    open_issues_count: 2 + index,
    license: { key: "mit", name: "MIT License" },
    forks: 20 + index * 5,
    open_issues: 2 + index,
    watchers: 200 + index * 50,
    default_branch: "main",
    mirror_url: null,
    visibility: "public",
    topics: [name, "open-source"],
  }));
};

// Helper function to generate pinned repos for any username
const generatePinnedReposForUser = (username) => {
  return [
    {
      name: "github-clone",
      author: username,
      description: "A beautiful GitHub clone built with React and Vite",
      stars: 342,
      language: "JavaScript",
      languageColor: "#f1e05a",
      visibility: "public",
      url: `https://github.com/${username}/github-clone`,
    },
    {
      name: "nextjs-ecommerce",
      author: username,
      description: "Full-stack e-commerce platform with Next.js",
      stars: 256,
      language: "JavaScript",
      languageColor: "#f1e05a",
      visibility: "public",
      url: `https://github.com/${username}/nextjs-ecommerce`,
    },
    {
      name: "python-data-science",
      author: username,
      description: "Data Science projects with Python",
      stars: 203,
      language: "Python",
      languageColor: "#3572A5",
      visibility: "public",
      url: `https://github.com/${username}/python-data-science`,
    },
  ];
};

// Helper function to generate starred repos for any username
const generateStarredReposForUser = (username) => {
  return [
    {
      id: 101,
      name: "react",
      full_name: "facebook/react",
      owner: {
        login: "facebook",
        avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
        type: "Organization",
      },
      html_url: "https://github.com/facebook/react",
      description: "A JavaScript library for building user interfaces",
      stargazers_count: 200000,
      language: "JavaScript",
      forks_count: 41000,
      archived: false,
      visibility: "public",
    },
    {
      id: 102,
      name: "vue",
      full_name: "vuejs/vue",
      owner: {
        login: "vuejs",
        avatar_url: "https://avatars.githubusercontent.com/u/6128107?v=4",
        type: "Organization",
      },
      html_url: "https://github.com/vuejs/vue",
      description: "The Progressive JavaScript Framework",
      stargazers_count: 205000,
      language: "JavaScript",
      forks_count: 33000,
      archived: false,
      visibility: "public",
    },
    {
      id: 103,
      name: "nodejs",
      full_name: "nodejs/node",
      owner: {
        login: "nodejs",
        avatar_url: "https://avatars.githubusercontent.com/u/16383701?v=4",
        type: "Organization",
      },
      html_url: "https://github.com/nodejs/node",
      description: "Node.js JavaScript runtime",
      stargazers_count: 95000,
      language: "C++",
      forks_count: 24000,
      archived: false,
      visibility: "public",
    },
  ];
};

// Cache for generated data
const userDataCache = {};

// Function to get repos dynamically
export const getStaticRepos = (username) => {
  if (!username) return [];
  if (!userDataCache[username]) {
    userDataCache[username] = {
      repos: generateReposForUser(username),
      pinned: generatePinnedReposForUser(username),
      starred: generateStarredReposForUser(username),
    };
  }
  return userDataCache[username].repos;
};

// Function to get pinned repos dynamically
export const getStaticPinnedRepos = (username) => {
  if (!username) return [];
  if (!userDataCache[username]) {
    userDataCache[username] = {
      repos: generateReposForUser(username),
      pinned: generatePinnedReposForUser(username),
      starred: generateStarredReposForUser(username),
    };
  }
  return userDataCache[username].pinned;
};

// Function to get starred repos dynamically
export const getStaticStarredRepos = (username) => {
  if (!username) return [];
  if (!userDataCache[username]) {
    userDataCache[username] = {
      repos: generateReposForUser(username),
      pinned: generatePinnedReposForUser(username),
      starred: generateStarredReposForUser(username),
    };
  }
  return userDataCache[username].starred;
};

export const STATIC_PINNED_REPOS = {
  momanamjad: [
    {
      name: "github-clone",
      author: "momanamjad",
      description: "A beautiful GitHub clone built with React and Vite",
      stars: 342,
      language: "JavaScript",
      languageColor: "#f1e05a",
      visibility: "public",
      url: "https://github.com/momanamjad/github-clone",
    },
    {
      name: "nextjs-ecommerce",
      author: "momanamjad",
      description: "Full-stack e-commerce platform with Next.js",
      stars: 256,
      language: "JavaScript",
      languageColor: "#f1e05a",
      visibility: "public",
      url: "https://github.com/momanamjad/nextjs-ecommerce",
    },
    {
      name: "python-data-science",
      author: "momanamjad",
      description: "Data Science projects with Python",
      stars: 203,
      language: "Python",
      languageColor: "#3572A5",
      visibility: "public",
      url: "https://github.com/momanamjad/python-data-science",
    },
  ],
};

// Simulated delay to mimic API calls
const simulateDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
