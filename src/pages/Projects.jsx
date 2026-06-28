import React, { useState, useEffect, useMemo } from 'react';
import { SearchIcon, XIcon, ClockIcon, PersonIcon, ChevronDownIcon, ProjectIcon } from '@primer/octicons-react';
import { Link } from 'react-router-dom';
import EmptyStateClockIcon from "../components/ui/icons/EmptyStateClockIcon";
import FooterGithubIcon from "../components/ui/icons/FooterGithubIcon";
import { apiClient } from '../services/apiClient';
import { useGitHub } from '../contexts/GitHubContext';

export default function Projects() {
  const { user } = useGitHub();
  const [activeTab, setActiveTab] = useState('recently-viewed');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentSearchQuery, setRecentSearchQuery] = useState('');
  const [createdSearchQuery, setCreatedSearchQuery] = useState('');
  const [createdFilter, setCreatedFilter] = useState('open'); // 'open' | 'closed'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'alphabetical'
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = React.useRef(null);

  useEffect(() => {
    if (!showSortDropdown) return;
    const handler = (e) => {
      if (!sortDropdownRef.current?.contains(e.target)) setShowSortDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSortDropdown]);

  const sortProjects = React.useCallback((list) => {
    return [...list].sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = new Date(a.updated_at || a.updatedAt || a.created_at || a.createdAt || Date.now());
        const dateB = new Date(b.updated_at || b.updatedAt || b.created_at || b.createdAt || Date.now());
        return dateB - dateA;
      } else if (sortBy === 'oldest') {
        const dateA = new Date(a.created_at || a.createdAt || Date.now());
        const dateB = new Date(b.created_at || b.createdAt || Date.now());
        return dateA - dateB;
      } else if (sortBy === 'alphabetical') {
        const titleA = a.title || a.name || '';
        const titleB = b.title || b.name || '';
        return titleA.localeCompare(titleB);
      }
      return 0;
    });
  }, [sortBy]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await apiClient('/projects');
        if (res && res.data) {
          setProjects(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const clearRecentSearch = () => {
    setRecentSearchQuery('');
  };
  const clearCreatedSearch = () => {
    setCreatedSearchQuery('');
  };

  const getFilteredProjects = (projectList, query) => {
    let result = [...projectList];
    const q = query.toLowerCase().trim();
    if (!q) return result;

    const terms = q.split(/\s+/);
    terms.forEach(term => {
      if (term === 'is:open') {
        result = result.filter(p => p.column !== 'done');
      } else if (term === 'is:closed') {
        result = result.filter(p => p.column === 'done');
      } else if (term === 'creator:@me') {
        const loggedInUserId = user?._id || user?.id;
        result = result.filter(p => {
          const creatorId = p.creator?._id || p.creator?.id || p.creator;
          return creatorId && loggedInUserId && creatorId.toString() === loggedInUserId.toString();
        });
      } else if (!term.includes(':')) {
        result = result.filter(p => 
          p.title?.toLowerCase().includes(term) || 
          p.name?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
        );
      }
    });
    return result;
  };

  // Recently viewed list - shows all projects by default, filtered by search query
  const recentlyViewedProjects = useMemo(() => {
    return sortProjects(getFilteredProjects(projects, recentSearchQuery));
  }, [projects, recentSearchQuery, user, sortProjects]);

  // Projects created by me
  const myProjects = useMemo(() => {
    return projects.filter(p => {
      const creatorId = p.creator?._id || p.creator?.id || p.creator;
      const loggedInUserId = user?._id || user?.id;
      return creatorId && loggedInUserId && creatorId.toString() === loggedInUserId.toString();
    });
  }, [projects, user]);

  // Metric counts for created by me (unfiltered by search query for static count feel)
  const openCount = useMemo(() => myProjects.filter(p => p.column !== 'done').length, [myProjects]);
  const closedCount = useMemo(() => myProjects.filter(p => p.column === 'done').length, [myProjects]);

  // Filtered created-by-me projects
  const filteredCreatedByMe = useMemo(() => {
    const base = myProjects.filter(p => createdFilter === 'open' ? p.column !== 'done' : p.column === 'done');
    return sortProjects(getFilteredProjects(base, createdSearchQuery));
  }, [myProjects, createdFilter, createdSearchQuery, user, sortProjects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex items-center justify-center text-gray-600 dark:text-[#8b949e]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0d1117] flex items-center justify-center text-red-500">
        <div className="text-center">
          <p className="font-semibold">Error loading projects</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] transition-colors">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              <div className={`relative transition-all ${activeTab === 'recently-viewed' ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md" : ""}`}>
                <button
                  onClick={() => {
                    setActiveTab("recently-viewed");
                    setRecentSearchQuery('');
                    setCreatedSearchQuery('');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border-0 bg-transparent text-left cursor-pointer transition-colors ${
                    activeTab === 'recently-viewed'
                      ? 'bg-gray-100 dark:bg-[#30363d] text-gray-900 dark:text-white font-semibold'
                      : 'text-gray-700 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#161b22]'
                  }`}
                >
                  <ClockIcon size={16} />
                  <span>Recently viewed</span>
                </button>
              </div>
              
              <div className={`relative transition-all ${activeTab === 'created-by-me' ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md" : ""}`}>
                <button
                  onClick={() => {
                    setActiveTab('created-by-me');
                    setRecentSearchQuery('');
                    setCreatedSearchQuery('');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md border-0 bg-transparent text-left cursor-pointer transition-colors ${
                    activeTab === 'created-by-me'
                      ? 'bg-gray-100 dark:bg-[#30363d] text-gray-900 dark:text-white font-semibold'
                      : 'text-gray-700 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#161b22]'
                  }`}
                >
                  <PersonIcon size={16} />
                  <span>Created by me</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Recently Viewed Tab */}
            {activeTab === 'recently-viewed' && (
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Recently viewed
                </h1>

                {/* Search Bar */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon size={16} className="text-gray-400 dark:text-[#8b949e]" />
                  </div>
                  <input
                    type="text"
                    value={recentSearchQuery}
                    onChange={(e) => setRecentSearchQuery(e.target.value)}
                    placeholder="is:open"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-[#30363d] rounded-md leading-5 bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {recentSearchQuery && (
                    <button
                      onClick={clearRecentSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent border-0 cursor-pointer"
                    >
                      <XIcon size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-white" />
                    </button>
                  )}
                </div>

                {/* Results Count */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-[#8b949e]">
                    {recentlyViewedProjects.length} recently viewed
                  </p>
                </div>

                {/* Projects List or Empty State */}
                {recentlyViewedProjects.length > 0 ? (
                  <div className="border border-gray-200 dark:border-[#30363d] rounded-md overflow-hidden bg-white dark:bg-[#161b22]">
                    <div className="divide-y divide-gray-200 dark:divide-[#30363d]">
                      {recentlyViewedProjects.map(project => (
                        <div key={project._id} className="p-4 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-[#161b22]/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 text-gray-500">
                              <ProjectIcon size={18} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base text-gray-900 dark:text-white">
                                <Link to={`/repos/${project.repository?._id || project.repository?.id}?tab=projects`} className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 text-inherit font-semibold">
                                  {project.title}
                                </Link>
                              </h4>
                              {project.description && (
                                <p className="text-sm text-gray-600 dark:text-[#8b949e] mt-1">
                                  {project.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-[#8b949e]">
                                {project.repository && (
                                  <span className="font-medium text-gray-700 dark:text-[#c9d1d9]">
                                    {project.repository.name}
                                  </span>
                                )}
                                <span>•</span>
                                <span>
                                  Column: <span className="capitalize px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-[#30363d] text-gray-700 dark:text-[#c9d1d9] text-[10px] font-medium">{project.column?.replace('_', ' ')}</span>
                                </span>
                                {project.creator && typeof project.creator === 'object' && project.creator.login && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      {project.creator.avatar_url && (
                                        <img src={project.creator.avatar_url} alt={project.creator.login} className="w-4 h-4 rounded-full" />
                                      )}
                                      <span className="font-semibold">{project.creator.login}</span>
                                    </span>
                                  </>
                                )}
                                <span>•</span>
                                <span>
                                  updated {new Date(project.updated_at || project.updatedAt || project.created_at || project.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-16 bg-white dark:bg-[#161b22] flex flex-col items-center justify-center">
                    <div className="w-12 h-12 mb-4 flex items-center justify-center">
                      <EmptyStateClockIcon className="w-12 h-12 text-gray-400 dark:text-[#8b949e]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      No projects found
                    </h3>
                  </div>
                )}
              </div>
            )}

            {/* Created by Me Tab */}
            {activeTab === 'created-by-me' && (
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Created by me
                </h1>

                {/* Search Bar */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon size={16} className="text-gray-400 dark:text-[#8b949e]" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="is:open creator:@me"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-[#30363d] rounded-md leading-5 bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent border-0 cursor-pointer"
                    >
                      <XIcon size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-white" />
                    </button>
                  )}
                </div>

                {/* Tabs and Sort */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-[#30363d]">
                  <div className="flex gap-6">
                    <button
                      onClick={() => setCreatedFilter('open')}
                      className={`pb-3 px-1 border-b-2 font-medium text-sm bg-transparent border-0 cursor-pointer transition-colors ${
                        createdFilter === 'open'
                          ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold'
                          : 'border-transparent text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                      }`}
                    >
                      Open <span className="ml-1 text-gray-600 dark:text-[#8b949e]">{openCount}</span>
                    </button>
                    <button
                      onClick={() => setCreatedFilter('closed')}
                      className={`pb-3 px-1 border-b-2 font-medium text-sm bg-transparent border-0 cursor-pointer transition-colors ${
                        createdFilter === 'closed'
                          ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold'
                          : 'border-transparent text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                      }`}
                    >
                      Closed <span className="ml-1">{closedCount}</span>
                    </button>
                  </div>
                  <div className="relative" ref={sortDropdownRef}>
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white bg-transparent border-0 cursor-pointer"
                    >
                      Sort: <span className="capitalize">{sortBy}</span>
                      <ChevronDownIcon size={14} />
                    </button>
                    {showSortDropdown && (
                      <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-md shadow-lg py-1 z-10">
                        {['newest', 'oldest', 'alphabetical'].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSortBy(opt);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs capitalize bg-transparent border-0 cursor-pointer ${
                              sortBy === opt
                                ? 'text-blue-600 font-bold dark:text-blue-400'
                                : 'text-gray-700 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#30363d]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Projects List or Empty State */}
                {filteredCreatedByMe.length > 0 ? (
                  <div className="border border-gray-200 dark:border-[#30363d] rounded-md overflow-hidden bg-white dark:bg-[#161b22]">
                    <div className="divide-y divide-gray-200 dark:divide-[#30363d]">
                      {filteredCreatedByMe.map(project => (
                        <div key={project._id} className="p-4 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-[#161b22]/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 text-gray-500">
                              <ProjectIcon size={18} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base text-gray-900 dark:text-white">
                                <Link to={`/repos/${project.repository?._id || project.repository?.id}?tab=projects`} className="hover:underline hover:text-blue-600 dark:hover:text-blue-400 text-inherit font-semibold">
                                  {project.title}
                                </Link>
                              </h4>
                              {project.description && (
                                <p className="text-sm text-gray-600 dark:text-[#8b949e] mt-1">
                                  {project.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-[#8b949e]">
                                {project.repository && (
                                  <span className="font-medium text-gray-700 dark:text-[#c9d1d9]">
                                    {project.repository.name}
                                  </span>
                                )}
                                <span>•</span>
                                <span>
                                  Column: <span className="capitalize px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-[#30363d] text-gray-700 dark:text-[#c9d1d9] text-[10px] font-medium">{project.column?.replace('_', ' ')}</span>
                                </span>
                                {project.creator && typeof project.creator === 'object' && project.creator.login && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      {project.creator.avatar_url && (
                                        <img src={project.creator.avatar_url} alt={project.creator.login} className="w-4 h-4 rounded-full" />
                                      )}
                                      <span className="font-semibold">{project.creator.login}</span>
                                    </span>
                                  </>
                                )}
                                <span>•</span>
                                <span>
                                  updated {new Date(project.updated_at || project.updatedAt || project.created_at || project.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-16 bg-white dark:bg-[#161b22] flex flex-col items-center justify-center">
                    <div className="w-12 h-12 mb-4 flex items-center justify-center">
                      <EmptyStateClockIcon className="w-12 h-12 text-gray-400 dark:text-[#8b949e]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      No projects found
                    </h3>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-[#30363d] mt-16 bg-[#f6f8fa] dark:bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#57606a] dark:text-[#8b949e]">
            <div className="flex items-center gap-2">
              <FooterGithubIcon className="w-6 h-6" />
              <span>© 2026 GitHub, Inc.</span>
            </div>
            <a href="#" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
              Terms
            </a>
            <a href="#" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
              Privacy
            </a>
            <a href="#" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
              Security
            </a>
            <a href="#" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
              Status
            </a>
            <a href="#" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
              Docs
            </a>
            <a href="#" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
              Contact
            </a>
            <a href="#" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
              Manage cookies
            </a>
            <a href="#" className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
              Do not share my personal information
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

