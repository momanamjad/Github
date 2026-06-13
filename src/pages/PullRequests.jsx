import React, { useState, useEffect } from "react";
import { Search, Check } from 'lucide-react';
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
  const [selectedTab, setSelectedTab] = useState("everything");
  const [searchQuery, setSearchQuery] = useState("is:open is:pr author:@me");
  const [pullRequests, setPullRequests] = useState(defaultPullRequests);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPrRepoId, setNewPrRepoId] = useState("");
  const [newPrTitle, setNewPrTitle] = useState("");
  const [newPrDesc, setNewPrDesc] = useState("");

  const fetchAllPRs = async () => {
    if (!user || !repositories || repositories.length === 0) return;
    setLoading(true);
    try {
      const prList = [];
      for (const repo of repositories) {
        if (typeof repo._id === 'string' && repo._id.length === 24) {
          const res = await apiClient(`/repos/${repo._id}/pulls`);
          if (res?.data) {
            res.data.forEach((pr) => {
              prList.push({
                id: pr._id,
                title: pr.title,
                repo: repo.name,
                number: Math.floor(Math.random() * 800) + 100,
                status: pr.status,
                author: pr.author?.login || user.login,
                comments: 0,
                updated: new Date(pr.updated_at || pr.created_at).toLocaleDateString(),
                labels: [],
              });
            });
          }
        }
      }
      if (prList.length > 0) {
        setPullRequests(prList);
      }
    } catch (err) {
      console.error("Failed to fetch PRs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPRs();
  }, [user, repositories]);

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

  const filteredPullRequests = pullRequests.filter(pr => 
    pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-[#e6edf3] font-sans">
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
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#848d97]" />
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
            <StatusOpenIcon className="w-4 h-4 text-black" />
            <span className="text-black">{filteredPullRequests.length} Results</span>
            <div className="flex gap-3">
              <Check className="w-4 h-4 text-black" />
              <span className="text-black">
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
                    <a
                      href="#"
                      className="font-semibold hover:text-[#2f81f7] text-base text-github-link"
                    >
                      {pr.title}
                    </a>
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
                </div>

                <div className="flex-shrink-0 text-xs hidden sm:block">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f2328] border border-github-border rounded-lg max-w-md w-full p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Open a New Pull Request</h3>
            <form onSubmit={handleCreatePR} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Select Repository</label>
                <select
                  value={newPrRepoId}
                  onChange={(e) => setNewPrRepoId(e.target.value)}
                  className="w-full bg-[#30363d] border border-github-border rounded p-2 text-sm focus:outline-none focus:border-[#2f81f7] text-white"
                >
                  {repositories.map(repo => (
                    <option key={repo._id || repo.id} value={repo._id || repo.id}>
                      {repo.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Add dark mode"
                  value={newPrTitle}
                  onChange={(e) => setNewPrTitle(e.target.value)}
                  className="w-full bg-[#30363d] border border-github-border rounded p-2 text-sm focus:outline-none focus:border-[#2f81f7] text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Description (Optional)</label>
                <textarea
                  placeholder="Describe your changes..."
                  value={newPrDesc}
                  onChange={(e) => setNewPrDesc(e.target.value)}
                  className="w-full bg-[#30363d] border border-github-border rounded p-2 text-sm h-24 resize-none focus:outline-none focus:border-[#2f81f7] text-white"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-github-border hover:bg-[#30363d] text-sm font-semibold rounded-md transition-colors cursor-pointer text-white"
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
