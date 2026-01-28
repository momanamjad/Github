const PinnedRepoCard = ({ repo }) => {
  if (!repo) return null;

  return (
    <article
      className="
        bg-github-panel
        border border-github-border
        rounded-md p-4
        transition hover:bg-github-panelHover
      "
    >
      <a
        href={repo.html_url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-github-link font-semibold text-[14px] hover:underline"
      >
        {repo.name ?? "Unnamed repository"}
      </a>

      <p className="text-github-muted text-[12px] mt-1 leading-snug">
        {repo.description ?? "No description"}
      </p>

      <div className="flex items-center gap-4 text-xs text-github-muted mt-4">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-400" />
            {repo.language}
          </span>
        )}

        <span>⭐ {repo.stargazers_count ?? 0}</span>
      </div>
    </article>
  );
};

export default PinnedRepoCard;
