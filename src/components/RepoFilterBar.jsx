import { useState, useRef, useEffect } from "react";
import { TriangleDownIcon, CheckIcon } from "@primer/octicons-react";
import { useNavigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";
const FilterMenu = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-2
          px-3 py-1.5 text-sm font-medium
          border border-[#d0d7de]
          rounded-md bg-[#f6f8fa]
          hover:bg-[#eef1f4]
        "
      >
        {label}
        <TriangleDownIcon size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-[#d0d7de] rounded-md shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 text-xs font-semibold border-b bg-[#f6f8fa]">
            Select {label}
          </div>

          <div className="max-h-72 overflow-auto">
            {options.map((opt) => {
              const val = opt.value || opt;
              const labelText = opt.label || opt;

              return (
                <button
                  key={val}
                  onClick={() => {
                    onChange(val);
                    setOpen(false);
                  }}
                  className="flex justify-between w-full px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {labelText}
                  {value === val && <CheckIcon size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const RepoFilterBar = ({
  search,
  setSearch,
  language,
  setLanguage,
  sort,
  setSort,
  type,
  setType,
  languages,
}) => {
  const navigate = useNavigate();
  const handleNewRepoClick = () => {
    navigate("/new");
  };
  return (
    <div className="flex flex-col gap-3 py-4 border-b border-github-border">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a repository..."
          className="
            flex-1 bg-github-panel border border-github-border
            rounded-md px-3 py-1.5 text-sm
            text-github-text placeholder-github-muted
            focus:outline-none focus:ring-2 focus:ring-[#0969DA]
          "
        />

        <div className="flex gap-2">
          <FilterMenu
            label="Type"
            value={type}
            onChange={setType}
            options={[
              { label: "All", value: "all" },
              { label: "Sources", value: "sources" },
              { label: "Forks", value: "forks" },
              { label: "Archived", value: "archived" },
              { label: "Mirrors", value: "mirrors" },
            ]}
          />

          <FilterMenu
            label="Language"
            value={language}
            onChange={setLanguage}
            options={languages}
          />

          <FilterMenu
            label="Sort"
            value={sort}
            onChange={setSort}
            options={[
              { label: "Last updated", value: "updated" },
              { label: "Stars", value: "stars" },
              { label: "Name", value: "name" },
            ]}
          />
          <button
            className="dropdown-item gap-1.5 flex items-center bg-[#1F883D] rounded-md w-auto h-9 px-4 text-[17px] font-semibold text-white"
            onClick={handleNewRepoClick}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
            </svg>
            <span>New</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepoFilterBar;
