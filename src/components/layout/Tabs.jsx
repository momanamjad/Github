import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { OverviewIcon, ReposotoryIcon, ProjectsIcon, PackageIcon, StarsIcon } from "@ui/Icons";
import ChevronDownIcon from "../../../public/customIcons/ChevronDownIcon";
import LoadingBar from 'react-top-loading-bar';
import { useEffect, useState, useRef } from "react";
import { useTabsContext } from "@/contexts/TabsContext";
import { getRepos } from "@services/GithubApi.jsx";
import { useScrollLock } from "../../hooks/useScrollLock";
import { Users } from "lucide-react";


const Tabs = ({ username }) => {
  const [progress, setProgress] = useState(0);
  const [repoCount, setRepoCount] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { setHasTabsComponent } = useTabsContext();

  useScrollLock(moreOpen);



  useEffect(() => {
    setHasTabsComponent(true);
    return () => setHasTabsComponent(false);
  }, [setHasTabsComponent]);

  // Loading bar progress on route change
  useEffect(() => {
    // Use a timer so the setState is async, not synchronous-in-effect
    const startTimer = setTimeout(() => {
      setProgress(70);
      setMoreOpen(false); // also close the dropdown on navigation
    }, 0);
    const endTimer = setTimeout(() => setProgress(100), 400);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [location]);

  // Fetch repo count for the tab badge
  useEffect(() => {
    getRepos(username)
      .then((repos) => setRepoCount(repos?.length || 0))
      .catch(() => setRepoCount(0));
  }, [username]);

  // Close "More" dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // All non-Overview tabs
  const allTabs = [
    { to: `/${username}/repositories`, icon: ReposotoryIcon, label: "Repositories", count: repoCount },
    { to: `/${username}/projects`, icon: ProjectsIcon, label: "Projects" },
    { to: `/${username}/packages`, icon: PackageIcon, label: "Packages" },
    { to: `/${username}/stars`, icon: StarsIcon, label: "Stars" },
  ];

  const activeTabIndex = allTabs.findIndex(
    (tab) =>
      location.pathname === tab.to ||
      location.pathname.startsWith(tab.to + "/")
  );

  // For mobile: the active non-Overview tab shows inline, rest go in "More"
  const activeNonOverviewTab = activeTabIndex >= 0 ? allTabs[activeTabIndex] : null;
  const moreTabs = allTabs.filter((_, i) => i !== activeTabIndex);

  return (
    <div>
      <LoadingBar
        color="#2188ff"
        progress={progress}
        height={2}
        onLoaderFinished={() => setProgress(0)}
      />
      <div className="px-2 sm:px-4 py-0 bg-[#F6F8FA] dark:bg-[#0d1117] border-b border-[#d0d7de] dark:border-[#30363d] transition-colors">
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
                className="flex items-center gap-1 px-3 py-1.5 mb-[3px] text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer border-0 bg-transparent
                  text-[#636c76] dark:text-[#8b949e] hover:bg-[#eaeef2] dark:hover:bg-[#21262d] rounded-md"
              >
                <span>More</span>
                <ChevronDownIcon
                  className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
                />
              </button>

              {moreOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMoreOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-lg z-50 py-1">
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
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer border-0 bg-transparent
                            ${isActive ? "font-semibold text-[#1f2328] dark:text-white" : "text-[#1f2328] dark:text-[#c9d1d9]"}`}
                        >
                          {item.icon && <item.icon size={16} />}
                          <span>{item.label}</span>
                          {item.count > 0 && (
                            <span className="bg-[#e8e8e8] dark:bg-[#30363d] text-[#636c76] dark:text-[#8b949e] text-[11px] font-medium px-[6px] py-[1px] rounded-full min-w-[20px] text-center ml-auto">
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
          ? "border-b-2 border-[#f78166]"
          : ""
        }`
      }
    >
      {({ isActive }) => (
        <div
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md mb-[3px] transition-colors duration-200
            hover:bg-[#eaeef2] dark:hover:bg-[#21262d]
            ${isActive ? "font-semibold text-[#1f2328] dark:text-white" : "text-[#57606a] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-white"}`}
        >
          {Icon && <span className="hidden sm:inline-flex"><Icon size={16} /></span>}
          <span>{label}</span>
          {count > 0 && (
            <span className="bg-[#e8e8e8] dark:bg-[#30363d] text-[#636c76] dark:text-[#8b949e] text-[11px] font-medium px-[6px] py-[1px] rounded-full min-w-[20px] text-center">
              {count}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
};

export default Tabs;
