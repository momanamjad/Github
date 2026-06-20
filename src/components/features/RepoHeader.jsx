import { useState, useEffect } from "react";
import { GitFork, Eye } from "lucide-react";
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

  useEffect(() => {
    if (repo) {
      setWatchersCount(repo.watchers_count || 0);
      setIsWatching(repo.isWatching || false);
    }
  }, [repo]);

  if (!repo) return null;

  const isPrivate = repo.private || repo.visibility === "private";

  const handleWatchClick = async () => {
    if (!user) {
      alert("Please log in to watch repositories.");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const repoId = repo._id || repo.id;
      const res = await apiClient(`/repos/${repoId}/watch`, { method: "POST" });
      if (res?.data) {
        setIsWatching(res.data.isWatching);
        setWatchersCount(res.data.watchers_count);
      }
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
      <div className="flex flex-wrap items-center gap-2 text-[12px] md:self-center">
        <StarButton repo={repo} />
        <PinButton repo={repo} />

        <button className="flex items-center gap-1.5 px-3 py-[3px] text-[#24292f] border border-[#d0d7de] rounded-md bg-[#f6f8fa] hover:bg-[#ebedf0] transition-colors cursor-pointer font-medium">
          <GitFork size={14} className="text-[#57606a]" />
          <span>Fork</span>
          <span className="ml-1 px-[6px] py-[1px] bg-white border border-[#d0d7de] rounded-full text-[11px] font-semibold text-[#636c76]">
            {repo.forks_count || 0}
          </span>
        </button>

        <button
          onClick={handleWatchClick}
          disabled={loading}
          className={`flex items-center gap-1 px-3 py-[3px] text-[#24292f] border border-[#d0d7de] rounded-md transition-colors cursor-pointer font-medium ${
            isWatching ? "bg-[#f3f4f6] hover:bg-[#e5e7eb]" : "bg-[#f6f8fa] hover:bg-[#ebedf0]"
          }`}
        >
          <Eye size={14} className={isWatching ? "text-blue-500 fill-blue-500" : "text-[#57606a]"} />
          <span>{isWatching ? "Watching" : "Watch"}</span>
          <span className="ml-1 px-[6px] py-[1px] bg-white border border-[#d0d7de] rounded-full text-[11px] font-semibold text-[#636c76]">
            {watchersCount}
          </span>
        </button>
      </div>
    </div>
  );
};

export default RepoHeader;
