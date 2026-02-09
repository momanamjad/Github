const PinnedRepoCard = ({ name, desc, stars, language, repoUrl }) => {
  return (
    <article className="bg-[#0d1117] border border-[#30363d] rounded-md p-4 transition hover:bg-[#161b22]">
      <div className="flex gap-3">
        <Reposvg />
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#58a6ff] font-semibold text-[14px] hover:underline"
        >
          {name}
        </a>
      </div>

      <p className="text-[#8b949e] text-[12px] mt-2 leading-snug">
        {desc || "No description provided"}
      </p>

      <div className="flex items-center gap-4 text-xs text-[#8b949e] mt-4">
        {language && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#8b949e]" />
            {language}
          </span>
        )}
        <span className="flex items-center gap-1">⭐ {stars}</span>
      </div>
    </article>
  );
};
export default PinnedRepoCard;