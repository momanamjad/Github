import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { TriangleDownIcon } from "@primer/octicons-react";
import { getStoredStarredRepos, starRepository, unstarRepository } from "@services/storageService.js";

const StarButton = ({ repo, className = "" }) => {
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(repo?.stargazers_count || repo?.stars || 0);

  useEffect(() => {
    const starredRepos = getStoredStarredRepos();
    const starred = starredRepos.some(r => r.full_name === repo?.full_name);
    setIsStarred(starred);
  }, [repo]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isStarred) {
      unstarRepository(repo.full_name);
      setIsStarred(false);
      setStarCount(prev => Math.max(0, prev - 1));
    } else {
      starRepository(repo);
      setIsStarred(true);
      setStarCount(prev => prev + 1);
    }

    // Notify other components
    window.dispatchEvent(new CustomEvent('github_repos_updated'));
    window.dispatchEvent(new Event('github_starred_updated'));
  };

  return (
    <div className={`inline-flex items-center rounded-md border border-[#d0d7de] bg-[#f6f8fa] shadow-sm select-none shrink-0 ${className}`}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#24292f] hover:bg-[#eef1f4] rounded-l-md border-r border-[#d0d7de] cursor-pointer transition-colors"
      >
        <Star
          size={14}
          className={isStarred ? "fill-[#e3b341] text-[#e3b341]" : "text-[#57606a]"}
        />
        <span>{isStarred ? "Starred" : "Star"}</span>
        {starCount > 0 && (
          <span className="ml-1 px-[6px] py-[1px] bg-[#afb8c1]/20 rounded-full text-[11px] font-semibold text-[#57606a]">
            {starCount}
          </span>
        )}
      </button>
      <button
        type="button"
        className="flex items-center justify-center px-2 py-1.5 text-[#57606a] hover:bg-[#eef1f4] rounded-r-md cursor-pointer transition-colors"
      >
        <TriangleDownIcon size={14} />
      </button>
    </div>
  );
};

export default StarButton;
