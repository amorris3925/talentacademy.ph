'use client';

/**
 * FeedbackManager Component
 *
 * Admin dashboard for managing all feedback tickets with:
 * - Stats cards (total, open, in progress, unread)
 * - Two-column layout: Ticket list | Ticket detail
 * - Filters (status, category)
 * - Ticket detail with 4 tabs (Messages, Details, AI Analysis, Context)
 * - Messaging with internal notes support
 * - Status/priority updates
 * - Real-time updates via Supabase Realtime
 */

import { useState, useEffect, useRef } from 'react';
import { Search, Send, AlertCircle, UserCircle, ChevronLeft, Zap } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Checkbox } from '@/components/ui/Checkbox';
import { toast } from 'sonner';
import type {
  FeedbackTicket,
  FeedbackMessage,
  FeedbackStats,
  FeedbackTeamMember,
} from '@/types';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'not_relevant', label: 'Not Relevant' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'question', label: 'Question' },
  { value: 'other', label: 'Other' },
];

const TICKET_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'not_relevant', label: 'Not Relevant' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug Report',
  feature_request: 'Feature Request',
  question: 'Question',
  other: 'Other',
};

function getStatusVariant(status: string): 'info' | 'warning' | 'success' | 'default' {
  const map: Record<string, 'info' | 'warning' | 'success' | 'default'> = {
    open: 'info',
    in_progress: 'warning',
    resolved: 'success',
    closed: 'default',
    not_relevant: 'default',
  };
  return map[status] || 'default';
}

function getPriorityVariant(priority: string): 'default' | 'info' | 'warning' | 'danger' {
  const map: Record<string, 'default' | 'info' | 'warning' | 'danger'> = {
    low: 'default',
    normal: 'info',
    high: 'warning',
    urgent: 'danger',
  };
  return map[priority] || 'default';
}

const CANNED_RESPONSES = [
  { label: 'Acknowledged', text: 'Thanks for reporting this! We\'re looking into it and will update you shortly.' },
  { label: 'Fixed next deploy', text: 'This has been fixed and will be live in the next deployment. Thanks for catching it!' },
  { label: 'Need more info', text: 'Thanks for the report. Could you provide a bit more detail about what you were doing when this happened? Steps to reproduce would be very helpful.' },
  { label: 'Known issue', text: 'We\'re aware of this issue and it\'s already being worked on. We\'ll notify you once it\'s resolved.' },
  { label: 'Not a bug', text: 'After investigating, this appears to be working as intended. Let us know if you have further questions about how this feature works.' },
  { label: 'Duplicate', text: 'This has already been reported and is being tracked. We\'ll update you when it\'s resolved.' },
];

export default function FeedbackManager() {
  const [tickets, setTickets] = useState<FeedbackTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<FeedbackTicket | null>(null);
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<FeedbackTeamMember[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Message input
  const [newMessage, setNewMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showCannedMenu, setShowCannedMenu] = useState(false);

  // Detail tabs
  const [detailTab, setDetailTab] = useState<string>('messages');

  // Loading states
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    loadStats();
    loadTickets();
    loadTeamMembers();
  }, []);

  // Load tickets when filters change
  useEffect(() => {
    loadTickets();
  }, [statusFilter, categoryFilter]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to real-time updates for selected ticket
  useEffect(() => {
    if (!selectedTicket) return;

    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`feedback-admin-ticket-${selectedTicket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback_messages',
          filter: `ticket_id=eq.${selectedTicket.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as FeedbackMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'feedback_tickets',
          filter: `id=eq.${selectedTicket.id}`
        },
        (payload) => {
          setSelectedTicket(payload.new as FeedbackTicket);
          setTickets(prev =>
            prev.map(t => t.id === selectedTicket.id ? payload.new as FeedbackTicket : t)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTicket]);

  // Subscribe to new tickets globally
  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel('feedback-admin-global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback_tickets'
        },
        () => {
          loadTickets();
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadStats() {
    try {
      const response = await fetch('/api/feedback/stats');
      if (!response.ok) throw new Error('Failed to load stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  async function loadTickets() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/feedback?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load tickets');
      let data: FeedbackTicket[] = await response.json();

      // Client-side category filter
      if (categoryFilter !== 'all') {
        data = data.filter(t => t.category === categoryFilter);
      }

      setTickets(data || []);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  async function loadTeamMembers() {
    try {
      const response = await fetch('/api/feedback/team-members');
      if (!response.ok) throw new Error('Failed to load team members');
      const data = await response.json();
      setTeamMembers(data);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  }

  async function loadTicketDetails(ticket: FeedbackTicket) {
    try {
      const response = await fetch(`/api/feedback/${ticket.id}`);
      if (!response.ok) throw new Error('Failed to load ticket details');
      const data = await response.json();

      setMessages(data.messages || []);
      setSelectedTicket(data.ticket);
      setDetailTab('messages');
      setTickets(prev =>
        prev.map(t => t.id === data.ticket.id ? { ...t, ...data.ticket, unread_by_admin: false } : t)
      );
    } catch (error) {
      console.error('Failed to load ticket details:', error);
      toast.error('Failed to load ticket details');
    }
  }

  async function handleSendMessage() {
    if (!selectedTicket || !newMessage.trim()) return;

    setSendingMessage(true);

    try {
      const response = await fetch(`/api/feedback/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage.trim(),
          is_internal_note: isInternalNote,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage('');
      setIsInternalNote(false);
      toast.success(isInternalNote ? 'Internal note added' : 'Message sent!');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleUpdateTicket(updates: { status?: string; priority?: string; assigned_to?: string }) {
    if (!selectedTicket) return;

    try {
      const response = await fetch(`/api/feedback/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update ticket');

      const data = await response.json();
      setSelectedTicket(data);
      setTickets(prev =>
        prev.map(t => t.id === selectedTicket.id ? data : t)
      );

      toast.success('Ticket updated');
      loadStats();
    } catch (error) {
      console.error('Failed to update ticket:', error);
      toast.error('Failed to update ticket');
    }
  }

  // Filter tickets by search query (client-side text search)
  const filteredTickets = searchQuery.trim()
    ? tickets.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user_display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user_email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tickets;

  const assignmentOptions = [
    { value: '', label: 'Unassigned' },
    ...teamMembers.map(m => ({ value: m.id, label: m.display_name || m.email })),
  ];

  const detailTabs = [
    { key: 'messages', label: 'Messages' },
    { key: 'details', label: 'Details' },
    { key: 'ai-analysis', label: 'AI Analysis' },
    { key: 'context', label: 'Context' },
  ];

  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 12rem)' }}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card padding="sm">
          <div className="text-xs text-gray-500">Total Tickets</div>
          <div className="text-2xl font-bold text-gray-900">{stats?.total_tickets || 0}</div>
        </Card>
        <Card padding="sm">
          <div className="text-xs text-gray-500">Open</div>
          <div className="text-2xl font-bold text-blue-600">{stats?.by_status?.open || 0}</div>
        </Card>
        <Card padding="sm">
          <div className="text-xs text-gray-500">In Progress</div>
          <div className="text-2xl font-bold text-yellow-600">{stats?.by_status?.in_progress || 0}</div>
        </Card>
        <Card padding="sm">
          <div className="text-xs text-gray-500">Unread</div>
          <div className="text-2xl font-bold text-red-600">{stats?.unread_count || 0}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="sm" className="shrink-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_OPTIONS}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={CATEGORY_OPTIONS}
          />
        </div>
      </Card>

      {/* Two-column Layout (stacked on mobile) */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Ticket List — hidden on mobile when a ticket is selected */}
        <Card padding="sm" className={`flex flex-col overflow-hidden lg:w-1/2 ${selectedTicket ? 'hidden lg:flex' : 'w-full'}`}>
          <div className="border-b border-gray-200 px-3 pb-3">
            <h3 className="font-semibold text-gray-900">Tickets ({filteredTickets.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No tickets found</div>
            ) : (
              <div className="space-y-2">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => loadTicketDetails(ticket)}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50 ${
                      selectedTicket?.id === ticket.id ? 'border-indigo-500 bg-indigo-50' : ''
                    } ${ticket.unread_by_admin ? 'border-l-4 border-l-indigo-500' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                          {ticket.unread_by_admin && (
                            <Badge variant="danger" size="sm">New</Badge>
                          )}
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-xs">
                          <Badge variant={getStatusVariant(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant={getPriorityVariant(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <span className="text-gray-500">
                            {CATEGORY_LABELS[ticket.category] || ticket.category}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.user_display_name} ({ticket.user_email})
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                          <span>{ticket.message_count} messages</span>
                          {(ticket.attachment_count ?? 0) > 0 && (
                            <>
                              <span>&middot;</span>
                              <span>{ticket.attachment_count} files</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="whitespace-nowrap text-xs text-gray-400">
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Ticket Detail — full width on mobile */}
        <Card padding="sm" className={`flex flex-col overflow-hidden lg:w-1/2 ${selectedTicket ? 'w-full' : 'hidden lg:flex'}`}>
          {!selectedTicket ? (
            <div className="flex flex-1 items-center justify-center text-gray-400">
              Select a ticket to view details
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Header */}
              <div className="shrink-0 border-b border-gray-200 px-3 pb-3">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <h3 className="text-sm font-semibold text-gray-900">
                        #{selectedTicket.ticket_number} — {selectedTicket.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateTicket({ status: e.target.value })}
                        options={TICKET_STATUS_OPTIONS}
                      />
                      <Select
                        value={selectedTicket.priority}
                        onChange={(e) => handleUpdateTicket({ priority: e.target.value })}
                        options={PRIORITY_OPTIONS}
                      />
                    </div>
                  </div>
                </div>

                <Tabs tabs={detailTabs} activeTab={detailTab} onChange={setDetailTab} />
              </div>

              {/* Tab Content */}
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Messages Tab */}
                {detailTab === 'messages' && (
                  <div className="flex flex-1 flex-col overflow-hidden p-3">
                    {/* Initial Description */}
                    <div className="mb-4 shrink-0 rounded-lg bg-gray-50 p-3">
                      <div className="mb-1 text-xs font-medium text-gray-500">Initial Report</div>
                      <p className="whitespace-pre-wrap text-sm text-gray-900">{selectedTicket.description}</p>
                    </div>

                    {/* Messages */}
                    <div className="mb-4 flex-1 overflow-y-auto">
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.is_staff ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                msg.is_internal_note
                                  ? 'border-l-4 border-yellow-500 bg-yellow-50'
                                  : msg.is_staff
                                  ? 'bg-indigo-50'
                                  : 'bg-gray-100'
                              }`}
                            >
                              <div className="mb-1 text-xs font-medium text-gray-700">
                                {msg.user_display_name}
                                {msg.is_staff && (
                                  <Badge variant="info" size="sm" className="ml-2">Staff</Badge>
                                )}
                                {msg.is_internal_note && (
                                  <Badge variant="warning" size="sm" className="ml-2">Internal</Badge>
                                )}
                              </div>
                              <p className="whitespace-pre-wrap text-sm text-gray-900">{msg.message}</p>
                              <span className="text-xs text-gray-400">
                                {new Date(msg.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="shrink-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <Checkbox
                          label="Internal note (not visible to user)"
                          checked={isInternalNote}
                          onChange={(e) => setIsInternalNote((e.target as HTMLInputElement).checked)}
                        />

                        {/* Canned Responses */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCannedMenu(!showCannedMenu)}
                            className="text-gray-500"
                          >
                            <Zap className="h-4 w-4" />
                            Quick Reply
                          </Button>
                          {showCannedMenu && (
                            <div className="absolute bottom-full right-0 z-10 mb-1 w-64 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                              {CANNED_RESPONSES.map((canned) => (
                                <button
                                  key={canned.label}
                                  onClick={() => {
                                    setNewMessage(canned.text);
                                    setShowCannedMenu(false);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  {canned.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-end gap-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={3}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={sendingMessage || !newMessage.trim()}
                          size="sm"
                          className="mb-0.5"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">Press Ctrl+Enter to send</p>
                    </div>
                  </div>
                )}

                {/* Details Tab */}
                {detailTab === 'details' && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <UserCircle className="h-4 w-4" />
                          Assigned To
                        </div>
                        <Select
                          value={selectedTicket.assigned_to || ''}
                          onChange={(e) => handleUpdateTicket({ assigned_to: e.target.value })}
                          options={assignmentOptions}
                        />
                      </div>

                      <div>
                        <div className="mb-1 text-sm font-medium text-gray-700">Category</div>
                        <Badge>{CATEGORY_LABELS[selectedTicket.category] || selectedTicket.category}</Badge>
                      </div>

                      <div>
                        <div className="mb-1 text-sm font-medium text-gray-700">Page URL</div>
                        <a
                          href={selectedTicket.page_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-sm text-indigo-600 hover:underline"
                        >
                          {selectedTicket.page_url}
                        </a>
                      </div>

                      <div>
                        <div className="mb-1 text-sm font-medium text-gray-700">Reported By</div>
                        <div className="text-sm text-gray-900">
                          {selectedTicket.user_display_name} ({selectedTicket.user_email})
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 text-sm font-medium text-gray-700">Created</div>
                        <div className="text-sm text-gray-600">
                          {new Date(selectedTicket.created_at).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 text-sm font-medium text-gray-700">Last Updated</div>
                        <div className="text-sm text-gray-600">
                          {new Date(selectedTicket.updated_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Analysis Tab */}
                {detailTab === 'ai-analysis' && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {selectedTicket.ai_problem_diagnosis ? (
                        <>
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              Problem Diagnosis
                            </div>
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                              <p className="whitespace-pre-wrap text-sm text-gray-900">
                                {selectedTicket.ai_problem_diagnosis}
                              </p>
                            </div>
                          </div>

                          <div>
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                              <AlertCircle className="h-4 w-4 text-green-500" />
                              Recommended Fix
                            </div>
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                              <p className="whitespace-pre-wrap text-sm text-gray-900">
                                {selectedTicket.ai_recommended_fix}
                              </p>
                            </div>
                          </div>

                          {selectedTicket.ai_analysis_model && (
                            <div className="text-xs text-gray-400">
                              Analyzed by {selectedTicket.ai_analysis_model} at{' '}
                              {selectedTicket.ai_analyzed_at
                                ? new Date(selectedTicket.ai_analyzed_at).toLocaleString()
                                : 'N/A'}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <AlertCircle className="mb-4 h-12 w-12 text-gray-300" />
                          <p className="text-sm text-gray-500">
                            AI analysis is running in the background...
                          </p>
                          <p className="mt-2 text-xs text-gray-400">
                            This usually takes 2-5 seconds. Refresh to see results.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Context Tab */}
                {detailTab === 'context' && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <pre className="whitespace-pre-wrap break-all text-xs text-gray-700">
                        {JSON.stringify(selectedTicket.context_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
