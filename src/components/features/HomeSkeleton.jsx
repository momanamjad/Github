import React from 'react';

export const HomeSidebarSkeleton = () => {
  return (
    <ul className="space-y-3 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <li key={i} className="flex items-center gap-2 py-1">
          <div className="w-4 h-4 rounded-full bg-gray-200" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </li>
      ))}
    </ul>
  );
};

export const HomeFeedSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border border-[#d0d7de] rounded-lg bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-gray-200" />
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-32" />
            <div className="h-3 bg-gray-100 rounded w-12 ml-auto" />
          </div>
          <div className="rounded-lg p-3 bg-[#F6F8FA] space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="flex gap-3">
              <div className="w-12 h-3 bg-gray-100 rounded" />
              <div className="w-12 h-3 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
