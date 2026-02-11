import React, { useState } from 'react';
import { Package, Search, Star, Download, Code, Filter, TrendingUp } from 'lucide-react';

const MCPRegistry = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All packages' },
    { id: 'ai', label: 'AI & ML' },
    { id: 'data', label: 'Data processing' },
    { id: 'web', label: 'Web frameworks' },
    { id: 'tools', label: 'Developer tools' },
    { id: 'testing', label: 'Testing' },
    { id: 'security', label: 'Security' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">MCP Registry</h1>
          </div>
          <p className="text-lg text-gray-600">
            Discover and share Model Context Protocol servers
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search MCP servers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-900">245</p>
                <p className="text-sm text-purple-700">Total servers</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Download className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-900">52.4k</p>
                <p className="text-sm text-blue-700">Total downloads</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-900">34</p>
                <p className="text-sm text-green-700">New this week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-50 text-purple-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Filters</h3>
              <div className="space-y-3">
                <label className="flex items-center text-sm text-gray-700">
                  <input type="checkbox" className="mr-2 rounded" />
                  Verified only
                </label>
                <label className="flex items-center text-sm text-gray-700">
                  <input type="checkbox" className="mr-2 rounded" />
                  Recently updated
                </label>
                <label className="flex items-center text-sm text-gray-700">
                  <input type="checkbox" className="mr-2 rounded" />
                  Has documentation
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                {selectedCategory === 'all' ? 'All servers' : categories.find(c => c.id === selectedCategory)?.label}
              </p>
              <select className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Most popular</option>
                <option>Recently added</option>
                <option>Most downloads</option>
                <option>Most stars</option>
              </select>
            </div>

            {/* MCP Servers List */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-blue-600 hover:underline">
                          @mcp/server-name-{item}
                        </h3>
                        {item % 3 === 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        A powerful MCP server that provides tools for {item % 2 === 0 ? 'data processing' : 'AI integration'} 
                        with comprehensive documentation and examples
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center">
                          <Code className="w-3 h-3 mr-1" />
                          TypeScript
                        </span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-yellow-500" />
                          {Math.floor(Math.random() * 500) + 100}
                        </span>
                        <span className="flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {(Math.random() * 10).toFixed(1)}k downloads
                        </span>
                        <span>Updated 2 days ago</span>
                      </div>

                      {/* Tools/Capabilities */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          tools: {Math.floor(Math.random() * 10) + 3}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          resources: {Math.floor(Math.random() * 5) + 1}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 whitespace-nowrap">
                        <Download className="w-3 h-3 mr-1.5" />
                        Install
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
                        View docs
                      </button>
                    </div>
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
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-purple-50 text-sm font-medium text-purple-600">
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
      </div>
    </div>
  );
};

export default MCPRegistry;
