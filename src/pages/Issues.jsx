import React, { useState, useCallback } from "react";
import { PlusIcon, SearchIcon, ChevronDownIcon, CheckIcon, TagIcon, PersonIcon } from "@primer/octicons-react";
import FilterModal from "../components/FilterModal";
import { useGitHub } from "../contexts/GitHubContext";
import { apiClient } from "@/services/apiClient";
import { StarsIcon } from "../components/ui/Icons";
import TabUserIcon from "../components/ui/icons/TabUserIcon";
import TabCircleIcon from "../components/ui/icons/TabCircleIcon";
import TabAtIcon from "../components/ui/icons/TabAtIcon";
import TabClockIcon from "../components/ui/icons/TabClockIcon";
import ViewUntitledIcon from "../components/ui/icons/ViewUntitledIcon";
import IssuesVariantIcon from "../components/ui/icons/IssuesVariantIcon";
import FooterGithubIcon from "../components/ui/icons/FooterGithubIcon";
import OpenIssueModal from "../components/features/OpenIssueModal";

export default function GitHubIssues() {
  const [activeTab, setActiveTab] = useState("assigned");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, repositories } = useGitHub();
  const activeUsername = user?.login || "";
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBackendIssues = useCallback(async () => {
    if (!repositories || repositories.length === 0) return;
    try {
      const allIssuesPromise = repositories.map(async (repo) => {
        const repoId = repo._id || repo.id;
        try {
          const res = await apiClient(`/repos/${repoId}/issues?state=all&limit=50`);
          return (res?.data || []).map(issue => ({
            id: issue._id,
            title: issue.title,
            repo: repo.name,
            repoId: repoId,
            number: issue.number || parseInt(issue._id ? issue._id.substring(18, 24) : '0', 16) || 1,
            status: issue.state || 'open',
            author: issue.creator?.login || 'unknown',
            updated: new Date(issue.updated_at || issue.created_at).toLocaleDateString(),
            updatedAt: issue.updated_at || issue.created_at,
            labels: issue.labels || [],
            assignee: issue.assignee?.login || null,
            description: issue.description || '',
          }));
        } catch (e) {
          console.warn(`Failed to fetch issues for repo ${repo.name}:`, e);
          return [];
        }
      });
      const resolved = await Promise.all(allIssuesPromise);
      const aggregated = resolved.flat().sort((a, b) => b.number - a.number);
      setIssues(aggregated);
    } catch (err) {
      console.error("Failed to load issues:", err);
    }
  }, [repositories]);

  React.useEffect(() => {
    setLoading(true);
    fetchBackendIssues().finally(() => setLoading(false));
  }, [fetchBackendIssues]);

  React.useEffect(() => {
    const handleIssuesUpdate = () => {
      fetchBackendIssues();
    };
    window.addEventListener("github_clone_issues_updated", handleIssuesUpdate);
    return () => window.removeEventListener("github_clone_issues_updated", handleIssuesUpdate);
  }, [fetchBackendIssues]);

  const handleCreateIssue = (newlyCreated) => {
    fetchBackendIssues();
  };

  const tabs = [
    { id: "assigned", label: "Assigned to me", icon: "user" },
    { id: "created", label: "Created by me", icon: "circle" },
    { id: "mentioned", label: "Mentioned", icon: "at" },
    { id: "recent", label: "Recent activity", icon: "clock" },
  ];

  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  React.useEffect(() => {
    if (!selectedIssue) {
      setComments([]);
      return;
    }
    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const res = await apiClient(`/repos/${selectedIssue.repoId}/issues/${selectedIssue.id}/comments`);
        setComments(res?.data || []);
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [selectedIssue]);

  const [newCommentText, setNewCommentText] = useState("");

  // Sidebar selector dropdown toggles
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);
  const [labelDropdownOpen, setLabelDropdownOpen] = useState(false);

  const assigneeDropdownRef = React.useRef(null);
  const labelDropdownRef = React.useRef(null);

  React.useEffect(() => {
    if (!assigneeDropdownOpen) return;
    const handler = (e) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(e.target)) {
        setAssigneeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [assigneeDropdownOpen]);

  React.useEffect(() => {
    if (!labelDropdownOpen) return;
    const handler = (e) => {
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(e.target)) {
        setLabelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [labelDropdownOpen]);

  const allAssignees = [activeUsername, "alice", "bob", "ghost"];
  const allLabels = ["bug", "enhancement", "ui", "documentation", "duplicate"];

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedIssue) return;
    try {
      const res = await apiClient(`/repos/${selectedIssue.repoId}/issues/${selectedIssue.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: newCommentText })
      });
      if (res?.data) {
        setComments(prev => [...prev, res.data]);
      }
      setNewCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleToggleIssueStatus = async () => {
    if (!selectedIssue) return;
    const nextState = selectedIssue.status === "open" ? "closed" : "open";
    try {
      await apiClient(`/repos/${selectedIssue.repoId}/issues/${selectedIssue.id}`, {
        method: "PUT",
        body: JSON.stringify({ state: nextState }),
      });
      setIssues(prev => prev.map(issue => {
        if (issue.id === selectedIssue.id) {
          return {
            ...issue,
            status: nextState
          };
        }
        return issue;
      }));
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setActionError("Failed to update issue status. Please try again.");
    }
  };

  const handleToggleLabel = async (label) => {
    if (!selectedIssue) return;
    const hasLabel = selectedIssue.labels.includes(label);
    const newLabels = hasLabel
      ? selectedIssue.labels.filter(l => l !== label)
      : [...selectedIssue.labels, label];
    try {
      await apiClient(`/repos/${selectedIssue.repoId}/issues/${selectedIssue.id}`, {
        method: "PUT",
        body: JSON.stringify({ labels: newLabels }),
      });
      setIssues(prev => prev.map(issue => {
        if (issue.id === selectedIssue.id) {
          return { ...issue, labels: newLabels };
        }
        return issue;
      }));
    } catch (err) {
      console.error("Failed to toggle label:", err);
      setActionError("Failed to update issue labels. Please try again.");
    }
  };

  const handleSelectAssignee = async (assigneeName) => {
    if (!selectedIssue) return;
    const nextAssignee = selectedIssue.assignee === assigneeName ? null : assigneeName;
    try {
      await apiClient(`/repos/${selectedIssue.repoId}/issues/${selectedIssue.id}`, {
        method: "PUT",
        body: JSON.stringify({ assignee: nextAssignee }),
      });
      setIssues(prev => prev.map(issue => {
        if (issue.id === selectedIssue.id) {
          return {
            ...issue,
            assignee: nextAssignee
          };
        }
        return issue;
      }));
    } catch (err) {
      console.error("Failed to select assignee:", err);
      setActionError("Failed to update issue assignee. Please try again.");
    }
  };

  let tabFilteredIssues = issues;
  const userLogin = user?.login || "";

  if (activeTab === "created") {
    tabFilteredIssues = issues.filter(issue => issue.author === userLogin);
  } else if (activeTab === "assigned") {
    tabFilteredIssues = issues.filter(issue => {
      if (issue.assignees && Array.isArray(issue.assignees)) {
        return issue.assignees.some(a => (typeof a === 'string' ? a : a?.login) === userLogin);
      }
      return issue.assignee === userLogin;
    });
  } else if (activeTab === "mentioned") {
    tabFilteredIssues = issues.filter(issue => {
      const mentionStr = `@${userLogin}`;
      const inBody = (issue.description || "").includes(mentionStr);
      return inBody;
    });
  } else if (activeTab === "recent") {
    tabFilteredIssues = [...issues].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.updated || 0);
      const dateB = new Date(b.updatedAt || b.updated || 0);
      return dateB - dateA;
    });
  }

  const filteredIssues = tabFilteredIssues.filter(issue => 
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] flex flex-col transition-colors">
      <div className="flex flex-1">
        <aside className="w-64 bg-white dark:bg-[#0d1117] border-r border-[#d0d7de] dark:border-[#30363d] min-h-screen hidden lg:block">
          <div className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`p-1 relative transition-all ${
                    activeTab === tab.id
                      ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => { setActiveTab(tab.id); setSelectedIssueId(null); }}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                      activeTab === tab.id
                        ? "bg-[#ECEEF0] dark:bg-[#21262d] text-[#24292f] dark:text-white font-medium"
                        : "text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]"
                    }`}
                  >
                    {tab.icon === "user" && <TabUserIcon className="w-4 h-4 text-current" />}
                    {tab.icon === "circle" && <TabCircleIcon className="w-4 h-4 text-current" />}
                    {tab.icon === "at" && <TabAtIcon className="w-4 h-4 text-current" />}
                    {tab.icon === "clock" && <TabClockIcon className="w-4 h-4 text-current" />}
                    <span>{tab.label}</span>
                  </button>
                </div>
              ))}
            </nav>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-[#57606a] dark:text-[#8b949e] uppercase">
                  Views
                </h3>
                <button className="text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white">
                  <PlusIcon size={16} />
                </button>
              </div>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]">
                  <ViewUntitledIcon className="w-4 h-4 text-current" />
                  <span>Untitled view</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {selectedIssue ? (
              // ISSUE DETAILS PANEL
              <div className="space-y-6">
                <div>
                  <button
                    onClick={() => setSelectedIssueId(null)}
                    className="text-[#0969da] dark:text-[#58a6ff] hover:underline text-sm font-medium mb-3 cursor-pointer inline-flex items-center gap-1 bg-transparent border-0"
                  >
                    ← Back to issues list
                  </button>

                  {actionError && (
                    <div className="mb-4 p-3 text-sm text-[#ff7b72] bg-[#f85149]/10 border border-[#f85149]/30 rounded-md flex justify-between items-center">
                      <span>{actionError}</span>
                      <button onClick={() => setActionError(null)} className="text-xs font-bold text-[#ff7b72] bg-transparent border-0 cursor-pointer p-1">✕</button>
                    </div>
                  )}
                  <h1 className="text-2xl font-normal text-[#1f2328] dark:text-white mb-2 flex items-center gap-3">
                    <span className="font-semibold">{selectedIssue.title}</span>
                    <span className="text-[#57606a] dark:text-[#8b949e] font-light">#{selectedIssue.number}</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm border-b border-[#d0d7de] dark:border-[#30363d] pb-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold text-white rounded-full ${
                      selectedIssue.status === "open" ? "bg-[#1a7f37]" : "bg-[#8250df]"
                    }`}>
                      {selectedIssue.status === "open" ? "💡 Open" : "🟣 Closed"}
                    </span>
                    <span className="text-[#57606a] dark:text-[#8b949e]">
                      <span className="font-semibold text-[#1f2328] dark:text-white">{selectedIssue.author}</span> opened this issue in{" "}
                      <span className="font-semibold text-[#1f2328] dark:text-white">{selectedIssue.repo}</span> · {selectedIssue.updated}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Left Column: Comments, Replies and Input */}
                  <div className="lg:col-span-3 space-y-4">
                    {/* Original post */}
                    <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg overflow-hidden bg-white dark:bg-[#161b22]">
                      <div className="px-4 py-2 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] text-xs text-[#57606a] dark:text-[#8b949e] flex justify-between">
                        <span><span className="font-semibold text-[#1f2328] dark:text-white">{selectedIssue.author}</span> commented {selectedIssue.updated}</span>
                        <span className="px-1.5 py-0.5 border border-[#d0d7de] dark:border-[#30363d] rounded bg-white dark:bg-[#0d1117] font-medium text-[10px]">Owner</span>
                      </div>
                      <div className="p-4 text-[14px] leading-relaxed text-[#1f2328] dark:text-[#c9d1d9]">
                        Please look into the issue regarding "{selectedIssue.title}". We need this addressed immediately for quality check.
                      </div>
                    </div>

                    {/* Render Comments */}
                    {comments.map((comment, index) => {
                      const commentAuthor = comment.author?.login || comment.author || "Someone";
                      const commentDate = new Date(comment.created_at || comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={comment._id || index} className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg overflow-hidden bg-white dark:bg-[#161b22]">
                          <div className="px-4 py-2 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] text-xs text-[#57606a] dark:text-[#8b949e] flex justify-between">
                            <span><span className="font-semibold text-[#1f2328] dark:text-white">{commentAuthor}</span> commented {commentDate}</span>
                          </div>
                          <div className="p-4 text-[14px] leading-relaxed text-[#1f2328] dark:text-[#c9d1d9]">
                            {comment.body}
                          </div>
                        </div>
                      );
                    })}

                    {/* Add comment box */}
                    <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg overflow-hidden bg-white dark:bg-[#161b22] mt-6">
                      <div className="px-4 py-2.5 bg-[#f6f8fa] dark:bg-[#161b22] border-b border-[#d0d7de] dark:border-[#30363d] text-xs font-semibold text-[#57606a] dark:text-[#8b949e]">
                        Write a comment
                      </div>
                      <form onSubmit={handleAddComment} className="p-4 space-y-3">
                        <textarea
                          rows="4"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Leave a comment"
                          className="w-full border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleToggleIssueStatus}
                            className="px-4 py-2 border border-[#d0d7de] dark:border-[#30363d] text-xs font-semibold rounded-md transition-colors cursor-pointer bg-white dark:bg-[#21262d] text-[#1f2328] dark:text-[#c9d1d9] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d]"
                          >
                            {selectedIssue.status === "open" ? "Close issue" : "Reopen issue"}
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#2da44e] hover:bg-[#2c974b] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer border-0"
                          >
                            Comment
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Right Column: Metadata Sidebar */}
                  <div className="space-y-6 lg:border-l lg:border-[#d0d7de] lg:dark:border-[#30363d] lg:pl-6">
                    {/* Assignees section */}
                    <div ref={assigneeDropdownRef} className="relative border-b border-[#d0d7de] dark:border-[#30363d] pb-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#57606a] dark:text-[#8b949e] mb-2">
                        <span>Assignees</span>
                        <button
                          onClick={() => setAssigneeDropdownOpen(!assigneeDropdownOpen)}
                          className="hover:text-[#0969da] dark:hover:text-[#58a6ff] cursor-pointer bg-transparent border-0"
                        >
                          ⚙️
                        </button>
                      </div>

                      {selectedIssue.assignee ? (
                        <div className="flex items-center gap-2 text-sm text-[#1f2328] dark:text-[#c9d1d9]">
                          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-200">
                            {selectedIssue.assignee.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{selectedIssue.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#57606a] dark:text-[#8b949e] italic">No one assigned</span>
                      )}

                      {/* Dropdown Menu for Assignees */}
                      {assigneeDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-lg z-10 py-1">
                          <div className="px-3 py-1.5 text-xs font-semibold text-[#57606a] dark:text-[#8b949e] border-b border-[#d0d7de] dark:border-[#30363d]">
                            Assign up to 1 user
                          </div>
                          {allAssignees.map(user => (
                            <button
                              key={user}
                              onClick={() => {
                                handleSelectAssignee(user);
                                setAssigneeDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] flex items-center justify-between text-[#1f2328] dark:text-[#c9d1d9] bg-transparent border-0 cursor-pointer"
                            >
                              <span>{user}</span>
                              {selectedIssue.assignee === user && <CheckIcon size={14} className="text-[#0969da] dark:text-[#58a6ff]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Labels section */}
                    <div ref={labelDropdownRef} className="relative border-b border-[#d0d7de] dark:border-[#30363d] pb-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#57606a] dark:text-[#8b949e] mb-2">
                        <span>Labels</span>
                        <button
                          onClick={() => setLabelDropdownOpen(!labelDropdownOpen)}
                          className="hover:text-[#0969da] dark:hover:text-[#58a6ff] cursor-pointer bg-transparent border-0"
                        >
                          ⚙️
                        </button>
                      </div>

                      {selectedIssue.labels.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedIssue.labels.map(label => (
                            <span
                              key={label}
                              className="px-2 py-0.5 text-xs font-medium border border-[#d0d7de] dark:border-[#30363d] rounded-full text-[#636c76] dark:text-[#8b949e] bg-[#f6f8fa] dark:bg-[#21262d]"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[#57606a] dark:text-[#8b949e] italic">None yet</span>
                      )}

                      {/* Dropdown Menu for Labels */}
                      {labelDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-lg z-10 py-1">
                          <div className="px-3 py-1.5 text-xs font-semibold text-[#57606a] dark:text-[#8b949e] border-b border-[#d0d7de] dark:border-[#30363d]">
                            Apply labels
                          </div>
                          {allLabels.map(label => (
                            <button
                              key={label}
                              onClick={() => handleToggleLabel(label)}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] flex items-center justify-between text-[#1f2328] dark:text-[#c9d1d9] bg-transparent border-0 cursor-pointer"
                            >
                              <span>{label}</span>
                              {selectedIssue.labels.includes(label) && <CheckIcon size={14} className="text-[#0969da] dark:text-[#58a6ff]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // ISSUES LIST PANEL
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-semibold text-[#24292f] dark:text-white">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h1>
                  <button 
                    onClick={() => setIsNewIssueOpen(true)}
                    className="bg-[#1C8139] hover:bg-[#2c974b] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer border-0"
                  >
                    New issue
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md focus-within:border-[#0969da] focus-within:ring-1 focus-within:ring-[#0969da]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm focus:outline-none bg-transparent text-[#1f2328] dark:text-white"
                      placeholder="Search all issues..."
                    />
                    <button className="px-3 py-2 hover:bg-[#D1D9E0] dark:hover:bg-[#30363d] bg-[#EFF2F5] dark:bg-[#161b22] border-l border-[#d0d7de] dark:border-[#30363d] rounded-r-md transition-colors border-y-0 border-r-0 cursor-pointer">
                      <SearchIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-[#F6F8FA] dark:bg-[#161b22] border-[#d0d7de] dark:border-[#30363d]">
                    <div className="text-sm text-[#57606a] dark:text-[#8b949e]">
                      <span className="font-semibold">{filteredIssues.length} results</span>
                    </div>
                    <div className="flex items-center rounded-md hover:bg-[#D1D9E0] dark:hover:bg-[#30363d] gap-3">
                      <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors bg-transparent border-0 cursor-pointer text-[#24292f] dark:text-white">
                        <IssuesVariantIcon className="w-4 h-4" />
                        <span>Updated</span>
                        <ChevronDownIcon size={14} className="text-[#57606a] dark:text-[#8b949e]" />
                      </button>
                    </div>
                  </div>

                  {filteredIssues.length > 0 ? (
                    <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                      {filteredIssues.map((issue) => (
                        <div
                          key={issue.id}
                          onClick={() => setSelectedIssueId(issue.id)}
                          className="flex items-start gap-3 p-4 hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] transition-colors group cursor-pointer"
                        >
                          <div className={`mt-1 ${issue.status === 'open' ? 'text-[#1a7f37]' : 'text-[#8250df]'}`}>
                            <TabCircleIcon className="w-4 h-4 text-current" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#1f2328] dark:text-white hover:text-[#0969da] dark:hover:text-[#58a6ff] transition-colors">
                                {issue.title}
                              </span>
                              {issue.labels.map(label => (
                                <span key={label} className="px-2 py-0.5 text-xs font-medium border border-[#d0d7de] dark:border-[#30363d] rounded-full text-[#636c76] dark:text-[#8b949e]">
                                  {label}
                                </span>
                              ))}
                            </div>
                            <div className="mt-1 text-xs text-[#636c76] dark:text-[#8b949e]">
                              #{issue.number} {issue.status === 'open' ? 'opened' : 'closed'} {issue.updated} by {issue.author} in {issue.repo}
                              {issue.assignee && ` · Assigned to ${issue.assignee}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <h3 className="text-2xl font-normal text-[#24292f] dark:text-white mb-2">
                        No results
                      </h3>
                      <p className="text-base text-[#57606a] dark:text-[#8b949e]">
                        Try adjusting your search filters.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#57606a] dark:text-[#8b949e]">
            <div className="flex items-center gap-2">
              <FooterGithubIcon className="w-6 h-6 fill-[#57606a] dark:fill-[#8b949e]" />
              <span>© 2026 GitHub, Inc.</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="about:blank" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
                Terms
              </a>
              <a href="about:blank" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
                Privacy
              </a>
              <a href="about:blank" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
                Security
              </a>
              <a href="about:blank" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
                Status
              </a>
              <a href="about:blank" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
                Community
              </a>
              <a href="about:blank" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
                Docs
              </a>
              <a href="about:blank" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
                Contact
              </a>
              <a href="about:blank" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
                Manage cookies
              </a>
              <a href="about:blank" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
                Do not share my personal information
              </a>
            </div>
          </div>
        </div>
      </footer>
      {isNewIssueOpen && (
        <OpenIssueModal
          onClose={() => setIsNewIssueOpen(false)}
          username={activeUsername}
          onSubmit={handleCreateIssue}
        />
      )}
    </div>
  );
}


