import React, { useState } from 'react';
import { SearchIcon, ProjectIcon, ChevronDownIcon } from '@primer/octicons-react';

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="py-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={16} className="text-gray-400 dark:text-[#8b949e]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all projects"
            className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 dark:border-[#30363d] rounded-md leading-5 bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#c9d1d9] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 bg-[#f6f8fa] dark:bg-[#21262d] text-[#24292f] dark:text-[#c9d1d9] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#eaeef2] dark:hover:bg-[#30363d] cursor-pointer">
            Sort
            <ChevronDownIcon size={14} />
          </button>
          <button className="text-sm font-semibold px-3 py-1.5 bg-[#2da44e] text-white rounded-md hover:bg-[#2c974b] border border-transparent cursor-pointer">
            New project
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-12 bg-white dark:bg-[#0d1117] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 mb-4 rounded-full bg-[#f6f8fa] dark:bg-[#161b22] flex items-center justify-center text-gray-500">
          <ProjectIcon size={24} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Create your first project
        </h3>
        <p className="text-sm text-gray-500 dark:text-[#8b949e] max-w-lg mb-6 leading-relaxed">
          Projects are a customizable spreadsheet, board, and roadmap tool. Keep your tasks, issues, and PRs organized, and track progress right inside your profile.
        </p>
        <button className="text-sm font-semibold px-4 py-2 bg-[#2da44e] text-white rounded-md hover:bg-[#2c974b] border border-transparent cursor-pointer">
          New project
        </button>
      </div>
    </div>
  );
}