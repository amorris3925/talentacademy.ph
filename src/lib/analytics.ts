'use client';

import { academyApi } from '@/lib/api';
import type {
  AnalyticsEvent,
  AnalyticsEventType,
  BlockViewData,
  ChatMessageSource,
  QuizAttempt,
} from '@/types';

const SESSION_STORAGE_KEY = 'ta_analytics_session';
const FLUSH_INTERVAL_MS = 10_000;
const MAX_BUFFER_SIZE = 50;

interface StoredSession {
  sessionId: string;
  expiresAt: string; // ISO string
}

/**
 * Singleton analytics service.
 *
 * Plain class (not a Zustand store) to avoid triggering React re-renders.
 * Buffers events in memory and flushes them in batches to the backend.
 */
class AnalyticsService {
  private sessionId: string | null = null;
  private expiresAt: Date | null = null;
  private eventBuffer: AnalyticsEvent[] = [];
  private blockTimers: Map<string, { startMs: number; blockType: string }> = new Map();
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private expiryTimeout: ReturnType<typeof setTimeout> | null = null;
  private onSessionExpired: (() => void) | null = null;
  private isDestroyed = false;

  // ── Session lifecycle ──────────────────────────────────────────────────

  /**
   * Start a new analytics session. Called after successful login.
   * Returns the session ID from the backend.
   */
  async startSession(): Promise<string | null> {
    try {
      const deviceInfo = parseDeviceInfo();
      const res = await academyApi.post<{ session_id: string; expires_at: string }>(
        '/analytics/session/start',
        deviceInfo,
      );

      this.sessionId = res.session_id;
      this.expiresAt = new Date(res.expires_at);
      this.isDestroyed = false;

      // Persist to localStorage for rehydration
      try {
        localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ sessionId: this.sessionId, expiresAt: res.expires_at }),
        );
      } catch {
        // QuotaExceededError or SecurityError — session still works in-memory
      }

      // Start flush interval
      this.startFlushInterval();

      // Set up auto-expiry
      this.scheduleExpiry();

      // Set up page lifecycle listeners
      this.setupLifecycleListeners();

      return this.sessionId;
    } catch (err) {
      console.warn('[analytics] Failed to start session:', err);
      return null;
    }
  }

  /**
   * End the current session. Called on logout.
   */
  async endSession(): Promise<void> {
    if (!this.sessionId) return;

    // Track logout event
    this.track({ event_type: 'logout', client_ts: new Date().toISOString() });

    // Flush remaining events
    await this.flush();

    try {
      await academyApi.post('/analytics/session/end', { session_id: this.sessionId });
    } catch {
      // Best-effort
    }

    this.cleanup();
  }

  /**
   * Rehydrate session from localStorage on app init.
   * Returns true if a valid session was restored.
   */
  rehydrate(): boolean {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return false;

      const { sessionId, expiresAt } = JSON.parse(stored) as StoredSession;
      const expiry = new Date(expiresAt);

      if (expiry <= new Date()) {
        // Session expired
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return false;
      }

      this.sessionId = sessionId;
      this.expiresAt = expiry;
      this.isDestroyed = false;
      this.startFlushInterval();
      this.scheduleExpiry();
      this.setupLifecycleListeners();
      return true;
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return false;
    }
  }

  /**
   * Check if the current session is expired.
   */
  isExpired(): boolean {
    if (!this.expiresAt) return true;
    return this.expiresAt <= new Date();
  }

  /**
   * Register a callback for when the session expires (triggers auto-logout).
   */
  setOnSessionExpired(cb: () => void): void {
    this.onSessionExpired = cb;
  }

  /**
   * Get the current session ID (null if no active session).
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  // ── Event tracking ─────────────────────────────────────────────────────

  /**
   * Buffer a generic analytics event. Synchronous — never blocks the UI.
   */
  track(event: Omit<AnalyticsEvent, 'client_ts'> & { client_ts?: string }): void {
    if (!this.sessionId || this.isDestroyed) return;

    this.eventBuffer.push({
      ...event,
      client_ts: event.client_ts || new Date().toISOString(),
    });

    if (this.eventBuffer.length >= MAX_BUFFER_SIZE) {
      void this.flush();
    }
  }

  /**
   * Convenience: track a typed event with just the type and optional metadata.
   */
  trackEvent(
    eventType: AnalyticsEventType,
    context?: { lesson_id?: string; module_id?: string; track_id?: string },
    metadata?: Record<string, unknown>,
  ): void {
    this.track({
      event_type: eventType,
      ...context,
      metadata,
    });
  }

  // ── Quiz attempt tracking ──────────────────────────────────────────────

  /**
   * Persist a quiz attempt to the backend (separate from the event buffer).
   */
  async trackQuizAttempt(attempt: QuizAttempt): Promise<void> {
    if (!this.sessionId) return;

    this.trackEvent('quiz_submit', { lesson_id: attempt.lesson_id }, {
      block_index: attempt.block_index,
      is_correct: attempt.is_correct,
      attempt_number: attempt.attempt_number,
    });

    try {
      await academyApi.post('/analytics/quiz-attempt', {
        session_id: this.sessionId,
        ...attempt,
      });
    } catch (err) {
      console.warn('[analytics] Failed to persist quiz attempt:', err);
    }
  }

  // ── Chat message tracking ──────────────────────────────────────────────

  /**
   * Persist a chat message to the backend.
   */
  async trackChatMessage(
    lessonId: string | null,
    role: 'user' | 'assistant',
    content: string,
    source: ChatMessageSource = 'typed',
  ): Promise<string | null> {
    if (!this.sessionId) return null;

    this.trackEvent(role === 'user' ? 'chat_send' : 'chat_receive', {
      lesson_id: lessonId ?? undefined,
    }, { source, content_length: content.length });

    try {
      const res = await academyApi.post<{ id: string }>('/analytics/chat-message', {
        session_id: this.sessionId,
        lesson_id: lessonId,
        role,
        content,
        source,
      });
      return res.id;
    } catch (err) {
      console.warn('[analytics] Failed to persist chat message:', err);
      return null;
    }
  }

  /**
   * Update the rating on a persisted chat message.
   */
  async rateChatMessage(messageId: string, rating: number): Promise<void> {
    this.trackEvent('rating_submit', undefined, { message_id: messageId, rating });

    try {
      await academyApi.patch(`/analytics/chat-message/${messageId}/rate`, { rating });
    } catch (err) {
      console.warn('[analytics] Failed to rate chat message:', err);
    }
  }

  // ── Block view timing ──────────────────────────────────────────────────

  /**
   * Start timing a content block when it enters the viewport.
   */
  trackBlockView(lessonId: string, blockIndex: number, blockType: string): void {
    const key = `${lessonId}:${blockIndex}`;
    this.blockTimers.set(key, { startMs: performance.now(), blockType });
  }

  /**
   * Stop timing a content block when it leaves the viewport.
   * Queues a block_view event with the duration.
   */
  trackBlockLeave(lessonId: string, blockIndex: number): void {
    const key = `${lessonId}:${blockIndex}`;
    const timer = this.blockTimers.get(key);
    if (!timer) return;

    const timeVisibleMs = Math.round(performance.now() - timer.startMs);
    this.blockTimers.delete(key);

    // Only track if visible for at least 500ms (filter out scroll-throughs)
    if (timeVisibleMs < 500) return;

    this.track({
      event_type: 'block_view',
      lesson_id: lessonId,
      metadata: {
        block_index: blockIndex,
        block_type: timer.blockType,
        time_visible_ms: timeVisibleMs,
      },
    });
  }

  /**
   * Flush all remaining block timers (e.g., when navigating away from lesson).
   */
  flushBlockTimers(lessonId: string): void {
    for (const [key, timer] of this.blockTimers.entries()) {
      if (key.startsWith(`${lessonId}:`)) {
        const blockIndex = parseInt(key.split(':')[1], 10);
        const timeVisibleMs = Math.round(performance.now() - timer.startMs);
        this.blockTimers.delete(key);

        if (timeVisibleMs >= 500) {
          this.track({
            event_type: 'block_view',
            lesson_id: lessonId,
            metadata: {
              block_index: blockIndex,
              block_type: timer.blockType,
              time_visible_ms: timeVisibleMs,
            },
          });
        }
      }
    }
  }

  // ── Flush / transport ──────────────────────────────────────────────────

  /**
   * Send buffered events to the backend. Fire-and-forget — errors are swallowed.
   */
  async flush(): Promise<void> {
    if (!this.sessionId || this.eventBuffer.length === 0) return;

    const batch = this.eventBuffer.splice(0);

    try {
      await academyApi.post('/analytics/events', {
        session_id: this.sessionId,
        events: batch,
      });
    } catch {
      // Put events back for retry on next flush (only once)
      if (batch.length <= MAX_BUFFER_SIZE) {
        this.eventBuffer.unshift(...batch);
      }
    }
  }

  /**
   * Last-resort flush using sendBeacon (survives page close).
   */
  private beaconFlush(): void {
    if (!this.sessionId || this.eventBuffer.length === 0) return;

    const batch = this.eventBuffer.splice(0);
    const payload = JSON.stringify({
      session_id: this.sessionId,
      events: batch,
    });

    const blob = new Blob([payload], { type: 'application/json' });
    const url = `${window.location.origin}/api/academy/analytics/events`;
    navigator.sendBeacon(url, blob);
  }

  // ── Teardown ───────────────────────────────────────────────────────────

  /**
   * Full cleanup: flush events, remove listeners, stop timers.
   * Called on logout or when the app unmounts.
   */
  destroy(): void {
    this.beaconFlush();
    this.cleanup();
  }

  private cleanup(): void {
    this.isDestroyed = true;
    this.sessionId = null;
    this.expiresAt = null;
    this.eventBuffer = [];
    this.blockTimers.clear();
    localStorage.removeItem(SESSION_STORAGE_KEY);

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.expiryTimeout) {
      clearTimeout(this.expiryTimeout);
      this.expiryTimeout = null;
    }

    this.removeLifecycleListeners();
  }

  // ── Internal helpers ───────────────────────────────────────────────────

  private startFlushInterval(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => {
      if (this.isExpired()) {
        this.onSessionExpired?.();
        return;
      }
      void this.flush();
    }, FLUSH_INTERVAL_MS);
  }

  private scheduleExpiry(): void {
    if (!this.expiresAt) return;
    if (this.expiryTimeout) clearTimeout(this.expiryTimeout);

    const msUntilExpiry = this.expiresAt.getTime() - Date.now();
    if (msUntilExpiry <= 0) {
      this.onSessionExpired?.();
      return;
    }

    // Cap at ~2 billion ms (setTimeout limit) — for 24h sessions this is fine
    this.expiryTimeout = setTimeout(() => {
      this.onSessionExpired?.();
    }, Math.min(msUntilExpiry, 2_147_483_647));
  }

  // Page lifecycle listeners
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      this.beaconFlush();
    }
  };

  private handleBeforeUnload = (): void => {
    this.beaconFlush();
  };

  private setupLifecycleListeners(): void {
    if (typeof window === 'undefined') return;
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  private removeLifecycleListeners(): void {
    if (typeof window === 'undefined') return;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }
}

// ── Device info parser ─────────────────────────────────────────────────────

function parseDeviceInfo(): { user_agent: string; device_type: string; browser: string; os: string } {
  const ua = navigator.userAgent;

  let deviceType = 'desktop';
  if (/Mobi|Android/i.test(ua)) deviceType = 'mobile';
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';

  let browser = 'unknown';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';

  let os = 'unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';

  return { user_agent: ua, device_type: deviceType, browser, os };
}

// ── Singleton export ───────────────────────────────────────────────────────

export const analytics = new AnalyticsService();
