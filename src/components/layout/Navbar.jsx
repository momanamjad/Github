import { IoLogoGithub } from "react-icons/io";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import GitHubUserMenu from "@features/GitHubUserMenu";
import TopBarActions from "./Topbar";
import GithubOpenMenu from "./GithubOpenMenu";
import GitHubSearch from "@features/GitHubSearch";
import LoadingBar from "react-top-loading-bar";
import { useLocation } from "react-router-dom";
import { useTabsContext } from "@/contexts/TabsContext";

const Navbar = () => {
  const [progress, setProgress] = useState(0);
  const [value, setValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { hasTabsComponent } = useTabsContext();

  const routeMap = {
    Home: "/",
    Issues: "/issues",
    "Pull requests": "/pull-requests",
    Repositories: "/repositories",
    Projects: "/projects",
    Discussions: "/discussions",
    Codespaces: "/codespaces",
    Copilot: "/copilot",
    Explore: "/explore",
    MarketPlace: "/marketplace",
    "MCP Registory": "/mcp-registry",
  };
  const currentPathName =
    Object.keys(routeMap).find((key) => routeMap[key] === location.pathname) ||
    "momanamjad";
  useEffect(() => {
    setProgress(70);
    const timer = setTimeout(() => setProgress(100), 200);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "/" && !isSearchOpen) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    const handleSubmit = (e) => {
      e.preventDefault();
      setIsSearchOpen(true);
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isSearchOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    navigate(`/${value.trim()}`);
    setValue("");
  };
  document.addEventListener("keydown", function (e) {
    if (e.key === "/") {
      const inputField = document.getElementById("search-input");
      inputField.focus();
    }
  });
  const HandleInputClick = () => {
    setIsSearchOpen(true);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div>
      <LoadingBar
        color="#2188ff"
        progress={progress}
        height={2}
        onLoaderFinished={() => setProgress(0)}
      />
      <header
        className="bg-[#F6F8FA] border border-github-border  h-[70px]"
        style={{ borderBottom: hasTabsComponent ? "transparent" : undefined }}
      >
        <div className=" mx-auto  h-full flex items-center  justify-between">
          <div className="flex items-center gap-2    ">
            <GithubOpenMenu />
            <Link to="/">
              <IoLogoGithub size={33} className=" cursor-pointer" />
            </Link>
            <div className="hover:bg-[#ebeff6]  px-2 py-1 rounded-md ">
              <span className="font-semibold text-[14px]  cursor-pointer whitespace-nowrap">
                {currentPathName}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end w-full gap-4 px-4">
            <form onSubmit={handleSubmit}>
              <div
                onClick={HandleInputClick}
                className="relative flex items-center  px-4 py-[6px] border border-gray-300 rounded-md  focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-100 transition-all cursor-pointer"
              >
                <Search
                  className={`absolute left-3 h-4 w-4 text-gray-400 ${isFocused ? "text-blue-500" : ""}`}
                />

                <input
                  type="text"
                  placeholder="Type"
                  id="search-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  readOnly
                  className="pl-5  focus:outline-none text-sm placeholder-gray-800 cursor-pointer"
                />

                {!inputValue && (
                  <div className="absolute p-13 flex items-center   text-gray-500 pointer-events-none">
                    <kbd className="px-1.5 py-0.4 ml-1 mr-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-800 rounded">
                      /
                    </kbd>
                    <span className="text-gray-600">to search</span>
                  </div>
                )}
              </div>
            </form>

            <GitHubSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
            />

            <div className=" ">
              <TopBarActions />
            </div>
            <div className=" ">
              <GitHubUserMenu />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
