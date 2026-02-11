import React, { useState } from 'react';
import { Compass, TrendingUp, Star, GitFork, Eye, Search } from 'lucide-react';

const Explore = () => {
  const [activeTab, setActiveTab] = useState('trending');

  const tabs = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'topics', label: 'Topics', icon: Compass },
    { id: 'collections', label: 'Collections', icon: Star }
  ];

  const topics = [
    { name: 'React', count: '125k repositories' },
    { name: 'Machine Learning', count: '89k repositories' },
    { name: 'TypeScript', count: '156k repositories' },
    { name: 'Python', count: '234k repositories' },
    { name: 'Web Development', count: '178k repositories' },
    { name: 'DevOps', count: '67k repositories' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Compass className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Explore</h1>
          </div>
          <p className="text-lg text-gray-600">
            Discover interesting projects and people to follow
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics, repositories, or users..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'trending' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Trending repositories today
              </h2>
              <select className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Today</option>
                <option>This week</option>
                <option>This month</option>
              </select>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer mb-1">
                        username/trending-repo-{item}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        A comprehensive solution for modern web development with cutting-edge 
                        features and best practices built in.
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center">
                          <span className="w-3 h-3 bg-blue-500 rounded-full mr-1.5"></span>
                          TypeScript
                        </span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          2.4k stars today
                        </span>
                        <span className="flex items-center">
                          <GitFork className="w-3 h-3 mr-1" />
                          345 forks
                        </span>
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
          </div>
        )}

        {activeTab === 'topics' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Browse popular topics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-blue-600 hover:underline mb-2">
                    {topic.name}
                  </h3>
                  <p className="text-sm text-gray-600">{topic.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'collections' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Curated collections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-blue-600 hover:underline mb-2">
                        Collection Name {item}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        A curated list of awesome resources and tools for developers
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          12.5k viewers
                        </span>
                        <span>23 repositories</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
