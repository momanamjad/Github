import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { IoLogoGithub } from "react-icons/io";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import LoadingBar from "react-top-loading-bar";
import GitHubUserMenu from "@features/GitHubUserMenu";
import GitHubSearch from "@features/GitHubSearch";
import { useTabsContext } from "@/contexts/TabsContext";
import StatusButton from "../common/StatusButton";
import TopBarActions from "./Topbar";
import GithubOpenMenu from "./GithubOpenMenu";

const Navbar = () => {
  const [progress, setProgress] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { hasTabsComponent } = useTabsContext();
  const searchInputRef = useRef(null);

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
    Marketplace: "/marketplace",
    "MCP Registry": "/mcp-registry",
  }), []);

  const currentPathName = useMemo(() => {
    const found = Object.keys(routeMap).find((key) => routeMap[key] === location.pathname);
    return found || "momanamjad";
  }, [location.pathname, routeMap]);

  // Handle Route Transition Progress
  useEffect(() => {
    setProgress(70);
    const timer = setTimeout(() => setProgress(100), 200);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Global Key Listeners
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // '/' to focus search
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        setIsSearchOpen(true);
        // The focus will happen in a separate effect once search modal is open if needed
      }
    };

    const handleFocusSearch = (e) => {
      if (e.key === "/") {
        searchInputRef.current?.focus();
      }
    }

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
        className={`bg-[#F6F8FA] border-b border-github-border h-[64px] flex items-center transition-all ${hasTabsComponent ? "border-transparent" : "border-github-border"
          }`}
      >
        <div className="w-full px-4 flex items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <GithubOpenMenu />
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <IoLogoGithub size={32} />
            </Link>
            <div className="hover:bg-[#ebeff6] px-2 py-1 rounded-md transition-colors cursor-pointer">
              <span className="font-semibold text-sm whitespace-nowrap">
                {currentPathName}
              </span>
            </div>
          </div>

          {/* Search & Actions Section */}
          <div className="flex-1 flex items-center justify-end gap-3 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm">
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
                    placeholder="Search or jump to..."
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

            <GitHubSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
            />

            <div className="flex items-center gap-2">
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
