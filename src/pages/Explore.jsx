import React, { useState, useEffect } from 'react';
import { TelescopeIcon, GraphIcon, StarIcon, RepoForkedIcon, EyeIcon, SearchIcon, PersonIcon, RepoIcon } from '@primer/octicons-react';
import { getExploreRepos } from '../services/GithubApi';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useGitHub } from '../contexts/GitHubContext';
import PinnedRepoCard from '../components/features/PinnedRepoCard';

const Explore = () => {
  const { user: currentUser } = useGitHub();
  const [activeTab, setActiveTab] = useState('trending');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({ repos: [], users: [] });

  useEffect(() => {
    const performExplore = async () => {
      try {
        setLoading(true);
        const data = await getExploreRepos();
        setRepos(data || []);
      } catch (err) {
        console.error('Error fetching explore repos:', err);
      } finally {
        setLoading(false);
      }
    };
    performExplore();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setIsSearching(false);
        setSearchResults({ repos: [], users: [] });
        return;
      }
      setIsSearching(true);
      setSearchLoading(true);
      try {
        const query = encodeURIComponent(searchQuery.trim());
        const [reposRes, usersRes] = await Promise.all([
          apiClient(`/repos/search/query?q=${query}`).catch(() => ({ data: [] })),
          apiClient(`/users/search?q=${query}`).catch(() => ({ data: { users: [] } }))
        ]);
        
        setSearchResults({
          repos: reposRes?.data || [],
          users: usersRes?.data?.users || []
        });
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleFollowUser = async (targetUserId) => {
    if (!currentUser) {
      alert("Please log in to follow users.");
      return;
    }
    try {
      const res = await apiClient(`/users/${targetUserId}/follow`, { method: 'POST' });
      if (res) {
        setSearchResults(prev => ({
          ...prev,
          users: prev.users.map(u => u._id === targetUserId ? { ...u, isFollowing: res.data?.message === 'Followed' } : u)
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'trending', label: 'Trending', icon: GraphIcon },
    { id: 'topics', label: 'Topics', icon: TelescopeIcon },
    { id: 'collections', label: 'Collections', icon: StarIcon }
  ];

  const topics = [
    { name: 'React', count: '125k repositories' },
    { name: 'Machine Learning', count: '89k repositories' },
    { name: 'TypeScript', count: '156k repositories' },
    { name: 'Python', count: '234k repositories' },
    { name: 'Web Development', count: '178k repositories' },
    { name: 'DevOps', count: '67k repositories' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <TelescopeIcon size={32} className="text-[#0969da] dark:text-[#58a6ff]" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explore</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-[#8b949e]">
            Discover interesting projects and people to follow
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 text-left">
          <div className="relative max-w-2xl">
            <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#8b949e]" />
            <input
              type="text"
              placeholder="Search repositories or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
        </div>

        {isSearching ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-left">
              Search Results for "{searchQuery}"
            </h2>
            {searchLoading ? (
              <div className="text-center py-12 text-sm text-gray-500 dark:text-[#8b949e]">Searching...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Repository results */}
                <div className="lg:col-span-2 space-y-4 text-left">
                  <h3 className="font-bold text-xs text-gray-500 dark:text-[#8b949e] border-b border-gray-200 dark:border-[#30363d] pb-1.5 uppercase tracking-wider">Repositories ({searchResults.repos.length})</h3>
                  {searchResults.repos.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-[#8b949e]">No repositories matched your search.</p>
                  ) : (
                    searchResults.repos.map(repo => (
                      <PinnedRepoCard 
                        key={repo._id} 
                        repo={repo} 
                        author={repo.owner?.login || 'unknown'} 
                      />
                    ))
                  )}
                </div>

                {/* User results */}
                <div className="lg:col-span-1 space-y-4 text-left">
                  <h3 className="font-bold text-xs text-gray-500 dark:text-[#8b949e] border-b border-gray-200 dark:border-[#30363d] pb-1.5 uppercase tracking-wider">Users ({searchResults.users.length})</h3>
                  {searchResults.users.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-[#8b949e]">No users matched your search.</p>
                  ) : (
                    searchResults.users.map(u => (
                      <div key={u._id} className="border border-gray-300 dark:border-[#30363d] rounded-lg p-4 bg-white dark:bg-[#161b22] flex items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar_url || "https://avatars.githubusercontent.com/u/104862410?v=4"}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-[#30363d]"
                          />
                          <div className="min-w-0">
                            <Link to={`/${u.login}`} className="text-sm font-semibold text-[#0969da] dark:text-[#58a6ff] hover:underline block truncate">
                              {u.login}
                            </Link>
                            <span className="text-[10px] text-gray-500 dark:text-[#8b949e] block truncate">{u.name || u.login}</span>
                          </div>
                        </div>
                        {currentUser && currentUser.login !== u.login && (
                          <button
                            onClick={() => handleFollowUser(u._id)}
                            className={`px-3 py-1 text-xs font-semibold rounded-md border cursor-pointer transition-colors ${u.isFollowing ? 'bg-gray-100 dark:bg-[#21262d] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-[#30363d] hover:bg-gray-200 dark:hover:bg-[#30363d]' : 'bg-[#2da44f] hover:bg-[#2c974b] text-white border-transparent'}`}
                          >
                            {u.isFollowing ? 'Unfollow' : 'Follow'}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-300 dark:border-[#30363d] mb-8">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-[#f78166] text-gray-900 dark:text-white font-bold'
                        : 'border-transparent text-gray-500 dark:text-[#8b949e] hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-[#8b949e]'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            {activeTab === 'trending' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Public repositories
                  </h2>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-[#8b949e]">Loading explore repositories...</div>
                ) : repos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-[#8b949e]">No public repositories found. Create one to get started!</div>
                ) : (
                  <div className="space-y-4 text-left">
                    {repos.map((repo) => (
                      <PinnedRepoCard
                        key={repo._id}
                        repo={repo}
                        author={repo.owner?.login || 'unknown'}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'topics' && (
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Browse popular topics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 dark:border-[#30363d] rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-[#161b22]"
                    >
                      <h3 className="text-lg font-semibold text-[#0969da] dark:text-[#58a6ff] hover:underline mb-2">
                        {topic.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-[#8b949e]">{topic.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'collections' && (
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Curated collections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="border border-gray-300 dark:border-[#30363d] rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-[#161b22]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-[#0969da] dark:text-[#58a6ff] hover:underline mb-2">
                            Collection Name {item}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-[#8b949e] mb-3 line-clamp-2">
                            A curated list of awesome resources and tools for developers
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-[#8b949e]">
                            <span className="flex items-center">
                              <EyeIcon size={14} className="mr-1" />
                              12.5k viewers
                            </span>
                            <span>23 repositories</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
