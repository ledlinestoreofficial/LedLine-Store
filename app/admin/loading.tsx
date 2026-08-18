import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-[#EAEAEA] rounded-lg" />
          <div className="h-3.5 w-72 bg-[#F3F4F6] rounded-md" />
        </div>
        <div className="h-10 w-36 bg-[#EAEAEA] rounded-xl" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-[#E5E5E5] rounded-3xl p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-[#F3F4F6] rounded" />
              <div className="w-8 h-8 rounded-xl bg-[#EAEAEA]" />
            </div>
            <div className="h-7 w-28 bg-[#EAEAEA] rounded-lg" />
            <div className="h-3 w-24 bg-[#F3F4F6] rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Table/Grid Skeleton */}
      <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
          <div className="h-5 w-36 bg-[#EAEAEA] rounded-lg" />
          <div className="h-4 w-20 bg-[#F3F4F6] rounded" />
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-14 bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EAEAEA]" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-40 bg-[#EAEAEA] rounded" />
                  <div className="h-2.5 w-24 bg-[#F3F4F6] rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-[#EAEAEA] rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
