import React, { useEffect, useState, useMemo } from "react";
import { Star } from "lucide-react";
import StarButton from "@/components/common/StarButton";
import NewRepoBtn from "@/components/common/NewRepoBtn";
import { getRepos } from "@services/GithubApi.jsx";
import { useGitHub } from "@/contexts/GitHubContext";
import FilterModal from "@/components/FilterModal";
import StarsIcon from "../../public/customIcons/StarsIcon";
import FilterIcon from "../../public/customIcons/FilterIcon";
import ChevronDownIcon from "../../public/customIcons/ChevronDownIcon";
import { useNavigate } from "react-router-dom";

const INITIAL_REPO_COUNT = 4;

const Home = React.memo(() => {
  const { repositories: allRepos } = useGitHub();
  const [filterOpen, setFilterOpen] = useState(false);
  const [, setFilterValue] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();



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

  const recentRepos = useMemo(() => {
    return [...allRepos]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 3);
  }, [allRepos]);

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
                    src="profile.webp"
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
              <FilterIcon className="mr-2" />
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

          {/* Dynamic Feed Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#1F2328]">Recent activity</h3>
              <button className="text-xs text-[#0969da] hover:underline">All activity</button>
            </div>

            {recentRepos.length > 0 ? (
              recentRepos.map((repo) => (
                <div key={repo.id || repo.name} className="p-4 border border-[#d0d7de] rounded-lg bg-white shadow-sm transition-hover hover:border-[#8c959f]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden">
                      <img src="profile.webp" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-[#1f2328] font-medium">momanamjad</span>
                    <span className="text-xs text-[#636c76]">created a repository</span>
                    <span className="text-xs text-[#636c76] ml-auto">
                      {new Date(repo.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="rounded-lg p-3 bg-[#F6F8FA]">
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        onClick={() => handleRepoClick(repo)}
                        className="text-[#0969da] font-bold hover:underline cursor-pointer text-sm truncate"
                      >
                        momanamjad/{repo.name}
                      </h4>
                      <StarButton repo={repo} />
                    </div>
                    {repo.description && (
                      <p className="text-xs text-[#636c76] mb-2 line-clamp-1">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-[#636c76]">
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3178c6]"></span>
                          <span>{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <StarsIcon />
                        <span>{repo.stargazers_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 border border-[#d0d7de] border-dashed rounded-lg bg-[#f6f8fa] text-center">
                <p className="text-sm text-[#636c76]">No recent activity to show.</p>
                <button
                   onClick={() => navigate("/new")}
                   className="mt-2 text-sm text-[#0969da] hover:underline font-medium"
                >
                  Create your first repository
                </button>
              </div>
            )}
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
