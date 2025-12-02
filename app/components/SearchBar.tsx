'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, XIcon, TrendingUpIcon } from './Icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  favoriteTopics: string[];
  currentQuery: string;
}

export default function SearchBar({ onSearch, favoriteTopics, currentQuery }: SearchBarProps) {
  const [query, setQuery] = useState(currentQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      inputRef.current?.blur();
    }
  };

  const handleTopicClick = (topic: string) => {
    setQuery(topic);
    onSearch(topic);
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative flex items-center transition-all duration-200 ${
            isFocused
              ? 'ring-2 ring-[var(--primary)] ring-opacity-50'
              : ''
          }`}
          style={{ borderRadius: '16px' }}
        >
          <SearchIcon
            size={20}
            className="absolute left-4 text-[var(--text-muted)] pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for news topics..."
            className="w-full py-4 pl-12 pr-24 bg-white border-2 border-[var(--border)] rounded-2xl text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors text-lg"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-20 p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
            >
            </button>
          )}
          <button
            type="submit"
            disabled={!query.trim()}
            className="absolute right-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>
      </form>

      {/* Quick topics */}
      {favoriteTopics.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
            <TrendingUpIcon size={14} />
            Quick:
          </span>
          {favoriteTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => handleTopicClick(topic)}
              className={`tag cursor-pointer transition-all ${
                currentQuery.toLowerCase() === topic.toLowerCase()
                  ? 'tag-active'
                  : ''
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
