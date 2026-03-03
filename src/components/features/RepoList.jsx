import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { getStoredStarredRepos, starRepository, unstarRepository } from "@services/storageService.js";
import { languageColors } from "@utils/LanguageColors.jsx";
import { Link } from "react-router-dom";

const RepoList = ({ repos }) => {
  const [starredFullNames, setStarredFullNames] = useState([]);

  // Sync with storage on mount and when repos change
  useEffect(() => {
    const starred = getStoredStarredRepos();
    setStarredFullNames(starred.map(r => r.full_name));
  }, [repos]);

  const handleStarToggle = (repo) => {
    const isCurrentlyStarred = starredFullNames.includes(repo.full_name);
    let updatedList;

    if (isCurrentlyStarred) {
      updatedList = unstarRepository(repo.full_name);
    } else {
      updatedList = starRepository(repo);
    }

    setStarredFullNames(updatedList.map(r => r.full_name));
  };

  return (
    <div className="divide-y divide-github-border">
      {repos.map((repo) => {
        const isStarred = starredFullNames.includes(repo.full_name);

        return (
          <div key={repo.id} className="py-6 flex justify-between items-start">
            <div>
              <Link
                to={`/${repo.owner.login}/${encodeURIComponent(repo.name)}`}
                className="text-[#0969DA] text-[22px] font-semibold   hover:underline"
              >
                {repo.name}
              </Link>

              {repo.description && (
                <p className="mt-1 text-sm text-github-muted max-w-xl">
                  {repo.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 text-xs text-github-muted">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          languageColors[repo.language] || "#8b949e",
                      }}
                    />
                    {repo.language}
                  </span>
                )}

                <span>⭐ {repo.stargazers_count + (isStarred ? 1 : 0)}</span>
                <span>
                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleStarToggle(repo)}
              className={`
                flex items-center gap-1
                px-3 py-1.5
                text-xs font-medium
                border border-github-border
                rounded-md
                transition-colors
                 hover:bg-[#F6F8FA]  
           
              `}
            >
              <Star size={14} className={isStarred ? "fill-[#e3b341] text-[#e3b341]" : ""} />
              {isStarred ? "Starred" : "Star"}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default RepoList;
