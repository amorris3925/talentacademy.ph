'use client';

/**
 * FeedbackWidget Component
 *
 * Global feedback/bug reporting widget with:
 * - Fixed position button (bottom-right)
 * - Two tabs: "New Feedback" and "My Tickets"
 * - Smart context capture (browser info, console errors, API requests, navigation, performance)
 * - Screenshot capture (html2canvas)
 * - File upload with drag-drop
 * - Ticket history with two-way messaging
 * - Real-time updates via Supabase Realtime
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Camera, Paperclip, Send, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { createBrowserClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import type { FeedbackTicket, FeedbackMessage, FeedbackAttachment } from '@/types';

const CATEGORY_OPTIONS = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'question', label: 'Question' },
  { value: 'other', label: 'Other' },
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

export function FeedbackWidget() {
  const { learner } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('new');

  // New Feedback Form State
  const [category, setCategory] = useState<string>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<Blob | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Tickets State
  const [tickets, setTickets] = useState<FeedbackTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<FeedbackTicket | null>(null);
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Unread badge count
  const [unreadCount, setUnreadCount] = useState(0);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load tickets when dialog opens
  useEffect(() => {
    if (open && learner && activeTab === 'tickets') {
      loadTickets();
    }
  }, [open, learner, activeTab]);

  // Update unread count
  useEffect(() => {
    const count = tickets.filter(t => t.unread_by_user).length;
    setUnreadCount(count);
  }, [tickets]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to real-time updates for selected ticket
  useEffect(() => {
    if (!selectedTicket) return;

    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`feedback-ticket-${selectedTicket.id}`)
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

          // Mark ticket as read if staff replied
          if ((payload.new as FeedbackMessage).is_staff) {
            markTicketAsRead(selectedTicket.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTicket]);

  const loadTickets = useCallback(async () => {
    if (!learner) return;

    setLoadingTickets(true);
    try {
      const response = await fetch('/api/feedback');
      if (!response.ok) throw new Error('Failed to load tickets');
      const data = await response.json();
      setTickets(data || []);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoadingTickets(false);
    }
  }, [learner]);

  async function loadTicketDetails(ticketId: string) {
    try {
      const response = await fetch(`/api/feedback/${ticketId}`);
      if (!response.ok) throw new Error('Failed to load ticket details');
      const data = await response.json();

      setMessages(data.messages || []);
      setAttachments(data.attachments || []);

      // Mark as read locally
      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId ? { ...t, unread_by_user: false } : t
        )
      );
    } catch (error) {
      console.error('Failed to load ticket details:', error);
      toast.error('Failed to load ticket details');
    }
  }

  async function markTicketAsRead(ticketId: string) {
    try {
      const supabase = createBrowserClient();
      await supabase
        .from('feedback_tickets')
        .update({ unread_by_user: false })
        .eq('id', ticketId);

      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId ? { ...t, unread_by_user: false } : t
        )
      );
    } catch (error) {
      console.error('Failed to mark ticket as read:', error);
    }
  }

  function captureContext() {
    // Sanitize localStorage (remove sensitive keys)
    const sanitizedStorage: Record<string, string> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !['token', 'password', 'secret', 'auth', 'session'].some(s => key.toLowerCase().includes(s))) {
          sanitizedStorage[key] = localStorage.getItem(key) || '';
        }
      }
    } catch {
      // localStorage might not be available
    }

    return {
      browser: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      device_pixel_ratio: window.devicePixelRatio,
      url: window.location.href,
      path: window.location.pathname,
      query_params: Object.fromEntries(new URLSearchParams(window.location.search)),
      referrer: document.referrer,
      local_storage: sanitizedStorage,
      network_status: navigator.onLine ? 'online' : 'offline',
      console_errors: window.__feedbackErrors?.slice(-20) || [],
      recent_api_requests: window.__feedbackApiRequests?.slice(-10) || [],
      navigation_history: window.__feedbackNavHistory?.slice(-5) || [],
      performance: {
        page_load_time_ms: performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0,
        dom_ready_time_ms: performance.timing?.domContentLoadedEventEnd - performance.timing?.navigationStart || 0,
        memory_used_mb: (() => {
          const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
          return mem ? mem.usedJSHeapSize / 1024 / 1024 : 0;
        })(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async function captureScreenshot() {
    try {
      // Hide the feedback dialog temporarily
      setOpen(false);

      // Wait for dialog to close
      await new Promise(resolve => setTimeout(resolve, 300));

      // Capture screenshot
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          setScreenshot(blob);
          setScreenshotPreview(URL.createObjectURL(blob));
          toast.success('Screenshot captured!');
        }
      }, 'image/png');

      // Reopen dialog
      setOpen(true);
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      toast.error('Failed to capture screenshot');
      setOpen(true);
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large (max 10MB)');
        return;
      }
      setAttachedFile(file);
    }
  }

  async function handleSubmitFeedback() {
    if (!learner || !title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          page_url: window.location.href,
          page_path: window.location.pathname,
          context_data: captureContext(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create ticket');
      }

      const ticket = await response.json();

      // Upload screenshot if captured
      if (screenshot) {
        const screenshotFile = new File([screenshot], 'screenshot.png', { type: 'image/png' });
        await uploadAttachment(ticket.id, screenshotFile);
      }

      // Upload attached file if present
      if (attachedFile) {
        await uploadAttachment(ticket.id, attachedFile);
      }

      toast.success('Feedback submitted successfully! AI is analyzing your issue...');

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('bug');
      setScreenshot(null);
      setScreenshotPreview(null);
      setAttachedFile(null);

      // Switch to tickets tab
      setActiveTab('tickets');
      loadTickets();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadAttachment(ticketId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/feedback/${ticketId}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload attachment');
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
          is_internal_note: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to send message' }));
        throw new Error(error.detail || 'Failed to send message');
      }

      setNewMessage('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  }

  function handleSelectTicket(ticket: FeedbackTicket) {
    setSelectedTicket(ticket);
    loadTicketDetails(ticket.id);
  }

  function handleBackToList() {
    setSelectedTicket(null);
    setMessages([]);
    setAttachments([]);
  }

  if (!learner) return null;

  const tabs = [
    { key: 'new', label: 'New Feedback' },
    { key: 'tickets', label: `My Tickets${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
  ];

  return (
    <>
      {/* Fixed Position Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Feedback</span>
        {unreadCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Feedback Modal */}
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Platform Feedback" size="lg">
        <div className="flex flex-col" style={{ maxHeight: '65vh' }}>
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* New Feedback Tab */}
          {activeTab === 'new' && (
            <div className="flex-1 overflow-y-auto space-y-4 pt-4">
              <Select
                label="Category *"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={CATEGORY_OPTIONS}
              />

              <Input
                label="Title *"
                placeholder="Brief description of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Textarea
                label="Description *"
                placeholder="What happened? What were you trying to do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={captureScreenshot}
                  disabled={submitting}
                >
                  <Camera className="h-4 w-4" />
                  Capture Screenshot
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                >
                  <Paperclip className="h-4 w-4" />
                  Attach File
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,application/pdf,text/*"
                />
              </div>

              {screenshotPreview && (
                <div className="relative">
                  <img
                    src={screenshotPreview}
                    alt="Screenshot preview"
                    className="max-h-40 rounded border border-gray-200"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setScreenshot(null);
                      setScreenshotPreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {attachedFile && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                  <Paperclip className="h-4 w-4 text-gray-500" />
                  <span className="flex-1 text-sm text-gray-700">{attachedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Button
                onClick={handleSubmitFeedback}
                disabled={submitting || !title.trim() || !description.trim()}
                isLoading={submitting}
                className="w-full"
              >
                Submit Feedback
              </Button>
            </div>
          )}

          {/* My Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="flex-1 overflow-hidden flex flex-col pt-4">
              {!selectedTicket ? (
                // Ticket List
                <div className="flex-1 overflow-y-auto">
                  {loadingTickets ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No tickets yet. Submit your first feedback!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => handleSelectTicket(ticket)}
                          className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50 ${
                            ticket.unread_by_user ? 'border-l-4 border-l-indigo-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                                {ticket.unread_by_user && (
                                  <Badge variant="danger" size="sm">New</Badge>
                                )}
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                <Badge variant={getStatusVariant(ticket.status)}>
                                  {ticket.status.replace('_', ' ')}
                                </Badge>
                                <span>{CATEGORY_LABELS[ticket.category] || ticket.category}</span>
                                <span>&middot;</span>
                                <span>{ticket.message_count} messages</span>
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
              ) : (
                // Ticket Detail View
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="mb-4 flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleBackToList}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{selectedTicket.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant={getStatusVariant(selectedTicket.status)}>
                          {selectedTicket.status.replace('_', ' ')}
                        </Badge>
                        <span>{CATEGORY_LABELS[selectedTicket.category] || selectedTicket.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="mb-4 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.is_staff ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.is_staff
                                ? 'bg-indigo-50 text-gray-900'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="mb-1 text-xs font-medium">
                              {msg.user_display_name}
                              {msg.is_staff && (
                                <Badge variant="info" size="sm" className="ml-2">Staff</Badge>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
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
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
