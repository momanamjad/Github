import React, { useState } from 'react';
import { PackageIcon, SearchIcon, StarIcon, DownloadIcon, FilterIcon, GraphIcon, TagIcon } from '@primer/octicons-react';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('apps');

  const tabs = [
    { id: 'apps', label: 'Apps' },
    { id: 'actions', label: 'Actions' },
    { id: 'verified', label: 'Verified creators' }
  ];

  const categories = [
    'Code quality',
    'Code review',
    'Continuous integration',
    'Dependency management',
    'Deployment',
    'IDEs',
    'Mobile',
    'Monitoring',
    'Project management',
    'Publishing',
    'Security',
    'Testing',
    'Utilities'
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <PackageIcon size={32} className="text-[#2da44f]" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
          </div>
          <p className="text-lg text-[#57606a] dark:text-[#8b949e]">
            Discover and install apps and actions to enhance your workflow
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#8b949e]" />
            <input
              type="text"
              placeholder="Search apps and actions..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Tabs */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Type</h3>
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium border-0 cursor-pointer transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-[#1f242c] text-[#0969da] dark:text-[#58a6ff] font-semibold'
                        : 'text-gray-700 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#161b22]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="border-t border-gray-200 dark:border-[#30363d] pt-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 rounded-md text-sm border-0 bg-transparent text-gray-700 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#161b22] cursor-pointer transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="border-t border-gray-200 dark:border-[#30363d] pt-6 mt-6">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-[#30363d] rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#21262d] hover:bg-gray-50 dark:hover:bg-[#30363d] cursor-pointer">
                <FilterIcon size={16} className="mr-2" />
                More filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-[#1f242c]/50 dark:to-purple-950/20 border border-blue-200 dark:border-[#30363d] rounded-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <GraphIcon size={18} className="text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Featured Apps</h2>
              </div>
              <p className="text-gray-700 dark:text-[#8b949e]">
                Discover the most popular and trusted apps in the marketplace
              </p>
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#57606a] dark:text-[#8b949e]">
                Showing {activeTab === 'apps' ? 'apps' : activeTab === 'actions' ? 'actions' : 'verified creators'}
              </p>
              <select className="px-3 py-1.5 border border-gray-300 dark:border-[#30363d] rounded-md text-sm bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] focus:outline-none">
                <option>Most popular</option>
                <option>Recently added</option>
                <option>Most stars</option>
                <option>Most downloads</option>
              </select>
            </div>

            {/* Apps/Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="border border-gray-300 dark:border-[#30363d] rounded-lg p-6 hover:shadow-lg dark:hover:bg-[#161b22] bg-white dark:bg-[#0d1117] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-[#0969da] dark:hover:text-[#58a6ff] mb-1">
                        {activeTab === 'apps' ? 'App Name' : 'Action Name'} {item}
                      </h3>
                      <p className="text-xs text-[#57606a] dark:text-[#8b949e]">by Developer Name</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[#57606a] dark:text-[#8b949e] mb-4 line-clamp-2">
                    Automate your workflow with this powerful {activeTab === 'apps' ? 'app' : 'action'} 
                    that integrates seamlessly with GitHub
                  </p>

                  <div className="flex items-center justify-between mb-4 text-xs text-[#57606a] dark:text-[#8b949e]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center">
                        <StarIcon size={14} className="mr-1 text-yellow-500 fill-yellow-500" />
                        4.8
                      </span>
                      <span className="flex items-center">
                        <DownloadIcon size={14} className="mr-1" />
                        12.5k
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      {activeTab === 'verified' ? 'Verified' : 'Free'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-[#2da44f] hover:bg-[#2c974b] text-white rounded-md text-sm font-semibold border-0 cursor-pointer">
                      Install
                    </button>
                    <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-[#30363d] rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#21262d] hover:bg-gray-50 dark:hover:bg-[#30363d] cursor-pointer">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-8 text-center">
              <button className="inline-flex items-center px-6 py-2 border border-gray-300 dark:border-[#30363d] rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#21262d] hover:bg-gray-50 dark:hover:bg-[#30363d] cursor-pointer">
                Load more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
