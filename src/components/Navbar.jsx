import { IoLogoGithub } from "react-icons/io";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import GitHubUserMenu from "./GitHubUserMenu";
import TopBarActions from "./Topbar";
import GithubOpenMenu from "./GithubOpenMenu";
// import GitHubSearch from "./GitHubSearch";
import GitHubSearch from "./GitHubSearch";
// import { useState, useEffect } from 'react';
// import { Search } from 'lucide-react';

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
    <header className="bg-[#EFF2F5]   border-github-border">
      <div className=" mx-auto h-13  flex items-center justify-between">
        <div className="flex items-center gap-2  pt-4 pr-4 pb-1 pl-2 ">
          <GithubOpenMenu />
          <IoLogoGithub size={33} className=" cursor-pointer" />
          <div className="hover:bg-[#c8d1da]  px-2 py-1 rounded-md ">
            <span className="font-semibold text-github-text  cursor-pointer ">
              momanamjad
            </span>
          </div>
        </div>
        <div className=" pt-4 pr-4 pb-1 pl-2    flex">
          {/* <div className=" pt-4 pr-4 pb-1 pl-2 ">
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
          </div> */}
          <div className="pt-4 pr-4 pb-1 pl-2">
            <form onSubmit={handleSubmit}>
              <div
                onClick={HandleInputClick}
                className="relative flex items-center w-80 px-4 py-[6px] border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-100 transition-all cursor-pointer"
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
                  className="w-full pl-8 pr-2 focus:outline-none text-sm placeholder-gray-500 cursor-pointer"
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

          <GitHubSearch
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />

          <div className="pt-4 pr-4 pb-1 pl-2 gap-6">
            <TopBarActions />
          </div>
          <div className="pt-4 pr-4 pb-1 pl-2 gap-6 ">
            <GitHubUserMenu />,
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
