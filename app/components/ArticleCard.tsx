'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { NewsArticle } from '../lib/types';
import { formatDate } from '../lib/api';
import { BookmarkIcon, ExternalLinkIcon, PlusIcon, FolderIcon, CheckIcon } from './Icons';

interface ArticleCardProps {
  article: NewsArticle;
  collectionNames: string[];
  onSaveToCollection: (article: NewsArticle, collectionName: string) => void;
  onCreateCollection: (name: string, article: NewsArticle) => void;
  isInCollection: (articleUrl: string) => boolean;
  onArticleClick?: (articleUrl: string) => void;
}

export default function ArticleCard({
  article,
  collectionNames,
  onSaveToCollection,
  onCreateCollection,
  isInCollection,
  onArticleClick,
}: ArticleCardProps) {
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName.trim(), article);
      setNewCollectionName('');
      setIsCreatingCollection(false);
      setShowCollectionMenu(false);
    }
  };

  const handleArticleLinkClick = () => {
    if (onArticleClick) {
      onArticleClick(article.url);
    }
  };

  const isSaved = isInCollection(article.url);

  return (
    <article className="card group relative animate-fade-in">
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--surface)]">
        {article.urlToImage ? (
          <Image
            src={article.urlToImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--surface)] to-[var(--border)]">
            <span className="text-4xl">📰</span>
          </div>
        )}
        
        {/* Source badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-[var(--foreground)] shadow-sm">
            {article.source.name}
          </span>
        </div>

        {/* Save button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setShowCollectionMenu(!showCollectionMenu)}
            className={`p-2 rounded-full transition-all duration-200 shadow-sm ${
              isSaved
                ? 'bg-[var(--primary)] text-white'
                : 'bg-white/90 backdrop-blur-sm text-[var(--text-secondary)] hover:text-[var(--primary)]'
            }`}
            title={isSaved ? 'Saved' : 'Save to collection'}
          >
            <BookmarkIcon size={18} filled={isSaved} />
          </button>

          {/* Collection dropdown */}
          {showCollectionMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => {
                  setShowCollectionMenu(false);
                  setIsCreatingCollection(false);
                }}
              />
              <div className="absolute right-0 top-12 z-50 w-64 bg-white rounded-xl shadow-xl border border-[var(--border)] overflow-hidden animate-fade-in">
                <div className="p-3 border-b border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Save to Collection
                  </p>
                </div>
                
                <div className="max-h-48 overflow-y-auto">
                  {collectionNames.length === 0 && !isCreatingCollection ? (
                    <p className="p-4 text-sm text-[var(--text-muted)] text-center">
                      No collections yet
                    </p>
                  ) : (
                    collectionNames.map((name) => (
                      <button
                        key={name}
                        onClick={() => {
                          onSaveToCollection(article, name);
                          setShowCollectionMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-[var(--surface-hover)]"
                      >
                        <FolderIcon size={18} className="text-[var(--primary)] flex-shrink-0" />
                        <span className="text-sm text-[var(--foreground)] flex-1 truncate">
                          {name}
                        </span>
                      </button>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-[var(--border)]">
                  {isCreatingCollection ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                        placeholder="Collection name"
                        className="input text-sm py-2"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsCreatingCollection(false);
                            setNewCollectionName('');
                          }}
                          className="btn-secondary flex-1 py-2 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateCollection}
                          disabled={!newCollectionName.trim()}
                          className="btn-primary flex-1 py-2 text-sm disabled:opacity-50"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCreatingCollection(true)}
                      className="w-full flex items-center gap-2 p-2 text-sm text-[var(--primary)] hover:bg-[var(--surface)] rounded-lg transition-colors"
                    >
                      <PlusIcon size={18} />
                      Create new collection
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-[var(--foreground)] mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            onClick={handleArticleLinkClick}
          >
            {article.title}
          </a>
        </h3>
        
        {article.description && (
          <p className="text-[var(--text-muted)] text-sm mb-4 line-clamp-2">
            {article.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-muted)]">
            {formatDate(article.publishedAt)}
          </span>
          
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[var(--primary)] hover:underline font-medium"
            onClick={handleArticleLinkClick}
          >
            Read more
            <ExternalLinkIcon size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}
