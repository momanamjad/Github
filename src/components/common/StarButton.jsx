import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useGitHub } from "@/contexts/GitHubContext";
import { toggleStarRepo, getStarredRepos } from "@services/GithubApi";

const StarButton = ({ repo, className = "" }) => {
  const { user } = useGitHub();
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(repo?.stars_count || repo?.stargazers_count || repo?.stars || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.login && repo) {
      getStarredRepos(user.login)
        .then((starredList) => {
          const starred = starredList.some(r => r._id === repo._id || r.id === repo.id || r.name === repo.name);
          setIsStarred(starred);
        })
        .catch(console.error);
    }
  }, [repo, user?.login]);

  // Sync star count when repo changes
  useEffect(() => {
    if (repo) {
      setStarCount(repo.stars_count || repo.stargazers_count || repo.stars || 0);
    }
  }, [repo]);

  const handleStarClick = async (e) => {
    e.preventDefault();
    if (loading || !repo) return;
    setLoading(true);
    try {
      const repoId = repo._id || repo.id;
      const res = await toggleStarRepo(repoId);
      const isNowStarred = res?.message === "Starred";
      setIsStarred(isNowStarred);
      setStarCount(prev => isNowStarred ? prev + 1 : Math.max(0, prev - 1));
      
      // Dispatch an event to update other parts of UI (like Stars tab)
      window.dispatchEvent(new CustomEvent("github_stars_updated"));
    } catch (error) {
      console.error("Error toggling star:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStarClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-[3px] text-[#24292f] border border-[#d0d7de] rounded-md transition-colors cursor-pointer font-medium ${
        isStarred ? "bg-[#f3f4f6] hover:bg-[#e5e7eb]" : "bg-[#f6f8fa] hover:bg-[#ebedf0]"
      } ${className}`}
    >
      <Star
        size={14}
        className={isStarred ? "text-yellow-500 fill-yellow-500" : "text-[#57606a]"}
      />
      <span>{isStarred ? "Starred" : "Star"}</span>
      <span className="ml-1 px-[6px] py-[1px] bg-white border border-[#d0d7de] rounded-full text-[11px] font-semibold text-[#636c76]">
        {starCount}
      </span>
    </button>
  );
};

export default StarButton;
