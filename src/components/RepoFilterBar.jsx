import { useState, useRef, useEffect } from "react";
import { TriangleDownIcon, CheckIcon } from "@primer/octicons-react";

const FilterMenu = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = e => {
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
            {options.map(opt => {
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
  return (
    <div className="flex flex-col gap-3 py-4 border-b border-github-border">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
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
        </div>
      </div>
    </div>
  );
};

export default RepoFilterBar;
