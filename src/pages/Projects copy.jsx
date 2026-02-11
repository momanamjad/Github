import React, { useState } from 'react';
import { Table2, Search, ChevronDown, Plus } from 'lucide-react';

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
            <p className="text-sm text-gray-600 mt-1">
              Organize and track your work with project boards
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 self-start sm:self-auto">
            <Plus className="w-4 h-4 mr-2" />
            New project
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Sort
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Table2 className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                    Project Board {item}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                Track and manage issues, pull requests, and notes for this project
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Updated 3 days ago</span>
                <div className="flex items-center gap-3">
                  <span>12 items</span>
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no projects) */}
        {/* <div className="border border-gray-300 rounded-lg p-12 text-center">
          <Table2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            You don't have any projects yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create a new project to organize your issues and pull requests with custom boards
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Create your first project
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Projects;
