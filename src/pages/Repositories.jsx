import React, { useState } from 'react';
import { Book, Star, GitFork, Search, ChevronDown } from 'lucide-react';

const Repositories = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Repositories</h1>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 self-start sm:self-auto">
            <Book className="w-4 h-4 mr-2" />
            New
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Find a repository..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Type
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Language
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Sort
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Repository List */}
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="pb-6 border-b border-gray-200 last:border-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Book className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer">
                      username/repository-name-{item}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-gray-300 text-gray-700">
                      Public
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    A brief description of what this repository does and why it's useful
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-yellow-400 rounded-full mr-1.5"></span>
                      JavaScript
                    </span>
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      125
                    </span>
                    <span className="flex items-center">
                      <GitFork className="w-3 h-3 mr-1" />
                      42
                    </span>
                    <span>Updated 2 days ago</span>
                  </div>
                </div>
                <button className="flex-shrink-0 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Star className="w-3 h-3 mr-1.5" />
                  Star
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded-md shadow-sm -space-x-px">
            <button className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Previous
            </button>
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              1
            </button>
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
              2
            </button>
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              3
            </button>
            <button className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Repositories;
