const Tabs = () => {
  const tabs = ["Overview", "Repositories", "Projects", "Packages", "Stars"];

  return (
    <nav className="border-b border-github-border bg-github-bg">
      <div className="max-w-7xl mx-auto px-4 flex gap-6 h-12">
        {tabs.map((tab) => {
          const active = tab === "Repositories";

          return (
            <button
              key={tab}
              className={`
                 h-full flex items-center
    text-[14px] font-medium
                ${
                  active
                    ? "text-github-text border-b-2 border-github-orange"
                    : "text-github-muted"
                }
                hover:text-github-text
              `}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Tabs;
