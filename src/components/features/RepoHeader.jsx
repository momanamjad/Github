import { Star, GitFork } from "lucide-react";

const RepoHeader = ({ repo }) => {
  return (
    <div className="py-6 border-b border-github-border">
      <h1 className="text-xl font-semibold text-github-link">
        {repo.owner.login} / {repo.name}
      </h1>

      <div className="flex gap-4 mt-2 text-sm text-github-muted">
        <span>⭐ {repo.stargazers_count}</span>
        <span>🍴 {repo.forks_count}</span>
        <span>{repo.visibility}</span>
      </div>
    </div>
  );
};

export default RepoHeader;
