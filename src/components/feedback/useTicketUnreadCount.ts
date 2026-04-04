'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';

/**
 * Hook that fetches and live-updates the unread ticket count for admins.
 * Used in the admin nav to show a badge on the Tickets tab.
 */
export function useTicketUnreadCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    fetch('/api/feedback/stats')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.unread_count !== undefined) {
          setCount(data.unread_count);
        }
      })
      .catch(() => {});

    // Subscribe to real-time changes
    const supabase = createBrowserClient();
    const channel = supabase
      .channel('admin-ticket-unread-count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feedback_tickets' },
        () => {
          // Refetch stats on any ticket change
          fetch('/api/feedback/stats')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (data?.unread_count !== undefined) {
                setCount(data.unread_count);
              }
            })
            .catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
