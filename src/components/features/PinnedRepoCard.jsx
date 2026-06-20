import { Link } from "react-router-dom";
import DragIcon from "../../../public/customIcons/DragIcon";
import ReposotoryIcon from "../../../public/customIcons/ReposotoryIcon";
import { Star, GitFork } from "lucide-react";
import { languageColors } from "@utils/LanguageColors.jsx";
import { useState, useEffect } from "react";
import { getStoredStarredRepos, starRepository, unstarRepository } from "@services/storageService.js";

const PinnedRepoCard = ({
  repo,
  author,
  dragHandleProps,
  isDragging,
  isOverlay,
}) => {
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(repo?.stars_count || repo?.stargazers_count || repo?.stars || 0);

  const authorLogin = author || repo?.author || repo?.owner?.login || "moman";

  useEffect(() => {
    try {
      const storedStarred = JSON.parse(localStorage.getItem("starred_repo_ids") || "[]");
      setIsStarred(storedStarred.includes(repo?._id || repo?.id));
    } catch {
      const starredRepos = getStoredStarredRepos();
      const starred = starredRepos.some(r => r.name === repo?.name && (r.owner?.login === repo?.author || r.owner?.login === authorLogin));
      setIsStarred(starred);
    }
  }, [repo, authorLogin]);

  const handleStarToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const repoId = repo?._id || repo?.id;
    const hasUser = !!localStorage.getItem("github_user");

    if (hasUser && repo?._id) {
      try {
        const { toggleStarRepo } = await import("../../services/GithubApi");
        await toggleStarRepo(repo._id);
      } catch (err) {
        console.error("Error starring inside pinned card:", err);
      }
    } else {
      const repoToStar = {
        ...repo,
        full_name: `${authorLogin}/${repo.name}`,
        stargazers_count: starCount
      };
      if (isStarred) {
        unstarRepository(repoToStar.full_name);
      } else {
        starRepository(repoToStar);
      }
    }

    setIsStarred(prev => {
      const nextStarred = !prev;
      setStarCount(c => nextStarred ? c + 1 : Math.max(0, c - 1));
      
      try {
        let stored = JSON.parse(localStorage.getItem("starred_repo_ids") || "[]");
        if (nextStarred) {
          if (!stored.includes(repoId)) stored.push(repoId);
        } else {
          stored = stored.filter(id => id !== repoId);
        }
        localStorage.setItem("starred_repo_ids", JSON.stringify(stored));
      } catch (_err) {}

      window.dispatchEvent(new Event('github_starred_updated'));
      window.dispatchEvent(new CustomEvent('github_repos_updated'));
      return nextStarred;
    });
  };

  return (
    <article
      className={`bg-white border border-[#d0d7de] rounded-md p-4 transition flex flex-col justify-between min-h-[120px] select-none ${
        isOverlay ? "shadow-xl ring-2 ring-[#0969da] cursor-grabbing rotate-2" : ""
      } ${isDragging && !isOverlay ? "opacity-0" : ""}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-wrap min-w-0">
            <ReposotoryIcon className="mt-1 flex-shrink-0 text-[#57606a]" />
            <Link
              to={`/${authorLogin}/${encodeURIComponent(repo.name)}`}
              className="text-[#0969DA] font-semibold text-[14px] hover:underline break-all"
            >
              {repo.name || "Repository"}
            </Link>
            <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-medium text-[#57606a] border border-[#d0d7de] rounded-full bg-white select-none capitalize">
              {repo.visibility || (repo.private ? "private" : "public")}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Star toggle in pinned card */}
            <button 
              onClick={handleStarToggle}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              <Star 
                size={14} 
                className={isStarred ? "fill-[#e3b341] text-[#e3b341]" : "text-[#636c76]"} 
              />
            </button>
            {dragHandleProps && (
              <div
                {...dragHandleProps.listeners}
                {...dragHandleProps.attributes}
                className="p-2 -m-1 rounded hover:bg-slate-100 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
              >
                <DragIcon />
              </div>
            )}
          </div>
        </div>

        <p className="text-[#57606a] text-[12px] mt-2 leading-snug line-clamp-2 pr-1">
          {repo.description || "No description provided."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-[#636c76] mt-4">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full border border-[rgba(31,35,40,0.1)]"
              style={{ backgroundColor: languageColors[repo.language] || "#8b949e" }}
            />
            {repo.language}
          </span>
        )}

        {starCount > 0 && (
          <span className="flex items-center gap-1">
            <Star size={12} className="text-[#636c76]" />
            {starCount}
          </span>
        )}

        {repo.forks_count > 0 && (
          <span className="flex items-center gap-1">
            <GitFork size={12} className="text-[#636c76]" />
            {repo.forks_count}
          </span>
        )}
      </div>
    </article>
  );
};

export default PinnedRepoCard;
