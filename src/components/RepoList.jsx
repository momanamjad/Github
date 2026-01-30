import { Star } from "lucide-react";
import { languageColors } from "../utils/languageColors";
import { Link } from "react-router-dom";

const RepoList = ({ repos }) => {
  return (
    <div className="divide-y divide-github-border">
      {repos.map((repo) => (
        <div key={repo.id} className="py-6 flex justify-between items-start">
          <div>
            <Link
              to={`/${repo.owner.login}/${repo.name}`}
              className="text-github-link font-semibold text-base hover:underline"
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

              <span>⭐ {repo.stargazers_count}</span>
              <span>
                Updated {new Date(repo.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <button
            className="
              flex items-center gap-1
              px-3 py-1.5
              text-xs font-medium
              border border-github-border
              rounded-md
              bg-github-panel
              hover:bg-[#D1D9E0]
            "
          >
            <Star size={14} />
            Star
          </button>
        </div>
      ))}
    </div>
  );
};

export default RepoList;
