import React from 'react';
import { Home as HomeIcon } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Home</h1>
          <p className="text-gray-600">Your personalized feed</p>
        </div>

        {/* Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-gray-300 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <HomeIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Welcome to GitHub</h3>
                  <p className="text-sm text-gray-600">
                    Discover repositories, follow users, and stay updated with the latest in open source.
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Items */}
            <div className="border border-gray-300 rounded-lg divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">username</span> starred{' '}
                        <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
                          repository/name
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Trending Repositories */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Trending repositories</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <p className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">
                        owner/repo-name
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      A description of the trending repository
                    </p>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-xs text-gray-500">⭐ 1.2k</span>
                      <span className="text-xs text-gray-500">JavaScript</span>
                    </div>
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

export default Home;
