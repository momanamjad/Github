import React, { useEffect, useState, useMemo } from "react";
import {
  PeopleIcon,
  BookIcon,
  RepoForkedIcon,
  GearIcon,
  PlusIcon,
} from "@primer/octicons-react";
import NewRepoBtn from "@/components/common/NewRepoBtn";
import { useGitHub } from "@/contexts/GitHubContext";
import { useSearchParams } from "react-router-dom";
import FooterGithubIcon from "../components/ui/icons/FooterGithubIcon";
import RepoList from "@/components/features/RepoList";
import RepoFilterBar from "@/components/features/RepoFilterBar";
import { Skeleton } from 'boneyard-js/react';
import { RepoSkeleton } from "@features/RepoSkeleton";

export default function Repositories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "my-repositories";
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay for skeleton demonstration
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [sortOrder, setSortOrder] = useState("updated");

  const { repositories, user } = useGitHub();

  // Calculate unique languages for the filter dropdown
  const languages = useMemo(() => {
    const langs = new Set();
    repositories.forEach(repo => {
      if (repo.language) langs.add(repo.language);
    });
    return ["all", ...Array.from(langs)];
  }, [repositories]);

  // Filter and sort repositories
  const filteredRepositories = useMemo(() => {
    let filtered = [...repositories];

    // Helper to check if logged-in user owns the repo
    const isOwner = (repo) => {
      if (!user) return false;
      const ownerId = repo.owner?._id || repo.owner?.id || repo.owner;
      const ownerLogin = repo.owner?.login;
      return ownerId === user.id || ownerLogin === user.login;
    };

    // 1. Filter by Tab (Sidebar)
    if (activeTab === "my-repositories") {
      filtered = filtered.filter(isOwner);
    } else if (activeTab === "my-forks") {
      filtered = filtered.filter(repo => repo.fork);
    } else if (activeTab === "admin-access") {
      filtered = filtered.filter(repo => repo.permissions?.admin || isOwner(repo));
    } else if (activeTab === "my-contributions") {
      filtered = filtered.filter(repo => !isOwner(repo) || repo.fork);
    }

    // 2. Filter by Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(repo => 
        repo.name.toLowerCase().includes(query) || 
        (repo.description && repo.description.toLowerCase().includes(query))
      );
    }

    // 3. Filter by Type
    if (filterType !== "all") {
      if (filterType === "forks") {
        filtered = filtered.filter(repo => repo.fork);
      } else if (filterType === "sources") {
        filtered = filtered.filter(repo => !repo.fork);
      } else if (filterType === "archived") {
        filtered = filtered.filter(repo => repo.archived);
      }
      // mirrors etc can be added if data exists
    }

    // 4. Filter by Language
    if (filterLanguage !== "all") {
      filtered = filtered.filter(repo => repo.language === filterLanguage);
    }

    // 5. Sort
    filtered.sort((a, b) => {
      if (sortOrder === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === "stars") {
        return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      } else {
        // default: updated
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
    });

    return filtered;
  }, [repositories, activeTab, searchQuery, filterType, filterLanguage, sortOrder, user]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] transition-colors">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {[
                { id: "my-repositories", label: "My repositories", icon: BookIcon },
                { id: "my-contributions", label: "My contributions", icon: PeopleIcon },
                { id: "my-forks", label: "My forks", icon: RepoForkedIcon },
                { id: "admin-access", label: "Admin access", icon: GearIcon },
              ].map((tab) => (
                <div key={tab.id} className={`relative transition-all ${activeTab === tab.id ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-[#f78166] before:rounded-r-md" : ""}`}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all rounded-md border-0 cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-[#ECEEF0] dark:bg-[#21262d] text-[#24292f] dark:text-white font-medium"
                        : "text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]"
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                </div>
              ))}

              {/* Views Section */}
              <div className="pt-6">
                <div className="flex items-center justify-between px-3 mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-[#8b949e]">Views</span>
                  <button className="text-gray-400 dark:text-[#8b949e] hover:text-gray-600 dark:hover:text-gray-300 border-0 bg-transparent cursor-pointer">
                    <PlusIcon size={16} />
                  </button>
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {activeTab === "my-contributions" && "My contributions"}
                {activeTab === "my-repositories" && "My repositories"}
                {activeTab === "my-forks" && "My forks"}
                {activeTab === "admin-access" && "Admin access"}
              </h1>
            </div>

            {/* Filter Bar Component */}
            <RepoFilterBar 
              search={searchQuery}
              setSearch={setSearchQuery}
              type={filterType}
              setType={setFilterType}
              language={filterLanguage}
              setLanguage={setFilterLanguage}
              sort={sortOrder}
              setSort={setSortOrder}
              languages={languages}
            />

            {/* Repository Count */}
            <div className="py-2 border-b border-gray-200 dark:border-[#30363d] mb-4">
              <p className="text-sm text-gray-600 dark:text-[#8b949e]">
                <span className="font-semibold text-gray-900 dark:text-white">{filteredRepositories.length}</span> repositories
              </p>
            </div>

            {/* Repositories List Component with Skeleton */}
            <Skeleton 
              name="global-repo-list" 
              loading={isLoading} 
              fixture={
                <div className="flex flex-col">
                  <RepoSkeleton />
                  <RepoSkeleton />
                  <RepoSkeleton />
                  <RepoSkeleton />
                </div>
              }
            >
              <RepoList repos={filteredRepositories} />
            </Skeleton>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-[#30363d] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#57606a] dark:text-[#8b949e]">
            <div className="flex items-center gap-2">
              <FooterGithubIcon className="w-6 h-6" />
              <span>© 2026 GitHub, Inc.</span>
            </div>
            {["Terms", "Privacy", "Security", "Status", "Community", "Docs", "Contact", "Manage cookies", "Do not share my personal information"].map(item => (
              <a key={item} href="#" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
