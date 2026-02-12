import React, { useState } from 'react';
import { X, ChevronDown, Search, Plus, Book, Star, GitFork, Circle } from 'lucide-react';

export default function GitHubDashboard() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Recent activity');
  const [selectedType, setSelectedType] = useState('All');
  
  const filterOptions = [
    'Recent activity',
    'Recently starred',
    'Recently watched',
    'Your repositories',
    'Public activity'
  ];
  
  const typeOptions = ['All', 'Public', 'Private', 'Sources', 'Forks', 'Archived', 'Mirrors'];

  const activities = [
    {
      user: 'johndoe',
      action: 'created a repository',
      repo: 'johndoe/awesome-project',
      time: '2 hours ago',
      description: 'A new awesome project for learning React and Tailwind',
      language: 'JavaScript',
      stars: 12,
      forks: 3
    },
    {
      user: 'janedoe',
      action: 'starred',
      repo: 'facebook/react',
      time: '3 hours ago',
      description: 'The library for web and native user interfaces',
      language: 'JavaScript',
      stars: 234000,
      forks: 48000
    },
    {
      user: 'devuser',
      action: 'forked',
      repo: 'tailwindlabs/tailwindcss',
      time: '5 hours ago',
      description: 'A utility-first CSS framework for rapid UI development',
      language: 'CSS',
      stars: 89000,
      forks: 4500
    },
    {
      user: 'codemaster',
      action: 'created a repository',
      repo: 'codemaster/ml-toolkit',
      time: '1 day ago',
      description: 'Machine learning toolkit with Python',
      language: 'Python',
      stars: 45,
      forks: 8
    },
    {
      user: 'webdev',
      action: 'starred',
      repo: 'vercel/next.js',
      time: '1 day ago',
      description: 'The React Framework for the Web',
      language: 'JavaScript',
      stars: 132000,
      forks: 28000
    }
  ];

  const repositories = [
    { name: 'awesome-project', description: 'My awesome project', language: 'JavaScript', stars: 23, updated: '2 hours ago', private: false },
    { name: 'portfolio-site', description: 'Personal portfolio website', language: 'TypeScript', stars: 5, updated: '1 day ago', private: false },
    { name: 'secret-project', description: 'Top secret work in progress', language: 'Python', stars: 0, updated: '3 days ago', private: true }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <svg className="w-8 h-8 fill-white" viewBox="0 0 16 16">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              <nav className="hidden md:flex items-center gap-4">
                <input 
                  type="text" 
                  placeholder="Search or jump to..."
                  className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm w-72 focus:outline-none focus:border-[#1f6feb] focus:ring-1 focus:ring-[#1f6feb]"
                />
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-[#e6edf3] hover:text-white text-sm hidden md:block">Pull requests</button>
              <button className="text-[#e6edf3] hover:text-white text-sm hidden md:block">Issues</button>
              <button className="text-[#e6edf3] hover:text-white text-sm hidden md:block">Codespaces</button>
              <button className="text-[#e6edf3] hover:text-white text-sm hidden md:block">Marketplace</button>
              <button className="text-[#e6edf3] hover:text-white text-sm hidden md:block">Explore</button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500"></div>
                <div>
                  <h2 className="text-xl font-semibold text-[#e6edf3]">YourUsername</h2>
                  <p className="text-sm text-[#7d8590]">yourhandle</p>
                </div>
              </div>
              <button className="w-full bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md py-1.5 text-sm font-medium text-[#e6edf3] transition-colors">
                Edit profile
              </button>
            </div>

            {/* Repositories */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#e6edf3]">Top Repositories</h3>
                <button className="text-[#1f6feb] hover:underline text-xs">New</button>
              </div>
              <div className="space-y-2">
                {repositories.map((repo, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4 text-[#7d8590]" />
                      <a href="#" className="text-sm text-[#1f6feb] hover:underline">{repo.name}</a>
                      {repo.private && (
                        <span className="text-xs px-1.5 py-0.5 border border-[#30363d] rounded-full text-[#7d8590]">Private</span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-xs text-[#7d8590] ml-6 mt-1">{repo.description}</p>
                    )}
                  </div>
                ))}
              </div>
              <button className="text-[#7d8590] hover:text-[#1f6feb] text-xs mt-3">Show more</button>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <h3 className="text-sm font-semibold text-[#e6edf3] mb-3">Recent activity</h3>
              <div className="space-y-3">
                <div className="text-xs text-[#7d8590]">
                  <p>Created <a href="#" className="text-[#1f6feb] hover:underline">awesome-project</a></p>
                  <p className="text-[#7d8590] mt-1">2 hours ago</p>
                </div>
                <div className="text-xs text-[#7d8590]">
                  <p>Starred <a href="#" className="text-[#1f6feb] hover:underline">facebook/react</a></p>
                  <p className="text-[#7d8590] mt-1">3 hours ago</p>
                </div>
              </div>
              <button className="text-[#7d8590] hover:text-[#1f6feb] text-xs mt-3">Show more activity</button>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-2 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <button 
                  onClick={() => setIsFilterModalOpen(true)}
                  className="flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md px-4 py-1.5 text-sm font-medium text-[#e6edf3] transition-colors"
                >
                  <span>{selectedFilter}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md px-4 py-1.5 text-sm font-medium text-[#e6edf3] transition-colors">
                  <span>{selectedType}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <button className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md px-4 py-1.5 text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New repository</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>

            {/* Activity Feed */}
            <div className="space-y-4">
              {activities.map((activity, idx) => (
                <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-[#3d444d] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-[#e6edf3]">{activity.user}</span>
                        <span className="text-sm text-[#7d8590]">{activity.action}</span>
                        <a href="#" className="text-sm text-[#1f6feb] hover:underline font-semibold truncate">{activity.repo}</a>
                        <span className="text-xs text-[#7d8590]">{activity.time}</span>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-[#7d8590] mb-3">{activity.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#7d8590]">
                        {activity.language && (
                          <div className="flex items-center gap-1.5">
                            <Circle className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span>{activity.language}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5" />
                          <span>{activity.stars.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GitFork className="w-3.5 h-3.5" />
                          <span>{activity.forks.toLocaleString()}</span>
                        </div>
                        <button className="text-[#1f6feb] hover:underline ml-auto">Star</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <button className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md px-6 py-2 text-sm font-medium text-[#e6edf3] transition-colors">
                Load more activity
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setIsFilterModalOpen(false)}
          ></div>
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 animate-slideDown">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl w-full max-w-md">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
                <h2 className="text-lg font-semibold text-[#e6edf3]">Filter activity</h2>
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-[#7d8590] hover:text-[#e6edf3] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#e6edf3] mb-2">Show</label>
                  <div className="space-y-1">
                    {filterOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedFilter(option)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedFilter === option 
                            ? 'bg-[#1f6feb] text-white' 
                            : 'text-[#e6edf3] hover:bg-[#21262d]'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#e6edf3] mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {typeOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedType(option)}
                        className={`px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedType === option 
                            ? 'bg-[#1f6feb] text-white' 
                            : 'text-[#e6edf3] hover:bg-[#21262d] border border-[#30363d]'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-2 p-4 border-t border-[#30363d]">
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="flex-1 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md py-2 text-sm font-medium transition-colors"
                >
                  Apply filters
                </button>
                <button 
                  onClick={() => {
                    setSelectedFilter('Recent activity');
                    setSelectedType('All');
                    setIsFilterModalOpen(false);
                  }}
                  className="flex-1 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] rounded-md py-2 text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
