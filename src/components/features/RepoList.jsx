import { Star } from "lucide-react";
import { languageColors } from "@utils/LanguageColors.jsx";
import { Link } from "react-router-dom";

const RepoList = ({ repos }) => {
  return (
    <div className="divide-y divide-github-border">
      {repos.map((repo) => (
        <div key={repo.id} className="py-6 flex justify-between items-start">
          <div>
            <Link
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

              <span>⭐ {repo.stargazers_count}</span>
              <span>
                Updated {new Date(repo.updated_at).toLocaleDateString()}
              </span>
              {/* {stars > 0 && (
          <span className="flex items-center gap-1 text-black hover:text-[#0969DA]">
            <svg
              aria-label="star"
              role="img"
              height="16"
              viewBox="0 0 16 16"
              version="1.1"
              width="16"
              fill="#8b949e"
              hover:fill="#0969DA"
              data-view-component="true"
            >
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
            </svg>
            {stars}
          </span>
        )} */}
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
