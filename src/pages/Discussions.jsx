import React, { useState, useEffect } from 'react';
import { SearchIcon, XIcon, ClockIcon, PersonIcon, ChevronDownIcon, CommentDiscussionIcon } from '@primer/octicons-react';
import EmptyStateClockIcon from "../components/ui/icons/EmptyStateClockIcon";
import EmptyStateDiscussionIcon from "../components/ui/icons/EmptyStateDiscussionIcon";
import FooterGithubIcon from "../components/ui/icons/FooterGithubIcon";
import { useGitHub } from "../contexts/GitHubContext";
import { apiClient } from "../services/apiClient";

export default function GitHubClone() {
  const [mainSection, setMainSection] = useState('projects');  
  const [projectTab, setProjectTab] = useState('recently-viewed');  
  const [discussionTab, setDiscussionTab] = useState('created'); 
  const [searchQuery, setSearchQuery] = useState('');
  const { user, repositories } = useGitHub();
  const activeUsername = user?.login || "moman";

  const [discussionsList, setDiscussionsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGlobalDiscussions = async () => {
    if (!repositories || repositories.length === 0) return;
    setLoading(true);
    try {
      const allPromises = repositories.map(async (repo) => {
        try {
          const res = await apiClient(`/repos/${repo._id || repo.id}/discussions`);
          return (res?.data || []).map(d => ({ ...d, repoName: repo.name, repoOwner: repo.owner?.login || user?.login }));
        } catch (e) {
          console.warn(e);
          return [];
        }
      });
      const resolved = await Promise.all(allPromises);
      setDiscussionsList(resolved.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalDiscussions();
  }, [repositories]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              <div className="mb-4">
                <h3 className="px-4 text-xs font-semibold text-[#57606a] dark:text-[#8b949e] uppercase tracking-wider mb-2">
                  Projects
                </h3>
                
                <div className={`relative transition-all ${mainSection === 'projects' && projectTab === 'recently-viewed' ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md" : ""}`}>
                  <button
                    onClick={() => {
                      setMainSection('projects');
                      setProjectTab('recently-viewed');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all rounded-md border-0 cursor-pointer bg-transparent text-left ${
                      mainSection === 'projects' && projectTab === 'recently-viewed'
                        ? "bg-[#ECEEF0] dark:bg-[#30363d] text-[#24292f] dark:text-white font-medium"
                        : "text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]"
                    }`}
                  >
                    <ClockIcon size={16} />
                    <span>Recently viewed</span>
                  </button>
                </div>

                <div className={`relative transition-all ${mainSection === 'projects' && projectTab === 'created-by-me' ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md" : ""}`}>
                  <button
                    onClick={() => {
                      setMainSection('projects');
                      setProjectTab('created-by-me');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all rounded-md border-0 cursor-pointer bg-transparent text-left ${
                      mainSection === 'projects' && projectTab === 'created-by-me'
                        ? "bg-[#ECEEF0] dark:bg-[#30363d] text-[#24292f] dark:text-white font-medium"
                        : "text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]"
                    }`}
                  >
                    <PersonIcon size={16} />
                    <span>Created by me</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="px-4 text-xs font-semibold text-[#57606a] dark:text-[#8b949e] uppercase tracking-wider mb-2">
                  Discussions
                </h3>
                <div className={`relative transition-all ${mainSection === 'discussions' ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md" : ""}`}>
                  <button
                    onClick={() => {
                      setMainSection('discussions');
                      setDiscussionTab('created');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all rounded-md border-0 cursor-pointer bg-transparent text-left ${
                      mainSection === 'discussions'
                        ? "bg-[#ECEEF0] dark:bg-[#30363d] text-[#24292f] dark:text-white font-medium"
                        : "text-[#57606a] dark:text-[#8b949e] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]"
                    }`}
                  >
                    <CommentDiscussionIcon size={16} />
                    <span>Discussions</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>

          <div className="flex-1">
            {mainSection === 'projects' && (
              <>
                {projectTab === 'recently-viewed' && (
                  <div>
                    <h1 className="text-2xl font-semibold text-[#24292f] dark:text-white mb-6">
                      Recently viewed
                    </h1>

                    <div className="relative mb-6">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="is:open"
                        className="block w-full pl-10 pr-10 py-2 border border-[#d0d7de] dark:border-[#30363d] rounded-md leading-5 bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

                    <div className="mb-4">
                      <p className="text-sm text-[#57606a] dark:text-[#8b949e]">0 recently viewed</p>
                    </div>

                    <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-16 bg-white dark:bg-[#161b22] flex flex-col items-center justify-center">
                      <div className="w-12 h-12 mb-4 flex items-center justify-center">
                        <EmptyStateClockIcon className="w-12 h-12 text-[#57606a] dark:text-[#8b949e]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#24292f] dark:text-white">
                        No open projects
                      </h3>
                    </div>
                  </div>
                )}

                {projectTab === 'created-by-me' && (
                  <div>
                    <h1 className="text-2xl font-semibold text-[#24292f] dark:text-white mb-6">
                      Created by me
                    </h1>

                    {/* Search Bar */}
                    <div className="relative mb-6">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="is:open creator:@me"
                        className="block w-full pl-10 pr-10 py-2 border border-[#d0d7de] dark:border-[#30363d] rounded-md leading-5 bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

                    <div className="flex items-center justify-between mb-6 border-b border-[#d0d7de] dark:border-[#30363d]">
                      <div className="flex gap-6">
                        <button className="pb-3 px-1 border-b-2 border-gray-900 dark:border-white font-medium text-sm text-[#24292f] dark:text-white bg-transparent border-0 cursor-pointer">
                          Open <span className="ml-1 text-[#57606a] dark:text-[#8b949e]">0</span>
                        </button>
                        <button className="pb-3 px-1 border-b-2 border-transparent font-medium text-sm text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white hover:border-gray-300 bg-transparent border-0 cursor-pointer">
                          Closed <span className="ml-1">1</span>
                        </button>
                      </div>
                      <button className="flex items-center gap-1 text-sm font-medium text-[#57606a] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-white bg-transparent border-0 cursor-pointer">
                        Sort
                        <ChevronDownIcon size={14} />
                      </button>
                    </div>

                    <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-16 bg-white dark:bg-[#161b22] flex flex-col items-center justify-center">
                      <div className="w-12 h-12 mb-4 flex items-center justify-center">
                        <EmptyStateClockIcon className="w-12 h-12 text-[#57606a] dark:text-[#8b949e]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#24292f] dark:text-white">
                        No open projects
                      </h3>
                    </div>
                  </div>
                )}
              </>
            )}

            {mainSection === 'discussions' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setDiscussionTab('created')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-0 ${
                      discussionTab === 'created'
                        ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold'
                        : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:border-gray-300'
                    }`}
                  >
                    Created
                  </button>
                  <button
                    onClick={() => setDiscussionTab('commented')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-0 ${
                      discussionTab === 'commented'
                        ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold'
                        : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:border-gray-300'
                    }`}
                  >
                    Commented
                  </button>

                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon size={16} className="text-[#57606a] dark:text-[#8b949e]" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={discussionTab === 'created' ? `author:${activeUsername}` : `commenter:${activeUsername}`}
                      className="block w-full pl-10 pr-10 py-2 border border-[#d0d7de] dark:border-[#30363d] rounded-md leading-5 bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent border-0 cursor-pointer"
                      >
                        <XIcon size={16} className="text-[#57606a] dark:text-[#8b949e] hover:text-black dark:hover:text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-sm text-[#57606a] dark:text-[#8b949e]">Loading discussions...</div>
                ) : discussionsList.length > 0 ? (
                  <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md divide-y divide-[#d0d7de] dark:divide-[#30363d] bg-white dark:bg-[#161b22]">
                    {discussionsList
                      .filter(d => {
                        const q = searchQuery.toLowerCase();
                        if (discussionTab === 'created') {
                          return d.creator?.login === activeUsername && d.title.toLowerCase().includes(q);
                        } else {
                          return d.replies?.some(r => r.author?.login === activeUsername) && d.title.toLowerCase().includes(q);
                        }
                      })
                      .map(d => (
                        <div key={d._id} className="p-4 hover:bg-[#f6f8fa] dark:hover:bg-[#1f242c] flex items-start gap-3 text-left">
                          <CommentDiscussionIcon size={20} className="text-[#238636] mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-xs text-[#57606a] dark:text-[#8b949e]">
                              <span className="font-semibold text-[#24292f] dark:text-[#c9d1d9]">{d.repoOwner}/{d.repoName}</span>
                              <span>•</span>
                              <span className="capitalize">Category: {d.category}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-[#1f2328] dark:text-white mt-0.5">
                              <a href={`/${d.repoOwner}/${d.repoName}`} className="hover:text-[#0969da] dark:hover:text-[#58a6ff] hover:underline">
                                {d.title}
                              </a>
                            </h4>
                            <p className="text-xs text-[#57606a] dark:text-[#8b949e] mt-1">
                              started {new Date(d.createdAt).toLocaleDateString()} by <span className="font-semibold">{d.creator?.login}</span> · {d.replies?.length || 0} replies
                            </p>
                          </div>
                        </div>
                      ))}
                    {discussionsList.filter(d => {
                      const q = searchQuery.toLowerCase();
                      if (discussionTab === 'created') {
                        return d.creator?.login === activeUsername && d.title.toLowerCase().includes(q);
                      } else {
                        return d.replies?.some(r => r.author?.login === activeUsername) && d.title.toLowerCase().includes(q);
                      }
                    }).length === 0 && (
                      <div className="p-12 text-center text-xs text-[#57606a] dark:text-[#8b949e]">No discussions match your filter criteria.</div>
                    )}
                  </div>
                ) : (
                  <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-16 bg-white dark:bg-[#161b22] flex flex-col items-center justify-center">
                    <div className="w-12 h-12 mb-4 flex items-center justify-center">
                      <EmptyStateDiscussionIcon className="w-12 h-12 text-[#57606a] dark:text-[#8b949e]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#24292f] dark:text-white mb-2">
                      No discussions match the selected filters.
                    </h3>
                    <p className="text-sm text-[#57606a] dark:text-[#8b949e]">
                      Discussions are used to ask questions and have open-ended conversations.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#d0d7de] dark:border-[#30363d] mt-16 bg-[#f6f8fa] dark:bg-[#0d1117]">
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
              Community
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
