import React from "react";
import { Star } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getStoredStarredRepos, starRepository, unstarRepository } from "@services/storageService.js";
import { languageColors } from "@utils/LanguageColors.jsx";
import { Link } from "react-router-dom";

/**
 * Individual Repository Item to improve render efficiency
 */
const RepoItem = React.memo(({ repo, isStarred, onToggleStar }) => {
  const formattedDate = new Date(repo.updated_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: repo.updated_at.includes(new Date().getFullYear()) ? undefined : 'numeric'
  });

  return (
    <div className="py-6 flex justify-between items-start border-b border-github-border last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <Link
          to={`/${repo.owner.login}/${encodeURIComponent(repo.name)}`}
          className="text-[#0969DA] text-[20px] font-semibold hover:underline truncate inline-block max-w-full"
        >
          {repo.name}
        </Link>

        {repo.description && (
          <p className="mt-1 text-sm text-github-muted max-w-xl line-clamp-2">
            {repo.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-github-muted">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border border-[rgba(31,35,40,0.1)]"
                style={{ backgroundColor: languageColors[repo.language] || "#8b949e" }}
              />
              {repo.language}
            </span>
          )}

          <span className="flex items-center gap-1">
            <Star size={14} />
            {repo.stargazers_count + (isStarred ? 1 : 0)}
          </span>

          <span>Updated on {formattedDate}</span>
        </div>
      </div>

      <button
        onClick={() => onToggleStar(repo)}
        className={`
                    flex items-center gap-1.5
                    px-3 py-1
                    text-xs font-medium
                    border border-github-border
                    rounded-md
                    transition-all duration-200
                    hover:bg-[#F6F8FA]
                    ${isStarred ? 'bg-[#F6F8FA]' : 'bg-white'}
                `}
      >
        <Star
          size={14}
          className={isStarred ? "fill-[#e3b341] text-[#e3b341]" : "text-github-muted"}
        />
        {isStarred ? "Starred" : "Star"}
      </button>
    </div>
  );
});

const RepoList = ({ repos }) => {
  const [starredFullNames, setStarredFullNames] = useState([]);

  useEffect(() => {
    const starred = getStoredStarredRepos();
    setStarredFullNames(starred.map(r => r.full_name));
  }, []);

  const handleStarToggle = useCallback((repo) => {
    setStarredFullNames(prev => {
      const isCurrentlyStarred = prev.includes(repo.full_name);
      if (isCurrentlyStarred) {
        unstarRepository(repo.full_name);
        return prev.filter(name => name !== repo.full_name);
      } else {
        starRepository(repo);
        return [...prev, repo.full_name];
      }
    });
  }, []);

  if (!repos || repos.length === 0) {
    return (
      <div className="py-12 text-center text-github-muted">
        No repositories found.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {repos.map((repo) => (
        <RepoItem
          key={repo.id}
          repo={repo}
          isStarred={starredFullNames.includes(repo.full_name)}
          onToggleStar={handleStarToggle}
        />
      ))}
    </div>
  );
};

export default RepoList;
