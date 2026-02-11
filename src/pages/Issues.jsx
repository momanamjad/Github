import React, { useState } from 'react';
import { Circle, CheckCircle2, Search, Filter } from 'lucide-react';
import { Navbar } from '@/components/layout';

const Issues = () => {
  const [activeTab, setActiveTab] = useState('open');

  const tabs = [
    { id: 'open', label: 'Open', count: 12 },
    { id: 'closed', label: 'Closed', count: 45 }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Issues</h1>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search all issues"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                {tab.id === 'open' ? (
                  <Circle className="w-4 h-4 inline mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 inline mr-2" />
                )}
                {tab.label}
                <span className="ml-2 py-0.5 px-2 bg-gray-200 text-gray-700 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Issues List */}
        <div className="border border-gray-300 rounded-lg divide-y divide-gray-200">
          {activeTab === 'open' ? (
            <>
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <Circle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                        Issue title goes here #{item}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
                        <span>#123 opened 2 days ago by username</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          enhancement
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          good first issue
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>💬 3</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                        Closed issue title #{item}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
                        <span>#123 by username was closed 1 week ago</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          bug
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>💬 8</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Empty State (Optional) */}
        {/* <div className="border border-gray-300 rounded-lg p-12 text-center">
          <Circle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No issues found</h3>
          <p className="text-gray-600">Create a new issue to get started</p>
        </div> */}
      </div>
    </div>
  );
};

export default Issues;
