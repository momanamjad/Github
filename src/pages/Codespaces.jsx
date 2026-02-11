import React, { useState } from 'react';
import { Monitor, Play, Trash2, Settings, Plus, Search } from 'lucide-react';

const Codespaces = () => {
  const [activeTab, setActiveTab] = useState('active');

  const tabs = [
    { id: 'active', label: 'Active' },
    { id: 'stopped', label: 'Stopped' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Codespaces</h1>
            <p className="text-sm text-gray-600 mt-1">
              Your cloud development environments
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 self-start sm:self-auto">
            <Plus className="w-4 h-4 mr-2" />
            New codespace
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search codespaces..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 mb-6">
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

        {/* Codespaces List */}
        {activeTab === 'active' ? (
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        username/repository-name
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      main branch • Created 2 hours ago
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>4-core • 8 GB RAM • 32 GB storage</span>
                      <span>Visual Studio Code</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                      <Play className="w-3 h-3 mr-1.5" />
                      Open
                    </button>
                    <button className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="inline-flex items-center p-2 border border-gray-300 rounded-md text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">
                        username/repository-name
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                        Stopped
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      main branch • Last used 1 day ago
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>4-core • 8 GB RAM • 32 GB storage</span>
                      <span>Visual Studio Code</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <Play className="w-3 h-3 mr-1.5" />
                      Start
                    </button>
                    <button className="inline-flex items-center p-2 border border-gray-300 rounded-md text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {/* <div className="border border-gray-300 rounded-lg p-12 text-center">
          <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            You don't have any codespaces yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create a codespace to start developing in the cloud with Visual Studio Code
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Create codespace
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Codespaces;
