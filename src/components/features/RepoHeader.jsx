import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import StarButton from "@common/StarButton";
import PinButton from "@common/PinButton";
import { apiClient } from "../../services/apiClient";
import { useGitHub } from "../../contexts/GitHubContext";
import { RepoForkedIcon, EyeIcon, ChevronDownIcon, CheckIcon, RepoIcon } from "@primer/octicons-react";

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
      <div className="flex items-center gap-2 flex-wrap text-[18px] sm:text-[20px] font-normal text-[#1f2328] dark:text-[#c9d1d9]">
        <RepoIcon size={16} className="text-[#57606a] dark:text-[#8b949e] shrink-0" />
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link to={`/${repo.owner?.login}`} className="text-[#0969da] dark:text-[#58a6ff] hover:underline">
            {repo.owner?.login}
          </Link>
          <span className="text-[#57606a] dark:text-[#8b949e]">/</span>
          <Link to={`/${repo.owner?.login}/${repo.name}`} className="hover:underline font-semibold text-[#1f2328] dark:text-[#c9d1d9]">
            {repo.name}
          </Link>
        </div>
        <span className="text-[12px] px-[7px] py-[0.5px] border border-[#d0d7de] dark:border-[#30363d] text-[#57606a] dark:text-[#8b949e] rounded-full font-medium capitalize bg-white dark:bg-[#161b22] ml-1">
          {isPrivate ? "private" : "public"}
        </span>
      </div>

      {/* Right: Stats row (Watch, Fork, Star) */}
      <div className="flex flex-wrap items-center gap-2 text-[12px] md:self-center relative">
        <StarButton repo={repo} />
        <PinButton repo={repo} />

        <button className="flex items-center gap-1.5 px-3 py-[3.5px] text-[#24292f] dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] hover:bg-[#ebedf0] dark:bg-[#21262d] dark:hover:bg-[#30363d] transition-colors cursor-pointer font-medium text-[12px]">
          <RepoForkedIcon size={14} className="text-[#57606a] dark:text-[#8b949e]" />
          <span>Fork</span>
          <span className="ml-1 px-[6px] py-[1px] bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-full text-[11px] font-semibold text-[#57606a] dark:text-[#8b949e]">
            {repo.forks_count || 0}
          </span>
        </button>

        {/* Watch Dropdown Button Group */}
        <div ref={dropdownRef} className="relative inline-flex text-[12px]">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-[3.5px] text-[#24292f] dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] rounded-l-md transition-colors cursor-pointer font-medium border-r-0 ${
              isWatching ? "bg-[#eaeef2] dark:bg-[#30363d]" : "bg-[#f6f8fa] hover:bg-[#ebedf0] dark:bg-[#21262d] dark:hover:bg-[#30363d]"
            }`}
          >
            <EyeIcon size={14} className={isWatching ? "text-[#0969da] dark:text-[#58a6ff]" : "text-[#57606a] dark:text-[#8b949e]"} />
            <span>{isWatching ? "Watching" : "Watch"}</span>
            <span className="ml-1 px-[6px] py-[1px] bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-full text-[11px] font-semibold text-[#57606a] dark:text-[#8b949e]">
              {watchersCount}
            </span>
          </button>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-1.5 py-[3.5px] text-[#24292f] dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] rounded-r-md bg-[#f6f8fa] hover:bg-[#ebedf0] dark:bg-[#21262d] dark:hover:bg-[#30363d] transition-colors cursor-pointer"
          >
            <ChevronDownIcon size={12} className="text-[#57606a] dark:text-[#8b949e]" />
          </button>

          {/* Premium GitHub-style dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-[320px] bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-lg z-50 text-left overflow-hidden">
              <div className="px-3.5 py-2 border-b border-[#d0d7de] dark:border-[#30363d]">
                <span className="text-[11px] font-bold text-[#24292f] dark:text-[#c9d1d9]">Select notification settings</span>
              </div>
              <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                <button
                  onClick={() => handleSelectMode("participating")}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#f6f8fa] dark:hover:bg-[#1f242c] bg-transparent border-0 cursor-pointer flex gap-3 items-start"
                >
                  <div className="pt-0.5 shrink-0 w-4">
                    {selectedMode === "participating" && <CheckIcon size={14} className="text-[#0969da] dark:text-[#58a6ff]" />}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#1f2328] dark:text-[#c9d1d9]">Participating and @mentions</div>
                    <div className="text-[10px] text-[#57606a] dark:text-[#8b949e] mt-0.5 leading-normal">Only receive notifications when you participate or are @mentioned.</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectMode("all")}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#f6f8fa] dark:hover:bg-[#1f242c] bg-transparent border-0 cursor-pointer flex gap-3 items-start"
                >
                  <div className="pt-0.5 shrink-0 w-4">
                    {selectedMode === "all" && <CheckIcon size={14} className="text-[#0969da] dark:text-[#58a6ff]" />}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#1f2328] dark:text-[#c9d1d9]">All Activity</div>
                    <div className="text-[10px] text-[#57606a] dark:text-[#8b949e] mt-0.5 leading-normal">Receive notifications for all commits, issues, pull requests, releases, and discussions.</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectMode("ignore")}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#f6f8fa] dark:hover:bg-[#1f242c] bg-transparent border-0 cursor-pointer flex gap-3 items-start"
                >
                  <div className="pt-0.5 shrink-0 w-4">
                    {selectedMode === "ignore" && <CheckIcon size={14} className="text-[#0969da] dark:text-[#58a6ff]" />}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#1f2328] dark:text-[#c9d1d9]">Ignore</div>
                    <div className="text-[10px] text-[#57606a] dark:text-[#8b949e] mt-0.5 leading-normal">Never receive notifications for this repository.</div>
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
