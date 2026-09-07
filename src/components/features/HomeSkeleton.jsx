import React from 'react';

export const HomeSidebarSkeleton = () => {
  return (
    <ul className="space-y-3 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <li key={i} className="flex items-center gap-2 py-1">
          <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-[#30363d]" />
          <div className="h-3 bg-gray-200 dark:bg-[#30363d] rounded w-3/4" />
        </li>
      ))}
    </ul>
  );
};

export const HomeFeedSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border border-[#d0d7de] dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-[#30363d]" />
            <div className="h-3 bg-gray-200 dark:bg-[#30363d] rounded w-24" />
            <div className="h-3 bg-gray-100 dark:bg-[#21262d] rounded w-32" />
            <div className="h-3 bg-gray-100 dark:bg-[#21262d] rounded w-12 ml-auto" />
          </div>
          <div className="rounded-lg p-3 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-[#30363d] rounded w-1/3" />
            <div className="h-3 bg-gray-100 dark:bg-[#21262d] rounded w-full" />
            <div className="flex gap-3 pt-2">
              <div className="w-12 h-3 bg-gray-100 dark:bg-[#21262d] rounded" />
              <div className="w-12 h-3 bg-gray-100 dark:bg-[#21262d] rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
