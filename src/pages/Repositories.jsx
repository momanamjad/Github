import React, { useEffect, useState } from "react";
import {
  Search,
  X,
  Users,
  BookOpen,
  GitFork,
  Settings,
  Plus,
  List,
  LayoutGrid,
  ArrowUpDown,
  Check,
  ChevronDown
} from "lucide-react";
import NewRepoBtn from "@/components/common/NewRepoBtn";
import { getRepos } from "@services/GithubApi.jsx";
import { Link } from "react-router-dom";
import ActivityGraphIcon from "../components/ui/icons/ActivityGraphIcon";
import FooterGithubIcon from "../components/ui/icons/FooterGithubIcon";
import PullRequestIcon from "../components/ui/icons/PullRequestIcon";
import StarsIcon from "../components/ui/icons/StarsIcon";
import IssuesIcon from "../components/ui/icons/IssuesIcon";
import EmptyStateSearchIcon from "../components/ui/icons/EmptyStateSearchIcon";

export default function Repositories() {
  const [activeTab, setActiveTab] = useState("my-contributions");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const [isRelevanceOpen, setIsRelevanceOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("relevance");

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "my-contributions":
        return "contributed-by:@me";
      case "my-repositories":
        return "owner:@me";
      case "my-forks":
        return "owner:@me fork:true";
      case "admin-access":
        return "admin:@me";
      default:
        return "";
    }
  };

  const sortOptions = [
    { value: "relevance", label: "Relevance", icon: Users },
    { value: "last-pushed", label: "Last pushed", icon: ArrowUpDown },
    { value: "name", label: "Name", icon: BookOpen },
    { value: "stars", label: "Stars", icon: Users },
  ];

  const [repositories, setRepositories] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const repos = await getRepos("momanamjad");
        if (mounted) setRepositories(repos);
      } catch (err) {
        console.error("Failed to load repositories:", err);
        if (mounted) setRepositories([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const getRepositoryCount = () => {
    if (activeTab === "my-forks") return 0;
    return repositories ? repositories.length : 0;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
           <nav className="space-y-1">
  {/* My contributions */}
  <div className={`relative transition-all ${activeTab === 'my-contributions' ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md" : ""}`}>
    <button
      onClick={() => setActiveTab("my-contributions")}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all rounded-md ${
        activeTab === "my-contributions"
          ? "bg-[#ECEEF0] text-[#24292f] font-medium"
          : "text-[#57606a] hover:bg-[#f6f8fa]"
      }`}
    >
      <Users className="w-4 h-4" />
      <span>My contributions</span>
    </button>
  </div>

  {/* My repositories */}
  <div className={`relative transition-all ${activeTab === 'my-repositories' ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md" : ""}`}>
    <button
      onClick={() => setActiveTab("my-repositories")}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all rounded-md ${
        activeTab === "my-repositories"
          ? "bg-[#ECEEF0] text-[#24292f] font-medium"
          : "text-[#57606a] hover:bg-[#f6f8fa]"
      }`}
    >
      <BookOpen className="w-4 h-4" />
      <span>My repositories</span>
    </button>
  </div>

  {/* My forks */}
  <div className={`relative transition-all ${activeTab === 'my-forks' ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md" : ""}`}>
    <button
      onClick={() => setActiveTab("my-forks")}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all rounded-md ${
        activeTab === "my-forks"
          ? "bg-[#ECEEF0] text-[#24292f] font-medium"
          : "text-[#57606a] hover:bg-[#f6f8fa]"
      }`}
    >
      <GitFork className="w-4 h-4" />
      <span>My forks</span>
    </button>
  </div>

  {/* Admin access */}
  <div className={`relative transition-all ${activeTab === 'admin-access' ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md" : ""}`}>
    <button
      onClick={() => setActiveTab("admin-access")}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all rounded-md ${
        activeTab === "admin-access"
          ? "bg-[#ECEEF0] text-[#24292f] font-medium"
          : "text-[#57606a] hover:bg-[#f6f8fa]"
      }`}
    >
      <Settings className="w-4 h-4" />
      <span>Admin access</span>
    </button>
  </div>

  {/* Views Section */}
  <div className="pt-6">
    <div className="flex items-center justify-between px-3 mb-2">
      <span className="text-sm font-medium text-gray-700">Views</span>
      <button className="text-gray-400 hover:text-gray-600">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
</nav>

          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeTab === "my-contributions" && "My contributions"}
                {activeTab === "my-repositories" && "My repositories"}
                {activeTab === "my-forks" && "My forks"}
                {activeTab === "admin-access" && "Admin access"}
              </h1>
              <div className="flex items-center gap-3">
                <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Preview
                </button>
             <NewRepoBtn/>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getSearchPlaceholder()}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Repository Count and Controls */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">
                {getRepositoryCount()} repositories
              </p>
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsRelevanceOpen(!isRelevanceOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span>
                      {
                        sortOptions.find((opt) => opt.value === selectedSort)
                          ?.label
                      }
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Dropdown Menu */}
                  {isRelevanceOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedSort(option.value);
                            setIsRelevanceOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-50"
                        >
                          {selectedSort === option.value && (
                            <Check className="w-4 h-4 text-gray-900" />
                          )}
                          {selectedSort !== option.value && (
                            <span className="w-4 h-4"></span>
                          )}
                          <option.icon className="w-4 h-4 text-gray-600" />
                          <span
                            className={
                              selectedSort === option.value
                                ? "font-medium text-gray-900"
                                : "text-gray-700"
                            }
                          >
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Mode Buttons */}
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 ${
                      viewMode === "list"
                        ? "bg-gray-100 text-gray-900"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 border-l border-gray-300 ${
                      viewMode === "grid"
                        ? "bg-gray-100 text-gray-900"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Repositories List */}
            {activeTab !== "my-forks" ? (
              <div className="space-y-4">
                {repositories.map((repo) => (
                  <div
                    key={repo.id || repo.name}
                    className="border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/${repo.owner?.login}/${encodeURIComponent(repo.name)}`}
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            {repo.full_name || `${repo.owner?.login}/${repo.name}`}
                          </Link>
                          <span className="px-2 py-0.5 text-xs font-medium border border-gray-300 rounded-full text-gray-600">
                            {repo.private ? "Private" : "Public"}
                          </span>
                        </div>
                        <div className="w-16 h-8">
                          {/* Activity graph placeholder */}
                          <ActivityGraphIcon className="w-full h-full" />
                        </div>
                      </div>

                      {repo.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {repo.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                            <span>{repo.language}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          <span>{repo.forks}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <StarsIcon className="w-3 h-3" fill="currentColor" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IssuesIcon className="w-3 h-3" fill="currentColor" />
                          <span>{repo.issues}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <PullRequestIcon className="w-3 h-3" fill="currentColor" />
                          <span>{repo.pullRequests}</span>
                        </div>
                        <span className="ml-auto">{repo.updated}</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state for My Forks */
              <div className="border border-gray-200 rounded-md p-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <EmptyStateSearchIcon className="w-16 h-16 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No repositories matched your search.
                </h3>
                <p className="text-sm text-gray-600">
                  Try a different search query.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <FooterGithubIcon className="w-6 h-6" />
              <span>© 2026 GitHub, Inc.</span>
            </div>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Terms
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Privacy
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Security
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Status
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Community
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Docs
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Contact
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Manage cookies
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Do not share my personal information
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
