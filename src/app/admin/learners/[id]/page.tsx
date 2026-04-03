'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Monitor,
  MessageSquare,
  BookOpen,
  Trophy,
  Star,
  Clock,
  Target,
  Award,
} from 'lucide-react'
import { academyApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { AcademyLearner } from '@/types'

interface EngagementStats {
  total_sessions: number
  quiz_attempts: number
  quiz_accuracy: number
  chat_messages: number
}

interface Session {
  id: string
  started_at: string
  ended_at: string | null
  device: string | null
  browser: string | null
  os: string | null
  event_count: number
}

interface QuizAttempt {
  id: string
  question_text: string
  selected_answer: string
  correct_answer: string
  is_correct: boolean
  reasoning: string | null
  time_to_answer: number | null
  attempt_number: number
  created_at: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  source: string | null
  rating: number | null
  created_at: string
}

interface Enrollment {
  id: string
  track_title: string
  progress_pct: number
  status: string
  enrolled_at: string
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string | null
  earned_at: string
}

interface TalentReview {
  id: string
  reviewer_name: string
  score: number
  feedback: string
  created_at: string
}

interface LearnerDetail extends AcademyLearner {
  enrollments?: Enrollment[]
  badges?: Badge[]
  talent_reviews?: TalentReview[]
}

type TabKey = 'sessions' | 'quizzes' | 'chat' | 'progress'

const levelColors: Record<string, string> = {
  beginner: 'bg-gray-100 text-gray-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
  expert: 'bg-amber-100 text-amber-700',
  master: 'bg-red-100 text-red-700',
}

function formatDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return 'Active'
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m`
}

function formatDateTime(str: string): string {
  const d = new Date(str)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function AdminLearnerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [learner, setLearner] = useState<LearnerDetail | null>(null)
  const [engagement, setEngagement] = useState<EngagementStats | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [activeTab, setActiveTab] = useState<TabKey>('sessions')
  const [isLoading, setIsLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [togglingRole, setTogglingRole] = useState(false)

  useEffect(() => {
    loadLearner()
    loadEngagement()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    loadTabData(activeTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id])

  async function loadLearner() {
    setIsLoading(true)
    try {
      const res = await academyApi.get<LearnerDetail>(`/admin/learners/${id}`)
      setLearner(res)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadEngagement() {
    try {
      const res = await academyApi.get<EngagementStats>(`/admin/analytics/learner/${id}/engagement`)
      setEngagement(res)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadTabData(tab: TabKey) {
    if (tab === 'progress') return // uses learner data already fetched
    setTabLoading(true)
    try {
      if (tab === 'sessions') {
        const res = await academyApi.get<{ sessions: Session[] } | Session[]>(`/admin/analytics/learner/${id}/sessions`)
        setSessions(Array.isArray(res) ? res : res?.sessions ?? [])
      } else if (tab === 'quizzes') {
        const res = await academyApi.get<{ attempts: QuizAttempt[] } | QuizAttempt[]>(`/admin/analytics/learner/${id}/quiz-attempts`)
        setQuizAttempts(Array.isArray(res) ? res : res?.attempts ?? [])
      } else if (tab === 'chat') {
        const res = await academyApi.get<{ messages: ChatMessage[] } | ChatMessage[]>(`/admin/analytics/learner/${id}/chat-messages`)
        setChatMessages(Array.isArray(res) ? res : res?.messages ?? [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTabLoading(false)
    }
  }

  async function toggleRole() {
    if (!learner) return
    setTogglingRole(true)
    try {
      const newRole = learner.role === 'admin' ? 'learner' : 'admin'
      await academyApi.patch(`/admin/learners/${id}/role`, { role: newRole })
      setLearner({ ...learner, role: newRole })
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingRole(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!learner) {
    return (
      <div className="text-center py-20 text-gray-500">
        Learner not found.
      </div>
    )
  }

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'sessions', label: 'Sessions', icon: Monitor },
    { key: 'quizzes', label: 'Quiz History', icon: Target },
    { key: 'chat', label: 'Chat', icon: MessageSquare },
    { key: 'progress', label: 'Progress', icon: BookOpen },
  ]

  const lessonsCompleted = learner.enrollments?.reduce((sum, e) => {
    return sum + Math.round((e.progress_pct / 100) * 10) // approximate
  }, 0) ?? 0

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push('/admin/learners')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Learners
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {learner.avatar_url ? (
              <img
                src={learner.avatar_url}
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-lg font-semibold text-indigo-700">
                {learner.first_name[0]}{learner.last_name[0]}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {learner.first_name} {learner.last_name}
              </h1>
              <p className="text-sm text-gray-500">{learner.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                  levelColors[learner.level] || 'bg-gray-100 text-gray-700'
                )}>
                  {learner.level}
                </span>
                {learner.cohort && (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    {learner.cohort}
                  </span>
                )}
                <span className={cn(
                  'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                  learner.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                )}>
                  {learner.role === 'admin' ? 'Admin' : 'Learner'}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {learner.xp_total.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleRole}
            disabled={togglingRole}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              learner.role === 'admin'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
              togglingRole && 'opacity-50 cursor-not-allowed'
            )}
          >
            {togglingRole ? 'Updating...' : learner.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Monitor className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {engagement?.total_sessions ?? '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <Target className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Quiz Attempts</p>
              <p className="text-2xl font-bold text-gray-900">
                {engagement?.quiz_attempts ?? '—'}
                {engagement?.quiz_accuracy != null && (
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    ({Math.round(engagement.quiz_accuracy)}% acc)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Chat Messages</p>
              <p className="text-2xl font-bold text-gray-900">
                {engagement?.chat_messages ?? '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Lessons Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {lessonsCompleted}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tabLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div>
                  {sessions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No sessions recorded.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Started At</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Device</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Browser</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">OS</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Events</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sessions.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(s.started_at)}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{s.device || '—'}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{s.browser || '—'}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{s.os || '—'}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                <span className={cn(
                                  'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                                  s.ended_at ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                                )}>
                                  {formatDuration(s.started_at, s.ended_at)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">{s.event_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Quiz History Tab */}
              {activeTab === 'quizzes' && (
                <div>
                  {quizAttempts.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No quiz attempts recorded.</p>
                  ) : (
                    <div className="space-y-4">
                      {quizAttempts.map((q) => (
                        <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900">{q.question_text}</p>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                              Attempt #{q.attempt_number}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Selected Answer</p>
                              <p className={cn(
                                'text-sm px-3 py-1.5 rounded-lg',
                                q.is_correct
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-red-50 text-red-700'
                              )}>
                                {q.selected_answer}
                              </p>
                            </div>
                            {!q.is_correct && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Correct Answer</p>
                                <p className="text-sm px-3 py-1.5 rounded-lg bg-green-50 text-green-700">
                                  {q.correct_answer}
                                </p>
                              </div>
                            )}
                          </div>
                          {q.reasoning && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">Reasoning</p>
                              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                {q.reasoning}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            {q.time_to_answer != null && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {q.time_to_answer}s
                              </span>
                            )}
                            <span>{formatDateTime(q.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div>
                  {chatMessages.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No chat messages recorded.</p>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div className={cn(
                            'max-w-[75%] rounded-2xl px-4 py-3',
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          )}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <div className={cn(
                              'flex items-center gap-2 mt-1.5 text-xs',
                              msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                            )}>
                              <span>{formatDateTime(msg.created_at)}</span>
                              {msg.source && (
                                <span className={cn(
                                  'px-1.5 py-0.5 rounded text-[10px] font-medium',
                                  msg.role === 'user'
                                    ? 'bg-indigo-500 text-indigo-100'
                                    : 'bg-gray-200 text-gray-500'
                                )}>
                                  {msg.source}
                                </span>
                              )}
                              {msg.rating != null && (
                                <span className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        'h-3 w-3',
                                        i < msg.rating!
                                          ? 'text-amber-400 fill-amber-400'
                                          : msg.role === 'user'
                                            ? 'text-indigo-300'
                                            : 'text-gray-300'
                                      )}
                                    />
                                  ))}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div className="space-y-8">
                  {/* Enrollments */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Enrollments</h3>
                    {!learner.enrollments || learner.enrollments.length === 0 ? (
                      <p className="text-sm text-gray-500">No enrollments yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {learner.enrollments.map((e) => (
                          <div key={e.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-900">{e.track_title}</p>
                              <span className={cn(
                                'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                                e.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : e.status === 'active'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                              )}>
                                {e.status}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                style={{ width: `${e.progress_pct}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-400">
                                Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                              </span>
                              <span className="text-xs font-medium text-gray-600">
                                {e.progress_pct}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Talent Reviews */}
                  {learner.talent_reviews && learner.talent_reviews.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Talent Reviews</h3>
                      <div className="space-y-3">
                        {learner.talent_reviews.map((r) => (
                          <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-900">{r.reviewer_name}</p>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      'h-3.5 w-3.5',
                                      i < r.score
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-gray-300'
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{r.feedback}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(r.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Badges Earned</h3>
                    {!learner.badges || learner.badges.length === 0 ? (
                      <p className="text-sm text-gray-500">No badges earned yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {learner.badges.map((b) => (
                          <div
                            key={b.id}
                            className="border border-gray-200 rounded-lg p-4 text-center"
                          >
                            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-50 flex items-center justify-center">
                              <Award className="h-5 w-5 text-amber-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">{b.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{b.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(b.earned_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
