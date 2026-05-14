import { useState, useRef, useEffect } from "react";
import { TriangleDownIcon, CheckIcon } from "@primer/octicons-react";
import { useNavigate } from "react-router-dom";
import { useScrollLock } from "../hooks/useScrollLock";
// import { useLocation } from "react-router-dom";

const FilterMenu = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Only lock scroll on mobile
  useScrollLock(open && window.innerWidth < 640);


  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  return (
    <div ref={ref} className="relative sm:static lg:relative">
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
        <>
          <div
            className="fixed inset-0 bg-black/20 z-[90] sm:hidden"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          />
          <div className="fixed sm:absolute bottom-0 left-0 right-0 sm:bottom-auto sm:left-0 sm:right-auto sm:top-full sm:mt-2 w-full sm:w-56 bg-white sm:border border-t sm:border-[#d0d7de] border-[#d0d7de] sm:rounded-md rounded-t-xl shadow-2xl z-[100] flex flex-col animate-in slide-in-from-bottom-2 sm:slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 sm:px-3 sm:py-2 text-sm sm:text-xs font-semibold border-b sm:bg-[#f6f8fa] bg-white flex justify-between items-center rounded-t-xl sm:rounded-none">
              <span>Select {label}</span>
              <button className="sm:hidden text-gray-500 p-1" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] sm:max-h-72 overflow-y-auto">
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
                    className="flex justify-between items-center w-full px-4 py-3 sm:px-3 sm:py-2 text-sm hover:bg-gray-100 border-b sm:border-none border-gray-100 last:border-none"
                  >
                    <span>{labelText}</span>
                    {value === val && <CheckIcon size={16} />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
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
