import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { OverviewIcon, ReposotoryIcon, ProjectsIcon, PackageIcon } from "@ui/Icons";
import LoadingBar from 'react-top-loading-bar';
import { useEffect, useState, useRef } from "react";
import { useTabsContext } from "@/contexts/TabsContext";
import { getRepos } from "@services/GithubApi.jsx";

const Tabs = ({ username }) => {
  const [progress, setProgress] = useState(0);
  const [repoCount, setRepoCount] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { setHasTabsComponent } = useTabsContext();

  useEffect(() => {
    setHasTabsComponent(true);
    return () => setHasTabsComponent(false);
  }, [setHasTabsComponent]);

  useEffect(() => {
    setProgress(70);
    const timer = setTimeout(() => setProgress(100), 400);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    getRepos(username)
      .then((repos) => setRepoCount(repos?.length || 0))
      .catch(() => setRepoCount(0));
  }, [username]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [location]);

  // All non-Overview tabs
  const allTabs = [
    { to: `/${username}/repositories`, icon: ReposotoryIcon, label: "Repositories", count: repoCount },
    { to: `/${username}/projects`, icon: ProjectsIcon, label: "Projects" },
    { to: `/${username}/packages`, icon: PackageIcon, label: "Packages" },
    { to: `/${username}/stars`, icon: null, label: "Stars" },
  ];

  // Determine which non-Overview tab is currently active
  const overviewPath = `/${username}`;
  const isOverviewActive =
    location.pathname === overviewPath || location.pathname === overviewPath + "/";

  const activeTabIndex = allTabs.findIndex(
    (tab) =>
      location.pathname === tab.to ||
      location.pathname.startsWith(tab.to + "/")
  );

  // For mobile: the active non-Overview tab shows inline, rest go in "More"
  const activeNonOverviewTab = activeTabIndex >= 0 ? allTabs[activeTabIndex] : null;
  const moreTabs = allTabs.filter((_, i) => i !== activeTabIndex);
  const hasMoreActive = false; // "More" itself is never the active page

  return (
    <div>
      <LoadingBar
        color="#2188ff"
        progress={progress}
        height={2}
        onLoaderFinished={() => setProgress(0)}
      />
      <div className="px-2 sm:px-4 py-0 bg-[#F6F8FA] border-b border-[#d0d7de]">
        <div className="mx-auto text-[14px]">
          {/* ── Desktop: all tabs inline ── */}
          <nav className="hidden sm:flex gap-2 -mb-px">
            <Tab to={`/${username}`} icon={OverviewIcon} label="Overview" end />
            {allTabs.map((tab) => (
              <Tab key={tab.label} to={tab.to} icon={tab.icon} label={tab.label} count={tab.count} />
            ))}
          </nav>

          {/* ── Mobile: Overview + active tab + More ▾ ── */}
          <nav className="flex sm:hidden gap-0.5 -mb-px items-end">
            {/* Overview — always visible */}
            <Tab to={`/${username}`} icon={null} label="Overview" end />

            {/* Active non-Overview tab — shown inline */}
            {activeNonOverviewTab && (
              <Tab
                to={activeNonOverviewTab.to}
                icon={null}
                label={activeNonOverviewTab.label}
                count={activeNonOverviewTab.count}
              />
            )}

            {/* "More ▾" dropdown for inactive tabs */}
            <div className="relative shrink-0 ml-auto flex flex-col justify-end pt-1 -mb-[1px]" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((prev) => !prev)}
                className="flex items-center gap-1 px-3 py-1.5 mb-[3px] text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer
                  text-[#636c76] hover:bg-[#eaeef2] rounded-md"
              >
                <span>More</span>
                <svg
                  width="12" height="12" viewBox="0 0 16 16" fill="currentColor"
                  className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
                >
                  <path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z" />
                </svg>
              </button>

              {moreOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMoreOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#d0d7de] rounded-md shadow-lg z-50 py-1">
                    {moreTabs.map((item) => {
                      const isActive =
                        location.pathname === item.to ||
                        location.pathname.startsWith(item.to + "/");
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            navigate(item.to);
                            setMoreOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-[#f6f8fa] transition-colors cursor-pointer
                            ${isActive ? "font-semibold text-[#1f2328]" : "text-[#1f2328]"}`}
                        >
                          {item.icon && <item.icon size={16} />}
                          <span>{item.label}</span>
                          {item.count > 0 && (
                            <span className="bg-[#e8e8e8] text-[#636c76] text-[11px] font-medium px-[6px] py-[1px] rounded-full min-w-[20px] text-center">
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

const Tab = ({ to, icon: Icon, label, end, count }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col justify-end shrink-0 text-sm whitespace-nowrap pt-1 pb-0 -mb-[1px]
        ${isActive
          ? "border-b-2 border-[#FD8C73]"
          : ""
        }`
      }
    >
      {({ isActive }) => (
        <div
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md mb-[3px] transition-colors duration-200
            hover:bg-[#eaeef2]
            ${isActive ? "font-semibold text-[#1f2328]" : "text-[#1f2328]"}`}
        >
          {Icon && <span className="hidden sm:inline-flex"><Icon size={16} /></span>}
          <span>{label}</span>
          {count > 0 && (
            <span className="bg-[#e8e8e8] text-[#636c76] text-[11px] font-medium px-[6px] py-[1px] rounded-full min-w-[20px] text-center">
              {count}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
};

export default Tabs;
