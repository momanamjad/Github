import React from 'react';

export const CopilotSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gray-200" />
          <div className="h-8 bg-gray-200 rounded w-48" />
        </div>
        <div className="h-4 bg-gray-100 rounded w-2/3" />
      </div>

      {/* Hero Section Skeleton */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
            </div>
            <div className="flex gap-3">
              <div className="w-32 h-10 bg-gray-200 rounded-md" />
              <div className="w-32 h-10 bg-gray-100 rounded-md" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-32" />
        </div>
      </div>

      {/* Features Grid Skeleton */}
      <div className="mb-12">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="w-10 h-10 rounded bg-gray-200" />
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
