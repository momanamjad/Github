import React, { useState } from "react";
import { Search } from "lucide-react";

const SearchInput = () => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="relative flex items-center w-80 px-4 py-[6px] border border-gray-300 rounded-lg shadow-sm bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-100 transition-all">
      <Search
        className={`absolute left-3 h-4 w-4 text-gray-400 ${isFocused ? "text-blue-500" : ""}`}
      />

      <input
        type="text"
        placeholder="Type"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        // Add padding to the left to avoid text overlap with the icon
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
  );
};

export default SearchInput;
