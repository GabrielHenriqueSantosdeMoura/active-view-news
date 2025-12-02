'use client';

import React, { useState } from 'react';
import { Collection, NewsArticle } from '../lib/types';
import { formatDate } from '../lib/api';
import {
  FolderIcon,
  PlusIcon,
  XIcon,
  TrashIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
  BookmarkIcon,
} from './Icons';

interface CollectionsPanelProps {
  collections: Collection[];
  isOpen: boolean;
  onClose: () => void;
  onCreateCollection: (name: string) => void;
  onDeleteCollection: (id: string) => void;
  onRemoveFromCollection: (collectionId: string, articleUrl: string) => void;
}

export default function CollectionsPanel({
  collections,
  isOpen,
  onClose,
  onCreateCollection,
  onDeleteCollection,
  onRemoveFromCollection,
}: CollectionsPanelProps) {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateCollection(newName.trim());
      setNewName('');
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    onDeleteCollection(id);
    setDeleteConfirm(null);
    if (selectedCollection?.id === id) {
      setSelectedCollection(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 animate-slide-up overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          {selectedCollection ? (
            <button
              onClick={() => setSelectedCollection(null)}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowLeftIcon size={20} />
              <span className="font-medium">Back</span>
            </button>
          ) : (
            <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
              <BookmarkIcon size={24} className="text-[var(--primary)]" />
              My Collections
            </h2>
          )}
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded-lg transition-colors"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedCollection ? (
            // Collection detail view
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {selectedCollection.name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {selectedCollection.articles.length} article
                    {selectedCollection.articles.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteConfirm(selectedCollection.id)}
                  className="p-2 text-[var(--error)] hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete collection"
                >
                  <TrashIcon size={20} />
                </button>
              </div>

              {selectedCollection.articles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[var(--surface)] rounded-full flex items-center justify-center">
                    <FolderIcon size={28} className="text-[var(--text-muted)]" />
                  </div>
                  <p className="text-[var(--text-muted)]">
                    No articles saved yet
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Save articles by clicking the bookmark icon
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCollection.articles.map((article: NewsArticle) => (
                    <div
                      key={article.url}
                      className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="flex-1 min-w-0">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[var(--foreground)] hover:text-[var(--primary)] line-clamp-2 transition-colors"
                          >
                            {article.title}
                          </a>
                          <div className="flex items-center gap-2 mt-2 text-sm text-[var(--text-muted)]">
                            <span>{article.source.name}</span>
                            <span>•</span>
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-2">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white rounded-lg transition-colors"
                            title="Open article"
                          >
                            <ExternalLinkIcon size={16} />
                          </a>
                          <button
                            onClick={() =>
                              onRemoveFromCollection(selectedCollection.id, article.url)
                            }
                            className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove from collection"
                          >
                            <XIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Collections list
            <div className="space-y-3">
              {/* Create new collection */}
              {isCreating ? (
                <div className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--primary)] space-y-3 animate-fade-in">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    placeholder="Collection name"
                    className="input"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setNewName('');
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={!newName.trim()}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      Create
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full p-4 bg-[var(--surface)] rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] text-[var(--primary)] flex items-center justify-center gap-2 transition-colors"
                >
                  <PlusIcon size={20} />
                  Create new collection
                </button>
              )}

              {/* Existing collections */}
              {collections.length === 0 && !isCreating ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] rounded-2xl flex items-center justify-center opacity-20">
                    <FolderIcon size={36} className="text-white" />
                  </div>
                  <p className="text-[var(--text-muted)] text-lg">
                    No collections yet
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Create a collection to save your favorite articles
                  </p>
                </div>
              ) : (
                collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => setSelectedCollection(collection)}
                    className="w-full p-4 bg-white rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] rounded-xl flex items-center justify-center flex-shrink-0">
                        <FolderIcon size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                          {collection.name}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">
                          {collection.articles.length} article
                          {collection.articles.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Delete confirmation modal */}
        {deleteConfirm && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setDeleteConfirm(null)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-white rounded-2xl shadow-2xl z-50 p-6 animate-fade-in">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                Delete Collection?
              </h3>
              <p className="text-[var(--text-muted)] mb-6">
                This action cannot be undone. All saved articles in this collection will be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-[var(--error)] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

