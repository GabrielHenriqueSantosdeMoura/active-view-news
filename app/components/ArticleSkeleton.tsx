'use client';

import React from 'react';

export default function ArticleSkeleton() {
  return (
    <div className="card overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-[16/9] skeleton" />
      
      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        {/* Title skeleton */}
        <div className="h-6 skeleton rounded-lg w-full" />
        <div className="h-6 skeleton rounded-lg w-3/4" />
        
        {/* Description skeleton */}
        <div className="h-4 skeleton rounded-lg w-full" />
        <div className="h-4 skeleton rounded-lg w-5/6" />
        
        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 skeleton rounded-lg w-24" />
          <div className="h-4 skeleton rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
}

export function ArticleSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleSkeleton key={i} />
      ))}
    </div>
  );
}

