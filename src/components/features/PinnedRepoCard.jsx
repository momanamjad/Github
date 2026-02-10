const PinnedRepoCard = ({
  name,
  desc,
  stars,
  language,
  repoUrl,
  languageColor,
  visibility,
}) => {
console.log(visibility)
    
  return (
    <article className="bg-[white] border border-[#C8D1DA] rounded-md p-4 transition   flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-3">
          <Reposvg />
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0969DA] font-semibold text-[14px] hover:underline break-all"
          >
            {name}
          </a>
        </div>

        <p className="text-[#8b949e] text-[12px] mt-2 leading-snug">
          {desc || ""}
        </p>
      </div>
      <div className="flex items-center gap-4 text-xs text-[#8b949e] mt-4">
        {language && (
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: languageColor }}
            />
            {language}
          </span>
        )}
        {stars > 0 && (
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
        )}
      </div>
    </article>
  );
};

// Helper SVG Component
function Reposvg() {
  return (
    <svg
      height="16"
      viewBox="0 0 16 16"
      width="16"
      fill="#8b949e"
      className="mt-1 flex-shrink-0"
    >
      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
    </svg>
   
  );
}

export default PinnedRepoCard;
