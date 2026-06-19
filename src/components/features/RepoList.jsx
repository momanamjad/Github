import React from "react";
import { Star, GitFork } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getStoredStarredRepos, starRepository, unstarRepository, getStoredPinnedRepos, pinRepository, unpinRepository } from "@services/storageService.js";
import { toggleStarRepo, togglePinRepo } from "@services/GithubApi.jsx";
import { languageColors } from "@utils/LanguageColors.jsx";
import { Link } from "react-router-dom";

/**
 * Individual Repository Item to improve render efficiency
 */
const RepoItem = React.memo(({ repo, isStarred, onToggleStar, isPinned, onTogglePin }) => {
  const formattedDate = new Date(repo.updated_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: repo.updated_at.includes(new Date().getFullYear()) ? undefined : 'numeric'
  });

  const ownerLogin = repo.owner?.login || "moman";
  const visibility = repo.visibility || (repo.private ? "private" : "public");

  return (
    <div className="py-6 flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-[#d0d7de]/60 last:border-0 gap-4">
      <div className="flex-1 min-w-0 pr-0 sm:pr-4">
        <div className="flex items-center flex-wrap gap-2 mb-1">
          <Link
            to={`/${ownerLogin}/${encodeURIComponent(repo.name)}`}
            className="text-[#0969DA] text-[20px] font-semibold hover:underline truncate max-w-full"
          >
            {repo.name}
          </Link>
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-[#57606a] border border-[#d0d7de] rounded-full bg-white select-none capitalize">
            {visibility}
          </span>
        </div>

        {repo.fork && (
          <p className="text-xs text-[#57606a] mb-1.5">
            Forked from <span className="font-mono">{repo.parent || "original/repo"}</span>
          </p>
        )}

        {repo.description && (
          <p className="mt-1 text-sm text-[#57606a] max-w-2xl break-words pr-2 line-clamp-2">
            {repo.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-[#57606a]">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border border-[rgba(31,35,40,0.1)]"
                style={{ backgroundColor: languageColors[repo.language] || "#8b949e" }}
              />
              {repo.language}
            </span>
          )}

          {((repo.stars_count || 0) + (isStarred ? 1 : 0) > 0) && (
            <span className="flex items-center gap-1">
              <Star size={14} className="text-[#57606a]" />
              {(repo.stars_count || 0) + (isStarred ? 1 : 0)}
            </span>
          )}

          {repo.forks_count > 0 && (
            <span className="flex items-center gap-1">
              <GitFork size={14} className="text-[#57606a]" />
              {repo.forks_count}
            </span>
          )}

          <span>Updated on {formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
        {visibility !== "private" && (
          <button
            onClick={() => onTogglePin(repo)}
            className={`
              flex items-center gap-1.5
              px-3 py-1.5
              text-xs font-semibold
              border border-[#d0d7de]
              rounded-md
              transition-all duration-200
              shadow-sm cursor-pointer
              ${isPinned ? 'bg-[#f3f4f6] text-[#24292f] border-[#afb8c1]' : 'bg-[#f6f8fa] text-[#24292f] hover:bg-[#f3f4f6]'}
            `}
          >
            {isPinned ? "Pinned" : "Pin"}
          </button>
        )}
        <button
          onClick={() => onToggleStar(repo)}
          className={`
            flex items-center gap-1.5
            px-3 py-1.5
            text-xs font-semibold
            border border-[#d0d7de]
            rounded-md
            transition-all duration-200
            shadow-sm cursor-pointer
            ${isStarred ? 'bg-[#f3f4f6] text-[#24292f] border-[#afb8c1]' : 'bg-[#f6f8fa] text-[#24292f] hover:bg-[#f3f4f6]'}
          `}
        >
          <Star
            size={14}
            className={isStarred ? "fill-[#e3b341] text-[#e3b341]" : "text-[#57606a]"}
          />
          {isStarred ? "Starred" : "Star"}
        </button>
      </div>
    </div>
  );
});

const RepoList = ({ repos }) => {
  const [starredIds, setStarredIds] = useState([]);
  const [pinnedIds, setPinnedIds] = useState([]);

  const refreshData = useCallback(() => {
    // Star local backup or state
    try {
      const storedStarred = JSON.parse(localStorage.getItem("starred_repo_ids") || "[]");
      setStarredIds(storedStarred);
    } catch {
      const starred = getStoredStarredRepos();
      setStarredIds(starred.map(r => r._id || r.id));
    }

    // Pinned repos
    try {
      const storedPinned = JSON.parse(localStorage.getItem("pinned_repo_ids") || "[]");
      setPinnedIds(storedPinned);
    } catch {
      const pinned = getStoredPinnedRepos();
      setPinnedIds(pinned.map(r => r._id || r.id));
    }
  }, []);

  useEffect(() => {
    refreshData();

    window.addEventListener('github_repos_updated', refreshData);
    window.addEventListener('github_starred_updated', refreshData);
    window.addEventListener('github_pinned_updated', refreshData);

    return () => {
      window.removeEventListener('github_repos_updated', refreshData);
      window.removeEventListener('github_starred_updated', refreshData);
      window.removeEventListener('github_pinned_updated', refreshData);
    };
  }, [refreshData]);

  const handleStarToggle = useCallback(async (repo) => {
    const repoId = repo._id || repo.id;
    const hasUser = !!localStorage.getItem("github_user");

    if (hasUser && repo._id) {
      try {
        await toggleStarRepo(repo._id);
      } catch (err) {
        console.error("Error toggling star on backend:", err);
      }
    } else {
      // Local storage fallback
      const starred = getStoredStarredRepos();
      if (starred.some(r => (r._id || r.id) === repoId)) {
        unstarRepository(repo.full_name);
      } else {
        starRepository(repo);
      }
    }

    // Toggle local state list
    setStarredIds(prev => {
      let next;
      if (prev.includes(repoId)) {
        next = prev.filter(id => id !== repoId);
      } else {
        next = [...prev, repoId];
      }
      localStorage.setItem("starred_repo_ids", JSON.stringify(next));
      window.dispatchEvent(new Event('github_starred_updated'));
      return next;
    });
  }, []);

  const handlePinToggle = useCallback(async (repo) => {
    const repoId = repo._id || repo.id;
    const hasUser = !!localStorage.getItem("github_user");

    if (hasUser && repo._id) {
      try {
        await togglePinRepo(repo._id);
      } catch (err) {
        console.error("Error toggling pin on backend:", err);
      }
    } else {
      // Local storage fallback
      const pinned = getStoredPinnedRepos();
      if (pinned.some(r => (r._id || r.id) === repoId)) {
        unpinRepository(repo.name);
      } else {
        pinRepository(repo);
      }
    }

    // Toggle local state list
    setPinnedIds(prev => {
      let next;
      if (prev.includes(repoId)) {
        next = prev.filter(id => id !== repoId);
      } else {
        next = [...prev, repoId];
      }
      localStorage.setItem("pinned_repo_ids", JSON.stringify(next));
      window.dispatchEvent(new Event('github_pinned_updated'));
      return next;
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
      {repos.map((repo) => {
        const repoId = repo._id || repo.id;
        return (
          <RepoItem
            key={repoId}
            repo={repo}
            isStarred={starredIds.includes(repoId)}
            onToggleStar={handleStarToggle}
            isPinned={pinnedIds.includes(repoId)}
            onTogglePin={handlePinToggle}
          />
        );
      })}
    </div>
  );
};

export default RepoList;
