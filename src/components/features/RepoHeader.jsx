import { GitFork, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import StarButton from "@common/StarButton";

const RepoHeader = ({ repo }) => {
  if (!repo) return null;

  const isPrivate = repo.private || repo.visibility === "private";

  return (
    <div className="py-4 sm:py-6 border-b border-[#d0d7de]">
      {/* Repo name with breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" className="text-[#636c76]" fill="currentColor">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.25.25 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
        </svg>
        <h1 className="text-[18px] sm:text-[20px]">
          <Link to={`/${repo.owner?.login}`} className="text-[#0969da] hover:underline font-normal">
            {repo.owner?.login}
          </Link>
          <span className="text-[#1f2328] mx-1">/</span>
          <Link to={`/${repo.owner?.login}/${repo.name}`} className="text-[#0969da] hover:underline font-semibold">
            {repo.name}
          </Link>
        </h1>
        <span className={`text-[11px] px-[7px] py-[1px] border rounded-full font-medium
          border-[#d0d7de] text-[#636c76]`}
        >
          {isPrivate ? "Private" : "Public"}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-[13px]">
        <StarButton repo={repo} />

        <button className="flex items-center gap-1.5 px-3 py-[3px] text-[#24292f] border border-[#d0d7de] rounded-md bg-[#f6f8fa] hover:bg-[#ebedf0] transition-colors">
          <GitFork size={14} />
          <span className="font-medium">Fork</span>
          <span className="ml-1 px-[6px] py-[1px] bg-white border border-[#d0d7de] rounded-full text-[11px] font-semibold text-[#636c76]">
            {repo.forks_count || 0}
          </span>
        </button>

        <span className="flex items-center gap-1 text-[#636c76]">
          <Eye size={14} />
          <span>{repo.watchers_count || 0}</span>
        </span>
      </div>
    </div>
  );
};

export default RepoHeader;
