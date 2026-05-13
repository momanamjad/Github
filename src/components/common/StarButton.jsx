import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { getStoredStarredRepos, starRepository, unstarRepository } from "@services/storageService.js";

const StarButton = ({ repo, className = "" }) => {
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(repo?.stargazers_count || 0);

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

    // Notify other components (like PinnedRepos or RepoList)
    window.dispatchEvent(new CustomEvent('github_repos_updated'));
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium border border-[#d0d7de] rounded-md transition-all ${
        isStarred ? "bg-[#f6f8fa] text-[#1f2328]" : "bg-white text-[#24292f] hover:bg-[#f6f8fa]"
      } ${className}`}
    >
      <Star
        size={14}
        className={isStarred ? "fill-[#e3b341] text-[#e3b341]" : "text-[#636c76]"}
      />
      <span>{isStarred ? "Starred" : "Star"}</span>
      {starCount > 0 && (
        <span className="ml-1 px-[6px] py-[1px] bg-white border border-[#d0d7de] rounded-full text-[11px] font-semibold text-[#636c76]">
          {starCount}
        </span>
      )}
    </button>
  );
};

export default StarButton;
