import { IoLogoGithub } from "react-icons/io";
import { CiMenuBurger } from "react-icons/ci";
import { RiGitRepositoryLine } from "react-icons/ri";
import { IoIosGitPullRequest } from "react-icons/io";
import { VscIssues } from "react-icons/vsc";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Search } from "lucide-react";

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
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 ">
          <button
            type="button"
            aria-label="Open Menu"
            // aria-expanded={isOpen}
            // onClick={() => setIsOpen(!isOpen)}
            className="btn-octicon m-2 p-2 border border-[#C8D1DA] rounded-[10px] cursor-pointer"
            size={36}
          >
            <svg
              height="24"
              width="24"
              viewBox="0 0 16 16"
              version="1.1"
              aria-hidden="true"
              color="#818B98"
            >
              <path
                fill="currentColor"
                d="M1 2.75A.75.75 0 011.75 2h12.5a.75.75 0 110 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h12.5a.75.75 0 110 1.5H1.75A.75.75 0 011 7.75zM1.75 12a.75.75 0 100 1.5h12.5a.75.75 0 100-1.5H1.75z"
              ></path>
            </svg>
          </button>
          <IoLogoGithub size={33} className="cursor-pointer" />
          <span className="font-semibold text-github-text cursor-pointer ">
            momanamjad
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center w-80 px-4 py-2 border border-gray-300 rounded-lg shadow-sm  focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
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

        <div className="flex items-center gap-4">
          {[
            <VscIssues size={32} />,
            <IoIosGitPullRequest size={32} />,
            <RiGitRepositoryLine size={32} />,
          ].map((item, index) => (
            <span
              key={index}
              className="
                text-github-text
                px-2 py-1 rounded-md
                hover:bg-github-panelHover
                cursor-pointer
              "
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
