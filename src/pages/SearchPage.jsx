import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { RepoIcon, IssueOpenedIcon, GitPullRequestIcon, PeopleIcon, StarIcon, SearchIcon, FlameIcon } from '@primer/octicons-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || "";

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('repositories'); // 'repositories' | 'users' | 'issues' | 'pullRequests'
  
  const [results, setResults] = useState({
    repositories: [],
    users: [],
    issues: [],
    pullRequests: [],
    counts: {
      repositories: 0,
      users: 0,
      issues: 0,
      pullRequests: 0
    }
  });

  useEffect(() => {
    const executeSearch = async () => {
      if (!query.trim()) return;
      try {
        setLoading(true);
        const res = await apiClient(`/search?q=${encodeURIComponent(query)}`);
        if (res?.data) {
          setResults(res.data);
          
          // Auto-select tab with most results if current tab is empty
          const counts = res.data.counts;
          if (counts[activeTab] === 0) {
            if (counts.repositories > 0) setActiveTab('repositories');
            else if (counts.issues > 0) setActiveTab('issues');
            else if (counts.pullRequests > 0) setActiveTab('pullRequests');
            else if (counts.users > 0) setActiveTab('users');
          }
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };
    executeSearch();
  }, [query]);

  const categories = [
    { id: 'repositories', label: 'Repositories', icon: <RepoIcon size={14} />, count: results.counts.repositories },
    { id: 'issues', label: 'Issues', icon: <IssueOpenedIcon size={14} />, count: results.counts.issues },
    { id: 'pullRequests', label: 'Pull requests', icon: <GitPullRequestIcon size={14} />, count: results.counts.pullRequests },
    { id: 'users', label: 'Users', icon: <PeopleIcon size={14} />, count: results.counts.users }
  ];

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-left min-h-screen bg-white dark:bg-[#0d1117] transition-colors">
      {/* Search status header */}
      <div className="border-b border-[#d0d7de] dark:border-[#30363d] pb-4 mb-6">
        <h2 className="text-lg font-semibold text-[#24292f] dark:text-white flex items-center gap-2">
          <SearchIcon size={20} className="text-gray-400" />
          Search results for: <span className="font-mono bg-[#f6f8fa] dark:bg-[#161b22] px-2 py-0.5 rounded border border-[#d0d7de] dark:border-[#30363d] text-sm text-[#0969da] dark:text-[#58a6ff]">{query}</span>
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500 font-sans">
          <svg className="animate-spin h-5 w-5 text-purple-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Searching all GitHub databases...
        </div>
      ) : !query.trim() ? (
        <div className="text-center py-20 text-xs text-gray-400">
          Enter a search query in the search bar above to begin.
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel: Search Categories Sidebar (matches GitHub.com) */}
          <div className="w-full lg:w-60 shrink-0">
            <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#f6f8fa] dark:bg-[#161b22] flex flex-col divide-y divide-[#d0d7de]/60 dark:divide-[#30363d]/60">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between text-xs transition-colors border-0 cursor-pointer ${cat.id === activeTab ? 'bg-white dark:bg-[#0d1117] font-semibold text-[#0969da] dark:text-[#58a6ff] border-l-2 border-[#f78166]' : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  <div className="flex items-center gap-2">
                    {cat.icon}
                    <span>{cat.label}</span>
                  </div>
                  <span className="bg-gray-200 dark:bg-[#30363d] px-1.5 py-0.2 rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-300">
                    {formatNumber(cat.count)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel: Content Cards */}
          <div className="flex-1 space-y-4">
            {/* Repositories results */}
            {activeTab === 'repositories' && (
              <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                {results.repositories.map(repo => (
                  <div key={repo._id || repo.id} className="py-4 space-y-2 text-left">
                    <div className="flex items-center gap-1.5 text-sm">
                      <RepoIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
                      <Link to={`/${repo.owner?.login}/${repo.name}`} className="text-[#0969da] dark:text-[#58a6ff] font-bold hover:underline">
                        {repo.owner?.login}/{repo.name}
                      </Link>
                      <span className="text-[10px] px-1.5 py-0.2 border border-gray-200 rounded-full capitalize text-gray-500">
                        {repo.visibility}
                      </span>
                    </div>
                    {repo.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-2xl">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-[10px] text-gray-500">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <StarIcon size={12} />
                        {repo.stars_count || 0}
                      </span>
                      <span>Updated {new Date(repo.updatedAt || repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {results.repositories.length === 0 && (
                  <div className="p-8 text-center text-xs text-gray-500">No repositories found matching your query.</div>
                )}
              </div>
            )}

            {/* Users results */}
            {activeTab === 'users' && (
              <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                {results.users.map(user => (
                  <div key={user.login} className="py-4 flex gap-3 items-start text-left">
                    <img
                      src={user.avatar_url || "/profile.webp"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <Link to={`/${user.login}`} className="text-xs sm:text-sm font-bold text-[#0969da] dark:text-[#58a6ff] hover:underline">
                          {user.login}
                        </Link>
                        {user.name && <span className="text-xs text-gray-500">{user.name}</span>}
                      </div>
                      {user.bio && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-xl truncate">{user.bio}</p>}
                      <div className="flex gap-3 text-[10px] text-gray-400 mt-1">
                        <span>{user.followers_count || 0} followers</span>
                        <span>{user.public_repos_count || 0} repositories</span>
                      </div>
                    </div>
                  </div>
                ))}
                {results.users.length === 0 && (
                  <div className="p-8 text-center text-xs text-gray-500">No users found matching your query.</div>
                )}
              </div>
            )}

            {/* Issues results */}
            {activeTab === 'issues' && (
              <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                {results.issues.map(issue => (
                  <div key={issue._id} className="py-4 space-y-1 text-left">
                    <div className="flex items-center gap-1.5 text-xs">
                      <IssueOpenedIcon size={14} className="text-[#1a7f37] shrink-0" />
                      <Link to={`/${issue.repository?.owner}/${issue.repository?.name}`} className="text-[#0969da] dark:text-[#58a6ff] hover:underline font-bold">
                        {issue.repository?.name}
                      </Link>
                      <span className="text-gray-400">·</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">{issue.title}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      #{issue.number} opened by {issue.creator?.login} on {new Date(issue.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {results.issues.length === 0 && (
                  <div className="p-8 text-center text-xs text-gray-500">No issues found matching your query.</div>
                )}
              </div>
            )}

            {/* Pull Requests results */}
            {activeTab === 'pullRequests' && (
              <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                {results.pullRequests.map(pr => (
                  <div key={pr._id} className="py-4 space-y-1 text-left">
                    <div className="flex items-center gap-1.5 text-xs">
                      <GitPullRequestIcon size={14} className={`${pr.status === 'merged' ? 'text-[#8250df]' : 'text-[#1a7f37]'} shrink-0`} />
                      <Link to={`/${pr.repository?.owner}/${pr.repository?.name}`} className="text-[#0969da] dark:text-[#58a6ff] hover:underline font-bold">
                        {pr.repository?.name}
                      </Link>
                      <span className="text-gray-400">·</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">{pr.title}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      #{pr.number} opened by {pr.author?.login} on {new Date(pr.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {results.pullRequests.length === 0 && (
                  <div className="p-8 text-center text-xs text-gray-500">No pull requests found matching your query.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
