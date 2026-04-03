'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  BookOpen,
  Sparkles,
  Users,
  ArrowRight,
  Trophy,
  Bot,
  Send,
} from 'lucide-react';
import { academyApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { formatXp, formatDate, getLevelColor } from '@/lib/utils';
import { Card, Spinner, Badge, ProgressBar } from '@/components/ui';
import { ChatMarkdown } from '@/components/chat/ChatMarkdown';
import type { DashboardData } from '@/types';

const XP_THRESHOLDS: Record<string, number> = {
  beginner: 0,
  intermediate: 500,
  advanced: 2000,
  expert: 5000,
  master: 10000,
};

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];

function getNextLevel(currentLevel: string): string | null {
  const idx = LEVEL_ORDER.indexOf(currentLevel.toLowerCase());
  if (idx < 0 || idx >= LEVEL_ORDER.length - 1) return null;
  return LEVEL_ORDER[idx + 1];
}

function getXpProgress(xp: number, level: string): { current: number; target: number; pct: number } {
  const nextLevel = getNextLevel(level);
  if (!nextLevel) return { current: xp, target: xp, pct: 100 };
  const currentThreshold = XP_THRESHOLDS[level.toLowerCase()] ?? 0;
  const nextThreshold = XP_THRESHOLDS[nextLevel] ?? 10000;
  const progress = xp - currentThreshold;
  const range = nextThreshold - currentThreshold;
  return {
    current: progress,
    target: range,
    pct: Math.min(100, Math.round((progress / range) * 100)),
  };
}

export default function DashboardPage() {
  const { learner } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dashRes, progressRes] = await Promise.all([
          academyApi.get<DashboardData>('/learner/dashboard'),
          academyApi.get<{ progress: Array<{ lesson_id: string; status: string; xp_earned: number }> }>('/learner/progress').catch(() => ({ progress: [] })),
        ]);

        // Compute real XP from completed lessons if backend isn't tracking it
        const completedProgress = (progressRes.progress || []).filter(p => p.status === 'completed');
        if (dashRes.xp_total === 0 && completedProgress.length > 0) {
          // Fetch track data to get xp_reward per lesson
          try {
            const tracksRes = await academyApi.get<{ tracks: Array<{ slug: string; modules: Array<{ lessons: Array<{ id: string; xp_reward: number }> }> }> }>('/tracks');
            const xpMap = new Map<string, number>();
            for (const track of tracksRes.tracks || []) {
              for (const mod of track.modules || []) {
                for (const lesson of mod.lessons || []) {
                  xpMap.set(lesson.id, lesson.xp_reward || 0);
                }
              }
            }
            const computedXp = completedProgress.reduce((sum, p) => sum + (xpMap.get(p.lesson_id) || 10), 0);
            dashRes.xp_total = computedXp;
          } catch {
            // Fallback: estimate 10 XP per completed lesson
            dashRes.xp_total = completedProgress.length * 10;
          }
        }

        // Compute real progress_pct for enrollments
        if (completedProgress.length > 0) {
          const completedIds = new Set(completedProgress.map(p => p.lesson_id));
          for (const enrollment of dashRes.enrollments) {
            if (enrollment.progress_pct === 0) {
              try {
                const trackRes = await academyApi.get<{ modules: Array<{ lessons: Array<{ id: string }> }> }>(`/tracks/${enrollment.track_slug}`);
                const allLessons = (trackRes.modules || []).flatMap(m => m.lessons || []);
                const total = allLessons.length;
                const done = allLessons.filter(l => completedIds.has(l.id)).length;
                if (total > 0) enrollment.progress_pct = (done / total) * 100;
              } catch {
                // Keep backend value
              }
            }
          }
        }

        if (!cancelled) setData(dashRes);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-red-600">{error ?? 'Something went wrong'}</p>
      </div>
    );
  }

  const xpProgress = getXpProgress(data.xp_total, data.level);
  const nextLevel = getNextLevel(data.level);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {learner?.first_name ?? 'Learner'}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">Here is your learning overview.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* XP Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">XP Progress</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatXp(data.xp_total)}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 ${getLevelColor(data.level)}`}>
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar value={xpProgress.pct} showLabel />
            {nextLevel && (
              <p className="mt-1 text-xs text-gray-500">
                {xpProgress.current} / {xpProgress.target} XP to{' '}
                <span className="capitalize">{nextLevel}</span>
              </p>
            )}
          </div>
          <Badge variant="info" className="mt-2 capitalize">{data.level}</Badge>
        </Card>

        {/* Streak Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Streak</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{data.current_streak} days</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">Keep learning daily to grow your streak!</p>
        </Card>

        {/* Level Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Level</p>
              <p className={`mt-1 text-2xl font-bold capitalize ${getLevelColor(data.level)}`}>
                {data.level}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          {nextLevel ? (
            <p className="mt-3 text-xs text-gray-500">
              Reach {formatXp(XP_THRESHOLDS[nextLevel])} to unlock{' '}
              <span className="capitalize">{nextLevel}</span>
            </p>
          ) : (
            <p className="mt-3 text-xs text-gray-500">You have reached the highest level!</p>
          )}
        </Card>
      </div>

      {/* Enrolled Tracks */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Tracks</h2>
          <Link href="/tracks" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            View all
          </Link>
        </div>
        {data.enrollments.length === 0 ? (
          <Card>
            <p className="py-6 text-center text-sm text-gray-500">
              You are not enrolled in any tracks yet.{' '}
              <Link href="/tracks" className="font-medium text-indigo-600 hover:underline">
                Browse tracks
              </Link>
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.enrollments.map((enrollment) => (
                <Link key={enrollment.id} href={`/tracks/${enrollment.track_slug || ''}`}>
                  <Card hover>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {enrollment.track_title ?? enrollment.track_slug?.replace(/-/g, ' ') ?? 'Track'}
                        </h3>
                        <Badge variant={enrollment.status === 'active' ? 'success' : 'default'}>
                          {enrollment.status}
                        </Badge>
                      </div>
                      <ProgressBar value={enrollment.progress_pct} showLabel />
                    </div>
                  </Card>
                </Link>
              ))}
          </div>
        )}
      </section>

      {/* Recent Badges */}
      {data.recent_badges.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Badges</h2>
          <div className="flex flex-wrap gap-4">
            {data.recent_badges.slice(0, 5).map((lb) => (
              <div
                key={lb.id}
                className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 text-2xl">
                  {lb.badge.icon ?? '🏅'}
                </div>
                <span className="text-xs font-semibold text-gray-800">{lb.badge.title}</span>
                <span className="text-[10px] text-gray-500">{formatDate(lb.earned_at)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions + AI Chat */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Link href="/tracks">
              <Card hover className="group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Continue Learning</p>
                    <p className="text-xs text-gray-500">Pick up where you left off</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>
            <Link href="/studio">
              <Card hover className="group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">AI Studio</p>
                    <p className="text-xs text-gray-500">Create with AI tools</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>
            <Link href="/community">
              <Card hover className="group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Community</p>
                    <p className="text-xs text-gray-500">Ask questions &amp; connect</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* AI Chat Widget */}
        <DashboardChat />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compact AI Chat widget for the dashboard                          */
/* ------------------------------------------------------------------ */
function DashboardChat() {
  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    setLessonContext,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // No lesson context on dashboard
  useEffect(() => {
    setLessonContext(null);
  }, [setLessonContext]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = () => {
    const value = inputRef.current?.value.trim();
    if (!value || isStreaming) return;
    sendMessage(value);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
        </div>
        <Link
          href="/studio"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          Open Studio
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-3 py-3" style={{ maxHeight: 320 }}>
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bot className="mb-2 h-8 w-8 text-gray-300" />
              <p className="text-xs text-gray-500">
                Ask me anything about AI, your courses, or get help with exercises.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-200 bg-gray-50 text-gray-800'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <ChatMarkdown content={msg.content} />
                    )}
                  </div>
                </div>
              );
            })}

            {isStreaming && streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-800 whitespace-pre-wrap">
                  {streamingContent}
                  <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-indigo-500" />
                </div>
              </div>
            )}

            {isStreaming && !streamingContent && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="flex items-end gap-2 border-t border-gray-200 p-2">
          <textarea
            ref={inputRef}
            onKeyDown={handleKeyDown}
            aria-label="Chat with AI assistant"
            placeholder="Ask something..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isStreaming}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
