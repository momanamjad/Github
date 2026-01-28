const PinnedRepoCard = ({ repo, name, desc }) => {
  const repoName = repo?.name ?? name ?? "Unnamed repository";
  const repoDesc = repo?.description ?? desc ?? "No description";
  const repoUrl = repo?.html_url ?? "#";
  const language = repo?.language;
  const stars = repo?.stargazers_count ?? 0;

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
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-github-link font-semibold text-[14px] hover:underline"
      >
        {repoName}
      </a>

      <p className="text-github-muted text-[12px] mt-1 leading-snug">
        {repoDesc}
      </p>

      <div className="flex items-center gap-4 text-xs text-github-muted mt-4">
        {language && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-400" />
            {language}
          </span>
        )}

        <span>⭐ {stars}</span>
      </div>
    </article>
  );
};

export default PinnedRepoCard;
