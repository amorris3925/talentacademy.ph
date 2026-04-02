'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  MessageCircleQuestion,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Send,
  MessageSquare,
} from 'lucide-react';
import { academyApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { formatDate } from '@/lib/utils';
import { Card, Spinner, Button, Badge, Avatar, EmptyState } from '@/components/ui';
import type { CommunityPost } from '@/types';

interface QuestionWithAnswers extends CommunityPost {
  answers: CommunityPost[];
}

export default function CommunityPage() {
  const { learner } = useAuthStore();
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New question form
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Expanded questions and answer inputs
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [submittingAnswer, setSubmittingAnswer] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await academyApi.get<any>('/community/posts');
      const posts: CommunityPost[] = res.posts || [];

      // Group answers under questions
      const questionMap = new Map<string, QuestionWithAnswers>();
      const answers: CommunityPost[] = [];

      for (const post of posts) {
        if (post.type === 'question') {
          questionMap.set(post.id, { ...post, answers: [] });
        } else {
          answers.push(post);
        }
      }

      for (const answer of answers) {
        if (answer.parent_id && questionMap.has(answer.parent_id)) {
          questionMap.get(answer.parent_id)!.answers.push(answer);
        }
      }

      setQuestions(
        Array.from(questionMap.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;
    setSubmittingQuestion(true);
    try {
      await academyApi.post('/community/posts', {
        type: 'question',
        content: newQuestion.trim(),
      });
      setNewQuestion('');
      setShowAskForm(false);
      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post question');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const content = answerInputs[questionId]?.trim();
    if (!content) return;
    setSubmittingAnswer(questionId);
    try {
      await academyApi.post('/community/posts', {
        type: 'answer',
        content,
        parent_id: questionId,
      });
      setAnswerInputs((prev) => ({ ...prev, [questionId]: '' }));
      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post answer');
    } finally {
      setSubmittingAnswer(null);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      await academyApi.patch(`/community/posts/${answerId}/accept`);
      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept answer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          <p className="mt-1 text-sm text-gray-500">Ask questions and help fellow learners.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAskForm(!showAskForm)}
        >
          <MessageCircleQuestion className="h-4 w-4" />
          Ask a Question
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Ask Question Form */}
      {showAskForm && (
        <Card>
          <div className="space-y-3">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="What would you like to ask the community?"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAskForm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submittingQuestion}
                onClick={handleAskQuestion}
                disabled={!newQuestion.trim()}
              >
                Post Question
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No questions yet"
          description="Be the first to ask a question!"
          action={{ label: 'Ask a Question', onClick: () => setShowAskForm(true) }}
        />
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const isExpanded = expandedIds.has(q.id);
            const isMyQuestion = q.author_id === learner?.id;
            const acceptedAnswer = q.answers.find((a) => a.is_accepted);

            return (
              <Card key={q.id}>
                {/* Question header */}
                <button
                  type="button"
                  className="flex w-full items-start gap-3 text-left"
                  onClick={() => toggleExpanded(q.id)}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{q.content}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span>{q.author_name}</span>
                      <span>{formatDate(q.created_at)}</span>
                      <Badge variant={q.answers.length > 0 ? 'success' : 'default'} size="sm">
                        {q.answers.length} {q.answers.length === 1 ? 'answer' : 'answers'}
                      </Badge>
                      {acceptedAnswer && (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Solved
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                  ) : (
                    <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                  )}
                </button>

                {/* Answers */}
                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                    {q.answers.length === 0 && (
                      <p className="text-xs text-gray-400">No answers yet. Be the first to help!</p>
                    )}

                    {q.answers
                      .sort((a, b) => {
                        if (a.is_accepted && !b.is_accepted) return -1;
                        if (!a.is_accepted && b.is_accepted) return 1;
                        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                      })
                      .map((answer) => (
                        <div
                          key={answer.id}
                          className={`rounded-lg border p-3 ${
                            answer.is_accepted
                              ? 'border-green-200 bg-green-50/50'
                              : 'border-gray-100 bg-gray-50/50'
                          }`}
                        >
                          <p className="text-sm text-gray-700">{answer.content}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{answer.author_name}</span>
                              <span>{formatDate(answer.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {answer.is_accepted && (
                                <Badge variant="success" size="sm">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Accepted
                                </Badge>
                              )}
                              {isMyQuestion && !acceptedAnswer && !answer.is_accepted && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAcceptAnswer(answer.id)}
                                >
                                  Accept
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Answer input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={answerInputs[q.id] ?? ''}
                        onChange={(e) =>
                          setAnswerInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="Write an answer..."
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmitAnswer(q.id);
                          }
                        }}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={submittingAnswer === q.id}
                        disabled={!answerInputs[q.id]?.trim()}
                        onClick={() => handleSubmitAnswer(q.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
