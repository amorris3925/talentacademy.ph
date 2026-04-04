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
  role: 'learner' | 'admin';
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

export interface ChatImage {
  data: string;        // base64-encoded
  media_type: string;  // e.g. "image/png"
  url?: string;        // server-side URL if persisted
}

export interface ToolCallEvent {
  tool_call_id: string;
  tool_name: string;
  tool_input: Record<string, unknown>;
  status: 'running' | 'done' | 'error';
  result_preview?: string;
  duration_ms?: number;
}

export type AcademyStructuredBlock =
  | { type: 'image'; url: string; alt?: string }
  | { type: 'data_table'; title?: string; columns: Array<{ key: string; label: string }>; rows: Array<Record<string, unknown>> }
  | { type: 'chart'; chart_type: string; title?: string; labels: string[]; datasets: Array<{ label: string; data: number[] }> }
  | { type: 'artifact_embed'; artifact_id: string; title: string; artifact_type: string; summary?: string };

export interface AcademyChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  images?: ChatImage[];
  tool_calls?: ToolCallEvent[];
  structured_blocks?: AcademyStructuredBlock[];
  is_image_request?: boolean;
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

// ─── Gemini Vision / Image Pipeline ─────────────────────────────────────────

export interface GeminiDescribeRequest {
  images: Array<{ data?: string; media_type?: string; url?: string }>;
  context?: string;
}

export interface GeminiDescribeResponse {
  descriptions: string[];
}

export interface GeminiGenerateImageRequest {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
}

export interface GeminiGenerateImageResponse {
  url?: string;
  base64?: string;
  media_type?: string;
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
  recaptcha_token: string;
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
  | 'checkpoint'
  | 'lesson_trigger'
  | 'content_prompt';

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

// ─── Artifacts ─────────────────────────────────────────────────────────────

export type ArtifactType =
  | 'document'
  | 'blog_post'
  | 'seo_article'
  | 'design_brief'
  | 'marketing_plan'
  | 'campaign'
  | 'workflow'
  | 'report';

export type ArtifactStatus = 'draft' | 'submitted' | 'evaluated' | 'published';

export interface AcademyArtifact {
  id: string;
  learner_id: string;
  lesson_id: string | null;
  track_id: string | null;
  title: string;
  slug: string;
  artifact_type: ArtifactType;
  content_markdown: string;
  sections: ArtifactSection[] | null;
  summary: string | null;
  metadata: Record<string, unknown>;
  tags: string[];
  status: ArtifactStatus;
  is_public: boolean;
  quality_score: number | null;
  creativity_score: number | null;
  completeness_score: number | null;
  skill_signals: Record<string, number>;
  evaluation_notes: string | null;
  evaluated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtifactSection {
  label: string;
  content: string;
  status?: string;
}

export interface ArtifactVersion {
  id: string;
  artifact_id: string;
  version_number: number;
  title: string | null;
  content_markdown: string | null;
  sections: ArtifactSection[] | null;
  summary: string | null;
  snapshot_at: string;
}

export interface SkillProfile {
  id: string;
  learner_id: string;
  track_id: string | null;
  skill_domain: string;
  skill_name: string;
  current_score: number;
  assessment_count: number;
  trend: 'improving' | 'stable' | 'declining';
  last_assessed_at: string | null;
}

// ─── Feedback / Ticketing ──────────────────────────────────────────────────

export type FeedbackTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'not_relevant';
export type FeedbackTicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type FeedbackTicketCategory = 'bug' | 'feature_request' | 'question' | 'other';

export interface FeedbackTicket {
  id: string;
  user_id: string;
  user_email: string;
  user_display_name: string;
  ticket_number: number;
  status: FeedbackTicketStatus;
  priority: FeedbackTicketPriority;
  category: FeedbackTicketCategory;
  title: string;
  description: string;
  page_url: string;
  page_path: string | null;
  context_data: Record<string, unknown>;
  assigned_to: string | null;
  assigned_at: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  ai_problem_diagnosis: string | null;
  ai_recommended_fix: string | null;
  ai_analysis_model: string | null;
  ai_analyzed_at: string | null;
  unread_by_user: boolean;
  unread_by_admin: boolean;
  last_message_at: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
  // From views
  assigned_to_name?: string | null;
  attachment_count?: number;
  last_message?: string | null;
}

export interface FeedbackMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  user_email: string;
  user_display_name: string;
  is_staff: boolean;
  message: string;
  is_internal_note: boolean;
  created_at: string;
}

export interface FeedbackAttachment {
  id: string;
  ticket_id: string | null;
  message_id: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  storage_url: string;
  uploaded_by: string;
  uploaded_by_email: string;
  created_at: string;
}

export interface FeedbackStats {
  total_tickets: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  unread_count: number;
}

export interface FeedbackTeamMember {
  id: string;
  email: string;
  display_name: string;
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
