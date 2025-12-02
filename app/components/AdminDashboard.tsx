'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { clearAuthData } from '../lib/supabase';
import {
  SettingsIcon,
  TrendingUpIcon,
  ExternalLinkIcon,
} from './Icons';

interface UserStat {
  id: string;
  apiKey: string;
  createdAt: string;
  clicks: number;
  articlesViewed: number;
  topics: string[];
}

interface TopArticle {
  url: string;
  viewCount: number;
}

interface AdminData {
  users: UserStat[];
  stats: {
    totalUsers: number;
    totalClicks: number;
    totalArticlesViewed: number;
  };
  topArticles: TopArticle[];
}

interface AdminDashboardProps {
  apiKey: string;
  onLogout: () => void;
}

// Icons
function UsersIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function EyeIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function MousePointerClickIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 9 5 12 1.8-5.2L21 14Z" />
      <path d="M7.2 2.2 8 5.1" />
      <path d="m5.1 8-2.9-.8" />
      <path d="M14 4.1 12 6" />
      <path d="m6 12-1.9 2" />
    </svg>
  );
}

function RefreshIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

export default function AdminDashboard({ apiKey, onLogout }: AdminDashboardProps) {
  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const loadAdminData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin?adminKey=${encodeURIComponent(apiKey)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load admin data');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [apiKey]);

  const handleLogout = () => {
    clearAuthData();
    onLogout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="InActiveView News"
                width={160}
                height={40}
                className="h-10 w-auto"
              />
              <span className="px-2 py-1 bg-[var(--primary)] text-white text-xs font-bold rounded-md">
                ADMIN
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={loadAdminData}
                className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)] rounded-xl transition-colors"
              >
                <RefreshIcon size={20} />
                <span className="hidden sm:inline font-medium">Refresh</span>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)] rounded-xl transition-colors relative"
              >
                <SettingsIcon size={20} />
              </button>

              {showSettings && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                  <div className="absolute right-4 top-14 z-50 w-64 bg-white rounded-xl shadow-xl border border-[var(--border)] overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-[var(--border)]">
                      <p className="text-sm text-[var(--text-muted)]">Logged in as</p>
                      <p className="font-semibold text-[var(--foreground)]">Administrator</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-[var(--error)] hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Admin Dashboard</h1>
          <p className="text-[var(--text-muted)] mt-1">Monitor user activity and platform statistics</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-[var(--error)] font-medium mb-2">Error loading data</p>
            <p className="text-[var(--text-muted)] text-sm">{error}</p>
            <button onClick={loadAdminData} className="mt-4 btn-primary">
              Try again
            </button>
          </div>
        ) : data && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <UsersIcon size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Total Users</p>
                    <p className="text-3xl font-bold text-[var(--foreground)]">{data.stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-xl flex items-center justify-center">
                    <MousePointerClickIcon size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Total Clicks</p>
                    <p className="text-3xl font-bold text-[var(--foreground)]">{data.stats.totalClicks.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <EyeIcon size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">Articles Viewed</p>
                    <p className="text-3xl font-bold text-[var(--foreground)]">{data.stats.totalArticlesViewed.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Users table */}
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-[var(--border)]">
                  <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <UsersIcon size={20} className="text-[var(--primary)]" />
                    All Users ({data.users.length})
                  </h2>
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--surface)] sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-[var(--text-muted)]">API Key</th>
                        <th className="text-left p-3 text-sm font-medium text-[var(--text-muted)]">Clicks</th>
                        <th className="text-left p-3 text-sm font-medium text-[var(--text-muted)]">Viewed</th>
                        <th className="text-left p-3 text-sm font-medium text-[var(--text-muted)]">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.users.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-[var(--surface)]'
                          }`}
                        >
                          <td className="p-3">
                            <code className="text-sm text-[var(--foreground)]">{user.apiKey}</code>
                          </td>
                          <td className="p-3">
                            <span className="flex items-center gap-1 text-sm">
                              <MousePointerClickIcon size={14} className="text-[var(--primary)]" />
                              {user.clicks}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="flex items-center gap-1 text-sm">
                              <EyeIcon size={14} className="text-purple-500" />
                              {user.articlesViewed}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-[var(--text-muted)]">
                            {formatDate(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                      {data.users.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-[var(--text-muted)]">
                            No users yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top articles */}
              <div className="card overflow-hidden">
                <div className="p-4 border-b border-[var(--border)]">
                  <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <TrendingUpIcon size={20} className="text-[var(--primary)]" />
                    Top 10 Most Viewed Articles
                  </h2>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {data.topArticles.length > 0 ? (
                    <div className="divide-y divide-[var(--border)]">
                      {data.topArticles.map((article, index) => (
                        <div
                          key={article.url}
                          className="p-4 hover:bg-[var(--surface-hover)] transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index < 3
                                ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white'
                                : 'bg-[var(--surface)] text-[var(--text-muted)]'
                            }`}>
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[var(--foreground)] hover:text-[var(--primary)] line-clamp-2 transition-colors"
                              >
                                {article.url}
                              </a>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                  <EyeIcon size={12} />
                                  {article.viewCount} views
                                </span>
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[var(--primary)] hover:underline"
                                >
                                  <ExternalLinkIcon size={12} />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-[var(--text-muted)]">
                      No articles viewed yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[var(--text-muted)]">
          <p>InActiveView News Admin Panel</p>
        </div>
      </footer>
    </div>
  );
}

