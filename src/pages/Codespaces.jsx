import React, { useState } from 'react';
import { SearchIcon, PlusIcon, PlayIcon, TrashIcon, GearIcon, DesktopDownloadIcon } from '@primer/octicons-react';

const Codespaces = () => {
  const [activeTab, setActiveTab] = useState('active');

  const tabs = [
    { id: 'active', label: 'Active' },
    { id: 'stopped', label: 'Stopped' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Codespaces</h1>
            <p className="text-sm text-[#57606a] dark:text-[#8b949e] mt-1">
              Your cloud development environments
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-[#2da44f] hover:bg-[#2c974b] text-white rounded-md text-sm font-semibold border-0 cursor-pointer self-start sm:self-auto">
            <PlusIcon size={16} className="mr-2" />
            New codespace
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#8b949e]" />
            <input
              type="text"
              placeholder="Search codespaces..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#30363d] rounded-md bg-white dark:bg-[#161b22] text-[#1f2328] dark:text-[#c9d1d9] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 dark:border-[#30363d] mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors bg-transparent border-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#f78166] text-gray-900 dark:text-white font-semibold'
                    : 'border-transparent text-gray-500 dark:text-[#8b949e] hover:text-gray-700 hover:border-gray-300'
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
                className="border border-gray-300 dark:border-[#30363d] rounded-lg p-4 hover:shadow-md dark:hover:bg-[#161b22] bg-white dark:bg-[#0d1117] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <DesktopDownloadIcon size={18} className="text-[#57606a] dark:text-[#8b949e]" />
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        username/repository-name
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-[#57606a] dark:text-[#8b949e] mb-3">
                      main branch • Created 2 hours ago
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#57606a] dark:text-[#8b949e]">
                      <span>4-core • 8 GB RAM • 32 GB storage</span>
                      <span>Visual Studio Code</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center px-3 py-1.5 bg-[#2da44f] hover:bg-[#2c974b] text-white rounded-md text-sm font-semibold border-0 cursor-pointer">
                      <PlayIcon size={12} className="mr-1.5" />
                      Open
                    </button>
                    <button className="inline-flex items-center p-2 border border-gray-300 dark:border-[#30363d] rounded-md text-[#57606a] dark:text-[#8b949e] bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#ebedf0] dark:hover:bg-[#30363d] cursor-pointer">
                      <GearIcon size={14} />
                    </button>
                    <button className="inline-flex items-center p-2 border border-gray-300 dark:border-[#30363d] rounded-md text-red-600 dark:text-red-400 bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer">
                      <TrashIcon size={14} />
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
                className="border border-gray-300 dark:border-[#30363d] rounded-lg p-4 hover:shadow-md dark:hover:bg-[#161b22] bg-white dark:bg-[#0d1117] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <DesktopDownloadIcon size={18} className="text-[#57606a] dark:text-[#8b949e]" />
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        username/repository-name
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                        Stopped
                      </span>
                    </div>
                    <p className="text-sm text-[#57606a] dark:text-[#8b949e] mb-3">
                      main branch • Last used 1 day ago
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#57606a] dark:text-[#8b949e]">
                      <span>4-core • 8 GB RAM • 32 GB storage</span>
                      <span>Visual Studio Code</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-[#30363d] rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#30363d] bg-white dark:bg-[#21262d] cursor-pointer">
                      <PlayIcon size={12} className="mr-1.5" />
                      Start
                    </button>
                    <button className="inline-flex items-center p-2 border border-gray-300 dark:border-[#30363d] rounded-md text-red-600 dark:text-red-400 bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer">
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Codespaces;
