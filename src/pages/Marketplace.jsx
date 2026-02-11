import React, { useState } from 'react';
import { ShoppingBag, Search, Star, Download, Filter, TrendingUp } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingBag className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          </div>
          <p className="text-lg text-gray-600">
            Discover and install apps and actions to enhance your workflow
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search apps and actions..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Tabs */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Type</h3>
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                More filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Featured Apps</h2>
              </div>
              <p className="text-gray-700">
                Discover the most popular and trusted apps in the marketplace
              </p>
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                Showing {activeTab === 'apps' ? 'apps' : activeTab === 'actions' ? 'actions' : 'verified creators'}
              </p>
              <select className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                  className="border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 mb-1">
                        {activeTab === 'apps' ? 'App Name' : 'Action Name'} {item}
                      </h3>
                      <p className="text-xs text-gray-500">by Developer Name</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    Automate your workflow with this powerful {activeTab === 'apps' ? 'app' : 'action'} 
                    that integrates seamlessly with GitHub
                  </p>

                  <div className="flex items-center justify-between mb-4 text-xs text-gray-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
                        4.8
                      </span>
                      <span className="flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        12.5k
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {activeTab === 'verified' ? 'Verified' : 'Free'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                      Install
                    </button>
                    <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-8 text-center">
              <button className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
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
