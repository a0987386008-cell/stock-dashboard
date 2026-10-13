// app/components/SourceTags.tsx
'use client';

import React, { useState } from 'react';

interface Source {
  etf_name: string;
  weight: number;
}

interface SourceTagsProps {
  sources: Source[];
  limit?: number;
}

export default function SourceTags({ sources, limit = 3 }: SourceTagsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!sources || sources.length === 0) return <span className="text-xs text-slate-400">無直接來源</span>;

  const visibleSources = isExpanded ? sources : sources.slice(0, limit);
  const hasMore = sources.length > limit;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleSources.map((src, index) => (
        <span 
          key={index} 
          className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
        >
          {src.etf_name} <span className="text-blue-500 font-semibold">({src.weight}%)</span>
        </span>
      ))}
      
      {hasMore && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ml-1 transition-colors focus:outline-none"
        >
          {isExpanded ? "收起 ▲" : `+${sources.length - limit} 更多 ▼`}
        </button>
      )}
    </div>
  );
}