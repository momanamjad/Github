import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, MessageCircle, Search, Filter } from 'lucide-react';

const Discussions = () => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unanswered', label: 'Unanswered' },
    { id: 'answered', label: 'Answered' }
  ];

  const categories = [
    { name: 'General', icon: '💬', count: 45 },
    { name: 'Q&A', icon: '❓', count: 32 },
    { name: 'Ideas', icon: '💡', count: 18 },
    { name: 'Show and tell', icon: '🙌', count: 23 }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Discussions</h1>
            <p className="text-sm text-gray-600 mt-1">
              Community discussions and Q&A
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 self-start sm:self-auto">
            <MessageSquare className="w-4 h-4 mr-2" />
            New discussion
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filter */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-300 mb-4">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Discussions List */}
            <div className="border border-gray-300 rounded-lg divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                          Discussion title goes here
                        </h3>
                        {item % 2 === 0 && (
                          <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Answered ✓
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-600">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          💬 General
                        </span>
                        <span>Started 2 hours ago by username</span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          12 upvotes
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          5 comments
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Most helpful */}
            <div className="border border-gray-300 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Most helpful</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="text-sm">
                    <p className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2">
                      How to contribute to open source?
                    </p>
                    <p className="text-xs text-gray-500 mt-1">24 upvotes</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discussions;
