import React, { useState, useEffect } from 'react';
import { Compass, TrendingUp, Star, GitFork, Eye, Search, User } from 'lucide-react';
import { getExploreRepos } from '../services/GithubApi';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useGitHub } from '../contexts/GitHubContext';

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
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'topics', label: 'Topics', icon: Compass },
    { id: 'collections', label: 'Collections', icon: Star }
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Compass className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Explore</h1>
          </div>
          <p className="text-lg text-gray-600">
            Discover interesting projects and people to follow
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 text-left">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search repositories or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white text-gray-900"
            />
          </div>
        </div>

        {isSearching ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-left">
              Search Results for "{searchQuery}"
            </h2>
            {searchLoading ? (
              <div className="text-center py-12 text-sm text-gray-500">Searching...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Repository results */}
                <div className="lg:col-span-2 space-y-4 text-left">
                  <h3 className="font-bold text-xs text-gray-500 border-b pb-1.5 uppercase tracking-wider">Repositories ({searchResults.repos.length})</h3>
                  {searchResults.repos.length === 0 ? (
                    <p className="text-sm text-gray-500">No repositories matched your search.</p>
                  ) : (
                    searchResults.repos.map(repo => (
                      <div key={repo._id} className="border border-gray-300 rounded-lg p-5 hover:shadow bg-white transition-shadow">
                        <Link to={`/${repo.owner?.login || 'unknown'}/${repo.name}`} className="text-base font-bold text-blue-600 hover:underline">
                          {repo.owner?.login || 'unknown'}/{repo.name}
                        </Link>
                        {repo.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{repo.description}</p>}
                        <div className="flex gap-4 text-[11px] text-gray-500 mt-3 font-semibold">
                          <span>{repo.language || 'JavaScript'}</span>
                          <span>★ {repo.stars_count || 0} stars</span>
                          <span>Forks {repo.forks_count || 0}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* User results */}
                <div className="lg:col-span-1 space-y-4 text-left">
                  <h3 className="font-bold text-xs text-gray-500 border-b pb-1.5 uppercase tracking-wider">Users ({searchResults.users.length})</h3>
                  {searchResults.users.length === 0 ? (
                    <p className="text-sm text-gray-500">No users matched your search.</p>
                  ) : (
                    searchResults.users.map(u => (
                      <div key={u._id} className="border border-gray-300 rounded-lg p-4 bg-white flex items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar_url || "https://avatars.githubusercontent.com/u/104862410?v=4"}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                          <div className="min-w-0">
                            <Link to={`/${u.login}`} className="text-sm font-semibold text-blue-600 hover:underline block truncate">
                              {u.login}
                            </Link>
                            <span className="text-[10px] text-gray-500 block truncate">{u.name || u.login}</span>
                          </div>
                        </div>
                        {currentUser && currentUser.login !== u.login && (
                          <button
                            onClick={() => handleFollowUser(u._id)}
                            className={`px-3 py-1 text-xs font-semibold rounded-md border cursor-pointer transition-colors ${u.isFollowing ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200' : 'bg-[#238636] hover:bg-[#2ea043] text-white border-transparent'}`}
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
            <div className="border-b border-gray-300 mb-8">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-gray-900 font-bold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            {activeTab === 'trending' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Public repositories
                  </h2>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading explore repositories...</div>
                ) : repos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No public repositories found. Create one to get started!</div>
                ) : (
                  <div className="space-y-4 text-left">
                    {repos.map((repo) => (
                      <div
                        key={repo._id}
                        className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                            {repo.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link to={`/${repo.owner?.login}/${repo.name}`} className="text-lg font-semibold text-blue-600 hover:underline mb-1 inline-block">
                              {repo.owner?.login || 'unknown'}/{repo.name}
                            </Link>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {repo.description || 'No description provided.'}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center">
                                <span className="w-3 h-3 bg-blue-500 rounded-full mr-1.5"></span>
                                {repo.language || 'JavaScript'}
                              </span>
                              <span className="flex items-center">
                                <Star className="w-3 h-3 mr-1 text-yellow-500" />
                                {repo.stars_count || 0} stars
                              </span>
                              <span className="flex items-center">
                                <GitFork className="w-3 h-3 mr-1" />
                                {repo.forks_count || 0} forks
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'topics' && (
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Browse popular topics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                    >
                      <h3 className="text-lg font-semibold text-blue-600 hover:underline mb-2">
                        {topic.name}
                      </h3>
                      <p className="text-sm text-gray-600">{topic.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'collections' && (
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Curated collections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-blue-600 hover:underline mb-2">
                            Collection Name {item}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            A curated list of awesome resources and tools for developers
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
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
