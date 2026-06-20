import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ThreeBarsIcon,
  XIcon,
  MarkGithubIcon,
  HomeIcon,
  IssueOpenedIcon,
  GitPullRequestIcon,
  RepoIcon,
  ProjectIcon,
  CommentDiscussionIcon,
  TerminalIcon,
  CopilotIcon,
  TelescopeIcon,
  PackageIcon,
  SearchIcon,
} from "@primer/octicons-react";
import { useGitHub } from "@/contexts/GitHubContext";
import { useScrollLock } from "../../hooks/useScrollLock";

const GithubOpenMenu = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { repositories: allRepos, user } = useGitHub();
  const activeUsername = user?.login || "moman";
  
  useScrollLock(isOpen);

  const topRepos = useMemo(() => {
    return [...allRepos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5);
  }, [allRepos]);

  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    setSearchQuery("");
    setShowSearch(false);
  }, [isOpen]);

  const filteredRepos = useMemo(() => {
    return topRepos.filter(repo =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.owner?.login && repo.owner.login.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [topRepos, searchQuery]);

  const routeMap = useMemo(() => ({
    Home: "/",
    Issues: "/issues",
    "Pull requests": "/pull-requests",
    Repositories: "/repositories",
    Projects: "/projects",
    Discussions: "/discussions",
    Codespaces: "/codespaces",
    Copilot: "/copilot",
    Explore: "/explore",
    Marketplace: "/marketplace",
    "MCP Registry": "/mcp-registry",
  }), [activeUsername]);

  useEffect(() => {
    const handleClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("touchstart", handleClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Open Menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 border border-[#d0d7de] dark:border-[#30363d] bg-transparent hover:bg-[#eaeef2] dark:hover:bg-[#21262d] text-[#1f2328] dark:text-[#c9d1d9] rounded-[8px] cursor-pointer flex items-center justify-center transition-colors"
      >
        <ThreeBarsIcon size={16} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#24292f]/50 dark:bg-black/50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full overflow-y-auto w-full max-w-[320px] bg-white dark:bg-[#161b22] border-r border-[#d0d7de] dark:border-[#30363d] rounded-r-[9px] text-left transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d]">
          <Link to="/" className="text-gray-900 dark:text-white" onClick={() => setIsOpen(false)}>
            <MarkGithubIcon size={32} />
          </Link>
          <button
            type="button"
            aria-label="Close Menu"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center p-1 text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-white hover:bg-[#eaeef2] dark:hover:bg-[#21262d] rounded-md border-0 bg-transparent cursor-pointer transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Main Nav */}
        <nav className="py-2 px-2 border-b border-[#d0d7de] dark:border-[#30363d] space-y-0.5">
          {[
            { label: "Home", icon: HomeIcon },
            { label: "Issues", icon: IssueOpenedIcon },
            { label: "Pull requests", icon: GitPullRequestIcon },
            { label: "Repositories", icon: RepoIcon },
            { label: "Projects", icon: ProjectIcon },
            { label: "Discussions", icon: CommentDiscussionIcon },
            { label: "Codespaces", icon: TerminalIcon },
            { label: "Copilot", icon: CopilotIcon },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-[#1f2328] dark:text-[#c9d1d9] hover:bg-[#eaeef2] dark:hover:bg-[#21262d] rounded-md border-0 bg-transparent cursor-pointer transition-colors"
              onClick={() => {
                const path = routeMap[item.label];
                if (path) navigate(path);
                setIsOpen(false);
              }}
            >
              <item.icon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Explore Section */}
        <nav className="py-2 px-2 border-b border-[#d0d7de] dark:border-[#30363d] space-y-0.5">
          {[
            { label: "Explore", icon: TelescopeIcon },
            { label: "Marketplace", icon: PackageIcon },
            { label: "MCP Registry", icon: PackageIcon },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-[#1f2328] dark:text-[#c9d1d9] hover:bg-[#eaeef2] dark:hover:bg-[#21262d] rounded-md border-0 bg-transparent cursor-pointer transition-colors"
              onClick={() => {
                const path = routeMap[item.label];
                if (path) navigate(path);
                setIsOpen(false);
              }}
            >
              <item.icon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Top Repositories */}
        <div className="py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
              Top Repositories
            </span>
            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              className="text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-white p-1 border-0 bg-transparent cursor-pointer transition-colors"
            >
              <SearchIcon size={14} />
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="px-4 mb-3">
            <input
              type="text"
              autoFocus
              className="w-full text-sm px-3 py-1.5 border border-[#d0d7de] dark:border-[#30363d] rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-[#f6f8fa] dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9]"
              placeholder="Find a repository..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Repositories List */}
        <div className="pb-4">
          {filteredRepos.length > 0 ? (
            filteredRepos.map(repo => (
              <button
                key={repo._id || repo.id || repo.name}
                onClick={() => {
                  const ownerLogin = repo.owner?.login || activeUsername;
                  navigate(`/${ownerLogin}/${repo.name}`);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#eaeef2] dark:hover:bg-[#21262d] text-sm text-[#1f2328] dark:text-[#c9d1d9] border-0 bg-transparent cursor-pointer transition-colors text-left"
              >
                {repo.owner?.avatar_url ? (
                  <img src={repo.owner.avatar_url} alt={repo.owner.login} className="w-5 h-5 rounded-full object-cover border border-[#d0d7de] dark:border-[#30363d]" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                    {repo.owner?.login ? repo.owner.login.substring(0, 2).toUpperCase() : 'MA'}
                  </div>
                )}
                <span className="truncate font-medium">{repo.owner?.login || activeUsername}/{repo.name}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-[#57606a] dark:text-[#8b949e]">No repositories found.</div>
          )}
        </div>
      </div>
    </>
  );
});

GithubOpenMenu.displayName = 'GithubOpenMenu';
export default GithubOpenMenu;
