import { Link } from "react-router-dom";
import DragIcon from "../../../public/customIcons/DragIcon";
import ReposotoryIcon from "../../../public/customIcons/ReposotoryIcon";
import { Star } from "lucide-react";
import { languageColors } from "@utils/LanguageColors.jsx";
import { useState, useEffect } from "react";
import { getStoredStarredRepos, starRepository, unstarRepository } from "@services/storageService.js";

const PinnedRepoCard = ({
  repo,
  dragHandleProps,
  isDragging,
  isOverlay,
}) => {
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(repo?.stars || repo?.stargazers_count || 0);

  useEffect(() => {
    const starredRepos = getStoredStarredRepos();
    const starred = starredRepos.some(r => r.name === repo?.name && r.owner?.login === repo?.author);
    setIsStarred(starred);
  }, [repo]);

  const handleStarToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Construct a full repo object for the star service if needed
    const repoToStar = {
      ...repo,
      full_name: `${repo.author}/${repo.name}`,
      stargazers_count: starCount
    };

    if (isStarred) {
      unstarRepository(repoToStar.full_name);
      setIsStarred(false);
      setStarCount(prev => Math.max(0, prev - 1));
    } else {
      starRepository(repoToStar);
      setIsStarred(true);
      setStarCount(prev => prev + 1);
    }
    window.dispatchEvent(new CustomEvent('github_repos_updated'));
  };

  return (
    <article
      className={`bg-white border border-[#C8D1DA] rounded-md p-4 transition flex flex-col justify-between min-h-[114px] select-none ${
        isOverlay ? "shadow-xl ring-2 ring-[#0969da] cursor-grabbing rotate-2" : ""
      } ${isDragging && !isOverlay ? "opacity-0" : ""}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <ReposotoryIcon className="mt-1 flex-shrink-0" />
            <Link
              to={`/${repo.author}/${encodeURIComponent(repo.name)}`}
              className="text-[#0969DA] font-semibold text-[14px] hover:underline break-all"
            >
              {repo.name || "Repository"}
            </Link>
          </div>

          <div className="flex items-center gap-1">
            {/* Star toggle in pinned card */}
            <button 
              onClick={handleStarToggle}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Star 
                size={14} 
                className={isStarred ? "fill-[#e3b341] text-[#e3b341]" : "text-[#636c76]"} 
              />
            </button>
            <div
              {...dragHandleProps?.listeners}
              {...dragHandleProps?.attributes}
              className="p-2 -m-1 rounded hover:bg-slate-100 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
            >
              <DragIcon />
            </div>
          </div>
        </div>

        <p className="text-[#636c76] text-[12px] mt-2 leading-snug line-clamp-2">
          {repo.description || "No description provided."}
        </p>
      </div>

      <div className="flex items-center gap-4 text-xs text-[#636c76] mt-4">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full border border-[rgba(31,35,40,0.1)]"
              style={{ backgroundColor: languageColors[repo.language] || "#8b949e" }}
            />
            {repo.language}
          </span>
        )}

        <span className="flex items-center gap-1">
          <Star size={12} className="text-[#636c76]" />
          {starCount}
        </span>
      </div>
    </article>
  );
};

export default PinnedRepoCard;
