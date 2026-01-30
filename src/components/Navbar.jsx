import { IoLogoGithub } from "react-icons/io";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import GitHubUserMenu from "./GitHubUserMenu";
import TopBarActions from "./Topbar";

const Navbar = () => {
  const [value, setValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <header className="bg-[#EFF2F5]   border-github-border">
      <div className=" mx-auto h-13  flex items-center justify-between">
        <div className="flex items-center gap-2  pt-4 pr-4 pb-1 pl-2 ">
          <button
            type="button"
            aria-label="Open Menu"
            // aria-expanded={isOpen}
            // onClick={() => setIsOpen(!isOpen)}
            className="btn-octicon m-2 p-2 border border-[#C8D1DA] rounded-[8px] cursor-pointer"
            size={36}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              // class="octicon octicon-three-bars"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="currentColor"
              display="inline-block"
              overflow="visible"
              // style="vertical-align:text-bottom"
            >
              <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z"></path>
            </svg>
          </button>

          <IoLogoGithub size={33} className="cursor-pointer" />
          <span className="font-semibold text-github-text cursor-pointer ">
            momanamjad
          </span>
        </div>
        <div className=" pt-4 pr-4 pb-1 pl-2    flex">
          <div className=" pt-4 pr-4 pb-1 pl-2 ">
            <form onSubmit={handleSubmit}>
              <div className="relative flex items-center w-80 px-4 py-[6px] border border-gray-300 rounded-lg shadow-sm  focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-100 transition-all">
                <Search
                  className={`absolute left-3 h-4 w-4 text-gray-400 ${isFocused ? "text-blue-500" : ""}`}
                />

                <input
                  type="text"
                  placeholder="Type"
                  id="search-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full pl-8 pr-2 focus:outline-none text-sm placeholder-gray-500"
                />

                {!inputValue && (
                  <div className="absolute right-2 flex items-center text-xs text-gray-500 pointer-events-none">
                    <span className="text-gray-400 mr-1">to search</span>
                    <kbd className="px-2 py-0.5 ml-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md">
                      /
                    </kbd>
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="pt-4 pr-4 pb-1 pl-2 gap-6">
            <TopBarActions />
          </div>
          <div className="pt-4 pr-4 pb-1 pl-2 gap-6">
            <GitHubUserMenu />,
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
