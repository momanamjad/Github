import { useState, useRef, useEffect } from "react";
import { TriangleDownIcon, CheckIcon } from "@primer/octicons-react";

import NewRepoBtn from "../common/NewRepoBtn";
import CloseIcon from "../../../public/customIcons/CloseIcon";
import { useScrollLock } from "../../hooks/useScrollLock";

const FilterMenu = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Only lock scroll on mobile (sm breakpoint is usually 640px)
  useScrollLock(open && window.innerWidth < 640);


  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
                <CloseIcon width="16" height="16" />
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

        <div className="flex flex-wrap gap-2">
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
          <NewRepoBtn />
        </div>
      </div>
    </div>
  );
};

export default RepoFilterBar;
