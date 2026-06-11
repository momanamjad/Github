import React from 'react';

export const RepoSkeleton = () => {
  return (
    <div className="py-6 flex justify-between items-start border-b border-[#d0d7de] last:border-0 animate-pulse">
      <div className="flex-1 min-w-0 pr-4">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
        </div>

        {/* Meta info skeleton */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-200" />
            <div className="w-12 h-3 bg-gray-200 rounded" />
          </div>
          <div className="w-10 h-3 bg-gray-200 rounded" />
          <div className="w-24 h-3 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-16 h-7 bg-gray-100 rounded-md" />
        <div className="w-16 h-7 bg-gray-100 rounded-md" />
      </div>
    </div>
  );
};
