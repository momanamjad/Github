import { IoLogoGithub } from "react-icons/io";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import GitHubUserMenu from "./GitHubUserMenu";
import TopBarActions from "./Topbar";
import GithubOpenMenu from "./GithubOpenMenu";
import GitHubSearch from "./GitHubSearch";

const Navbar = () => {
  const [value, setValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // const [inputValue, setInputValue] = useState('');
  // const [isFocused, setIsFocused] = useState(false);

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

  const navigate = useNavigate();
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
    <header className="bg-[#F6F8FA]   border-github-border">
      <div className=" mx-auto h-13  flex items-center justify-between">
        <div className="flex items-center gap-2  pt-4 pr-4 pb-1 pl-2 ">
          <GithubOpenMenu />
          <IoLogoGithub size={33} className=" cursor-pointer" />
          <div className="hover:bg-[#ebeff6]  px-2 py-1 rounded-md ">
            <span className="font-semibold text-[14px]  cursor-pointer ">
              momanamjad
            </span>
          </div>
        </div>
        <div className=" pt-4 pr-4 pb-1 pl-2 flex">
          <div className="pt-4  pb-1  ">
            <form onSubmit={handleSubmit}>
              <div
                onClick={HandleInputClick}
                className="relative flex items-center  px-4 py-[6px] border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-100 transition-all cursor-pointer"
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
          </div>

          <GitHubSearch
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />

          <div className="pt-4 pr-4 pb-1 pl-2 gap-6">
            <TopBarActions />
          </div>
          <div className="pt-4 pr-4 pb-1 pl-2 gap-6 ">
            <GitHubUserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
