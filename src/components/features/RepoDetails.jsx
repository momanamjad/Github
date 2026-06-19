import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRepo } from "@services/GithubApi.jsx";
import RepoHeader from "@features/RepoHeader";
import RepoFileList from "@features/RepoFileList";
import { getTree } from "@services/fileSystemService.js";
import { getStoredRepositories } from "@services/storageService.js";
import FileExplorer from "@components/FileExplorer.jsx";
import FileEditor from "@components/FileEditor.jsx";
import { useGitHub } from "@contexts/GitHubContext";
import DiscussionsTab from "./tabs/DiscussionsTab";
import ReactMarkdown from "react-markdown";
import { Folder, File as FileIcon, GitBranch, Tag, ChevronDown, BookOpen, Pencil, List, History, Settings, ExternalLink, Info } from "lucide-react";




const RepoDetails = () => {
  const { username, repo } = useParams();
  const { user } = useGitHub();
  const [activeRepoTab, setActiveRepoTab] = useState("code");
  const [currentPath, setCurrentPath] = useState("");

  const [repoData, setRepoData] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileTree, setFileTree] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCommitDiff, setActiveCommitDiff] = useState(null);

  // Mock commits data for the repository
  const [commitsList, setCommitsList] = useState([
    {
      hash: "8f3a9e2",
      message: "Refactor router config and add system dark mode listener",
      author: username || "moman",
      date: "2 hours ago",
      files: [
        {
          name: "src/App.jsx",
          additions: 11,
          deletions: 2,
          diff: `@@ -215,8 +215,17 @@
-  useEffect(() => {
-    initializeStorage();
-  }, []);
+  useEffect(() => {
+    initializeStorage();
+
+    // Automatic dark/light mode system theme listener
+    const media = window.matchMedia('(prefers-color-scheme: dark)');
+    const updateTheme = () => {
+      if (media.matches) {
+        document.documentElement.classList.add('dark');
+      } else {
+        document.documentElement.classList.remove('dark');
+      }
+    };
+    updateTheme();
+    media.addEventListener('change', updateTheme);
+    return () => media.removeEventListener('change', updateTheme);
+  }, []);`
        },
        {
          name: "src/pages/Issues.jsx",
          additions: 4,
          deletions: 1,
          diff: `@@ -67,5 +67,8 @@
-  const [selectedIssue, setSelectedIssue] = useState(null);
+  const [selectedIssueId, setSelectedIssueId] = useState(null);
+  const selectedIssue = issues.find(i => i.id === selectedIssueId);
+  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);`
        }
      ]
    },
    {
      hash: "4c7b2e1",
      message: "Fix layout scaling on profile tabs",
      author: "alice",
      date: "yesterday",
      files: [
        {
          name: "src/pages/ProfileLayout.jsx",
          additions: 3,
          deletions: 1,
          diff: `@@ -12,3 +12,5 @@
-  const tabs = ["overview", "repositories", "stars"];
+  const tabs = ["overview", "repositories", "stars", "followers", "following"];`
        }
      ]
    }
  ]);

  useEffect(() => {
    const loadRepo = async () => {
      try {
        setLoading(true);
        setError(null);

        const repoInfo = await getRepo(username, repo);
        setRepoData(repoInfo);

        // Sync backend repository info (containing DB fileTree) to local storage cache
        if (repoInfo) {
          const cachedRepos = getStoredRepositories();
          const idx = cachedRepos.findIndex(r => r._id === repoInfo._id || r.id === repoInfo.id);
          if (idx === -1) {
            cachedRepos.push(repoInfo);
          } else {
            cachedRepos[idx] = { ...cachedRepos[idx], ...repoInfo };
          }
          localStorage.setItem('github_repositories', JSON.stringify(cachedRepos));
        }

        if (repoInfo.fileTree) {
          const tree = await getTree(repoInfo._id || repoInfo.id);
          setFileTree(tree);
          setFiles(tree);
        } else {
          // For repos without a fileTree, show a default structure
          const defaultContents = [
            {
              name: "src",
              path: "src",
              type: "dir",
              html_url: `https://github.com/${username}/${repo}/tree/main/src`,
            },
            {
              name: "README.md",
              path: "README.md",
              type: "file",
              size: 2048,
              html_url: `https://github.com/${username}/${repo}/blob/main/README.md`,
            },
            {
              name: "package.json",
              path: "package.json",
              type: "file",
              size: 845,
              html_url: `https://github.com/${username}/${repo}/blob/main/package.json`,
            },
          ];
          setFiles(defaultContents);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRepo();
  }, [username, repo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="border border-[#d0d7de] rounded-md p-6 bg-white text-center">
          <p className="text-[#cf222e] text-[14px] font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const refreshTree = async () => {
    if (!repoData) return;
    const tree = await getTree(repoData._id || repoData.id);
    setFileTree([...tree]);
  };

  const handleSelect = (node) => {
    if (node && node.type === "file") {
      setSelectedFile(node);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSaveFile = (path, newContent) => {
    if (selectedFile && selectedFile.path === path) {
      setSelectedFile({ ...selectedFile, content: newContent });
    }
  };

  const getFilesAtCurrentPath = () => {
    const activeTree = fileTree.length > 0 ? fileTree : files;
    if (!currentPath) return activeTree;
    const parts = currentPath.split('/');
    let currentChildren = activeTree;
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
    const lower = name.toLowerCase();
    if (lower.includes('readme')) {
      return {
        message: 'feat: update readme',
        date: '3 weeks ago'
      };
    }
    if (lower.includes('package.json')) {
      return {
        message: 'chore: update dependencies',
        date: '3 weeks ago'
      };
    }
    if (lower === 'src' || lower === 'frontend' || lower === 'backend' || lower === 'admin') {
      return {
        message: 'feat: comprehensive app upgrades - security, features, code ...',
        date: '3 weeks ago'
      };
    }
    return {
      message: commitsList[0]?.message || 'Initial commit',
      date: commitsList[0]?.date || '3 weeks ago'
    };
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

  const isOwner = user?.login === repoData?.owner?.login;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] min-h-screen transition-colors">
      <RepoHeader repo={repoData} />

      {/* Repo Navigation Tabs */}
      <div className="border-b border-[#d0d7de] dark:border-[#30363d] mb-4 mt-2">
        <nav className="flex space-x-6" aria-label="Repository navigation">
          <button
            onClick={() => { setActiveRepoTab('code'); setSelectedFile(null); }}
            className={`pb-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 -mb-[1px] ${
              activeRepoTab === 'code'
                ? 'border-[#fd8c73] text-[#1f2328] dark:text-white font-semibold'
                : 'border-transparent text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-white hover:border-[#d0d7de] dark:hover:border-[#30363d]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            Code
          </button>
          <button
            onClick={() => { setActiveRepoTab('discussions'); setSelectedFile(null); }}
            className={`pb-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 -mb-[1px] ${
              activeRepoTab === 'discussions'
                ? 'border-[#fd8c73] text-[#1f2328] dark:text-white font-semibold'
                : 'border-transparent text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-white hover:border-[#d0d7de] dark:hover:border-[#30363d]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Discussions
          </button>
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
                repoId={repoData._id || repoData.id}
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
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22] text-xs font-semibold hover:bg-[#ebedf0] dark:hover:bg-[#30363d] cursor-pointer">
                    <GitBranch size={14} className="text-[#57606a] dark:text-[#8b949e]" />
                    <span>main</span>
                    <ChevronDown size={12} className="text-[#57606a] dark:text-[#8b949e]" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#57606a] dark:text-[#8b949e] font-semibold ml-2">
                    <span className="flex items-center gap-1">
                      <GitBranch size={13} />
                      1 Branch
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag size={13} />
                      0 Tags
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
                    <ChevronDown size={10} />
                  </button>
                  <button className="px-3 py-1.5 border border-transparent rounded-md bg-[#1f883d] text-xs font-semibold text-white hover:bg-[#1a7f37] cursor-pointer transition-colors flex items-center gap-1">
                    <span>Code</span>
                    <ChevronDown size={10} />
                  </button>
                </div>
              </div>

              {/* Commit Strip (GitHub Style) */}
              <div className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3 flex items-center justify-between text-xs text-[#57606a] dark:text-[#8b949e]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#1f2328] dark:bg-[#30363d] text-white flex items-center justify-center font-bold text-[10px]">
                    {(commitsList[0]?.author || "M").substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-[#1f2328] dark:text-white">{commitsList[0]?.author}</span>
                  <span 
                    onClick={() => setActiveCommitDiff(commitsList[0])}
                    className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline cursor-pointer font-medium"
                  >
                    {commitsList[0]?.message}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{commitsList[0]?.date}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveCommitDiff(commitsList[0])}
                      className="font-mono text-[#0969da] dark:text-[#58a6ff] hover:underline bg-transparent border-0 cursor-pointer text-xs"
                    >
                      {commitsList[0]?.hash}
                    </button>
                    <span className="text-[#d0d7de] dark:text-[#30363d]">|</span>
                    <span className="font-semibold text-[#24292f] dark:text-white cursor-pointer hover:text-[#0969da] dark:hover:text-[#58a6ff]" onClick={() => setActiveCommitDiff(commitsList[0])}>
                      <span className="inline-flex items-center gap-1">
                        <History size={12} />
                        <strong>{commitsList.length}</strong> commits
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Breadcrumbs for nested subfolders */}
              {currentPath && (
                <div className="px-1 py-1 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
                  {renderBreadcrumbs()}
                </div>
              )}

              {/* Files Table List */}
              <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-white dark:bg-[#161b22]">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    {/* Up one directory row */}
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
                          {/* Name column */}
                          <td className="px-4 py-2.5 font-medium text-[#24292f] dark:text-white flex items-center gap-2 max-w-[200px] truncate">
                            {item.type === 'dir' ? (
                              <Folder size={16} className="text-[#54a3ff] shrink-0" />
                            ) : (
                              <FileIcon size={16} className="text-[#57606a] dark:text-[#8b949e] shrink-0" />
                            )}
                            <span className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline truncate">
                              {item.name}
                            </span>
                          </td>
                          {/* Commit message column */}
                          <td className="px-4 py-2.5 text-[#57606a] dark:text-[#8b949e] truncate max-w-[300px]">
                            {commitInfo.message}
                          </td>
                          {/* Commit date column */}
                          <td className="px-4 py-2.5 text-[#57606a] dark:text-[#8b949e] text-right whitespace-nowrap w-[100px]">
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
                const readmeFile = (fileTree || files || []).find(f => f.name.toLowerCase() === 'readme.md');
                if (!readmeFile) return null;
                return (
                  <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#0d1117] text-left">
                    <div className="px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-[#57606a] dark:text-[#8b949e]" />
                        <span className="font-semibold text-xs text-[#24292f] dark:text-white font-sans">README.md</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setSelectedFile(readmeFile)}
                          className="p-1 hover:bg-[#ebedf0] dark:hover:bg-[#30363d] rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer border-0"
                          title="Edit README"
                        >
                          <Pencil size={14} />
                        </button>
                        <button className="p-1 hover:bg-[#ebedf0] dark:hover:bg-[#30363d] rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer border-0">
                          <List size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 prose dark:prose-invert max-w-none text-sm text-[#24292f] dark:text-[#c9d1d9] markdown-body">
                      <ReactMarkdown>{readmeFile.content || `# ${repoData?.name || ''}\n${repoData?.description || ''}`}</ReactMarkdown>
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
                    <Settings size={14} className="text-[#57606a] dark:text-[#8b949e] hover:text-[#0969da] cursor-pointer" />
                  )}
                </div>
                <p className="text-xs text-[#24292f] dark:text-[#c9d1d9] leading-relaxed">
                  {repoData?.description || "No description, website, or topics provided."}
                </p>
                
                {/* Website URL */}
                <div className="flex items-center gap-1.5 text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline font-medium">
                  <ExternalLink size={12} />
                  <a href={`https://${repo}.vercel.app`} target="_blank" rel="noreferrer" className="truncate">
                    {repo}.vercel.app
                  </a>
                </div>

                {/* Additional Quick Stats */}
                <div className="space-y-2.5 pt-3">
                  <div className="flex items-center gap-2 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                    <BookOpen size={14} className="text-[#57606a] dark:text-[#8b949e]" />
                    <span>Readme</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                    <History size={14} className="text-[#57606a] dark:text-[#8b949e]" />
                    <span>Activity</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                    <svg className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e]" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                    </svg>
                    <span><strong>{repoData?.stars_count || 0}</strong> stars</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                    <svg className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e]" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 2a5.002 5.002 0 0 0-3.205 8.844.75.75 0 0 1-.453 1.28A6.5 6.5 0 1 1 14.5 8a.75.75 0 0 1-1.5 0 5 5 0 0 0-5-5ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z" />
                    </svg>
                    <span><strong>{repoData?.watchers_count || 0}</strong> watching</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#24292f] dark:text-[#c9d1d9]">
                    <svg className="w-3.5 h-3.5 text-[#57606a] dark:text-[#8b949e]" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878ZM5 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm7-9.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>
                    <span><strong>{repoData?.forks_count || 0}</strong> forks</span>
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
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#ebedf0] dark:bg-[#30363d] text-[#57606a] dark:text-[#8b949e]">
                    175
                  </span>
                </h3>
                <div className="space-y-3">
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
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="py-4 sm:py-6">
          <DiscussionsTab repoId={repoData._id || repoData.id} isOwner={isOwner} />
        </div>
      )}

      {/* Commit Diff Modal Overlay */}
      {activeCommitDiff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
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

            {/* Modal Body */}
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
                      {/* File Header */}
                      <div className="px-4 py-2 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] flex justify-between items-center text-xs text-[#24292f] dark:text-white font-mono">
                        <span>{file.name}</span>
                        <div className="flex gap-2">
                          <span className="text-[#1a7f37] font-semibold">+{file.additions}</span>
                          <span className="text-[#cf222e] font-semibold">-{file.deletions}</span>
                        </div>
                      </div>

                      {/* File Diff Content */}
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

            {/* Modal Footer */}
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
