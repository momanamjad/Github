import React, { useEffect, useState, useMemo } from "react";
import { Star } from "lucide-react";
import NewRepoBtn from "@/components/common/NewRepoBtn";
import { getRepos } from "@services/GithubApi.jsx";
import FilterModal from "@/components/FilterModal";
import StarsIcon from "../../public/customIcons/StarsIcon";
import { useNavigate } from "react-router-dom";

const INITIAL_REPO_COUNT = 4;

const Home = React.memo(() => {
  const [allRepos, setAllRepos] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const repos = await getRepos("momanamjad");
        if (!mounted) return;
        setAllRepos(repos || []);
      } catch (err) {
        console.error("Failed to load sidebar repos:", err);
        if (mounted) setAllRepos([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter repos based on search query
  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return allRepos;
    const query = searchQuery.toLowerCase();
    return allRepos.filter(
      (repo) =>
        (repo.full_name || repo.name || "").toLowerCase().includes(query) ||
        (repo.name || "").toLowerCase().includes(query)
    );
  }, [allRepos, searchQuery]);

  // Determine which repos to display (limited or all)
  const displayedRepos = useMemo(() => {
    if (searchQuery.trim()) return filteredRepos;
    if (showAll) return filteredRepos;
    return filteredRepos.slice(0, INITIAL_REPO_COUNT);
  }, [filteredRepos, showAll, searchQuery]);

  const hasMoreRepos = filteredRepos.length > INITIAL_REPO_COUNT;

  const handleRepoClick = (repo) => {
    const owner = repo.owner?.login || "momanamjad";
    navigate(`/${owner}/${repo.name}`);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#ffffff] font-sans text-[#1f2328]">
      {/* ── Left Sidebar: Top Repositories ── */}
      {/* Visible on ALL screen sizes — stacks on mobile, sidebar on desktop */}
      <aside
        className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#d0d7de] p-4 xl:p-6 shrink-0"
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold text-[#1f2328]">
            Top Repositories
          </h2>
          <NewRepoBtn size="small" />
        </div>

        {/* Search Bar — Functional */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim()) setShowAll(false);
            }}
            placeholder="Find a repository..."
            className="w-full px-3 py-[5px] text-[14px] border border-[#d0d7de] rounded-md bg-[#f6f8fa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0969da] focus:border-[#0969da] placeholder-[#636c76]"
          />
        </div>

        {/* Repository List */}
        <ul className="space-y-1">
          {displayedRepos.length === 0 ? (
            <li className="text-sm text-[#636c76] py-2">
              {searchQuery.trim()
                ? "No repositories match your search."
                : "No repositories found."}
            </li>
          ) : (
            displayedRepos.map((repo) => (
              <li
                key={repo.id || repo.name}
                onClick={() => handleRepoClick(repo)}
                className="flex items-center gap-2 text-[14px] py-[6px] hover:underline cursor-pointer text-[#1f2328] group"
              >
                <span className="w-4 h-4 rounded-full inline-block overflow-hidden shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    src="profile.png"
                    alt="Repository owner avatar"
                  />
                </span>
                <span className="truncate">
                  {repo.full_name || `momanamjad/${repo.name}`}
                </span>
              </li>
            ))
          )}
        </ul>

        {/* Show more / Show less button */}
        {!searchQuery.trim() && hasMoreRepos && (
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="mt-3 text-[12px] text-[#636c76] hover:text-[#0969da] transition-colors cursor-pointer"
          >
            {showAll ? "Show less" : "Show more"}
          </button>
        )}
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 max-w-4xl mx-auto p-3 sm:p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-[20px] sm:text-[24px] font-semibold mb-4 sm:mb-6">
            Home
          </h1>

          {/* Feed Header */}
          <div className="flex items-center justify-between border-b border-[#d0d7de] pb-2 mb-4">
            <h2 className="font-semibold">Feed</h2>

            <button
              className="flex items-center gap-2 text-sm bg-[#EFF2F5] text-[#636c76] hover:bg-[#D1D9E0] px-3 py-2 rounded-md border border-[#d0d7de]"
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
              <div>
                <FilterModal
                  open={filterOpen}
                  onClose={() => setFilterOpen(false)}
                  title="Filter repositories"
                  options={["All", "JavaScript", "React", "TypeScript"]}
                  onSelect={setFilterValue}
                />
              </div>
            )}
          </div>

          {/* Feed Card */}
          <div className="p-3 sm:p-5 border border-[#d0d7de] rounded-lg bg-white mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-800 rounded-full overflow-hidden">
                <img
                  className="object-cover"
                  src="profile.png"
                  alt="User avatar"
                />
              </div>
              <span className="text-sm">
                <span className="font-bold text-[#1f2328]">
                  hiteshchoudhary
                </span>{" "}
                <span className="text-[#59636e]">created a repository</span>
              </span>
            </div>
            <span className="text-xs text-gray-500 ml-8">17 hours ago</span>

            <div className="rounded-lg p-3 sm:p-4 bg-[#F6F8FA]">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="text-blue-600 font-bold hover:underline cursor-pointer text-sm sm:text-base truncate">
                  hiteshchoudhary/vibe-translator
                </h3>
                <div className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs border border-[#d0d7de] rounded-md bg-[#f6f8fa] hover:bg-[#ebedf0] shrink-0">
                  <Star size={16} /> Star{" "}
                  <span>
                    <button type="button">
                      <svg
                        aria-hidden="true"
                        height="16"
                        viewBox="0 0 16 16"
                        version="1.1"
                        width="16"
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

      {/* ── Right Sidebar: Changelog ── */}
      <aside
        className="hidden w-72 xl:w-80 border-l border-[#d0d7de] p-4 xl:p-6 xl:block bg-white shrink-0"
        aria-label="Changelog"
      >
        <h2 className="text-[14px] font-semibold mb-6 text-[#1f2328]">
          Latest from our changelog
        </h2>

        <div className="relative">
          <div className="absolute left-[5px] top-2 bottom-8 w-[1px] bg-[#d0d7de]"></div>
        </div>

        <button className="mt-4 ml-6 text-[12px] text-[#636c76] hover:text-[#0969da] transition-colors">
          View changelog →
        </button>
      </aside>
    </div>
  );
});

Home.displayName = "Home";
export default Home;
