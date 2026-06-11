import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { IoLogoGithub } from "react-icons/io";
import { Link, useLocation, useParams } from "react-router-dom";
import { Search, TerminalSquare } from "lucide-react";
import LoadingBar from "react-top-loading-bar";
import GitHubUserMenu from "@features/GitHubUserMenu";
import GitHubSearch from "@features/GitHubSearch";
import { useTabsContext } from "@/contexts/TabsContext";
import StatusButton from "../common/StatusButton";
import TopBarActions from "./Topbar";
import GithubOpenMenu from "./GithubOpenMenu";
import { useGitHub } from "@/contexts/GitHubContext";

const Navbar = () => {
  const [progress, setProgress] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const location = useLocation();
  const { hasTabsComponent } = useTabsContext();
  const searchInputRef = useRef(null);

  const { user } = useGitHub();
  const activeUsername = user?.login || "moman";

  const routeMap = useMemo(() => ({
    Home: "/",
    Issues: "/issues",
    "Pull requests": "/pull-requests",
    Repositories: "/repositories",
    Projects: "/projects",
    Stars: `/${activeUsername}/stars`,
    Discussions: "/discussions",
    Codespaces: "/codespaces",
    Copilot: "/copilot",
    Explore: "/explore",
    Marketplace: "/marketplace",
    "MCP Registry": "/mcp-registry",
    "Create a new repository": "/new",
  }), [activeUsername]);

  const params = useParams();

  const currentPathName = useMemo(() => {
    // If we are in a repo route (/:username/:repo), show owner/repo
    if (params.username && params.repo) {
      return (
        <div className="flex items-center gap-1">
          <Link to={`/${params.username}`} className="hover:underline text-[#0969da]">
            {params.username}
          </Link>
          <span className="text-[#59636e] font-normal">/</span>
          <Link to={`/${params.username}/${params.repo}`} className="font-semibold hover:underline">
            {params.repo}
          </Link>
        </div>
      );
    }

    if (params.username) {
      const pathParts = location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 1) {
        const subTab = pathParts[1];
        if (subTab === 'repositories') return 'Repositories';
        if (subTab === 'stars') return 'Stars';
        if (subTab === 'projects') return 'Projects';
        if (subTab === 'packages') return 'Packages';
      } else {
        return params.username;
      }
    }

    const found = Object.keys(routeMap).find((key) => routeMap[key] === location.pathname);
    return found || params.username || activeUsername;
  }, [location.pathname, routeMap, params]);

  // Handle Route Transition Progress — use setTimeout to avoid
  // synchronous setState inside effect body (react-hooks/set-state-in-effect)
  useEffect(() => {
    const startTimer = setTimeout(() => setProgress(70), 0);
    const endTimer = setTimeout(() => setProgress(100), 200);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [location.pathname]);

  // Global Key Listeners
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // '/' to focus search
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleSearchClick = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearchOpen(true);
  };

  return (
    <div className="sticky top-0 z-40 w-full">
      <LoadingBar
        color="#0969da"
        progress={progress}
        height={2}
        onLoaderFinished={useCallback(() => setProgress(0), [])}
      />
      <header
        className={`bg-[#F6F8FA] border-b h-[64px] flex items-center transition-all ${hasTabsComponent ? "border-transparent" : "border-[#d0d7de]"
          }`}
      >
        <div className="w-full px-3 md:px-4 flex items-center justify-between gap-2 md:gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <GithubOpenMenu />
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <IoLogoGithub size={32} />
            </Link>
            {/* Dashboard text — hidden on small screens */}
            <div className="hidden sm:block hover:bg-[#ebeff6] px-2 py-1 rounded-md transition-colors cursor-pointer">
              <span className="font-semibold text-sm whitespace-nowrap flex items-center">
                {currentPathName}
              </span>
            </div>
          </div>

          {/* Search Section — full bar on md+, icon-only on mobile */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-3">
            {/* Desktop/Tablet search bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:block flex-1 max-w-[272px] lg:max-w-sm">
              <div
                onClick={handleSearchClick}
                className="relative flex items-center group cursor-pointer"
              >
                <div className={`
                  flex items-center w-full px-3 py-1.5 
                  bg-[#ffffff] border border-[#d0d7de] rounded-md
                  transition-all duration-200
                  ${isFocused ? 'ring-2 ring-blue-500 border-transparent shadow-sm' : 'hover:border-[#afb8c1]'}
                `}>
                  <Search className="h-4 w-4 text-[#59636e] shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Type / to search..."
                    readOnly
                    className="ml-2 w-full bg-transparent focus:outline-none text-sm placeholder-[#59636e] cursor-pointer"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <kbd className="min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-medium text-[#59636e] bg-[#f6f8fa] border border-[#d0d7de] rounded shadow-sm">
                      /
                    </kbd>
                  </div>
                </div>
              </div>
            </form>

            {/* Mobile search icon button */}
            <button
              onClick={handleSearchClick}
              className="md:hidden flex items-center justify-center w-8 h-8 text-[#59636e] hover:text-[#1f2328] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <GitHubSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
            />

            <div className="flex items-center gap-1 md:gap-2">
              <Link
                to="/terminal"
                aria-label="Terminal"
                className="flex items-center justify-center w-8 h-8 text-[#59636e] border border-[#C8D1DA] hover:bg-[#D1D9E0] rounded-[9px] transition-colors cursor-pointer"
              >
                <TerminalSquare size={18} />
              </Link>
              <TopBarActions />
              <GitHubUserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Keeping StatusButton here to preserve its existence in the tree if hidden */}
      <StatusButton hidden />
    </div>
  );
};

export default React.memo(Navbar);
