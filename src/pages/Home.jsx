import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Star } from "lucide-react";
// Note: NewRepoPage is not used in Home's render — removed unused barrel import
import NewRepoBtn from "@/components/common/NewRepoBtn";
import { getRepos } from "@services/GithubApi.jsx";
import FilterModal from "@/components/FilterModal";
import StarsIcon from "../../public/customIcons/StarsIcon";
const Home = React.memo(() => {
  const [sidebarRepos, setSidebarRepos] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const repos = await getRepos("momanamjad");
        if (!mounted) return;
        // map to display string
        const list = (repos || []).map((r) => r.full_name || `${r.owner?.login}/${r.name}`);
        setSidebarRepos(list);
      } catch (err) {
        console.error("Failed to load sidebar repos:", err);
        if (mounted) setSidebarRepos([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#ffffff] font-sans text-[#1f2328]">
      <aside className="hidden w-80 border-r border-[#d0d7de] p-6 lg:block" aria-label="Sidebar">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-[#f2328]">
            Top repositories
          </h2>

          <NewRepoBtn size="small" />
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Find a repository..."
            className="w-full font-github px-4 py-2 text-[16px] border border-[#d0d7de] rounded-md bg-[#f6f8fa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0969da]"
          />
        </div>
        <ul className="space-y-2">
          {sidebarRepos.map((repo) => (
            <li
              key={repo}
              className="flex items-center gap-2 text-sm hover:underline cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full inline-block overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="profile.png"
                  alt="Repository owner avatar"
                />
              </span>{" "}
              {repo}
            </li>
          ))}
        </ul>
        <button className="mt-4 text-xs text-[#636c76] hover:text-[#0969da]">
          Show more
        </button>
      </aside>

      <main className="flex-1 max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-[24px] font-semibold mb-6">Home</h1>
          {/* <div className="relative flex items-center p-4 border border-[#d0d7de] rounded-lg bg-white shadow-sm mb-6">
            <span className="text-gray-400 mr-2 font-medium">Ask anything</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-400 italic">
                Claude Haiku 4.5
              </span>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { icon: <ListTodo size={16} />, label: "Task" },
              { icon: <MessageSquare size={16} />, label: "Create issue" },
              { icon: <Code size={16} />, label: "Write code" },
              { icon: <GitBranch size={16} />, label: "Git" },
              {
                icon: <GitPullRequest size={16} />,
                label: "Pull requests",
                count: 11,
              },
            ].map((tab) => (
              <button
                key={tab.label}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[#d0d7de] rounded-full bg-[#f6f8fa] hover:bg-[#ebedf0]"
              >
                {tab.icon} {tab.label}{" "}
                {tab.count && (
                  <span className="bg-[#afb8c1] text-white text-[10px] px-1.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div> */}

          {/* Feed */}
          <div className="flex items-center justify-between border-b border-[#d0d7de] pb-2 mb-4">
            <h2 className="font-semibold">Feed</h2>

            <button
              className="flex items-center gap-2 text-sm  bg-[#EFF2F5] text-[#636c76] hover:bg-[#D1D9E0] px-3 py-2 rounded-md border border-[#d0d7de]"
              onClick={() => setFilterOpen(true)}
            >
              <svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                data-view-component="true"
                className="octicon octicon-filter mr-2"
              >
                <path d="M.75 3h14.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5ZM3 7.75A.75.75 0 0 1 3.75 7h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 7.75Zm3 4a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path>
              </svg>
              <span className="text-[black] font-semibold">Filter</span>
            </button>

            {filterOpen && (
              <div>  <FilterModal
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                title="Filter repositories"
                options={["All", "JavaScript", "React", "TypeScript"]}
                onSelect={setFilterValue}
              /> </div>
            )}

          </div>
          <div className="p-5 border border-[#d0d7de] rounded-lg bg-white mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-800 rounded-full overflow-hidden">
                <img className="object-cover" src="profile.png" alt="User avatar" />
              </div>
              <span className="text-sm">
                <span className="font-bold text-[#1f2328]">
                  hiteshchoudhary
                </span>{" "}
                <span className="text-[#59636e]">created a repository</span>
              </span>
            </div>
            <span className="text-xs text-gray-500 ml-8">17 hours ago</span>

            <div className="      rounded-lg p-4 bg-[#F6F8FA]">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-blue-600 font-bold hover:underline cursor-pointer">
                  hiteshchoudhary/vibe-translator
                </h3>
                <div className="flex items-center gap-1 px-3 py-1 text-xs border border-[#d0d7de] rounded-md bg-[#f6f8fa] hover:bg-[#ebedf0]">
                  <Star size={16} /> Star{" "}
                  <span>
                    {" "}
                    <button
                      group_item="true"
                      id="details-user-list-1150908408-unstarred-button"
                      aria-controls="details-user-list-1150908408-unstarred-dialog"
                      aria-haspopup="dialog"
                      aria-expanded="true"
                      aria-labelledby="tooltip-b669a0ea-7387-4031-affe-b07dc995c577"
                      type="button"
                      data-view-component="true"
                    >
                      {" "}
                      <svg
                        aria-hidden="true"
                        height="16"
                        viewBox="0 0 16 16"
                        version="1.1"
                        width="16"
                        data-view-component="true"
                      >
                        <path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"></path>
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
              <p className="text-sm font-semibold mb-2">vibe-translator</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>{" "}
                  Shell
                </span>
                <span className="flex items-center gap-1">
                  <StarsIcon /> 5
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside className="hidden w-80 border-l border-[#d0d7de] p-6 xl:block bg-white">
        <h2 className="text-[14px] font-semibold mb-6 text-[#1f2328]">
          Latest from our changelog
        </h2>

        <div className="relative">
          <div className="absolute left-[5px] top-2 bottom-8 w-[1px] bg-[#d0d7de]"></div>

          {/* <div className="space-y-6">
      {changelogItems.map((item, index) => (
        <div key={index} className="relative pl-6">
          <div className="absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full bg-[#d0d7de] border-2 border-white z-10"></div>
          
          <div className="text-[12px] leading-snug">
            <p className="text-[#636c76] mb-1">{item.date}</p>
            <p className="text-[#1f2328] hover:text-[#0969da] cursor-pointer font-medium">
              {item.text}
            </p>
          </div>
        </div>
      ))}
    </div> */}
        </div>

        <button className="mt-4 ml-6 text-[12px] text-[#636c76] hover:text-[#0969da] transition-colors">
          View changelog →
        </button>
      </aside>
    </div>
  );
});

Home.displayName = 'Home';
export default Home;
