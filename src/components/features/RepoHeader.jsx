import { useState, useEffect, useRef } from "react";
import { GitFork, Eye, ChevronDown, Check } from "lucide-react";
import { Link } from "react-router-dom";
import StarButton from "@common/StarButton";
import PinButton from "@common/PinButton";
import { apiClient } from "../../services/apiClient";
import { useGitHub } from "../../contexts/GitHubContext";

const RepoHeader = ({ repo }) => {
  const { user } = useGitHub();
  const [isWatching, setIsWatching] = useState(false);
  const [watchersCount, setWatchersCount] = useState(repo?.watchers_count || 0);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState("participating"); // "participating" | "all" | "ignore"
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (repo) {
      setWatchersCount(repo.watchers_count || 0);
      const watching = repo.isWatching || false;
      setIsWatching(watching);
      setSelectedMode(watching ? "all" : "participating");
    }
  }, [repo]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!repo) return null;

  const isPrivate = repo.private || repo.visibility === "private";

  const handleSelectMode = async (mode) => {
    if (!user) {
      alert("Please log in to change notification settings.");
      return;
    }
    if (loading) return;
    setLoading(true);
    setIsDropdownOpen(false);
    try {
      const repoId = repo._id || repo.id;
      // If choosing 'all', ensure we are watching. If ignore/participating, ensure we are not watching
      const targetWatchingState = mode === "all";
      
      if (targetWatchingState !== isWatching) {
        const res = await apiClient(`/repos/${repoId}/watch`, { method: "POST" });
        if (res?.data) {
          setIsWatching(res.data.isWatching);
          setWatchersCount(res.data.watchers_count);
        }
      }
      setSelectedMode(mode);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
      {/* Left: Repo name with breadcrumb & visibility badge */}
      <div className="flex items-center gap-2 flex-wrap text-[18px] sm:text-[20px] font-normal text-[#1f2328]">
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" className="text-[#636c76] shrink-0" fill="currentColor">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.25.25 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
        </svg>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link to={`/${repo.owner?.login}`} className="text-[#0969da] hover:underline">
            {repo.owner?.login}
          </Link>
          <span className="text-[#57606a]">/</span>
          <Link to={`/${repo.owner?.login}/${repo.name}`} className="hover:underline font-semibold text-[#1f2328]">
            {repo.name}
          </Link>
        </div>
        <span className="text-[12px] px-[7px] py-[0.5px] border border-[#d0d7de] text-[#57606a] rounded-full font-medium capitalize bg-white ml-1">
          {isPrivate ? "private" : "public"}
        </span>
      </div>

      {/* Right: Stats row (Watch, Fork, Star) */}
      <div className="flex flex-wrap items-center gap-2 text-[12px] md:self-center relative">
        <StarButton repo={repo} />
        <PinButton repo={repo} />

        <button className="flex items-center gap-1.5 px-3 py-[3px] text-[#24292f] border border-[#d0d7de] rounded-md bg-[#f6f8fa] hover:bg-[#ebedf0] transition-colors cursor-pointer font-medium">
          <GitFork size={14} className="text-[#57606a]" />
          <span>Fork</span>
          <span className="ml-1 px-[6px] py-[1px] bg-white border border-[#d0d7de] rounded-full text-[11px] font-semibold text-[#636c76]">
            {repo.forks_count || 0}
          </span>
        </button>

        {/* Watch Dropdown Button Group */}
        <div ref={dropdownRef} className="relative inline-flex">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-[3px] text-[#24292f] border border-[#d0d7de] rounded-l-md transition-colors cursor-pointer font-medium border-r-0 ${
              isWatching ? "bg-[#f3f4f6] hover:bg-[#e5e7eb]" : "bg-[#f6f8fa] hover:bg-[#ebedf0]"
            }`}
          >
            <Eye size={14} className={isWatching ? "text-blue-500 fill-blue-500" : "text-[#57606a]"} />
            <span>{isWatching ? "Watching" : "Watch"}</span>
            <span className="ml-1 px-[6px] py-[1px] bg-white border border-[#d0d7de] rounded-full text-[11px] font-semibold text-[#636c76]">
              {watchersCount}
            </span>
          </button>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`px-1.5 py-[3px] text-[#24292f] border border-[#d0d7de] rounded-r-md hover:bg-[#ebedf0] transition-colors cursor-pointer`}
          >
            <ChevronDown size={12} className="text-[#57606a]" />
          </button>

          {/* Premium GitHub-style dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-[320px] bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-lg z-50 text-left overflow-hidden">
              <div className="px-3.5 py-2 border-b border-[#d0d7de] dark:border-[#30363d]">
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200">Select notification settings</span>
              </div>
              <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                <button
                  onClick={() => handleSelectMode("participating")}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#f6f8fa] dark:hover:bg-[#1f242c] bg-transparent border-0 cursor-pointer flex gap-3 items-start"
                >
                  <div className="pt-0.5 shrink-0 w-4">
                    {selectedMode === "participating" && <Check size={14} className="text-[#0969da]" />}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#1f2328] dark:text-white">Participating and @mentions</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-normal">Only receive notifications when you participate or are @mentioned.</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectMode("all")}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#f6f8fa] dark:hover:bg-[#1f242c] bg-transparent border-0 cursor-pointer flex gap-3 items-start"
                >
                  <div className="pt-0.5 shrink-0 w-4">
                    {selectedMode === "all" && <Check size={14} className="text-[#0969da]" />}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#1f2328] dark:text-white">All Activity</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-normal">Receive notifications for all commits, issues, pull requests, releases, and discussions.</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectMode("ignore")}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#f6f8fa] dark:hover:bg-[#1f242c] bg-transparent border-0 cursor-pointer flex gap-3 items-start"
                >
                  <div className="pt-0.5 shrink-0 w-4">
                    {selectedMode === "ignore" && <Check size={14} className="text-[#0969da]" />}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#1f2328] dark:text-white">Ignore</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-normal">Never receive notifications for this repository.</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepoHeader;
