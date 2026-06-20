import React, { useState, useEffect, useRef } from "react";
import { SearchIcon, CheckIcon } from '@primer/octicons-react';
import { useGitHub } from "../contexts/GitHubContext";
import { apiClient } from "../services/apiClient";
import StatusOpenIcon from "../components/ui/icons/StatusOpenIcon";
import StatusDraftIcon from "../components/ui/icons/StatusDraftIcon";
import StatusMergedIcon from "../components/ui/icons/StatusMergedIcon";
import StatusClosedIcon from "../components/ui/icons/StatusClosedIcon";
import PullRequestSidebarIcon from "../components/ui/icons/PullRequestSidebarIcon";
import CommentsIcon from "../components/ui/icons/CommentsIcon";
import GithubLogoVariantIcon from "../components/ui/icons/GithubLogoVariantIcon";

const defaultPullRequests = [
  {
    id: 1,
    title: "Add user authentication flow",
    repo: "frontend-app",
    number: 234,
    status: "open",
    author: "johndoe",
    comments: 8,
    updated: "2 hours ago",
    labels: ["enhancement", "auth"],
  },
  {
    id: 2,
    title: "Fix responsive layout issues on mobile",
    repo: "website",
    number: 567,
    status: "draft",
    author: "janedoe",
    comments: 3,
    updated: "5 hours ago",
    labels: ["bug", "mobile"],
  },
  {
    id: 3,
    title: "Update API documentation",
    repo: "docs",
    number: 890,
    status: "merged",
    author: "bobsmith",
    comments: 12,
    updated: "yesterday",
    labels: ["documentation"],
  },
  {
    id: 4,
    title: "Implement dark mode toggle",
    repo: "dashboard",
    number: 123,
    status: "closed",
    author: "alicew",
    comments: 6,
    updated: "3 days ago",
    labels: ["feature", "ui"],
  },
];

const PullRequests = () => {
  const { user, repositories } = useGitHub();
  const [selectedTab, setSelectedTab] = useState("Created");
  const [searchQuery, setSearchQuery] = useState("is:open is:pr author:@me");
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPrRepoId, setNewPrRepoId] = useState("");
  const [newPrTitle, setNewPrTitle] = useState("");
  const [newPrDesc, setNewPrDesc] = useState("");
  const [expandedPrId, setExpandedPrId] = useState(null);

  const isFetchingRef = useRef(false);
  const lastRepoIdsRef = useRef("");

  const fetchAllPRs = async () => {
    if (!user || !repositories || repositories.length === 0) return;
    const repoIdsStr = repositories.map(r => r._id || r.id).join(",");
    if (isFetchingRef.current || lastRepoIdsRef.current === repoIdsStr) return;

    isFetchingRef.current = true;
    lastRepoIdsRef.current = repoIdsStr;
    setLoading(true);
    try {
      const res = await apiClient(`/users/pulls`);
      if (res?.data) {
        const formatted = res.data.map((pr) => ({
          id: pr._id,
          title: pr.title,
          repo: pr.repository?.name || "Unknown",
          repoId: pr.repository?._id || pr.repository,
          number: Math.floor(Math.random() * 800) + 100,
          status: pr.status,
          author: pr.author?.login || user.login,
          comments: 0,
          updated: new Date(pr.updatedAt || pr.createdAt || new Date()).toLocaleDateString(),
          labels: [],
        }));
        setPullRequests(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchAllPRs();
  }, [repositories, user]);

  useEffect(() => {
    const handlePRUpdate = () => {
      isFetchingRef.current = false;
      fetchAllPRs();
    };
    window.addEventListener("github_clone_pulls_updated", handlePRUpdate);
    return () => window.removeEventListener("github_clone_pulls_updated", handlePRUpdate);
  }, [repositories, user]);

  const activePRs = pullRequests.length > 0 ? pullRequests : defaultPullRequests;

  const handleCreatePR = async (e) => {
    e.preventDefault();
    if (!newPrRepoId || !newPrTitle) return;
    try {
      await apiClient(`/repos/${newPrRepoId}/pulls`, {
        method: "POST",
        body: JSON.stringify({
          title: newPrTitle,
          description: newPrDesc,
        }),
      });
      setIsCreateModalOpen(false);
      setNewPrTitle("");
      setNewPrDesc("");
      lastRepoIdsRef.current = ""; // Reset ref to force re-fetch
      await fetchAllPRs();
    } catch (err) {
      console.error("Failed to create PR:", err);
    }
  };

  const tabs = [
    { id: "Created", label: "Created", count: 12 },
    { id: "Assigned", label: "Assigned", count: 3 },
    { id: "Mentioned", label: "Mentioned", count: 1 },
    { id: "Review requests", label: "Review requests", count: 5 },
  ];

  const StatusIcon = ({ status }) => {
    switch (status) {
      case "open":
        return (
          <span className="w-4 h-4 text-green-600">
            <StatusOpenIcon className="w-4 h-4" />
          </span>
        );
      case "draft":
        return (
          <span className="w-4 h-4 text-gray-500">
            <StatusDraftIcon className="w-4 h-4" />
          </span>
        );
      case "merged":
        return (
          <span className="w-4 h-4 text-purple-600">
            <StatusMergedIcon className="w-4 h-4" />
          </span>
        );
      case "closed":
        return (
          <span className="w-4 h-4 text-red-600">
            <StatusClosedIcon className="w-4 h-4" />
          </span>
        );
      default:
        return null;
    }
  };

  const filteredPullRequests = activePRs.filter(pr => {
    // Apply tab filters
    if (selectedTab === "Created") {
      if (pr.author !== user?.login) return false;
    }
    // Search query parsing helper (ignore syntax helpers)
    const tokens = searchQuery.split(/\s+/).filter(t => !t.startsWith("is:") && !t.startsWith("author:"));
    if (tokens.length === 0) return true;
    
    const textQuery = tokens.join(" ").toLowerCase();
    return pr.title.toLowerCase().includes(textQuery) ||
           pr.repo.toLowerCase().includes(textQuery) ||
           pr.author.toLowerCase().includes(textQuery);
  });

  return (
    <div className="min-h-screen bg-white text-[#1f2328] font-sans">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="border rounded-md border-github-border">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                  py-2 px-4 font-semibold text-[14px] whitespace-nowrap
                  ${
                    selectedTab === tab.id
                      ? "bg-[#0969DA] text-white border border-github-border"
                      : "text-black hover:bg-[#F6F8FA] border border-github-border"
                  }
                `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F6F8FA] text-[#59636e] border border-github-border rounded-md py-2 pl-8 pr-3 text-sm focus:outline-none focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7]"
                placeholder="Search pull requests..."
              />
              <SearchIcon size={16} className="absolute left-2.5 top-3 text-[#848d97]" />
            </div>
            {user && (
              <button
                onClick={() => {
                  if (repositories.length > 0) {
                    setNewPrRepoId(repositories[0]._id || repositories[0].id);
                  }
                  setIsCreateModalOpen(true);
                }}
                className="px-4 py-2 bg-[#2da44e] hover:bg-[#2c974b] text-white text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                New pull request
              </button>
            )}
          </div>
        </div>

        <div className="border border-github-border rounded-lg overflow-hidden">
          <div className="bg-[#F6F8FA] px-4 py-3 border-b border-github-border flex items-center gap-3 text-sm">
            <StatusOpenIcon className="w-4 h-4 text-github-text" />
            <span className="text-github-text">{filteredPullRequests.length} Results</span>
            <div className="flex gap-3">
              <CheckIcon size={16} className="text-github-muted mt-0.5" />
              <span className="text-github-muted">
                {
                  filteredPullRequests.filter(
                    (pr) => pr.status === "closed" || pr.status === "merged",
                  ).length
                }{" "}
                Closed
              </span>
            </div>
          </div>

          {filteredPullRequests.length > 0 ? (
            filteredPullRequests.map((pr) => (
              <div
                key={pr.id}
                className="px-4 py-3 border-b border-github-border last:border-0 flex items-start gap-3"
              >
                <div className="flex-shrink-0 mt-1">
                  <StatusIcon status={pr.status} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex text-[#59636e] flex-wrap items-center gap-2">
                    <PullRequestSidebarIcon className="w-4 h-4 text-[#59636e]" />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setExpandedPrId(expandedPrId === pr.id ? null : pr.id);
                      }}
                      className="font-semibold text-base text-[#0969da] hover:underline cursor-pointer border-0 bg-transparent text-left"
                    >
                      {pr.title}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#848d97] mt-1">
                    <span className="font-medium text-[#1f2328]">{pr.repo}</span>
                    <span>#{pr.number}</span>
                    <span>by {pr.author}</span>
                    <span>updated {pr.updated}</span>
                    <span className="flex items-center gap-1">
                      <CommentsIcon className="w-4 h-4" />
                      {pr.comments}
                    </span>
                  </div>

                  {expandedPrId === pr.id && (
                    <div className="mt-3 p-4 border border-[#d0d7de] rounded-md bg-[#f6f8fa] text-[13px] text-[#24292f] space-y-3">
                      <div className="flex items-center gap-2 font-semibold text-[#1a7f37]">
                        <svg className="w-4 h-4" viewBox="0 0 16 16" version="1.1" fill="currentColor">
                          <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.47a.75.75 0 0 0-1.06-1.06L7 9.19 5.28 7.47a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.25-4.25Z"/>
                        </svg>
                        <span>This branch has no conflicts with the base branch</span>
                      </div>
                      <div className="border-t border-[#d0d7de]/60 pt-2">
                        <p className="font-semibold mb-1.5 text-xs text-[#57606a]">Files changed (1)</p>
                        <div className="flex items-center justify-between py-1.5 px-3 bg-white border border-[#d0d7de] rounded text-xs">
                          <span className="font-mono text-[#1f2328]">README.md</span>
                          <span className="text-[#1a7f37] font-semibold">+12 lines</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-xs flex items-center gap-2">
                  {pr.status === "open" && (
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!window.confirm(`Are you sure you want to merge PR: "${pr.title}"?`)) return;
                        try {
                          await apiClient(`/repos/${pr.repoId}/pulls/${pr.id}/merge`, { method: "POST" });
                          alert("Pull Request merged successfully!");
                          lastRepoIdsRef.current = "";
                          await fetchAllPRs();
                        } catch (err) {
                          alert("Merge failed: " + err.message);
                        }
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors cursor-pointer"
                    >
                      Merge
                    </button>
                  )}
                  <PullRequestSidebarIcon className="w-4 h-4" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white">
              <h3 className="text-xl font-normal text-[#24292f] mb-2">
                No pull requests matched your search.
              </h3>
              <p className="text-sm text-[#57606a]">
                Try a different search query or filter.
              </p>
            </div>
          )}
        </div>
      </main>
      <div>
         <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center   gap-10 text-xs text-[#57606a]">
            <div className="flex items-center gap-2">
              <GithubLogoVariantIcon className="w-6 h-6 fill-[#57606a]" />
              <span>© 2026 GitHub, Inc.</span>
            </div>
            <div className="flex flex-wrap justify-between gap-10">
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Terms
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Privacy
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Security
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Status
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Community
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Docs
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Contact
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Manage cookies
              </a>
              <a href="#" className="hover:text-[#0969da] hover:underline">
                Do not share my personal information
              </a>
            </div>
          </div>
        </div>
      </div>
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#d0d7de] rounded-lg max-w-md w-full p-6 text-[#1f2328] shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-[#1f2328]">Open a New Pull Request</h3>
            <form onSubmit={handleCreatePR} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-[#57606a] mb-1 font-semibold">Select Repository</label>
                <select
                  value={newPrRepoId}
                  onChange={(e) => setNewPrRepoId(e.target.value)}
                  className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0969da] focus:border-[#0969da] text-[#1f2328]"
                >
                  {repositories.map(repo => (
                    <option key={repo._id || repo.id} value={repo._id || repo.id}>
                      {repo.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#57606a] mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Add dark mode"
                  value={newPrTitle}
                  onChange={(e) => setNewPrTitle(e.target.value)}
                  className="w-full bg-white border border-[#d0d7de] rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0969da] focus:border-[#0969da] text-[#1f2328]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#57606a] mb-1 font-semibold">Description (Optional)</label>
                <textarea
                  placeholder="Describe your changes..."
                  value={newPrDesc}
                  onChange={(e) => setNewPrDesc(e.target.value)}
                  className="w-full bg-white border border-[#d0d7de] rounded p-2 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-[#0969da] focus:border-[#0969da] text-[#1f2328]"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-[#d0d7de] bg-[#f6f8fa] text-[#24292f] hover:bg-gray-100 text-sm font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2da44e] hover:bg-[#2c974b] text-sm font-semibold rounded-md transition-colors cursor-pointer text-white"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PullRequests;
