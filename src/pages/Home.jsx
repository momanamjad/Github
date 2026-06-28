import React, { useEffect, useState, useMemo } from "react";
import StarButton from "@/components/common/StarButton";
import NewRepoBtn from "@/components/common/NewRepoBtn";
import { useGitHub } from "@/contexts/GitHubContext";
import FilterModal from "@/components/FilterModal";
import { StarIcon, FilterIcon, RepoIcon } from "@primer/octicons-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from 'boneyard-js/react';
import { HomeSidebarSkeleton, HomeFeedSkeleton } from "@features/HomeSkeleton";
import { languageColors } from "@utils/LanguageColors.jsx";
import PinnedRepoCard from "@features/PinnedRepoCard";
import { getUserActivityFeed } from "@services/GithubApi.jsx";
import { resolveAvatarUrl } from "@/services/apiClient";
import { 
  Star, 
  UserPlus, 
  GitCommit, 
  GitPullRequest, 
  AlertCircle, 
  PlusCircle, 
  MessageSquare 
} from 'lucide-react';

const INITIAL_REPO_COUNT = 7;

const Home = React.memo(() => {
  const { repositories: allRepos, user } = useGitHub();
  const activeUsername = user?.login;
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedItems, setFeedItems] = useState([]);
  const [feedError, setFeedError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchFeed = async () => {
      try {
        const data = await getUserActivityFeed(1, 20, { signal: controller.signal });
        setFeedItems(data?.feed || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to load activity feed:", err);
          setFeedError("Failed to load activity feed.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeed();
    return () => controller.abort();
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
    const owner = repo.owner?.login || activeUsername;
    navigate(`/${owner}/${repo.name}`);
  };



  const filteredFeed = (filterValue === 'all' || filterValue === 'All')
    ? feedItems
    : feedItems.filter(item => item.type === filterValue);

  if (!activeUsername) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white dark:bg-[#0d1117] font-sans text-[#1f2328] dark:text-[#c9d1d9] transition-colors">
      {/* ── Left Sidebar: Top Repositories ── */}
      <aside
        className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#d0d7de] dark:border-[#30363d] p-4 xl:p-6 shrink-0 bg-[#f6f8fa] dark:bg-[#0d1117]"
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold text-[#1f2328] dark:text-[#c9d1d9]">
            Top Repositories
          </h2>
          <NewRepoBtn size="small" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim()) setShowAll(false);
            }}
            placeholder="Find a repository..."
            className="w-full px-3 py-[5px] text-[14px] border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] placeholder-[#636c76] dark:placeholder-[#8b949e]"
          />
        </div>

        {/* Repository List */}
        <Skeleton 
          name="home-sidebar" 
          loading={isLoading} 
          fixture={<HomeSidebarSkeleton />}
        >
          <ul className="space-y-1">
            {displayedRepos.length === 0 ? (
              <li className="text-sm text-[#636c76] dark:text-[#8b949e] py-2">
                {searchQuery.trim()
                  ? "No repositories match your search."
                  : "No repositories found."}
              </li>
            ) : (
              displayedRepos.map((repo) => (
                <li
                  key={repo._id || repo.id || `${repo.owner?.login || repo.owner}-${repo.name}`}
                  onClick={() => handleRepoClick(repo)}
                  className="flex items-center gap-2 text-[14px] py-[6px] hover:underline cursor-pointer text-[#1f2328] dark:text-[#c9d1d9] group font-medium"
                >
                  <RepoIcon size={14} className="text-[#57606a] dark:text-[#8b949e] shrink-0" />
                  <span className="truncate hover:text-[#0969da] dark:hover:text-[#58a6ff]">
                    {repo.full_name || `${activeUsername}/${repo.name}`}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Skeleton>

        {/* Show more / Show less button */}
        {!searchQuery.trim() && hasMoreRepos && (
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="mt-3 text-[12px] text-[#636c76] dark:text-[#8b949e] hover:text-[#0969da] dark:hover:text-[#58a6ff] transition-colors cursor-pointer bg-transparent border-none"
          >
            {showAll ? "Show less" : "Show more"}
          </button>
        )}
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 max-w-4xl mx-auto p-3 sm:p-4 md:p-8 bg-white dark:bg-[#0d1117]">
        <div className="mb-8">
          <h1 className="text-[20px] sm:text-[24px] font-semibold mb-4 sm:mb-6">
            Home
          </h1>

          {/* Feed Header */}
          <div className="flex items-center justify-between border-b border-[#d0d7de] dark:border-[#30363d] pb-2 mb-4">
            <h2 className="font-semibold text-[14px]">Feed</h2>

            <button
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#21262d] text-[#24292f] dark:text-[#c9d1d9] hover:bg-[#ebedf0] dark:hover:bg-[#30363d] cursor-pointer"
              onClick={() => setFilterOpen(true)}
            >
              <FilterIcon size={14} className="text-[#57606a] dark:text-[#8b949e]" />
              <span>Filter</span>
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
          {feedError && (
            <div className="mb-4 p-3 text-sm text-[#ff7b72] bg-[#f85149]/10 border border-[#f85149]/30 rounded-md">
              {feedError}
            </div>
          )}
          <Skeleton 
            name="home-feed" 
            loading={isLoading} 
            fixture={<HomeFeedSkeleton />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-[#1f2328] dark:text-[#c9d1d9]">Recent activity</h3>
                <button onClick={() => setFilterValue('all')} className="text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline bg-transparent border-0 cursor-pointer">All activity</button>
              </div>

              {filteredFeed.length > 0 ? (
                filteredFeed.map((item) => {
                  const actorName = item.user?.login || "Someone";
                  const avatar = resolveAvatarUrl(item.user?.avatar_url);
                  const dateStr = new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                  let icon = <PlusCircle className="w-4 h-4 text-green-500" />;
                  let titleContent = null;
                  let detailCard = null;

                  switch (item.type) {
                    case 'repo_created':
                      icon = <PlusCircle className="w-4 h-4 text-[#1a7f37]" />;
                      titleContent = (
                        <span className="text-xs text-[#57606a] dark:text-[#8b949e]">
                          created a repository <button className="font-semibold text-[#1f2328] dark:text-[#c9d1d9] hover:underline cursor-pointer bg-transparent border-0 p-0 text-left align-baseline inline" onClick={() => navigate(`/${item.repository?.owner?.login || actorName}/${item.repository?.name}`)} role="link" tabIndex={0}>{actorName}/{item.repository?.name}</button>
                        </span>
                      );
                      if (item.repository) {
                        detailCard = (
                          <div className="mt-2 pl-6">
                            <PinnedRepoCard repo={item.repository} author={item.repository.owner?.login || actorName} />
                          </div>
                        );
                      }
                      break;

                    case 'repo_starred':
                      icon = <Star className="w-4 h-4 text-[#e3b341] fill-[#e3b341]" />;
                      titleContent = (
                        <span className="text-xs text-[#57606a] dark:text-[#8b949e]">
                          starred a repository <button className="font-semibold text-[#1f2328] dark:text-[#c9d1d9] hover:underline cursor-pointer bg-transparent border-0 p-0 text-left align-baseline inline" onClick={() => navigate(`/${item.repository?.owner?.login || actorName}/${item.repository?.name}`)} role="link" tabIndex={0}>{item.repository?.owner?.login || actorName}/{item.repository?.name}</button>
                        </span>
                      );
                      if (item.repository) {
                        detailCard = (
                          <div className="mt-2 pl-6">
                            <PinnedRepoCard repo={item.repository} author={item.repository.owner?.login || actorName} />
                          </div>
                        );
                      }
                      break;

                    case 'user_followed':
                      icon = <UserPlus className="w-4 h-4 text-[#0969da]" />;
                      titleContent = (
                        <span className="text-xs text-[#57606a] dark:text-[#8b949e]">
                          started following <button className="font-semibold text-[#1f2328] dark:text-[#c9d1d9] hover:underline cursor-pointer bg-transparent border-0 p-0 text-left align-baseline inline" onClick={() => navigate(`/${item.targetUser?.login}`)} role="link" tabIndex={0}>{item.targetUser?.login}</button>
                        </span>
                      );
                      break;

                    case 'file_created':
                    case 'file_updated':
                      icon = <GitCommit className="w-4 h-4 text-[#57606a]" />;
                      titleContent = (
                        <span className="text-xs text-[#57606a] dark:text-[#8b949e]">
                          pushed a commit to <button className="font-semibold text-[#1f2328] dark:text-[#c9d1d9] hover:underline cursor-pointer bg-transparent border-0 p-0 text-left align-baseline inline" onClick={() => navigate(`/${item.repository?.owner?.login || actorName}/${item.repository?.name}`)} role="link" tabIndex={0}>{item.repository?.owner?.login || actorName}/{item.repository?.name}</button>
                        </span>
                      );
                      if (item.commitMessage) {
                        detailCard = (
                          <div className="mt-2 ml-6 p-3 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md font-mono text-xs text-left">
                            <div className="text-xs text-[#0969da] mb-1 font-semibold">
                              {item.commitHash ? `commit ${item.commitHash.substring(0, 7)}` : 'commit'}
                            </div>
                            <div className="text-[#1f2328] dark:text-[#c9d1d9] break-words">
                              {item.commitMessage}
                            </div>
                          </div>
                        );
                      }
                      break;

                    case 'pr_created':
                      icon = <GitPullRequest className="w-4 h-4 text-[#1a7f37]" />;
                      titleContent = (
                        <span className="text-xs text-[#57606a] dark:text-[#8b949e]">
                          opened a pull request in <button className="font-semibold text-[#1f2328] dark:text-[#c9d1d9] hover:underline cursor-pointer bg-transparent border-0 p-0 text-left align-baseline inline" onClick={() => navigate(`/${item.repository?.owner?.login || actorName}/${item.repository?.name}`)} role="link" tabIndex={0}>{item.repository?.owner?.login || actorName}/{item.repository?.name}</button>
                        </span>
                      );
                      break;

                    case 'issue_created':
                      icon = <AlertCircle className="w-4 h-4 text-[#1a7f37]" />;
                      titleContent = (
                        <span className="text-xs text-[#57606a] dark:text-[#8b949e]">
                          opened an issue in <button className="font-semibold text-[#1f2328] dark:text-[#c9d1d9] hover:underline cursor-pointer bg-transparent border-0 p-0 text-left align-baseline inline" onClick={() => navigate(`/${item.repository?.owner?.login || actorName}/${item.repository?.name}`)} role="link" tabIndex={0}>{item.repository?.owner?.login || actorName}/{item.repository?.name}</button>
                        </span>
                      );
                      break;

                    default:
                      titleContent = (
                        <span className="text-xs text-[#57606a] dark:text-[#8b949e]">
                          performed action {item.type}
                        </span>
                      );
                  }

                  return (
                    <div key={item._id || item.id} className="p-4 border border-[#d0d7de] dark:border-[#30363d] rounded-lg bg-white dark:bg-[#161b22] shadow-sm text-left">
                      <div className="flex items-center gap-2 mb-2">
                        {icon}
                        <div className="w-5 h-5 rounded-full overflow-hidden">
                          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.target.src = "profile.webp"; }} />
                        </div>
                        <button className="text-xs font-semibold text-[#1f2328] dark:text-[#c9d1d9] hover:underline cursor-pointer bg-transparent border-0 p-0 text-left align-baseline inline" onClick={() => navigate(`/${actorName}`)} role="link" tabIndex={0}>{actorName}</button>
                        {titleContent}
                        <span className="text-[11px] text-[#57606a] dark:text-[#8b949e] ml-auto">
                          {dateStr}
                        </span>
                      </div>
                      {detailCard}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 border border-[#d0d7de] dark:border-[#30363d] border-dashed rounded-lg bg-[#f6f8fa] dark:bg-[#161b22] text-center">
                  <p className="text-sm text-[#636c76] dark:text-[#8b949e]">No recent activity to show.</p>
                  <button
                     onClick={() => navigate("/new")}
                     className="mt-2 text-sm text-[#0969da] dark:text-[#58a6ff] hover:underline font-medium bg-transparent border-0 cursor-pointer"
                  >
                    Create your first repository
                  </button>
                </div>
              )}
            </div>
          </Skeleton>
        </div>
      </main>

      {/* ── Right Sidebar: Changelog ── */}
      {/* Hidden because this feature is not implemented */}
    </div>
  );
});

Home.displayName = "Home";
export default Home;
