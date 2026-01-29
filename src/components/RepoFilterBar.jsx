const RepoFilterBar = ({
  search,
  setSearch,
  language,
  setLanguage,
  sort,
  setSort,
  languages,
}) => {
  return (
    <div className="flex flex-col gap-3 py-4 border-b border-github-border">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a repository..."
          className="
            flex-1 bg-github-panel border border-github-border
            rounded-md px-3 py-1.5 text-sm
            text-github-text placeholder-github-muted
            focus:outline-none focus:ring-1 focus:ring-github-link
          "
        />

        {/* FILTERS */}
        <div className="flex gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="filter-select"
          >
            {languages.map((lang) => (
              <option key={lang}>{lang}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="filter-select"
          >
            <option value="updated">Last updated</option>
            <option value="stars">Stars</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RepoFilterBar;
