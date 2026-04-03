// ─── Core Learner ───────────────────────────────────────────────────────────

export interface AcademyLearner {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  age: number | null;
  sex: string | null;
  marital_status: string | null;
  cv_url: string | null;
  website_url: string | null;
  bio: string | null;
  avatar_url: string | null;
  xp_total: number;
  level: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  talent_score: number | null;
  management_score: number | null;
  is_flagged_talent: boolean;
  is_flagged_leader: boolean;
  onboarding_completed: boolean;
  selected_track: string | null;
  cohort: string | null;
  work_type: string | null;
  specialization: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearnerSettings {
  id: string;
  learner_id: string;
  notification_lesson_reminders: boolean;
  notification_streak_alerts: boolean;
  notification_peer_review: boolean;
  notification_team_challenges: boolean;
  notification_badges: boolean;
  preferred_track: string | null;
  ai_default_image_style: string | null;
  ai_default_voice: string | null;
  ai_default_video_style: string | null;
  ai_default_music_genre: string | null;
  theme: 'light' | 'dark' | 'system';
}

// ─── Curriculum ─────────────────────────────────────────────────────────────

export interface AcademyTrack {
  id: string;
  slug: string;
  title: string;
  description: string;
  prerequisite_track_id: string | null;
  is_invite_only: boolean;
  icon: string | null;
  duration_weeks: number;
  modules?: AcademyModule[];
}

export interface AcademyModule {
  id: string;
  track_id: string;
  slug: string;
  title: string;
  description: string;
  week_number: number;
  order: number;
}

export interface ContentBlock {
  type:
    | 'markdown'
    | 'code'
    | 'video'
    | 'image'
    | 'callout'
    | 'exercise'
    | 'quiz'
    | 'generation'
    | 'prompts'
    | 'hints'
    | 'checkpoint';
  content: string;
  metadata: Record<string, unknown>;
}

export interface AcademyLesson {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  description: string;
  content_blocks: ContentBlock[];
  ai_context: string | null;
  ai_tools_enabled: string[];
  exercise_config: Record<string, unknown> | null;
  xp_reward: number;
  passing_score: number | null;
  time_limit_minutes: number | null;
  order: number;
}

// ─── Progress & Enrollment ──────────────────────────────────────────────────

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface LessonProgress {
  id: string;
  learner_id: string;
  lesson_id: string;
  status: LessonStatus;
  time_spent: number;
  submission_data: Record<string, unknown> | null;
  quality_score: number | null;
  speed_score: number | null;
  creativity_score: number | null;
  curiosity_score: number | null;
  composite_score: number | null;
  xp_earned: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface AcademyEnrollment {
  id: string;
  learner_id?: string;
  track_id: string;
  track_slug?: string;
  track_title?: string;
  track_icon?: string;
  status: string;
  progress_pct: number;
  started_at?: string;
  enrolled_at?: string;
  completed_at?: string | null;
}

// ─── Chat ───────────────────────────────────────────────────────────────────

export interface AcademyChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// ─── AI Generation ──────────────────────────────────────────────────────────

export type GenerationType = 'image' | 'video' | 'audio' | 'music' | 'text';
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AcademyGeneration {
  id: string;
  learner_id: string;
  type: GenerationType;
  prompt: string;
  model: string | null;
  params: Record<string, unknown> | null;
  result_url: string | null;
  result_text: string | null;
  status: GenerationStatus;
  error: string | null;
  lesson_id: string | null;
  tokens_used: number | null;
  duration_ms: number | null;
  created_at: string;
}

export interface ImageGenParams {
  style: string | null;
  width: number | null;
  height: number | null;
  negative_prompt: string | null;
}

export interface ImageEvaluation {
  generation_id: string;
  rating: number | null;
  reflection: string | null;
  refinements_used: string[];
  hints_revealed: number;
}

export interface VideoGenParams {
  style: string | null;
  duration: number | null;
  resolution: string | null;
}

export interface AudioGenParams {
  voice: string | null;
  speed: number | null;
  format: string | null;
}

export interface MusicGenParams {
  genre: string | null;
  duration: number | null;
  mood: string | null;
  instruments: string[] | null;
}

// ─── Gamification ───────────────────────────────────────────────────────────

export type BadgeCategory =
  | 'achievement'
  | 'streak'
  | 'skill'
  | 'special'
  | 'milestone'
  | 'competition'
  | 'leadership'
  | 'curiosity'
  | 'consistency';

export interface AcademyBadge {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string | null;
  category: BadgeCategory;
}

export interface LearnerBadge {
  id: string;
  learner_id: string;
  badge_id: string;
  badge: AcademyBadge;
  earned_at: string;
}

export interface XpLogEntry {
  id: string;
  learner_id: string;
  amount: number;
  source: string;
  source_id: string | null;
  created_at: string;
}

export interface Certificate {
  id: string;
  learner_id: string;
  track_id: string;
  title: string;
  issued_at: string;
  share_url: string | null;
}

// ─── Social / Community ─────────────────────────────────────────────────────

export interface PeerReview {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  lesson_id: string;
  feedback_text: string;
  ai_quality_score: number | null;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  type: 'question' | 'answer';
  parent_id: string | null;
  content: string;
  is_accepted: boolean;
  helpfulness_score: number | null;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  xp_total: number;
  level: string;
  current_streak: number;
}

export interface TalentReview {
  id: string;
  learner_id: string;
  reviewer_email: string;
  recommendation: 'advance' | 'hold' | 'drop' | 'hire';
  notes: string | null;
  created_at: string;
}

// ─── Auth Payloads ──────────────────────────────────────────────────────────

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  age?: number;
  sex?: string;
  marital_status?: string;
  cv_url?: string;
  website_url?: string;
  work_type?: string;
  specialization?: string;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export interface DashboardData {
  xp_total: number;
  level: string;
  current_streak: number;
  enrollments: AcademyEnrollment[];
  recent_badges: LearnerBadge[];
  recent_xp: { amount: number; source: string; created_at: string }[];
}

// ─── Analytics & Sessions ──────────────────────────────────────────────────

export interface AcademySession {
  id: string;
  learner_id: string;
  started_at: string;
  expires_at: string;
  ended_at: string | null;
  is_active: boolean;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  total_events: number;
  lessons_viewed: number;
  lessons_completed: number;
  quizzes_attempted: number;
  chat_messages_sent: number;
}

export type AnalyticsEventType =
  | 'page_view'
  | 'lesson_start'
  | 'lesson_complete'
  | 'quiz_submit'
  | 'chat_send'
  | 'chat_receive'
  | 'hint_reveal'
  | 'checkpoint_complete'
  | 'generation_create'
  | 'track_enroll'
  | 'block_view'
  | 'text_highlight'
  | 'exercise_submit'
  | 'rating_submit'
  | 'login'
  | 'logout';

export interface AnalyticsEvent {
  event_type: AnalyticsEventType;
  lesson_id?: string;
  module_id?: string;
  track_id?: string;
  metadata?: Record<string, unknown>;
  client_ts: string;
}

export interface QuizAttempt {
  lesson_id: string;
  block_index: number;
  question_text: string;
  options: string[];
  correct_index: number;
  selected_index: number;
  selected_answer: string;
  reasoning: string;
  is_correct: boolean;
  attempt_number: number;
  time_to_answer_ms: number | null;
  time_to_reasoning_ms: number | null;
  answer_changed: boolean;
}

export interface PersistedChatMessage {
  id: string;
  session_id: string;
  learner_id: string;
  lesson_id: string | null;
  role: 'user' | 'assistant';
  content: string;
  source: ChatMessageSource;
  rating: number | null;
  created_at: string;
}

export type ChatMessageSource =
  | 'typed'
  | 'prompt_chip'
  | 'highlight_ask'
  | 'quiz_feedback'
  | 'checkpoint';

export interface BlockViewData {
  block_index: number;
  block_type: string;
  time_visible_ms: number;
}

export interface EvaluationScores {
  id: string;
  learner_id: string;
  analytical_reasoning: number;
  engagement_depth: number;
  management_aptitude: number;
  self_direction: number;
  consistency: number;
  growth_trajectory: number;
  communication_quality: number;
  composite_talent_score: number;
  composite_management_score: number;
  score_breakdown: Record<string, unknown>;
  evaluation_date: string;
}

// ─── Pagination ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  has_more: boolean;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  next_cursor: string | null;
  has_more: boolean;
}
