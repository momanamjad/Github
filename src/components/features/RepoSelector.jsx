import { Lock, Package } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { getRepos } from "@services/GithubApi.jsx";

export default function RepoSelector({ username, onSelect }) {
  const [repos, setRepos] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Derived state — useMemo is the correct tool here (avoids setState-in-effect)
  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    const reposArray = Array.isArray(repos) ? repos : [];
    return reposArray.filter((r) => {
      if (!r) return false;
      const nameStr = r.full_name || (r.owner?.login ? `${r.owner.login}/${r.name}` : r.name) || "";
      return nameStr.toLowerCase().includes(lower);
    });
  }, [search, repos]);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // fetch repos
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const data = await getRepos(username);
        const dataArray = Array.isArray(data) ? data : [];
        // recent repos first
        const sorted = [...dataArray].sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
        );

        setRepos(sorted);
      } catch (error) {
        console.error("Error fetching repos:", error);
        setRepos([]);
      }
    };

    if (username) {
      fetchRepos();
    }
  }, [username]);

  // outside click
  useEffect(() => {
    const close = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // focus search
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleSelect = (repo) => {
    setSelected(repo);
    setOpen(false);
    if (onSelect) {
      onSelect(repo);
    }
  };

  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }

    if (e.key === "Enter") {
      handleSelect(filtered[activeIndex]);
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative max-w-[320px]">
    
      {/* Selected */}
      <button
        onClick={() => setOpen(!open)}
        className="w-[214px] border rounded-md p-2 text-left bg-white text-[#1f2328]"
      >
        {selected ? (selected.full_name || selected.name) : "Select repository"}
      </button>
    
      {/* Dropdown */}
      {open && (
        <div
          className="absolute mt-1 w-full bg-white border rounded-md shadow-lg z-50"
          onKeyDown={handleKeyDown}
        >
          <h2 className="p-2 text-[14px] text-[black]">Select an item</h2>
          <input
            ref={inputRef}
            placeholder="Search repository"
            className="w-full p-2 border rounded-md mb-2 bg-white text-[#1f2328]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-60 overflow-y-auto">
            {filtered.map((repo, index) => (
              <div
                key={repo.id || repo._id}
                onClick={() => handleSelect(repo)}
                className={`px-3 py-2 cursor-pointer text-sm flex items-center gap-2 text-[#1f2328]
                  ${
                    index === activeIndex ? "bg-blue-50" : "hover:bg-gray-100"
                  }`}
              >
                <span>
                  {repo.private ? (
                    <Lock className="w-4 h-4 text-[#57606a]" />
                  ) : (
                    <Package className="w-4 h-4 text-[#57606a]" />
                  )}
                </span>

                {repo.full_name || repo.name}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="p-3 text-sm text-gray-500">
                No repositories found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
