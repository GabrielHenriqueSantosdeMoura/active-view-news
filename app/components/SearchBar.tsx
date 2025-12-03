'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, XIcon, TrendingUpIcon } from './Icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  favoriteTopics: string[];
  currentQuery: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchBar({ onSearch, favoriteTopics, currentQuery }: SearchBarProps) {
  const [query, setQuery] = useState(currentQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSearchRef = useRef<string>('');

  // Debounce the query - waits 300ms after user stops typing
  const debouncedQuery = useDebounce(query, 300);

  // Update local query when currentQuery prop changes (from topic buttons)
  useEffect(() => {
    if (!isTyping && currentQuery !== query) {
      setQuery(currentQuery);
      lastSearchRef.current = currentQuery;
    }
  }, [currentQuery, isTyping, query]);

  // Trigger search when debounced query changes (only when typing)
  useEffect(() => {
    if (isTyping && debouncedQuery.trim() !== lastSearchRef.current) {
      lastSearchRef.current = debouncedQuery.trim();
      onSearch(debouncedQuery.trim());
      setIsTyping(false);
    }
  }, [debouncedQuery, onSearch, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      lastSearchRef.current = query.trim();
      onSearch(query.trim());
      setIsTyping(false);
      inputRef.current?.blur();
    }
  };

  const handleTopicClick = (topic: string) => {
    // Always trigger search when clicking a topic, even if it's the same
    setQuery(topic);
    setIsTyping(false);
    lastSearchRef.current = topic;
    onSearch(topic);
  };

  const clearQuery = () => {
    setQuery('');
    setIsTyping(false);
    lastSearchRef.current = '';
    inputRef.current?.focus();
    onSearch('');
  };

  const showAllArticles = () => {
    setQuery('');
    setIsTyping(false);
    lastSearchRef.current = '';
    onSearch(''); // Empty query shows all articles
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsTyping(true);
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
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for news topics..."
            className="w-full py-4 pl-12 pr-12 bg-white border-2 border-[var(--border)] rounded-2xl text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors text-lg"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-4 p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <XIcon size={18} />
            </button>
          )}
        </div>
      </form>

      {/* Quick topics */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
          <TrendingUpIcon size={14} />
          Quick:
        </span>
        {/* All button */}
        <button
          type="button"
          onClick={showAllArticles}
          className={`tag cursor-pointer transition-all ${
            !currentQuery
              ? 'tag-active'
              : 'hover:border-[var(--primary)]'
          }`}
        >
          All
        </button>
        {favoriteTopics.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => handleTopicClick(topic)}
            className={`tag cursor-pointer transition-all ${
              currentQuery.toLowerCase() === topic.toLowerCase()
                ? 'tag-active'
                : 'hover:border-[var(--primary)]'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}
