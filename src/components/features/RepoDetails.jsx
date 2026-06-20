import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRepo } from "@services/GithubApi.jsx";
import RepoHeader from "@features/RepoHeader";
import { getTree } from "@services/fileSystemService.js";
import { getStoredRepositories } from "@services/storageService.js";
import FileEditor from "@components/FileEditor.jsx";
import { useGitHub } from "@contexts/GitHubContext";
import DiscussionsTab from "./tabs/DiscussionsTab";
import ProjectsTab from "./tabs/ProjectsTab";
import ActionsTab from "./tabs/ActionsTab";
import MarkdownRenderer from "../common/MarkdownRenderer";
import {
  FileDirectoryFillIcon,
  FileIcon,
  GitBranchIcon,
  TagIcon,
  ChevronDownIcon,
  BookIcon,
  PencilIcon,
  HistoryIcon,
  GearIcon,
  LinkExternalIcon,
  ShieldIcon,
  GraphIcon,
  PlayIcon,
  HubotIcon,
  IssueOpenedIcon,
  GitPullRequestIcon,
  ProjectIcon,
  CheckIcon,
  CommentDiscussionIcon,
  CodeIcon,
  ListUnorderedIcon,
  SearchIcon
} from "@primer/octicons-react";
import { apiClient } from "@services/apiClient.js";


// Helper to convert flat GitHub API tree to nested structure
const buildNestedTree = (flatTree) => {
  const root = [];
  const map = {};

  flatTree.sort((a, b) => a.path.localeCompare(b.path));

  for (const node of flatTree) {
    const parts = node.path.split('/');
    const name = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/');
    
    const newNode = {
      name,
      path: node.path,
      type: node.type === 'tree' ? 'dir' : 'file',
      sha: node.sha,
      html_url: `https://github.com/momanamjad/Github/blob/main/${node.path}`,
      children: node.type === 'tree' ? [] : undefined
    };

    map[node.path] = newNode;

    if (!parentPath) {
      root.push(newNode);
    } else {
      const parent = map[parentPath];
      if (parent && parent.children) {
        parent.children.push(newNode);
      } else {
        root.push(newNode);
      }
    }
  }
  return root;
};

const formatGitHubDate = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 60) return `${mins} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 30) return `${days} days ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

const RepoDetails = () => {
  const { username, repo } = useParams();
  const { user } = useGitHub();
  const [repoData, setRepoData] = useState(null);
  const isOwner = user?.login === repoData?.owner?.login;
  const [activeRepoTab, setActiveRepoTab] = useState("code");
  const [currentPath, setCurrentPath] = useState("");

  const [fileTree, setFileTree] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCommitDiff, setActiveCommitDiff] = useState(null);

  // Issues states
  const [repoIssues, setRepoIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesFilter, setIssuesFilter] = useState("all"); // 'all' | 'open' | 'closed'
  const [issuesLabelFilter, setIssuesLabelFilter] = useState("all"); // 'all' | 'bug' | 'enhancement' | 'documentation' | 'duplicate'
  const [issuesSearchQuery, setIssuesSearchQuery] = useState("");
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDesc, setNewIssueDesc] = useState("");

  // PRs states
  const [repoPRs, setRepoPRs] = useState([]);
  const [prsLoading, setPrsLoading] = useState(false);
  const [isCreatingPR, setIsCreatingPR] = useState(false);
  const [newPrTitle, setNewPrTitle] = useState("");
  const [newPrDesc, setNewPrDesc] = useState("");
  const [newPrSource, setNewPrSource] = useState("main");
  const [newPrTarget, setNewPrTarget] = useState("main");

  // Comment states
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedPR, setSelectedPR] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  const fetchIssueComments = async (issueId) => {
    if (!repoData) return;
    try {
      setCommentsLoading(true);
      const res = await apiClient(`/repos/${repoData._id || repoData.id}/issues/${issueId}/comments`);
      setComments(res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchPRComments = async (prId) => {
    if (!repoData) return;
    try {
      setCommentsLoading(true);
      const res = await apiClient(`/repos/${repoData._id || repoData.id}/pulls/${prId}/comments`);
      setComments(res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostIssueComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedIssue) return;
    try {
      const issueId = selectedIssue.id || selectedIssue._id;
      const res = await apiClient(`/repos/${repoData._id || repoData.id}/issues/${issueId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: newCommentText })
      });
      if (res?.data) {
        setComments(prev => [...prev, res.data]);
        setNewCommentText("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostPRComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedPR) return;
    try {
      const prId = selectedPR._id || selectedPR.id;
      const res = await apiClient(`/repos/${repoData._id || repoData.id}/pulls/${prId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: newCommentText })
      });
      if (res?.data) {
        setComments(prev => [...prev, res.data]);
        setNewCommentText("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Settings states
  const [editRepoName, setEditRepoName] = useState("");
  const [editRepoDesc, setEditRepoDesc] = useState("");
  const [editRepoVisibility, setEditRepoVisibility] = useState("public");
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState({ text: "", type: "" });

  // Secrets states
  const [secretsList, setSecretsList] = useState([]);
  const [loadingSecrets, setLoadingSecrets] = useState(false);
  const [newSecretName, setNewSecretName] = useState("");
  const [newSecretValue, setNewSecretValue] = useState("");
  const [secretsSaving, setSecretsSaving] = useState(false);
  const [secretsError, setSecretsError] = useState("");

  // Branch & Tag management states
  const [branches, setBranches] = useState(["main"]);
  const [tags, setTags] = useState([]);
  const [currentBranch, setCurrentBranch] = useState("main");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branchFilterQuery, setBranchFilterQuery] = useState("");
  const [newBranchInput, setNewBranchInput] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [activeSelectorTab, setActiveSelectorTab] = useState("branches"); // "branches" | "tags"

  // Commits list initialized with realistic fallbacks
  const [commitsList, setCommitsList] = useState([
    {
      hash: "8a39f04",
      message: "feat: complete notifications, pin/star, discussions, and repository l...",
      author: "momanamjad",
      avatar_url: "https://avatars.githubusercontent.com/u/104862410?v=4",
      date: "13 hours ago",
      files: []
    },
    {
      hash: "7d2b451",
      message: "fix: restore PWA installability with correctly-sized icons and pr...",
      author: "momanamjad",
      avatar_url: "https://avatars.githubusercontent.com/u/104862410?v=4",
      date: "last month",
      files: []
    }
  ]);

  // Load Issues/PRs dynamically when tabs are clicked
  useEffect(() => {
    const fetchIssues = async () => {
      if (!repoData) return;
      try {
        setIssuesLoading(true);
        const res = await apiClient(`/repos/${repoData._id || repoData.id}/issues`);
        if (res && res.data) {
          // Format issues correctly
          const formatted = (res.data || []).map(issue => ({
            id: issue._id,
            title: issue.title,
            number: issue.number || Math.floor(Math.random() * 900) + 100,
            status: issue.state || 'open',
            author: issue.creator?.login || 'unknown',
            updated: new Date(issue.updated_at || issue.created_at).toLocaleDateString(),
            description: issue.description || '',
            labels: issue.labels || [],
          }));
          setRepoIssues(formatted);
        }
      } catch (err) {
        console.error("Failed to load issues:", err);
      } finally {
        setIssuesLoading(false);
      }
    };

    const fetchPRs = async () => {
      if (!repoData) return;
      try {
        setPrsLoading(true);
        const res = await apiClient(`/repos/${repoData._id || repoData.id}/pulls`);
        if (res && res.data) {
          setRepoPRs(res.data);
        }
      } catch (err) {
        console.error("Failed to load Pull Requests:", err);
      } finally {
        setPrsLoading(false);
      }
    };

    const fetchCommits = async () => {
      if (!repoData) return;
      try {
        const id = repoData._id || repoData.id;
        const res = await apiClient(`/repos/${id}/commits`);
        if (res && res.data) {
          const formatted = (res.data || []).map(c => ({
            hash: (c._id || c.id || '').substring(0, 7),
            message: c.type === 'repo_created' ? 'Initial commit' : `${c.type.replace(/_/g, ' ')}`,
            author: c.user?.login || 'unknown',
            avatar_url: c.user?.avatar_url || 'https://avatars.githubusercontent.com/u/104862410?v=4',
            date: formatGitHubDate(c.created_at),
            files: []
          }));
          if (formatted.length > 0) {
            setCommitsList(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to load commits:", err);
      }
    };

    if (activeRepoTab === 'issues') {
      fetchIssues();
    } else if (activeRepoTab === 'pulls') {
      fetchPRs();
    } else if (activeRepoTab === 'commits') {
      fetchCommits();
    } else if (activeRepoTab === 'settings' && isOwner) {
      fetchSecrets();
    }
  }, [activeRepoTab, repoData, isOwner]);

  // Sync settings inputs when repoData changes
  useEffect(() => {
    if (repoData) {
      setEditRepoName(repoData.name);
      setEditRepoDesc(repoData.description || "");
      setEditRepoVisibility(repoData.visibility || "public");
    }
  }, [repoData]);

  // Load branches & tags
  useEffect(() => {
    const fetchBranchesAndTags = async () => {
      if (!repoData || (!repoData._id && !repoData.id)) return;
      try {
        const id = repoData._id || repoData.id;
        const branchesRes = await apiClient(`/repos/${id}/branches`);
        if (branchesRes && branchesRes.data) {
          const list = branchesRes.data || [];
          if (!list.includes('main')) {
            setBranches(['main', ...list]);
          } else {
            setBranches(list);
          }
        }
        const tagsRes = await apiClient(`/repos/${id}/tags`);
        if (tagsRes && tagsRes.data) {
          setTags(tagsRes.data);
        }
      } catch (err) {
        console.warn("Failed to load branches and tags from backend:", err);
      }
    };
    fetchBranchesAndTags();
  }, [repoData]);

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!newBranchInput.trim() || !repoData) return;
    try {
      const id = repoData._id || repoData.id;
      const res = await apiClient(`/repos/${id}/branches`, {
        method: 'POST',
        body: JSON.stringify({ name: newBranchInput.trim() }),
      });
      if (res && res.data) {
        const list = res.data || [];
        if (!list.includes('main')) {
          setBranches(['main', ...list]);
        } else {
          setBranches(list);
        }
        setCurrentBranch(newBranchInput.trim());
        setNewBranchInput("");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create branch");
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagInput.trim() || !repoData) return;
    try {
      const id = repoData._id || repoData.id;
      const res = await apiClient(`/repos/${id}/tags`, {
        method: 'POST',
        body: JSON.stringify({ name: newTagInput.trim() }),
      });
      if (res && res.data) {
        setTags(res.data);
        setNewTagInput("");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create tag");
    }
  };

  useEffect(() => {
    const loadRepo = async () => {
      try {
        setLoading(true);
        setError(null);

        let repoInfo;
        try {
          repoInfo = await getRepo(username, repo);
          setRepoData(repoInfo);
        } catch (e) {
          console.warn("Repo not found in local backend, generating configuration...");
          repoInfo = {
            name: repo,
            owner: { login: username, avatar_url: "https://avatars.githubusercontent.com/u/104862410?v=4" },
            visibility: "public",
            description: "No description provided.",
            stars_count: 1,
            watchers_count: 0,
            forks_count: 0,
            issues_count: 0,
            pulls_count: 0
          };
          setRepoData(repoInfo);
        }

        // If this is the "Github" repository, fetch live data from the GitHub API!
        if (repo.toLowerCase() === "github") {
          try {
            const treeRes = await fetch("https://api.github.com/repos/momanamjad/Github/git/trees/main?recursive=1");
            const treeData = await treeRes.json();
            if (treeData && treeData.tree) {
              const nested = buildNestedTree(treeData.tree);
              setFileTree(nested);
            } else {
              throw new Error("Failed to load GitHub tree structure");
            }

            const commitsRes = await fetch("https://api.github.com/repos/momanamjad/Github/commits?per_page=10");
            const commitsData = await commitsRes.json();
            if (Array.isArray(commitsData)) {
              const formatted = commitsData.map(c => ({
                hash: c.sha.substring(0, 7),
                message: c.commit.message,
                author: c.author?.login || c.commit.author.name,
                avatar_url: c.author?.avatar_url || "https://avatars.githubusercontent.com/u/104862410?v=4",
                date: formatGitHubDate(c.commit.author.date),
                files: []
              }));
              setCommitsList(formatted);
            }
          } catch (apiErr) {
            console.warn("GitHub API rate limit or network error, falling back to mock files:", apiErr);
            useFallbackFiles(repoInfo);
          }
        } else {
          if (repoInfo && repoInfo.fileTree) {
            const tree = await getTree(repoInfo._id || repoInfo.id);
            setFileTree(tree);
          } else {
            useFallbackFiles(repoInfo);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const useFallbackFiles = (repoInfo) => {
      const fallbackTree = [
        {
          name: "public",
          path: "public",
          type: "dir",
          children: [
            { name: "index.html", path: "public/index.html", type: "file", content: "<!DOCTYPE html>\n<html>\n<head>\n  <title>GitHub Clone</title>\n</head>\n<body>\n  <div id=\"root\"></div>\n</body>\n</html>" },
            { name: "manifest.json", path: "public/manifest.json", type: "file", content: "{\n  \"name\": \"GitHub Clone\",\n  \"short_name\": \"GitHub\"\n}" }
          ]
        },
        {
          name: "src",
          path: "src",
          type: "dir",
          children: [
            { name: "App.jsx", path: "src/App.jsx", type: "file", content: "import React from 'react';\nexport default function App() {\n  return <div>App</div>;\n}" },
            { name: "main.jsx", path: "src/main.jsx", type: "file", content: "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\nReactDOM.createRoot(document.getElementById('root')).render(<App />);" },
            { name: "index.css", path: "src/index.css", type: "file", content: "@tailwind base;\n@tailwind components;\n@tailwind utilities;" }
          ]
        },
        {
          name: "workflows",
          path: "workflows",
          type: "dir",
          children: []
        },
        { name: ".gitignore", path: ".gitignore", type: "file", content: "node_modules/\ndist/\n.env" },
        { name: "boneyard.config.json", path: "boneyard.config.json", type: "file", content: "{\n  \"unused\": []\n}" },
        { name: "components.json", path: "components.json", type: "file", content: "{\n  \"style\": \"default\",\n  \"rsc\": false\n}" },
        { name: "eslint.config.js", path: "eslint.config.js", type: "file", content: "export default [];" },
        { name: "index.html", path: "index.html", type: "file", content: "<!DOCTYPE html><html></html>" },
        { name: "jsconfig.json", path: "jsconfig.json", type: "file", content: "{\n  \"compilerOptions\": {}\n}" }
      ];
      setFileTree(fallbackTree);
    };

    loadRepo();
  }, [username, repo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 bg-white dark:bg-[#0d1117]">
        <div className="flex items-center gap-3 text-[#636c76]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-[14px]">Loading repository…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 bg-white dark:bg-[#0d1117]">
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-6 bg-white dark:bg-[#161b22] text-center">
          <p className="text-[#cf222e] text-[14px] font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const handleSaveFile = (filePath, content) => {
    setSelectedFile(prev => prev && prev.path === filePath ? { ...prev, content } : prev);
    const updateTreeNodes = (nodes) => {
      return nodes.map(node => {
        if (node.path === filePath) {
          return { ...node, content };
        }
        if (node.children) {
          return { ...node, children: updateTreeNodes(node.children) };
        }
        return node;
      });
    };
    setFileTree(prev => updateTreeNodes(prev));
  };

  const getFilesAtCurrentPath = () => {
    if (!currentPath) return fileTree;
    const parts = currentPath.split('/');
    let currentChildren = fileTree;
    for (const part of parts) {
      const found = currentChildren.find(node => node.name === part && node.type === 'dir');
      if (found) {
        currentChildren = found.children || [];
      } else {
        return [];
      }
    }
    return currentChildren;
  };

  const getFileCommitInfo = (name) => {
    if (repo.toLowerCase() === 'github') {
      const mapping = {
        'public': {
          message: 'fix: restore PWA installability with correctly-sized icons and pr...',
          date: 'last month'
        },
        'src': {
          message: 'feat: complete notifications, pin/star, discussions, and reposit...',
          date: '13 hours ago'
        },
        'workflows': {
          message: 'feat: complete notifications, pin/star, discussions, and reposit...',
          date: '13 hours ago'
        },
        '.gitignore': {
          message: 'feat: implement core GitHub-like application structure with r...',
          date: '2 months ago'
        },
        'boneyard.config.json': {
          message: 'feat: implement Home page with repository list, filtering, and...',
          date: 'last month'
        },
        'components.json': {
          message: 'first commit',
          date: '5 months ago'
        },
        'eslint.config.js': {
          message: 'feat: implement core GitHub-like application structure with r...',
          date: '2 months ago'
        },
        'index.html': {
          message: 'fix: correct title formatting in index.html',
          date: 'last month'
        },
        'jsconfig.json': {
          message: 'performance optized through lazyloading etc,',
          date: '3 months ago'
        },
        'vite.config.js': {
          message: 'performance optized through lazyloading etc,',
          date: '3 months ago'
        }
      };
      const key = name.toLowerCase();
      if (mapping[key]) return mapping[key];
    }
    return {
      message: commitsList[0]?.message || 'Initial commit',
      date: commitsList[0]?.date || '3 weeks ago'
    };
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!newIssueTitle.trim()) return;
    try {
      const res = await apiClient(`/repos/${repoData._id || repoData.id}/issues`, {
        method: 'POST',
        body: JSON.stringify({
          title: newIssueTitle,
          description: newIssueDesc,
        }),
      });
      if (res && res.data) {
        const formatted = {
          id: res.data._id,
          title: res.data.title,
          number: res.data.number || Math.floor(Math.random() * 900) + 100,
          status: res.data.state || 'open',
          author: res.data.creator?.login || user?.login || 'unknown',
          updated: new Date(res.data.updated_at || res.data.created_at).toLocaleDateString(),
          description: res.data.description || '',
        };
        setRepoIssues(prev => [formatted, ...prev]);
        setNewIssueTitle("");
        setNewIssueDesc("");
        setIsCreatingIssue(false);
      }
    } catch (err) {
      console.error("Failed to create issue:", err);
    }
  };

  const handleCreatePR = async (e) => {
    e.preventDefault();
    if (!newPrTitle.trim()) return;
    try {
      const res = await apiClient(`/repos/${repoData._id || repoData.id}/pulls`, {
        method: 'POST',
        body: JSON.stringify({
          title: newPrTitle,
          description: newPrDesc,
          sourceBranch: newPrSource,
          targetBranch: newPrTarget,
        }),
      });
      if (res && res.data) {
        setRepoPRs(prev => [res.data, ...prev]);
        setNewPrTitle("");
        setNewPrDesc("");
        setIsCreatingPR(false);
      }
    } catch (err) {
      console.error("Failed to create PR:", err);
    }
  };

  const handleMergePR = async (prId) => {
    try {
      const res = await apiClient(`/repos/${repoData._id || repoData.id}/pulls/${prId}/merge`, {
        method: 'POST',
      });
      if (res && res.data) {
        setRepoPRs(prev => prev.map(pr => pr._id === prId ? { ...pr, status: 'merged' } : pr));
      }
    } catch (err) {
      console.error("Failed to merge PR:", err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMessage({ text: "", type: "" });
    try {
      const res = await apiClient(`/repos/${repoData._id || repoData.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editRepoName,
          description: editRepoDesc,
          visibility: editRepoVisibility,
        }),
      });
      if (res && res.data) {
        setRepoData(res.data);
        setSettingsMessage({ text: "Repository updated successfully!", type: "success" });
      }
    } catch (err) {
      setSettingsMessage({ text: err.message || "Failed to update settings.", type: "error" });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleDeleteRepo = async () => {
    const confirmName = prompt(`To confirm deletion, type the repository name "${repoData.name}":`);
    if (confirmName !== repoData.name) {
      alert("Repository name confirmation mismatch. Deletion cancelled.");
      return;
    }
    try {
      await apiClient(`/repos/${repoData._id || repoData.id}`, {
        method: 'DELETE',
      });
      alert("Repository deleted successfully!");
      window.location.href = `/${username}`;
    } catch (err) {
      console.error("Failed to delete repository:", err);
      alert(err.message || "Failed to delete repository.");
    }
  };

  const fetchSecrets = async () => {
    if (!repoData) return;
    try {
      setLoadingSecrets(true);
      setSecretsError("");
      const id = repoData._id || repoData.id;
      const res = await apiClient(`/repos/${id}/secrets`);
      if (res && res.data) {
        setSecretsList(res.data);
      }
    } catch (err) {
      console.error(err);
      setSecretsError(err.message || "Failed to load secrets.");
    } finally {
      setLoadingSecrets(false);
    }
  };

  const handleCreateSecret = async (e) => {
    e.preventDefault();
    if (!newSecretName.trim() || !newSecretValue.trim() || !repoData) return;
    try {
      setSecretsSaving(true);
      setSecretsError("");
      const id = repoData._id || repoData.id;
      const res = await apiClient(`/repos/${id}/secrets`, {
        method: "POST",
        body: JSON.stringify({ name: newSecretName, value: newSecretValue })
      });
      if (res && res.data) {
        setSecretsList(prev => {
          const exists = prev.some(s => s.name === res.data.name);
          if (exists) {
            return prev.map(s => s.name === res.data.name ? res.data : s);
          }
          return [res.data, ...prev];
        });
        setNewSecretName("");
        setNewSecretValue("");
      }
    } catch (err) {
      console.error(err);
      setSecretsError(err.message || "Failed to save secret.");
    } finally {
      setSecretsSaving(false);
    }
  };

  const handleDeleteSecret = async (secretId) => {
    if (!repoData) return;
    try {
      const id = repoData._id || repoData.id;
      await apiClient(`/repos/${id}/secrets/${secretId}`, {
        method: "DELETE"
      });
      setSecretsList(prev => prev.filter(s => s._id !== secretId));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete secret.");
    }
  };

  const renderBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    return (
      <div className="flex items-center gap-1.5 text-xs text-[#57606a] dark:text-[#8b949e] font-medium py-1">
        <button
          onClick={() => { setCurrentPath(""); setSelectedFile(null); }}
          className="text-[#0969da] dark:text-[#58a6ff] hover:underline bg-transparent border-0 cursor-pointer p-0"
        >
          {repoData?.name || repo}
        </button>
        {parts.map((part, index) => {
          const pathUpToPart = parts.slice(0, index + 1).join('/');
          const isLast = index === parts.length - 1;
          return (
            <div key={pathUpToPart} className="flex items-center gap-1.5 flex-row">
              <span>/</span>
              {isLast ? (
                <span className="text-[#1f2328] dark:text-white font-semibold">{part}</span>
              ) : (
                <button
                  onClick={() => { setCurrentPath(pathUpToPart); setSelectedFile(null); }}
                  className="text-[#0969da] dark:text-[#58a6ff] hover:underline bg-transparent border-0 cursor-pointer p-0"
                >
                  {part}
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const tabs = [
    { id: "code", label: "Code", icon: <CodeIcon size={16} /> },
    { id: "issues", label: "Issues", icon: <IssueOpenedIcon size={16} />, count: repoIssues.length || repoData?.issues_count || 0 },
    { id: "pulls", label: "Pull requests", icon: <GitPullRequestIcon size={16} />, count: repoPRs.length || repoData?.pulls_count || 0 },
    { id: "agents", label: "Agents", icon: <HubotIcon size={16} /> },
    { id: "actions", label: "Actions", icon: <PlayIcon size={16} /> },
    { id: "projects", label: "Projects", icon: <ProjectIcon size={16} /> },
    { id: "wiki", label: "Wiki", icon: <BookIcon size={16} /> },
    { id: "security", label: "Security and quality", icon: <ShieldIcon size={16} />, badge: "1" },
    { id: "insights", label: "Insights", icon: <GraphIcon size={16} /> },
    { id: "discussions", label: "Discussions", icon: <CommentDiscussionIcon size={16} /> },
    ...(isOwner ? [{ id: "settings", label: "Settings", icon: <GearIcon size={16} /> }] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] min-h-screen transition-colors">
      <RepoHeader repo={repoData} />

      {/* Repo Navigation Tabs */}
      <div className="border-b border-[#d0d7de] dark:border-[#30363d] mb-4 mt-2 overflow-x-auto scrollbar-hide">
        <nav className="flex space-x-2 sm:space-x-4 min-w-max pb-1" aria-label="Repository navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveRepoTab(tab.id); setSelectedFile(null); }}
              className={`pb-2 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 -mb-[1.5px] ${
                activeRepoTab === tab.id
                  ? 'border-[#f78166] text-[#1f2328] dark:text-white font-semibold'
                  : 'border-transparent text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-white hover:border-[#d0d7de] dark:hover:border-[#30363d]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 bg-[#ebedf0] dark:bg-[#30363d] text-[#57606a] dark:text-[#8b949e] rounded-full text-[10px] font-semibold">
                  {tab.count}
                </span>
              )}
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.2 bg-[#afb8c1]/20 dark:bg-[#30363d] text-[#57606a] dark:text-[#8b949e] rounded-full text-[10px] font-semibold border border-[#d0d7de] dark:border-[#30363d]">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {activeRepoTab === 'code' ? (
        selectedFile ? (
          /* File Editor full-width blob view */
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#d0d7de] dark:border-[#30363d]">
              {renderBreadcrumbs()}
              <button
                onClick={() => setSelectedFile(null)}
                className="px-3 py-1.5 text-xs font-semibold text-[#24292f] border border-[#d0d7de] rounded-md bg-[#f6f8fa] hover:bg-[#ebedf0] dark:text-white dark:border-[#30363d] dark:bg-[#161b22] dark:hover:bg-[#30363d] transition-colors cursor-pointer"
              >
                Back to files
              </button>
            </div>
            <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-white dark:bg-[#161b22]">
              <FileEditor
                repoId={repoData?._id || repoData?.id}
                file={selectedFile}
                onSave={handleSaveFile}
              />
            </div>
          </div>
        ) : (
          /* Repository Home View: 2 Columns */
          <div className="py-4 flex flex-col lg:flex-row gap-6">
            {/* Left Column (75%): Header buttons, Commit strip, Folder table, README */}
            <div className="flex-1 lg:w-3/4 space-y-4 text-left">
              {/* Branch header & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 relative">
                  <div>
                    <button
                      onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22] text-xs font-semibold hover:bg-[#ebedf0] dark:hover:bg-[#30363d] cursor-pointer text-[#1f2328] dark:text-[#c9d1d9] outline-none"
                    >
                      <GitBranchIcon size={14} className="text-[#57606a] dark:text-[#8b949e]" />
                      <span>{currentBranch}</span>
                      <ChevronDownIcon size={12} className="text-[#57606a] dark:text-[#8b949e]" />
                    </button>

                    {isBranchDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-72 bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-lg z-30 overflow-hidden">
                        <div className="p-3 border-b border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Switch branches/tags</span>
                          <button
                            onClick={() => setIsBranchDropdownOpen(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-transparent border-0 cursor-pointer text-xs font-semibold"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="p-2 border-b border-[#d0d7de] dark:border-[#30363d] space-y-2">
                          <input
                            type="text"
                            placeholder="Filter branches/tags"
                            value={branchFilterQuery}
                            onChange={(e) => setBranchFilterQuery(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded text-xs outline-none focus:border-[#58a6ff]"
                          />
                          <div className="flex border-b border-[#d0d7de] dark:border-[#30363d]">
                            <button
                              onClick={() => { setActiveSelectorTab("branches"); setBranchFilterQuery(""); }}
                              className={`flex-1 pb-1.5 text-xs font-semibold border-b-2 cursor-pointer bg-transparent border-0 ${activeSelectorTab === "branches" ? "border-[#f78166] text-[#1f2328] dark:text-white font-bold" : "border-transparent text-[#57606a] dark:text-[#8b949e]"}`}
                            >
                              Branches
                            </button>
                            <button
                              onClick={() => { setActiveSelectorTab("tags"); setBranchFilterQuery(""); }}
                              className={`flex-1 pb-1.5 text-xs font-semibold border-b-2 cursor-pointer bg-transparent border-0 ${activeSelectorTab === "tags" ? "border-[#f78166] text-[#1f2328] dark:text-white font-bold" : "border-transparent text-[#57606a] dark:text-[#8b949e]"}`}
                            >
                              Tags
                            </button>
                          </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                          {activeSelectorTab === "branches" ? (
                            branches
                              .filter(b => b.toLowerCase().includes(branchFilterQuery.toLowerCase()))
                              .map(b => (
                                <button
                                  key={b}
                                  onClick={() => { setCurrentBranch(b); setIsBranchDropdownOpen(false); }}
                                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] flex items-center justify-between border-0 bg-transparent cursor-pointer ${b === currentBranch ? "font-bold text-[#1f2328] dark:text-white" : "text-[#57606a] dark:text-[#8b949e]"}`}
                                >
                                  <span>{b}</span>
                                  {b === currentBranch && <CheckIcon size={14} className="text-[#0969da] dark:text-[#58a6ff]" />}
                                </button>
                              ))
                          ) : (
                            tags.length === 0 ? (
                              <div className="p-3 text-center text-xs text-gray-500">No tags found</div>
                            ) : (
                              tags
                                .filter(t => t.toLowerCase().includes(branchFilterQuery.toLowerCase()))
                                .map(t => (
                                  <button
                                    key={t}
                                    onClick={() => { setCurrentBranch(t); setIsBranchDropdownOpen(false); }}
                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] flex items-center justify-between border-0 bg-transparent cursor-pointer ${t === currentBranch ? "font-bold text-[#1f2328] dark:text-white" : "text-[#57606a] dark:text-[#8b949e]"}`}
                                  >
                                    <span>{t}</span>
                                    {t === currentBranch && <CheckIcon size={14} className="text-[#0969da] dark:text-[#58a6ff]" />}
                                  </button>
                                ))
                            )
                          )}
                        </div>

                        <div className="p-3 bg-[#f6f8fa] dark:bg-[#161b22] border-t border-[#d0d7de] dark:border-[#30363d]">
                          {activeSelectorTab === "branches" ? (
                            <form onSubmit={handleCreateBranch} className="flex gap-2">
                              <input
                                type="text"
                                required
                                placeholder="New branch name"
                                value={newBranchInput}
                                onChange={(e) => setNewBranchInput(e.target.value)}
                                className="flex-1 px-2 py-1 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded text-[11px] outline-none"
                              />
                              <button
                                type="submit"
                                className="px-2 py-1 bg-[#238636] hover:bg-[#2ea043] text-white text-[11px] font-semibold rounded cursor-pointer border-0"
                              >
                                Create
                              </button>
                            </form>
                          ) : (
                            <form onSubmit={handleCreateTag} className="flex gap-2">
                              <input
                                type="text"
                                required
                                placeholder="New tag name"
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                className="flex-1 px-2 py-1 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded text-[11px] outline-none"
                              />
                              <button
                                type="submit"
                                className="px-2 py-1 bg-[#238636] hover:bg-[#2ea043] text-white text-[11px] font-semibold rounded cursor-pointer border-0"
                              >
                                Create
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#57606a] dark:text-[#8b949e] font-semibold ml-2">
                    <span className="flex items-center gap-1">
                      <GitBranchIcon size={14} className="text-[#57606a] dark:text-[#8b949e]" />
                      {branches.length} {branches.length === 1 ? 'Branch' : 'Branches'}
                    </span>
                    <span className="flex items-center gap-1">
                      <TagIcon size={14} className="text-[#57606a] dark:text-[#8b949e]" />
                      {tags.length} {tags.length === 1 ? 'Tag' : 'Tags'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22] text-xs font-semibold text-[#24292f] dark:text-white hover:bg-[#ebedf0] dark:hover:bg-[#30363d] cursor-pointer transition-colors">
                    Go to file
                  </button>
                  <button 
                    onClick={() => {
                      const newFileName = prompt("Enter path for the new file (e.g. src/utils.js):");
                      if (newFileName) {
                        const pathParts = newFileName.split('/');
                        const name = pathParts.pop();
                        const parentPath = pathParts.join('/');
                        setSelectedFile({
                          name,
                          path: newFileName,
                          type: 'file',
                          content: '',
                          parentPath
                        });
                      }
                    }}
                    className="px-3 py-1.5 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22] text-xs font-semibold text-[#24292f] dark:text-white hover:bg-[#ebedf0] dark:hover:bg-[#30363d] cursor-pointer transition-colors flex items-center gap-1"
                  >
                    Add file
                    <ChevronDownIcon size={12} className="opacity-75" />
                  </button>
                  <button className="px-3 py-1.5 border border-transparent rounded-md bg-[#2ea44f] hover:bg-[#2c974b] text-xs font-semibold text-white cursor-pointer transition-colors flex items-center gap-1">
                    <span>Code</span>
                    <ChevronDownIcon size={12} className="opacity-75" />
                  </button>
                </div>
              </div>

              {/* Files Box Panel (Merged Commit Strip + Table List) */}
              <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-white dark:bg-[#161b22] mb-4">
                {/* Commit Strip Header */}
                <div className="bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] p-3 flex items-center justify-between text-xs text-[#57606a] dark:text-[#8b949e]">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={commitsList[0]?.avatar_url || "https://avatars.githubusercontent.com/u/104862410?v=4"}
                      alt="avatar"
                      className="w-5 h-5 rounded-full object-cover border border-[#d0d7de] dark:border-[#30363d]"
                    />
                    <span className="font-semibold text-[#1f2328] dark:text-white shrink-0">{commitsList[0]?.author}</span>
                    <span 
                      onClick={() => setActiveCommitDiff(commitsList[0])}
                      className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline cursor-pointer font-medium truncate"
                    >
                      {commitsList[0]?.message}
                    </span>
                    <CheckIcon size={16} className="text-[#3fb950] shrink-0 ml-1" />
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span>{commitsList[0]?.date}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActiveCommitDiff(commitsList[0])}
                        className="font-mono text-[#0969da] dark:text-[#58a6ff] hover:underline bg-transparent border-0 cursor-pointer text-xs"
                      >
                        {commitsList[0]?.hash}
                      </button>
                      <span className="text-[#d0d7de] dark:text-[#30363d]">|</span>
                      <span 
                        onClick={() => setActiveRepoTab('commits')}
                        className="font-semibold text-[#24292f] dark:text-white cursor-pointer hover:text-[#0969da] dark:hover:text-[#58a6ff]"
                      >
                        <span className="inline-flex items-center gap-1">
                          <HistoryIcon size={14} className="text-[#57606a] dark:text-[#8b949e]" />
                          <strong>{repo.toLowerCase() === 'github' ? 162 : commitsList.length}</strong> commits
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Breadcrumbs for nested subfolders */}
                {currentPath && (
                  <div className="px-4 py-2 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d]">
                    {renderBreadcrumbs()}
                  </div>
                )}

                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    {currentPath && (
                      <tr 
                        onClick={() => {
                          const parts = currentPath.split('/');
                          parts.pop();
                          setCurrentPath(parts.join('/'));
                        }}
                        className="border-b border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-2.5 font-bold text-[#57606a] dark:text-[#8b949e] flex items-center gap-2" colSpan={3}>
                          <span>..</span>
                        </td>
                      </tr>
                    )}
                    
                    {getFilesAtCurrentPath().map((item) => {
                      const commitInfo = getFileCommitInfo(item.name);
                      return (
                        <tr 
                          key={item.path}
                          onClick={() => {
                            if (item.type === 'dir') {
                              setCurrentPath(item.path);
                            } else {
                              setSelectedFile(item);
                            }
                          }}
                          className="border-b border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-2.5 font-medium text-[#24292f] dark:text-white flex items-center gap-2 max-w-[200px] truncate">
                            {item.type === 'dir' ? (
                              <FileDirectoryFillIcon size={16} className="text-[#54a3ff] shrink-0" />
                            ) : (
                              <FileIcon size={16} className="text-[#57606a] dark:text-[#8b949e] shrink-0" />
                            )}
                            <span className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline truncate">
                              {item.name}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-[#57606a] dark:text-[#8b949e] truncate max-w-[300px]">
                            {commitInfo.message}
                          </td>
                          <td className="px-4 py-2.5 text-[#57606a] dark:text-[#8b949e] text-right whitespace-nowrap w-[120px]">
                            {commitInfo.date}
                          </td>
                        </tr>
                      );
                    })}

                    {getFilesAtCurrentPath().length === 0 && (
                      <tr>
                        <td className="px-4 py-8 text-center text-[#57606a] dark:text-[#8b949e]" colSpan={3}>
                          This directory is empty.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* README Section */}
              {(() => {
                const readmeFile = (fileTree || []).find(f => f.name.toLowerCase() === 'readme.md');
                if (!readmeFile) return null;
                return (
                  <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-left">
                    <div className="px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
                        <span className="font-semibold text-xs text-[#24292f] dark:text-white font-sans">README.md</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setSelectedFile(readmeFile)}
                          className="p-1 hover:bg-[#ebedf0] dark:hover:bg-[#30363d] rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer border-0"
                          title="Edit README"
                        >
                          <PencilIcon size={14} />
                        </button>
                        <button className="p-1 hover:bg-[#ebedf0] dark:hover:bg-[#30363d] rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer border-0">
                          <ListUnorderedIcon size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 prose dark:prose-invert max-w-none text-sm text-[#24292f] dark:text-[#c9d1d9] markdown-body">
                      <MarkdownRenderer content={readmeFile.content || `# ${repoData?.name || ''}\n${repoData?.description || ''}`} />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right Column (25%): Sidebar (About, Releases, Deployments) */}
            <div className="w-full lg:w-[280px] shrink-0 text-left space-y-6">
              {/* About Section */}
              <div className="space-y-3 pb-6 border-b border-[#d0d7de] dark:border-[#30363d]">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-[#24292f] dark:text-white">About</h3>
                  {isOwner && (
                    <GearIcon size={14} className="text-[#57606a] dark:text-[#8b949e] hover:text-[#0969da] dark:hover:text-[#58a6ff] cursor-pointer" />
                  )}
                </div>
                <p className="text-xs text-[#24292f] dark:text-[#c9d1d9] leading-relaxed">
                  {repo.toLowerCase() === 'github' ? "feat: complete notifications, pin/star, discussions, and repository list." : (repoData?.description || "No description, website, or topics provided.")}
                </p>
                
                {/* Website URL */}
                <div className="flex items-center gap-1.5 text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline font-medium">
                  <LinkExternalIcon size={12} />
                  <a href="https://github-kappa-two.vercel.app" target="_blank" rel="noreferrer" className="truncate">
                    github-kappa-two.vercel.app
                  </a>
                </div>

                {/* Additional Quick Stats */}
                <div className="space-y-2.5 pt-3">
                  <div className="flex items-center gap-2 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                    <BookIcon size={14} className="text-[#57606a] dark:text-[#8b949e]" />
                    <span>Readme</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                    <HistoryIcon size={14} className="text-[#57606a] dark:text-[#8b949e]" />
                    <span>Activity</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                    <svg className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e]" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                    </svg>
                    <span><strong>{repo.toLowerCase() === 'github' ? 1 : (repoData?.stars_count || 0)}</strong> star</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                    <svg className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e]" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 2a5.002 5.002 0 0 0-3.205 8.844.75.75 0 0 1-.453 1.28A6.5 6.5 0 1 1 14.5 8a.75.75 0 0 1-1.5 0 5 5 0 0 0-5-5ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z" />
                    </svg>
                    <span><strong>{repo.toLowerCase() === 'github' ? 0 : (repoData?.watchers_count || 0)}</strong> watching</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                    <svg className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e]" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878ZM5 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm7-9.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>
                    <span><strong>{repo.toLowerCase() === 'github' ? 0 : (repoData?.forks_count || 0)}</strong> forks</span>
                  </div>
                </div>
              </div>

              {/* Releases Section */}
              <div className="space-y-3 pb-6 border-b border-[#d0d7de] dark:border-[#30363d]">
                <h3 className="font-semibold text-sm text-[#24292f] dark:text-white">Releases</h3>
                <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
                  No releases published
                </p>
                <div className="text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline font-semibold cursor-pointer">
                  Create a new release
                </div>
              </div>

              {/* Deployments Section */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-[#24292f] dark:text-white flex items-center gap-1.5">
                  Deployments 
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#ebedf0] dark:bg-[#30363d] text-[#57606a] dark:text-[#8b949e]">
                    {repo.toLowerCase() === 'github' ? '202' : '2'}
                  </span>
                </h3>
                <div className="space-y-3">
                  {repo.toLowerCase() === 'github' ? (
                    <>
                      <div className="flex items-start gap-2.5 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                        <span className="w-2.5 h-2.5 mt-1 rounded-full bg-[#10b981] shrink-0"></span>
                        <div className="min-w-0">
                          <a href="https://github-kappa-two.vercel.app" target="_blank" rel="noreferrer" className="font-semibold text-[#24292f] dark:text-white hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline block truncate">
                            Production
                          </a>
                          <span className="text-[10px] text-[#57606a] dark:text-[#8b949e] block mt-0.5">13 hours ago</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                        <span className="w-2.5 h-2.5 mt-1.5 rounded-full bg-[#cf222e] shrink-0"></span>
                        <div className="min-w-0">
                          <span className="font-semibold text-[#57606a] dark:text-[#8b949e] block truncate">
                            Production – github-tjpl
                          </span>
                          <span className="text-[10px] text-[#57606a] dark:text-[#8b949e] block mt-0.5">last month</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                        <span className="w-2.5 h-2.5 mt-1.5 rounded-full bg-[#cf222e] shrink-0"></span>
                        <div className="min-w-0">
                          <span className="font-semibold text-[#57606a] dark:text-[#8b949e] block truncate">
                            Production – github
                          </span>
                          <span className="text-[10px] text-[#57606a] dark:text-[#8b949e] block mt-0.5">last month</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#0969da] dark:text-[#58a6ff] hover:underline font-semibold cursor-pointer block mt-1">
                        + 199 deployments
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-2.5 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                        <span className="w-2.5 h-2.5 mt-1 rounded-full bg-[#10b981] shrink-0 animate-pulse"></span>
                        <div className="min-w-0">
                          <a href={`https://${repo}.vercel.app`} target="_blank" rel="noreferrer" className="font-semibold text-[#0969da] dark:text-[#58a6ff] hover:underline block truncate">
                            Production – {repo}-frontend
                          </a>
                          <span className="text-[10px] text-[#57606a] dark:text-[#8b949e] block mt-0.5">3 weeks ago</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                        <span className="w-2.5 h-2.5 mt-1 rounded-full bg-[#10b981] shrink-0"></span>
                        <div className="min-w-0">
                          <a href={`https://${repo}-backend.vercel.app`} target="_blank" rel="noreferrer" className="font-semibold text-[#0969da] dark:text-[#58a6ff] hover:underline block truncate">
                            Production – {repo}-backend
                          </a>
                          <span className="text-[10px] text-[#57606a] dark:text-[#8b949e] block mt-0.5">3 weeks ago</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      ) : activeRepoTab === 'discussions' ? (
        <div className="py-4 sm:py-6">
          <DiscussionsTab repoId={repoData?._id || repoData?.id} isOwner={isOwner} />
        </div>
      ) : activeRepoTab === 'issues' ? (
        <div className="py-4 space-y-4 max-w-4xl text-left">
          {selectedIssue ? (
            /* Issue Detail View */
            <div className="space-y-4">
              <div className="border-b border-[#d0d7de] dark:border-[#30363d] pb-4">
                <button
                  onClick={() => { setSelectedIssue(null); setComments([]); }}
                  className="text-xs font-semibold text-[#0969da] hover:underline bg-transparent border-0 cursor-pointer p-0 mb-3"
                >
                  ← Back to issues
                </button>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#1f2328] dark:text-white">
                    {selectedIssue.title} <span className="text-[#57606a] dark:text-[#8b949e] font-light">#{selectedIssue.number}</span>
                  </h2>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full text-white ${selectedIssue.status === 'open' ? 'bg-[#2da44e]' : 'bg-[#8250df]'}`}>
                    {selectedIssue.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-2">
                  <span className="font-semibold text-[#24292f] dark:text-white">{selectedIssue.author}</span> opened this issue on {selectedIssue.updated}
                </p>
              </div>

              <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#161b22] p-4 text-sm text-[#1f2328] dark:text-[#c9d1d9]">
                {selectedIssue.description ? <MarkdownRenderer content={selectedIssue.description} /> : <i>No description provided.</i>}
              </div>

              {/* Comments list */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Comments ({comments.length})</h3>
                {commentsLoading ? (
                  <div className="text-xs text-gray-500 text-center py-4">Loading comments...</div>
                ) : (
                  <div className="space-y-3">
                    {comments.map(c => (
                      <div key={c._id || c.id} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22] overflow-hidden">
                        <div className="bg-[#f6f8fa] dark:bg-[#161b22] px-3.5 py-2 border-b border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={c.author?.avatar_url || "/profile.webp"}
                              alt="avatar"
                              className="w-5 h-5 rounded-full border object-cover"
                            />
                            <span className="font-semibold text-[#1f2328] dark:text-white">{c.author?.login || 'unknown'}</span>
                            <span className="text-[#57606a] dark:text-[#8b949e]">commented on {new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="p-3.5 text-xs sm:text-sm text-[#1f2328] dark:text-[#c9d1d9] bg-white dark:bg-[#0d1117]">
                          <MarkdownRenderer content={c.body} />
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="text-xs text-gray-500 italic py-2">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                )}
              </div>

              {/* Comment submission form */}
              <form onSubmit={handlePostIssueComment} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22] space-y-3 pt-3">
                <h4 className="text-xs font-semibold text-[#1f2328] dark:text-white">Leave a comment</h4>
                <textarea
                  required
                  placeholder="Type your comment here..."
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none focus:border-[#58a6ff] text-[#1f2328] dark:text-white"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
                  >
                    Comment
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Issues list */
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 border border-[#d0d7de] dark:border-[#30363d] rounded-md px-3 py-1.5 bg-[#f6f8fa] dark:bg-[#161b22] w-full max-w-md">
                  <SearchIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
                  <input
                    type="text"
                    placeholder="Search all issues"
                    value={issuesSearchQuery}
                    onChange={(e) => setIssuesSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-full text-[#1f2328] dark:text-white"
                  />
                </div>
                <button
                  onClick={() => setIsCreatingIssue(!isCreatingIssue)}
                  className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
                >
                  {isCreatingIssue ? "Cancel" : "New issue"}
                </button>
              </div>

              {isCreatingIssue && (
                <form onSubmit={handleCreateIssue} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22] space-y-3">
                  <h3 className="text-sm font-semibold text-[#1f2328] dark:text-white">Create a new issue</h3>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Title"
                      value={newIssueTitle}
                      onChange={(e) => setNewIssueTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none focus:border-[#58a6ff]"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Leave a comment"
                      rows={4}
                      value={newIssueDesc}
                      onChange={(e) => setNewIssueDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none focus:border-[#58a6ff]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
                    >
                      Submit new issue
                    </button>
                  </div>
                </form>
              )}

              {issuesLoading ? (
                <div className="text-center py-8 text-xs text-[#57606a]">Loading issues...</div>
              ) : (
                <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-white dark:bg-[#161b22]">
                  <div className="px-4 py-3 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIssuesFilter("all")}
                        className={`hover:text-[#1f2328] dark:hover:text-white font-medium cursor-pointer bg-transparent border-0 ${issuesFilter === 'all' ? 'text-[#1f2328] dark:text-white font-bold' : 'text-[#57606a] dark:text-[#8b949e]'}`}
                      >
                        All Issues
                      </button>
                      <button
                        onClick={() => setIssuesFilter("open")}
                        className={`hover:text-[#1f2328] dark:hover:text-white font-medium cursor-pointer bg-transparent border-0 ${issuesFilter === 'open' ? 'text-[#1f2328] dark:text-white font-bold' : 'text-[#57606a] dark:text-[#8b949e]'}`}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => setIssuesFilter("closed")}
                        className={`hover:text-[#1f2328] dark:hover:text-white font-medium cursor-pointer bg-transparent border-0 ${issuesFilter === 'closed' ? 'text-[#1f2328] dark:text-white font-bold' : 'text-[#57606a] dark:text-[#8b949e]'}`}
                      >
                        Closed
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#57606a] dark:text-[#8b949e]">Filter Label:</span>
                      <select
                        value={issuesLabelFilter}
                        onChange={(e) => setIssuesLabelFilter(e.target.value)}
                        className="px-2 py-1 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded text-[11px] outline-none"
                      >
                        <option value="all">All Labels</option>
                        <option value="bug">bug 🔴</option>
                        <option value="enhancement">enhancement 🔵</option>
                        <option value="documentation">documentation 🟢</option>
                        <option value="duplicate">duplicate 🟡</option>
                      </select>
                    </div>
                  </div>

                  <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                    {repoIssues
                      .filter(i => {
                        if (issuesFilter === 'open') return i.status === 'open';
                        if (issuesFilter === 'closed') return i.status === 'closed';
                        return true;
                      })
                      .filter(i => {
                        if (issuesLabelFilter === 'all') return true;
                        return i.labels && i.labels.includes(issuesLabelFilter);
                      })
                      .filter(i => i.title.toLowerCase().includes(issuesSearchQuery.toLowerCase()))
                      .map(issue => (
                        <div
                          key={issue.id}
                          onClick={() => { setSelectedIssue(issue); fetchIssueComments(issue.id); }}
                          className="p-4 hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] flex items-start gap-2.5 text-left transition-colors cursor-pointer"
                        >
                          <IssueOpenedIcon size={16} className={`mt-0.5 shrink-0 ${issue.status === 'open' ? 'text-[#3fb950]' : 'text-[#a371f7]'}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold text-sm text-[#1f2328] dark:text-white hover:text-[#0969da] hover:underline">{issue.title}</span>
                              {issue.labels && issue.labels.map(lbl => {
                                let labelStyle = "bg-[#f6f8fa] text-gray-800 dark:bg-[#30363d] dark:text-white";
                                if (lbl === "bug") labelStyle = "bg-[#f85149] text-white";
                                else if (lbl === "enhancement") labelStyle = "bg-[#58a6ff] text-black";
                                else if (lbl === "documentation") labelStyle = "bg-[#57ab5a] text-white";
                                else if (lbl === "duplicate") labelStyle = "bg-[#d3c6ff] text-black";
                                return (
                                  <span key={lbl} className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${labelStyle}`}>
                                    {lbl}
                                  </span>
                                );
                              })}
                            </div>
                            <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1">
                              #{issue.number} opened {issue.updated} by <span className="font-medium text-[#24292f] dark:text-[#c9d1d9]">{issue.author}</span>
                            </p>
                            {issue.description && (
                              <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-2 bg-[#f6f8fa] dark:bg-[#0d1117] p-2 rounded-md font-mono max-h-24 overflow-y-auto">
                                {issue.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    {repoIssues.length === 0 && (
                      <div className="p-8 text-center text-[#57606a] dark:text-[#8b949e] text-xs">
                        No issues found matching your filters.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : activeRepoTab === 'pulls' ? (
        <div className="py-4 space-y-4 max-w-4xl text-left">
          {selectedPR ? (
            /* Pull Request Detail View */
            <div className="space-y-4">
              <div className="border-b border-[#d0d7de] dark:border-[#30363d] pb-4">
                <button
                  onClick={() => { setSelectedPR(null); setComments([]); }}
                  className="text-xs font-semibold text-[#0969da] hover:underline bg-transparent border-0 cursor-pointer p-0 mb-3"
                >
                  ← Back to pull requests
                </button>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#1f2328] dark:text-white">
                    {selectedPR.title}
                  </h2>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full text-white ${selectedPR.status === 'merged' ? 'bg-[#8250df]' : selectedPR.status === 'closed' ? 'bg-[#cf222e]' : 'bg-[#2da44e]'}`}>
                    {selectedPR.status === 'merged' ? 'Merged' : selectedPR.status === 'closed' ? 'Closed' : 'Open'}
                  </span>
                </div>
                <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-2">
                  from <span className="font-mono bg-[#ebedf0] dark:bg-[#30363d] px-1 py-0.5 rounded text-[10px]">{selectedPR.sourceBranch}</span> into <span className="font-mono bg-[#ebedf0] dark:bg-[#30363d] px-1 py-0.5 rounded text-[10px]">{selectedPR.targetBranch}</span> by <span className="font-semibold text-[#24292f] dark:text-white">{selectedPR.author?.login || 'unknown'}</span>
                </p>
              </div>

              <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#161b22] p-4 text-sm text-[#1f2328] dark:text-[#c9d1d9]">
                {selectedPR.description ? <MarkdownRenderer content={selectedPR.description} /> : <i>No description provided.</i>}
              </div>

              {selectedPR.status === 'open' && isOwner && (
                <div className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 flex items-center justify-between">
                  <div className="text-xs text-[#57606a] dark:text-[#8b949e]">
                    This pull request has no conflicts and can be merged automatically.
                  </div>
                  <button
                    onClick={async () => {
                      await handleMergePR(selectedPR._id || selectedPR.id);
                      setSelectedPR(prev => prev ? { ...prev, status: 'merged' } : null);
                    }}
                    className="px-3.5 py-1.5 bg-[#8a63e5] hover:bg-[#986ff3] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
                  >
                    Merge Pull Request
                  </button>
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Comments ({comments.length})</h3>
                {commentsLoading ? (
                  <div className="text-xs text-gray-500 text-center py-4">Loading comments...</div>
                ) : (
                  <div className="space-y-3">
                    {comments.map(c => (
                      <div key={c._id || c.id} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22] overflow-hidden">
                        <div className="bg-[#f6f8fa] dark:bg-[#161b22] px-3.5 py-2 border-b border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={c.author?.avatar_url || "/profile.webp"}
                              alt="avatar"
                              className="w-5 h-5 rounded-full border object-cover"
                            />
                            <span className="font-semibold text-[#1f2328] dark:text-white">{c.author?.login || 'unknown'}</span>
                            <span className="text-[#57606a] dark:text-[#8b949e]">commented on {new Date(c.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="p-3.5 text-xs sm:text-sm text-[#1f2328] dark:text-[#c9d1d9] bg-white dark:bg-[#0d1117]">
                          <MarkdownRenderer content={c.body} />
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="text-xs text-gray-500 italic py-2">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                )}
              </div>

              {/* Comment submission form */}
              <form onSubmit={handlePostPRComment} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22] space-y-3 pt-3">
                <h4 className="text-xs font-semibold text-[#1f2328] dark:text-white">Leave a comment</h4>
                <textarea
                  required
                  placeholder="Type your comment here..."
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none focus:border-[#58a6ff] text-[#1f2328] dark:text-white"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
                  >
                    Comment
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* PRs list */
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1f2328] dark:text-white">Pull Requests</h3>
                <button
                  onClick={() => setIsCreatingPR(!isCreatingPR)}
                  className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
                >
                  {isCreatingPR ? "Cancel" : "New pull request"}
                </button>
              </div>

              {isCreatingPR && (
                <form onSubmit={handleCreatePR} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22] space-y-3">
                  <h3 className="text-sm font-semibold text-[#1f2328] dark:text-white">Open a new Pull Request</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#57606a] dark:text-[#8b949e] mb-1">Source Branch</label>
                      <input
                        type="text"
                        required
                        value={newPrSource}
                        onChange={(e) => setNewPrSource(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#57606a] dark:text-[#8b949e] mb-1">Target Branch</label>
                      <input
                        type="text"
                        required
                        value={newPrTarget}
                        onChange={(e) => setNewPrTarget(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Pull request title"
                      value={newPrTitle}
                      onChange={(e) => setNewPrTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none focus:border-[#58a6ff]"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Describe your changes..."
                      rows={3}
                      value={newPrDesc}
                      onChange={(e) => setNewPrDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none focus:border-[#58a6ff]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
                    >
                      Create pull request
                    </button>
                  </div>
                </form>
              )}

              {prsLoading ? (
                <div className="text-center py-8 text-xs text-[#57606a]">Loading pull requests...</div>
              ) : (
                <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-white dark:bg-[#161b22]">
                  <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                    {repoPRs.map(pr => (
                      <div
                        key={pr._id || pr.id}
                        onClick={() => { setSelectedPR(pr); fetchPRComments(pr._id || pr.id); }}
                        className="p-4 hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <GitPullRequestIcon size={16} className={`mt-0.5 shrink-0 ${pr.status === 'merged' ? 'text-[#8250df]' : pr.status === 'closed' ? 'text-[#cf222e]' : 'text-[#2da44e]'}`} />
                          <div className="min-w-0">
                            <span className="font-semibold text-sm text-[#1f2328] dark:text-white hover:text-[#0969da] hover:underline">{pr.title}</span>
                            <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1">
                              from <span className="font-mono bg-[#ebedf0] dark:bg-[#30363d] px-1 py-0.5 rounded text-[10px]">{pr.sourceBranch}</span> into <span className="font-mono bg-[#ebedf0] dark:bg-[#30363d] px-1 py-0.5 rounded text-[10px]">{pr.targetBranch}</span> by <span className="font-medium">{pr.author?.login || 'unknown'}</span>
                            </p>
                            {pr.description && <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1 italic truncate">{pr.description}</p>}
                          </div>
                        </div>
                        {pr.status === 'open' && isOwner && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMergePR(pr._id || pr.id); }}
                            className="px-3 py-1 bg-[#8a63e5] hover:bg-[#986ff3] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0 shrink-0"
                          >
                            Merge PR
                          </button>
                        )}
                        {pr.status === 'merged' && (
                          <span className="px-2 py-0.5 bg-[#a371f7]/10 text-[#a371f7] text-[10px] font-semibold border border-[#a371f7]/30 rounded-full shrink-0">
                            Merged
                          </span>
                        )}
                      </div>
                    ))}
                    {repoPRs.length === 0 && (
                      <div className="p-8 text-center text-[#57606a] dark:text-[#8b949e] text-xs">
                        No pull requests created yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : activeRepoTab === 'settings' ? (
        <div className="py-4 max-w-2xl text-left space-y-6">
          <form onSubmit={handleSaveSettings} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-6 bg-white dark:bg-[#161b22] space-y-4">
            <h3 className="text-base font-semibold text-[#1f2328] dark:text-white border-b border-[#d0d7de] dark:border-[#30363d] pb-2">Repository Settings</h3>
            {settingsMessage.text && (
              <div className={`p-3 text-xs rounded-md border ${settingsMessage.type === 'success' ? 'bg-[#3fb950]/10 border-[#3fb950]/30 text-[#3fb950]' : 'bg-[#f85149]/10 border-[#f85149]/30 text-[#f85149]'}`}>
                {settingsMessage.text}
              </div>
            )}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#1f2328] dark:text-white">Repository Name</label>
              <input
                type="text"
                required
                value={editRepoName}
                onChange={(e) => setEditRepoName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#1f2328] dark:text-white">Description</label>
              <textarea
                value={editRepoDesc}
                onChange={(e) => setEditRepoDesc(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#1f2328] dark:text-white">Visibility</label>
              <select
                value={editRepoVisibility}
                onChange={(e) => setEditRepoVisibility(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs outline-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={settingsSaving}
                className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
              >
                {settingsSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>

          {/* Action Secrets panel */}
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-6 bg-white dark:bg-[#161b22] space-y-4">
            <h3 className="text-base font-semibold text-[#1f2328] dark:text-white border-b border-[#d0d7de] dark:border-[#30363d] pb-2">Actions secrets</h3>
            <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
              Secrets are environment variables that are encrypted. They are only exposed to GitHub Actions runner pipelines.
            </p>

            {secretsError && (
              <div className="p-3 text-xs rounded border bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400">
                {secretsError}
              </div>
            )}

            {/* List existing secrets */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Repository secrets ({secretsList.length})</h4>
              {loadingSecrets ? (
                <div className="text-xs text-gray-500 py-2">Loading secrets...</div>
              ) : (
                <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d] border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] overflow-hidden">
                  {secretsList.map(sec => (
                    <div key={sec._id} className="p-3 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{sec.name}</span>
                        <span className="ml-4 text-gray-400">••••••••</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSecret(sec._id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:text-red-500 border border-red-200 dark:border-red-900 rounded bg-transparent hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {secretsList.length === 0 && (
                    <div className="p-4 text-center text-xs text-gray-500 italic">No secrets configured yet.</div>
                  )}
                </div>
              )}
            </div>

            {/* Add new secret form */}
            <form onSubmit={handleCreateSecret} className="border-t border-[#d0d7de] dark:border-[#30363d] pt-4 mt-2 space-y-3 text-left">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200">New repository secret</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Name (e.g. GH_TOKEN)"
                    value={newSecretName}
                    onChange={(e) => setNewSecretName(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded text-xs outline-none focus:border-[#58a6ff]"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    placeholder="Value"
                    value={newSecretValue}
                    onChange={(e) => setNewSecretValue(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded text-xs outline-none focus:border-[#58a6ff]"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={secretsSaving}
                  className="px-3.5 py-1.5 bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#ebedf0] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] text-xs font-semibold text-gray-800 dark:text-white rounded cursor-pointer transition-colors"
                >
                  {secretsSaving ? "Adding..." : "Add secret"}
                </button>
              </div>
            </form>
          </div>

          <div className="border border-[#f85149]/30 rounded-md p-6 bg-white dark:bg-[#161b22] space-y-4">
            <h3 className="text-base font-semibold text-[#f85149] border-b border-[#f85149]/20 pb-2">Danger Zone</h3>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h4 className="text-xs font-semibold text-[#1f2328] dark:text-white">Delete this repository</h4>
                <p className="text-[11px] text-[#57606a] dark:text-[#8b949e] mt-0.5">Once you delete a repository, there is no going back. Please be certain.</p>
              </div>
              <button
                onClick={handleDeleteRepo}
                className="px-3 py-2 bg-[#f85149] hover:bg-[#da3633] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
              >
                Delete this repository
              </button>
            </div>
          </div>
        </div>
      ) : activeRepoTab === 'commits' ? (
        <div className="py-4 max-w-4xl text-left space-y-4">
          <h3 className="text-sm font-semibold text-[#1f2328] dark:text-white">Commit History</h3>
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-white dark:bg-[#161b22]">
            <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {commitsList.map((commit, idx) => (
                <div key={idx} className="p-4 hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] flex items-center justify-between gap-4 transition-colors">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <img
                      src={commit.avatar_url}
                      alt="author avatar"
                      className="w-8 h-8 rounded-full object-cover border border-[#d0d7de] dark:border-[#30363d]"
                    />
                    <div className="min-w-0">
                      <span
                        onClick={() => setActiveCommitDiff(commit)}
                        className="font-semibold text-sm text-[#1f2328] dark:text-white hover:text-[#0969da] hover:underline cursor-pointer block truncate"
                      >
                        {commit.message}
                      </span>
                      <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1">
                        <span className="font-semibold text-[#24292f] dark:text-white">{commit.author}</span> committed {commit.date}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveCommitDiff(commit)}
                    className="font-mono text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline bg-[#f6f8fa] dark:bg-[#21262d] px-2.5 py-1 rounded border border-[#d0d7de] dark:border-[#30363d] cursor-pointer"
                  >
                    {commit.hash}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeRepoTab === 'projects' ? (
        <ProjectsTab repoId={repoData?._id || repoData?.id} />
      ) : activeRepoTab === 'actions' ? (
        <ActionsTab repoId={repoData?._id || repoData?.id} />
      ) : (
        /* Dynamic placeholder views for all other tabs matching GitHub's premium design */
        <div className="py-12 max-w-2xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#ebedf0] dark:bg-[#30363d] flex items-center justify-center mx-auto text-gray-500">
            {tabs.find(t => t.id === activeRepoTab)?.icon}
          </div>
          <h3 className="text-lg font-semibold capitalize">{activeRepoTab} Tab</h3>
          <p className="text-sm text-[#57606a] dark:text-[#8b949e]">
            This section simulates the real GitHub {activeRepoTab} dashboard. Here you can view issues, pull requests, project boards, and integration settings mapped dynamically.
          </p>
          <button 
            onClick={() => setActiveRepoTab('code')}
            className="px-4 py-2 bg-[#0969da] text-white text-xs font-semibold rounded hover:bg-[#0855b3] transition-colors cursor-pointer border-0"
          >
            Go back to Code
          </button>
        </div>
      )}

      {/* Commit Diff Modal Overlay */}
      {activeCommitDiff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-[#d0d7de] dark:border-[#30363d] flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#24292f] dark:text-white font-sans">
                  Commit: <span className="font-mono text-sm text-[#0969da] dark:text-[#58a6ff] bg-[#f6f8fa] dark:bg-[#21262d] px-1.5 py-0.5 rounded">{activeCommitDiff.hash}</span>
                </h3>
                <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1">
                  Authored by <span className="font-semibold">{activeCommitDiff.author}</span> · {activeCommitDiff.date}
                </p>
              </div>
              <button 
                onClick={() => setActiveCommitDiff(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg font-bold p-1 bg-transparent border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="bg-[#f6f8fa] dark:bg-[#21262d] border border-[#d0d7de] dark:border-[#30363d] rounded p-3 text-sm italic text-[#24292f] dark:text-white">
                "{activeCommitDiff.message}"
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                  Files Changed ({activeCommitDiff.files.length})
                </h4>

                <div className="space-y-4">
                  {activeCommitDiff.files.map((file, fileIdx) => (
                    <div key={fileIdx} className="border border-[#d0d7de] dark:border-[#30363d] rounded overflow-hidden">
                      <div className="px-4 py-2 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] flex justify-between items-center text-xs text-[#24292f] dark:text-white font-mono">
                        <span>{file.name}</span>
                        <div className="flex gap-2">
                          <span className="text-[#1a7f37] font-semibold">+{file.additions}</span>
                          <span className="text-[#cf222e] font-semibold">-{file.deletions}</span>
                        </div>
                      </div>

                      <pre className="p-3 bg-[#f6f8fa] dark:bg-[#0d1117] overflow-x-auto text-[11px] font-mono leading-relaxed text-[#1f2328] dark:text-[#c9d1d9] whitespace-pre">
                        {file.diff.split('\n').map((line, lineIdx) => {
                          let lineStyle = "text-[#1f2328] dark:text-[#c9d1d9]";
                          if (line.startsWith('+')) {
                            lineStyle = "bg-[#dafbe1] dark:bg-[#1f3f26] text-[#1a7f37] dark:text-[#3fb950] px-1";
                          } else if (line.startsWith('-')) {
                            lineStyle = "bg-[#ffebe9] dark:bg-[#4d1f21] text-[#cf222e] dark:text-[#ff7b72] px-1";
                          } else if (line.startsWith('@@')) {
                            lineStyle = "text-[#0969da] dark:text-[#58a6ff] opacity-80";
                          }
                          return (
                            <div key={lineIdx} className={lineStyle}>
                              {line}
                            </div>
                          );
                        })}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#d0d7de] dark:border-[#30363d] flex justify-end">
              <button 
                onClick={() => setActiveCommitDiff(null)}
                className="px-4 py-2 bg-[#0969da] hover:bg-[#0855b3] text-white text-xs font-semibold rounded transition-colors cursor-pointer border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoDetails;
