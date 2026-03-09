// lucide-react Radius import removed — was unused
import React, { useMemo } from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoLogoGithub } from "react-icons/io";
import { getStoredRepositories } from "../../services/storageService";
import SearchIcon from "../ui/icons/SearchIcon";
import MarketPlaceIcon from "../ui/icons/MarketPlaceIcon";
import ExploreIcon from "../ui/icons/ExploreIcon";
import CopilotIcon from "../ui/icons/CopilotIcon";
import CodeSpacesIcon from "../ui/icons/CodeSpacesIcon";
import DiscussionIcon from "../ui/icons/DiscussionIcon";
import ProjectsIcon from "../ui/icons/ProjectsIcon";
import ReposotoryIcon from "../ui/icons/ReposotoryIcon";
import PullRequestIcon from "../ui/icons/PullRequestIcon";
import IssuesIcon from "../ui/icons/IssuesIcon";
import HomeIcon from "../ui/icons/HomeIcon";
import MCPRegistoryIcon from "../ui/icons/MCPRegistoryIcon";
import MenuIcon from "../ui/icons/MenuIcon";
import CrossIcon from "../ui/icons/CrossIcon";

const Icons = {
  search: <SearchIcon />,
  MarketPlace: <MarketPlaceIcon />,
  Explore: <ExploreIcon />,
  Copilot: <CopilotIcon />,
  CodeSpaces: <CodeSpacesIcon />,
  Discussion: <DiscussionIcon />,
  Projects: <ProjectsIcon />,
  Repositories: <ReposotoryIcon />,
  PullRequest: <PullRequestIcon />,
  Issues: <IssuesIcon />,
  Home: <HomeIcon />,
  MCPRegistory: <MCPRegistoryIcon />
};

const exploreItems = [
  { label: "Explore", icon: Icons.Explore },
  { label: "MarketPlace", icon: Icons.MarketPlace },
  { label: "MCP Registory", icon: Icons.MCPRegistory },
];

const GithubOpenMenu = React.memo(() => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showSearch, setShowSearch] = React.useState(false);
  const [topRepos, setTopRepos] = React.useState([]);

  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const repos = getStoredRepositories();
      // sort by updated_at or id and slice top 5
      const sorted = [...repos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      setTopRepos(sorted.slice(0, 5));
      setSearchQuery("");
      setShowSearch(false);
    }
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
    Stars: "/momanamjad/stars",
    Discussions: "/discussions",
    Codespaces: "/codespaces",
    Copilot: "/copilot",
    Explore: "/explore",
    MarketPlace: "/marketplace",
    "MCP Registory": "/mcp-registry",
  }), []);

  useEffect(() => {
    const handleClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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
        className="btn-octicon p-2 border border-[#C8D1DA] hover:bg-[#ebeff2] rounded-[8px] cursor-pointer"
        size={36}
      >
        <MenuIcon />
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "#e4e9ed99" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        ref={sidebarRef}
        className="fixed top-0 left-0 z-50 h-full overflow-y-auto w-full max-w-[320px] bg-white rounded-r-[9px]"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="flex items-center justify-between px-3 py-3">
          <IoLogoGithub size={32} className=" cursor-pointer" />
          <button
            type="button"
            aria-label="Close Menu"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center text-[#59636E]   transition-colors"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <CrossIcon />
          </button>
        </div>

        {/* Main Nav */}
        <nav className="py-2" style={{ borderBottom: "1px solid #C8D1DA" }}>
          {[
            { label: "Home", icon: Icons.Home },
            { label: "Issues", icon: Icons.Issues },
            { label: "Pull requests", icon: Icons.PullRequest },
            { label: "Repositories", icon: Icons.Repositories },
            { label: "Projects", icon: Icons.Projects },
            { label: "Discussions", icon: Icons.Discussion },
            { label: "Codespaces", icon: Icons.CodeSpaces },
            { label: "Copilot", icon: Icons.Copilot },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-[#1f2328]"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                borderRadius: "6px",
                margin: "1px 8px",
                width: "calc(100% - 17px)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#ebeff2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => {
                const path = routeMap[item.label];
                if (path) navigate(path);
                setIsOpen(false);
              }}
            >
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </span>

              {item.label}
            </button>
          ))}
        </nav>
        {/* Explore Section */}
        <nav className="py-2" style={{ borderBottom: "1px solid #C8D1DA" }}>
          {exploreItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-[#1f2328] "
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                borderRadius: "6px",
                margin: "1px 8px",
                width: "calc(100% - 16px)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#D1D9E0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => {
                const path = routeMap[item.label];
                if (path) navigate(path);
                setIsOpen(false);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Top Repositories */}
        <div className="py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-gray-500 font-semibold"
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Top Repositories
            </span>
            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
              }}
            >
              {Icons.search}
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="px-4 mb-3">
            <input
              type="text"
              autoFocus
              className="w-full text-sm px-3 py-1.5 border border-[#d0d7de] rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-[#f6f8fa]"
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
                key={repo.id}
                onClick={() => {
                  const ownerLogin = repo.owner?.login || 'momanamjad';
                  navigate(`/${ownerLogin}/${repo.name}`);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#ebeff2] text-sm text-[#1f2328] transition-colors text-left"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {repo.owner?.avatar_url ? (
                  <img src={repo.owner.avatar_url} alt={repo.owner.login} className="w-5 h-5 rounded-full object-cover border border-[#d0d7de]" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                    {repo.owner?.login ? repo.owner.login.substring(0, 2).toUpperCase() : 'MA'}
                  </div>
                )}
                <span className="truncate font-medium">{repo.owner?.login || 'momanamjad'}/{repo.name}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">No repositories found.</div>
          )}
        </div>
      </div>
    </>
  );
});

GithubOpenMenu.displayName = 'GithubOpenMenu';
export default GithubOpenMenu;
