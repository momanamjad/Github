import { BrowserRouter, Routes } from "react-router-dom";
import { NavLink } from "react-router-dom";

const Tabs = () => {
  const tabs = ["Overview", "Repositories", "Projects", "Packages", "Stars"];

  return (
    <>
    <nav className="border-b border-github-border bg-[#EFF2F5]">
      <div className="max-w-7xl mx-auto px-4 flex gap-6 h-12">
        {tabs.map((tab) => {
          const active = tab === "Overview";

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
    </>
  );
};

export default Tabs;
