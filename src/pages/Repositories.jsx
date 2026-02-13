import React, { useState } from 'react';
import { Search, X, Users, BookOpen, GitFork, Settings, Plus, List, LayoutGrid, ArrowUpDown, Check } from 'lucide-react';

export default function Repositories() {
  const [activeTab, setActiveTab] = useState('my-contributions');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [isRelevanceOpen, setIsRelevanceOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('relevance');

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getSearchPlaceholder = () => {
    switch(activeTab) {
      case 'my-contributions':
        return 'contributed-by:@me';
      case 'my-repositories':
        return 'owner:@me';
      case 'my-forks':
        return 'owner:@me fork:true';
      case 'admin-access':
        return 'admin:@me';
      default:
        return '';
    }
  };

  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: Users },
    { value: 'last-pushed', label: 'Last pushed', icon: ArrowUpDown },
    { value: 'name', label: 'Name', icon: BookOpen },
    { value: 'stars', label: 'Stars', icon: Users },
  ];

  // Sample repository data
  const repositories = [
    {
      name: 'momanamjad/Github',
      private: true,
      language: 'JavaScript',
      forks: 0,
      stars: 0,
      issues: 0,
      pullRequests: 0,
      updated: 'Updated 13 hours ago',
      description: '',
    },
    {
      name: 'momanamjad/Employ',
      private: false,
      language: 'JavaScript',
      forks: 0,
      stars: 0,
      issues: 0,
      pullRequests: 0,
      updated: 'Updated on Jan 12',
      description: '',
    },
    {
      name: 'momanamjad/K_72-Clone-in-react-GSAP',
      private: true,
      language: 'JavaScript',
      forks: 0,
      stars: 0,
      issues: 0,
      pullRequests: 0,
      updated: 'Updated 2 days ago',
      description: '',
    },
    {
      name: 'momanamjad/theater-web-in-react',
      private: true,
      language: 'JavaScript',
      forks: 0,
      stars: 0,
      issues: 0,
      pullRequests: 0,
      updated: 'Updated on Dec 18, 2025',
      description: '',
    },
    {
      name: 'momanamjad/Todo-list',
      private: true,
      language: 'JavaScript',
      forks: 0,
      stars: 0,
      issues: 0,
      pullRequests: 0,
      updated: 'Updated on Dec 22, 2025',
      description: '',
    },
    {
      name: 'momanamjad/practice-react',
      private: true,
      language: '',
      forks: 0,
      stars: 0,
      issues: 0,
      pullRequests: 0,
      updated: 'Updated on Jan 13',
      description: 'just fun',
    },
    {
      name: 'momanamjad/Real-Estate-',
      private: false,
      language: 'JavaScript',
      forks: 0,
      stars: 0,
      issues: 0,
      pullRequests: 2,
      updated: 'Updated on Oct 20, 2025',
      description: 'web build with react js',
    },
    {
      name: 'momanamjad/Countries-',
      private: true,
      language: 'JavaScript',
      forks: 0,
      stars: 0,
      issues: 0,
      pullRequests: 0,
      updated: 'Updated on Nov 3, 2025',
      description: 'A country proj with simple js using map,filter properties',
    },
    {
      name: 'momanamjad/Birthday',
      private: false,
      language: '',
      forks: 0,
      stars: 0,
      issues: 0,
      pullRequests: 0,
      updated: 'Updated last week',
      description: '',
    },
  ];

  const getRepositoryCount = () => {
    if (activeTab === 'my-forks') return 0;
    return repositories.length;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {/* My contributions */}
              <button
                onClick={() => setActiveTab('my-contributions')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'my-contributions'
                    ? 'bg-gray-100 text-gray-900 border-l-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>My contributions</span>
              </button>

              {/* My repositories */}
              <button
                onClick={() => setActiveTab('my-repositories')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'my-repositories'
                    ? 'bg-gray-100 text-gray-900 border-l-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>My repositories</span>
              </button>

              {/* My forks */}
              <button
                onClick={() => setActiveTab('my-forks')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'my-forks'
                    ? 'bg-gray-100 text-gray-900 border-l-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <GitFork className="w-4 h-4" />
                <span>My forks</span>
              </button>

              {/* Admin access */}
              <button
                onClick={() => setActiveTab('admin-access')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'admin-access'
                    ? 'bg-gray-100 text-gray-900 border-l-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin access</span>
              </button>

              {/* Views Section */}
              <div className="pt-6">
                <div className="flex items-center justify-between px-3 mb-2">
                  <span className="text-sm font-medium text-gray-700">Views</span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeTab === 'my-contributions' && 'My contributions'}
                {activeTab === 'my-repositories' && 'My repositories'}
                {activeTab === 'my-forks' && 'My forks'}
                {activeTab === 'admin-access' && 'Admin access'}
              </h1>
              <div className="flex items-center gap-3">
                <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Preview
                </button>
                <button className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                  New repository
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getSearchPlaceholder()}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Repository Count and Controls */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">
                {getRepositoryCount()} repositories
              </p>
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsRelevanceOpen(!isRelevanceOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span>{sortOptions.find(opt => opt.value === selectedSort)?.label}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isRelevanceOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedSort(option.value);
                            setIsRelevanceOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-50"
                        >
                          {selectedSort === option.value && (
                            <Check className="w-4 h-4 text-gray-900" />
                          )}
                          {selectedSort !== option.value && (
                            <span className="w-4 h-4"></span>
                          )}
                          <option.icon className="w-4 h-4 text-gray-600" />
                          <span className={selectedSort === option.value ? 'font-medium text-gray-900' : 'text-gray-700'}>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Mode Buttons */}
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 ${
                      viewMode === 'list'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 border-l border-gray-300 ${
                      viewMode === 'grid'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Repositories List */}
            {activeTab !== 'my-forks' ? (
              <div className="space-y-4">
                {repositories.map((repo, index) => (
                  <div key={index} className="border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <a href="#" className="text-blue-600 hover:underline font-semibold">
                            {repo.name}
                          </a>
                          <span className="px-2 py-0.5 text-xs font-medium border border-gray-300 rounded-full text-gray-600">
                            {repo.private ? 'Private' : 'Public'}
                          </span>
                        </div>
                        <div className="w-16 h-8">
                          {/* Activity graph placeholder */}
                          <svg className="w-full h-full" viewBox="0 0 64 32">
                            <polyline
                              points="0,28 8,24 16,20 24,26 32,18 40,22 48,16 56,20 64,14"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                      </div>
                      
                      {repo.description && (
                        <p className="text-sm text-gray-600 mb-3">{repo.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                            <span>{repo.language}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          <span>{repo.forks}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                          </svg>
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            <path d="M8 0a8 8 0 110 16A8 8 0 018 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" />
                          </svg>
                          <span>{repo.issues}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z" />
                          </svg>
                          <span>{repo.pullRequests}</span>
                        </div>
                        <span className="ml-auto">{repo.updated}</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state for My Forks */
              <div className="border border-gray-200 rounded-md p-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No repositories matched your search.
                </h3>
                <p className="text-sm text-gray-600">
                  Try a different search query.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>© 2026 GitHub, Inc.</span>
            </div>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Terms
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Privacy
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Security
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Status
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Community
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Docs
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Contact
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Manage cookies
            </a>
            <a href="#" className="hover:text-blue-600 hover:underline">
              Do not share my personal information
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
