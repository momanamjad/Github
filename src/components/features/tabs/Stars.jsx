import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Star, ChevronDown, Check } from 'lucide-react';
import { getStarredRepos, toggleStarRepo } from "@services/GithubApi";
import { starRepository, unstarRepository } from "@services/storageService.js";
import { useParams, Link } from 'react-router-dom';
import { useScrollLock } from '../../../hooks/useScrollLock';


const Stars = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [typeFilter, setTypeFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recently-starred');

  // Dropdown states
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isListSortOpen, setIsListSortOpen] = useState(false);

  // Modal state
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Lists data
  const [lists, setLists] = useState([
    { id: 1, name: 'Future ideas', emoji: '💡' }
  ]);

  // Scroll locks
  useScrollLock(isCreateListOpen || (isTypeOpen || isLanguageOpen || isSortOpen || isListSortOpen));


  // Load data on component mount
  const params = useParams();
  const fetchStarred = async () => {
    const username = params?.username || 'moman';
    try {
      const starredRepos = await getStarredRepos(username);
      setRepos(starredRepos);
    } catch (error) {
      console.error("Error fetching starred repos:", error);
      setRepos([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStarred().finally(() => setLoading(false));

    window.addEventListener("github_stars_updated", fetchStarred);
    return () => {
      window.removeEventListener("github_stars_updated", fetchStarred);
    };
  }, [params?.username]);

  const handleStarToggle = async (repo) => {
    try {
      const repoId = repo._id || repo.id;
      await toggleStarRepo(repoId);
      // Immediately remove from list since it's unstarred
      setRepos(prev => prev.filter(r => (r._id !== repoId && r.id !== repoId)));
      // Dispatch event to sync other views
      window.dispatchEvent(new CustomEvent("github_stars_updated"));
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  };

  // 1. DYNAMIC FILTERS & SORTING LOGIC
  const filteredRepos = useMemo(() => {
    let result = [...repos];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(repo =>
        repo.full_name.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query))
      );
    }

    // Type Filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'public') result = result.filter(repo => !repo.private);
      if (typeFilter === 'private') result = result.filter(repo => repo.private);
      if (typeFilter === 'forks') result = result.filter(repo => repo.fork);
      if (typeFilter === 'sources') result = result.filter(repo => !repo.fork);
      if (typeFilter === 'archived') result = result.filter(repo => repo.archived);
    }

    // Language Filter
    if (languageFilter !== 'all') {
      result = result.filter(repo => repo.language && repo.language.toLowerCase() === languageFilter.toLowerCase());
    }

    // Sorting
    if (sortBy === 'most-stars') {
      result.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
    } else if (sortBy === 'recently-active') {
      result.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    } else if (sortBy === 'recently-starred') {
      // Default order returned by service (usually newest first)
      // Since we don't have a 'starred_at' timestamp, we'll keep the list as is
      // or sort by ID descending if they are mock IDs.
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [repos, searchQuery, typeFilter, languageFilter, sortBy]);

  // 2. DYNAMIC LANGUAGE LIST
  const languageOptions = useMemo(() => {
    const langs = new Set();
    repos.forEach(repo => {
      if (repo.language) langs.add(repo.language);
    });

    return [
      { value: 'all', label: 'All languages' },
      ...Array.from(langs).map(lang => ({
        value: lang.toLowerCase(),
        label: lang
      }))
    ];
  }, [repos]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const typeOptions = [
    { value: 'all', label: 'All' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'sources', label: 'Sources' },
    { value: 'forks', label: 'Forks' },
    { value: 'sponsored', label: 'Can be sponsored' },
    { value: 'mirrors', label: 'Mirrors' },
    { value: 'templates', label: 'Templates' },
  ];

  const sortOptions = [
    { value: 'recently-starred', label: 'Recently starred' },
    { value: 'recently-active', label: 'Recently active' },
    { value: 'most-stars', label: 'Most stars' },
  ];

  const listSortOptions = [
    { value: 'name-asc', label: 'Name ascending (A-Z)' },
    { value: 'name-desc', label: 'Name descending (Z-A)' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'last-updated', label: 'Last updated' },
  ];

  const handleCreateList = () => {
    if (listName.trim()) {
      const newList = {
        id: lists.length + 1,
        name: listName,
        emoji: '⭐',
        description: listDescription,
        isPrivate: isPrivate,
      };
      setLists([...lists, newList]);

      // Reset form
      setListName('');
      setListDescription('');
      setIsPrivate(false);
      setIsCreateListOpen(false);
    }
  };

  const isCreateButtonDisabled = !listName.trim();

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <p className="text-[#8b949e]">Loading stars...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Lists Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Lists <span className="text-gray-500 font-normal">({lists.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsListSortOpen(!isListSortOpen)}
                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                Sort
                <ChevronDown className="w-4 h-4" />
              </button>

              {isListSortOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/20 z-[90] sm:z-10 sm:bg-transparent"
                    onClick={() => setIsListSortOpen(false)}
                  />
                  <div className="fixed sm:absolute bottom-0 left-0 right-0 sm:bottom-auto sm:right-auto sm:left-0 sm:top-full sm:mt-2 w-full sm:w-64 bg-white sm:border border-t border-gray-200 sm:rounded-md rounded-t-xl shadow-2xl z-[100] flex flex-col animate-in slide-in-from-bottom-2 sm:slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 sm:px-4 sm:py-2 text-sm sm:text-xs font-semibold border-b sm:bg-white bg-[#f6f8fa] flex justify-between items-center rounded-t-xl sm:rounded-none">
                      <span className="text-sm font-semibold">Sort by</span>
                      <button
                        onClick={() => setIsListSortOpen(false)}
                        className="text-gray-400 hover:text-gray-600 sm:hidden"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="py-1 max-h-[60vh] sm:max-h-72 overflow-y-auto w-full pb-4 sm:pb-0">
                      {listSortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setIsListSortOpen(false);
                          }}
                          className="w-full px-4 py-3 sm:py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 border-b sm:border-none border-gray-100 last:border-none"
                        >
                          {option.value === 'last-updated' && (
                            <Check className="w-4 h-4 text-gray-900" />
                          )}
                          {option.value !== 'last-updated' && (
                            <span className="w-4 h-4" />
                          )}
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setIsCreateListOpen(true)}
              className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Create list
            </button>
          </div>
        </div>

        {/* Lists Display */}
        <div className="space-y-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className="p-4 border border-gray-200 rounded-md hover:border-gray-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{list.emoji}</span>
                <span className="text-sm font-medium text-gray-900">{list.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stars Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Stars</h2>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stars"
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

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Search
          </button>

          {/* Type Filter */}
          <div className="relative">
            <button
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              Type: {typeOptions.find(opt => opt.value === typeFilter)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>

            {isTypeOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/20 z-[90] sm:z-10 sm:bg-transparent"
                  onClick={() => setIsTypeOpen(false)}
                />
                <div className="fixed sm:absolute bottom-0 left-0 right-0 sm:bottom-auto sm:right-auto sm:left-0 sm:top-full sm:mt-2 w-full sm:w-56 bg-white sm:border border-t border-gray-200 sm:rounded-md rounded-t-xl shadow-2xl z-[100] flex flex-col animate-in slide-in-from-bottom-2 sm:slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 sm:hidden text-sm font-semibold border-b bg-[#f6f8fa] flex justify-between items-center rounded-t-xl">
                    <span>Select type</span>
                    <button onClick={() => setIsTypeOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="py-1 max-h-[60vh] sm:max-h-72 overflow-y-auto w-full pb-4 sm:pb-0">
                    {typeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTypeFilter(option.value);
                          setIsTypeOpen(false);
                        }}
                        className="w-full px-4 py-3 sm:py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 border-b sm:border-none border-gray-100 last:border-none"
                      >
                        {typeFilter === option.value && (
                          <Check className="w-4 h-4 text-gray-900" />
                        )}
                        {typeFilter !== option.value && (
                          <span className="w-4 h-4" />
                        )}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Language Filter */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              Language
              <ChevronDown className="w-4 h-4" />
            </button>

            {isLanguageOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/20 z-[90] sm:z-10 sm:bg-transparent"
                  onClick={() => setIsLanguageOpen(false)}
                />
                <div className="fixed sm:absolute bottom-0 left-0 right-0 sm:bottom-auto sm:right-auto sm:left-0 sm:top-full sm:mt-2 w-full sm:w-56 bg-white sm:border border-t border-gray-200 sm:rounded-md rounded-t-xl shadow-2xl z-[100] flex flex-col animate-in slide-in-from-bottom-2 sm:slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 sm:hidden text-sm font-semibold border-b bg-[#f6f8fa] flex justify-between items-center rounded-t-xl">
                    <span>Select language</span>
                    <button onClick={() => setIsLanguageOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="py-1 max-h-[60vh] sm:max-h-60 overflow-y-auto w-full pb-4 sm:pb-0">
                    {languageOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setLanguageFilter(option.value);
                          setIsLanguageOpen(false);
                        }}
                        className="w-full px-4 py-3 sm:py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 border-b sm:border-none border-gray-100 last:border-none"
                      >
                        {languageFilter === option.value && (
                          <Check className="w-4 h-4 text-gray-900" />
                        )}
                        {languageFilter !== option.value && (
                          <span className="w-4 h-4" />
                        )}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sort By Filter */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              Sort by: {sortOptions.find(opt => opt.value === sortBy)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>

            {isSortOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/20 z-[90] sm:z-10 sm:bg-transparent"
                  onClick={() => setIsSortOpen(false)}
                />
                <div className="fixed sm:absolute bottom-0 left-0 right-0 sm:bottom-auto sm:right-auto sm:left-0 sm:top-full sm:mt-2 w-full sm:w-56 bg-white sm:border border-t border-gray-200 sm:rounded-md rounded-t-xl shadow-2xl z-[100] flex flex-col animate-in slide-in-from-bottom-2 sm:slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 sm:hidden text-sm font-semibold border-b bg-[#f6f8fa] flex justify-between items-center rounded-t-xl">
                    <span>Sort by</span>
                    <button onClick={() => setIsSortOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="py-1 max-h-[60vh] sm:max-h-72 overflow-y-auto w-full pb-4 sm:pb-0">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className="w-full px-4 py-3 sm:py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 border-b sm:border-none border-gray-100 last:border-none"
                      >
                        {sortBy === option.value && (
                          <Check className="w-4 h-4 text-gray-900" />
                        )}
                        {sortBy !== option.value && (
                          <span className="w-4 h-4" />
                        )}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Repositories List */}
        {filteredRepos.length === 0 ? (
          <div className="border border-gray-200 rounded-md p-8 text-center bg-gray-50 mt-4">
            <p className="text-gray-600 font-medium">
              No results found for your active filters.
            </p>
            {(searchQuery || typeFilter !== 'all' || languageFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setLanguageFilter('all');
                }}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                className="border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Link
                        to={`/${repo.owner.login}/${encodeURIComponent(repo.name)}`}
                        className="text-blue-600 hover:underline font-semibold text-sm sm:text-base truncate"
                      >
                        {repo.full_name}
                      </Link>
                    </div>
                    <button
                      onClick={() => handleStarToggle(repo)}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-[#F6F8FA] transition-colors shrink-0"
                    >
                      <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                      <span className="text-gray-700">Starred</span>
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                    </button>
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
                      <Star className="w-3 h-3" />
                      <span>{repo.stargazers_count?.toLocaleString() || 0}</span>
                    </div>
                    <span>Updated on {new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create List Modal */}
      {isCreateListOpen && (
        <div className="fixed inset-0 bg-gray-500/55 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create list</h3>
              <button
                onClick={() => {
                  setIsCreateListOpen(false);
                  setListName('');
                  setListDescription('');
                  setIsPrivate(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Create a list to organize your starred repositories.
              </p>

              {/* Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-yellow-500 text-lg">⭐</span>
                  <input
                    type="text"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="Name this list"
                    className="block w-full pl-10 pr-3 py-2 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  placeholder="Write a description"
                  rows="4"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="mt-0.5 w-4 h-4 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-gray-900">Private</span>
                    <span className="block text-xs text-gray-600">
                      Enabling this makes the list visible only to you.
                    </span>
                  </div>
                </label>
              </div>


              <button
                onClick={handleCreateList}
                disabled={isCreateButtonDisabled}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${isCreateButtonDisabled
                  ? 'bg-green-100 text-green-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                Create
              </button>

              {/* Tip */}
              <p className="text-xs text-gray-500 mt-3">
                Tip: type <code className="bg-gray-100 px-1 rounded">:</code> to add emoji to the name or description.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stars;
