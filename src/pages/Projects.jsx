import React, { useState } from 'react';
import { Search, X, Clock, User, ChevronDown } from 'lucide-react';
import EmptyStateClockIcon from "../components/ui/icons/EmptyStateClockIcon";
import FooterGithubIcon from "../components/ui/icons/FooterGithubIcon";

export default function Projects() {
  const [activeTab, setActiveTab] = useState('recently-viewed');
  const [searchQuery, setSearchQuery] = useState('');

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
                <div className={`relative transition-all ${activeTab === 'recently-viewed' ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md" : ""}`}>

              <button
                     onClick={() => setActiveTab("recently-viewed")}

                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'recently-viewed'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Recently viewed</span>
              </button>
</div>
                <div className={`relative transition-all ${activeTab === 'created-by-me' ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-blue-600 before:rounded-r-md" : ""}`}>

              <button
                onClick={() => setActiveTab('created-by-me')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'created-by-me'
                    ? 'bg-gray-100 text-gray-900  '
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" />
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
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                  Recently viewed
                </h1>

                {/* Search Bar */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="is:open"
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

                {/* Results Count */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">0 recently viewed</p>
                </div>

                {/* Empty State */}
                <div className="border border-gray-200 rounded-md p-16 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 mb-4 flex items-center justify-center">
                    <EmptyStateClockIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    No open projects
                  </h3>
                </div>
              </div>
            )}

            {/* Created by Me Tab */}
            {activeTab === 'created-by-me' && (
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                  Created by me
                </h1>

                {/* Search Bar */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="is:open creator:@me"
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

                {/* Tabs and Sort */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-200">
                  <div className="flex gap-6">
                    <button className="pb-3 px-1 border-b-2 border-gray-900 font-medium text-sm text-gray-900">
                      Open <span className="ml-1 text-gray-600">0</span>
                    </button>
                    <button className="pb-3 px-1 border-b-2 border-transparent font-medium text-sm text-gray-600 hover:text-gray-900 hover:border-gray-300">
                      Closed <span className="ml-1">1</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sort
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Empty State */}
                <div className="border border-gray-200 rounded-md p-16 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 mb-4 flex items-center justify-center">
                    <EmptyStateClockIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    No open projects
                  </h3>
                </div>
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
              <FooterGithubIcon className="w-6 h-6" />
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
