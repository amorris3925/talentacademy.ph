# Comprehensive Code Review Findings — talentacademy.ph

**Date:** 2026-04-02
**Scope:** Full codebase — 82 TypeScript/TSX files, 30+ pages, 50+ components, 7 stores, 2 API routes
**Method:** 10 parallel review agents, each reading every file in their domain line-by-line

---

## Executive Summary

| Severity | Count | Description |
|----------|-------|-------------|
| **P0 Critical** | 14 | Security vulnerabilities, data exposure, crashes |
| **P1 High** | 68 | Bugs, race conditions, a11y failures, broken features |
| **P2 Medium** | 95+ | UX issues, validation gaps, performance, code quality |
| **P3 Low** | 60+ | Minor optimizations, style consistency, dead code |

**Total: ~240 unique findings across 82 files.**

---

## P0 — CRITICAL (Must Fix Before Any Deployment)

### Security

| # | File | Issue | Agent |
|---|------|-------|-------|
| 1 | `src/app/admin/layout.tsx` | **Admin panel has ZERO auth** — no login check, no role check. Any visitor can access `/admin/*` and view all learner PII. | 1,7 |
| 2 | `src/app/api/academy/[...path]/route.ts:43-45` | **SSRF via path traversal** — attacker can send `../../internal-service/secret` to reach internal endpoints behind the proxy. No path sanitization. | 1 |
| 3 | `src/components/lesson/MarkdownBlock.tsx:15-19` | **XSS via post-sanitization injection** — regex replacement runs AFTER DOMPurify, injecting unsanitized `$1` content into HTML attributes. Attribute breakout possible. | 2,5 |
| 4 | **(missing file)** `middleware.ts` | **No server-side route protection exists** — all auth is client-side only. Protected pages download full JS before redirecting. | 1 |
| 5 | `next.config.ts` | **No security headers** — missing CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy. Zero configuration. | 8,10 |
| 6 | `src/components/ui/Modal.tsx:37-45` | **No focus trap in modal** — Tab escapes to background content. WCAG 2.1 Level A failure. | 4,10 |

### Crashes & Data Integrity

| # | File | Issue | Agent |
|---|------|-------|-------|
| 7 | `src/components/lesson/QuizBlock.tsx:56` | **Crash: `metadata.options` unguarded** — if undefined from unsafe cast, `.map()` throws TypeError, crashing the page. | 5 |
| 8 | `src/components/lesson/HighlightToAsk.tsx:25-28` | **Click race condition** — `mousedown` clears selection and unmounts popup before `onClick` fires on "Ask AI" button, making it un-clickable. | 5 |
| 9 | `src/components/lesson/HighlightToAsk.tsx:55-56` | **Popup positioned wrong** — `fixed` positioning uses scroll-offset values, placing popup at wrong location. | 5 |
| 10 | `src/lib/api.ts:91` | **`null as T` defeats TypeScript generics** — 204 responses return `null` typed as `T`, causing null dereference in callers. | 9 |
| 11 | `src/stores/generation.ts:63` | **`Set<string>` in Zustand state** — non-serializable, breaks devtools and persistence. | 3,9 |
| 12 | `src/stores/interaction.ts:19` | **`Set<string>` in Zustand state** — same issue for `completedCheckpoints`. | 3,9 |
| 13 | `src/stores/generation.ts:35-37` | **`academyApi.post<any>` with unsafe cast to `AcademyGeneration`** — no validation on API response shape. | 9 |
| 14 | `src/lib/api.ts:154-206` | **SSE `stream()` has no timeout** — hung connection hangs forever. All other methods have timeouts. | 1,3,8 |

---

## P1 — HIGH (Should Fix Soon)

### Security & Auth

| # | File | Issue |
|---|------|-------|
| 15 | `src/app/api/academy/[...path]/route.ts:5` | `NEXT_PUBLIC_HENRY_API_URL` leaks internal backend URL to browser bundle |
| 16 | `src/stores/auth.ts:43-44` | `getSession()` used instead of `getUser()` — client auth state can be spoofed via localStorage |
| 17 | `src/stores/auth.ts:99` | Registration sends plaintext password to Henry backend (should only go to Supabase) |
| 18 | `src/app/(learner)/layout.tsx:18-22` | Client-side-only auth guard — flash of content before redirect |
| 19 | `src/app/(learner)/settings/page.tsx:456-477` | Password change does NOT verify current password — `oldPassword` collected but never sent |
| 20 | `src/app/(learner)/settings/page.tsx:479-489` | Account deletion has no re-authentication — only requires typing "DELETE" |

### Broken Features

| # | File | Issue |
|---|------|-------|
| 21 | `src/components/chat/ChatSidebar.tsx:30-39` | `didLoad.current` prevents chat reload on lesson change — stale messages persist |
| 22 | `src/components/chat/GhostPrompts.tsx` + `ChatSidebar.tsx` | Ghost prompts are non-functional — `triggerPrompt` writes to store but nothing reads it |
| 23 | `src/components/chat/OutputRating.tsx:11,20` | Rating is never persisted to API — user feedback is lost on unmount |
| 24 | `src/components/generation/VideoGenerator.tsx:26,48-54` | `sourceImage` captured but never sent to API — image-to-video feature is broken |
| 25 | `src/components/generation/TextGenerator.tsx:14-20` | Shares chat store with lesson chat — cross-contamination of messages |
| 26 | `src/app/(learner)/community/page.tsx:96-108` | Votes are client-side only — never persisted to server, lost on refresh |
| 27 | `src/components/lesson/ExerciseBlock.tsx:107-122` | Run/Submit buttons permanently disabled — handlers are dead code |

### Race Conditions & State Bugs

| # | File | Issue |
|---|------|-------|
| 28 | `src/stores/chat.ts:88-167` | No guard against concurrent `sendMessage()` — double-click sends duplicate messages, interleaves streams |
| 29 | `src/stores/chat.ts:174` | `sendFromInteraction()` doesn't await `sendMessage()` — errors silently lost |
| 30 | `src/stores/auth.ts:118-128` | Logout doesn't unsubscribe auth listener — old listener fires after re-login |
| 31 | `src/stores/generation.ts:134-136` | Single `pollAbortController` — concurrent generations clobber each other |
| 32 | `src/stores/settings.ts:100-102` | `deleteAccount` doesn't clear local state — user can continue using app |
| 33 | `src/stores/auth.ts:38-81` | Race condition in `initialize()` — no mutex, concurrent calls both execute |

### Navigation Bugs

| # | File | Issue |
|---|------|-------|
| 34 | `src/app/(learner)/tracks/[trackSlug]/[moduleSlug]/[lessonSlug]/page.tsx` | Breadcrumbs are `<span>` not `<Link>` — not clickable |
| 35 | Same file | NavButton uses `window.location.href` — full page reload, loses all Zustand state |

### Accessibility (WCAG Failures)

| # | File | Issue |
|---|------|-------|
| 36 | `src/components/ui/Modal.tsx` | No focus restoration on close — focus falls to `<body>` |
| 37 | `src/components/ui/Modal.tsx` | No auto-focus on open — screen readers don't know modal appeared |
| 38 | `src/components/ui/Modal.tsx` | No accessible label when `title` is undefined |
| 39 | `src/components/ui/Tabs.tsx:38-46` | Arrow keys change tab but don't move focus |
| 40 | `src/components/ui/Button.tsx:46` | No default `type="button"` — causes form submission inside `<form>` |
| 41 | `src/components/layout/LearnerHeader.tsx:92-120` | Dropdown menu has no keyboard navigation (Arrow/Escape) |
| 42 | `src/components/layout/LearnerHeader.tsx:92-120` | Dropdown doesn't close on Escape key |
| 43 | `src/components/layout/LearnerSidebar.tsx:53-57` | No focus trap on mobile sidebar overlay |
| 44 | `src/app/(auth)/register/page.tsx:167-176` | Labels not associated with inputs (`htmlFor`/`id` missing) |
| 45 | `src/app/(auth)/register/page.tsx:204` | `grid-cols-3` with no responsive breakpoint — broken on mobile |
| 46 | `src/app/(auth)/forgot-password/page.tsx:75-82` | Label not associated with email input |
| 47 | `src/app/(auth)/reset-password/page.tsx:108-129` | Labels not associated with password inputs |
| 48 | `src/app/(learner)/community/page.tsx:187-215` | Vote buttons use `title` not `aria-label` — not announced |
| 49 | `src/app/(learner)/community/page.tsx:330` | `text-gray-400` on white — 2.85:1 contrast, fails WCAG AA |
| 50 | `src/app/(learner)/dashboard/page.tsx:119-157` | Multiple `text-gray-400` instances failing contrast |
| 51 | `src/app/(learner)/profile/page.tsx:185` | `text-[9px] text-gray-400` — below WCAG minimum size and fails contrast |
| 52 | Multiple files | Loading spinners have no `role="status"` or screen reader text |

### Type Safety (causing potential crashes)

| # | File | Issue |
|---|------|-------|
| 53 | `src/components/lesson/ContentBlockRenderer.tsx` | 10 unsafe `as` casts on `block.metadata` — backend shape mismatch crashes children |
| 54 | `src/types/index.ts:86` | `ContentBlock.metadata` is `Record<string, unknown>` — should be discriminated union |
| 55 | All stores | 12+ instances of `academyApi.get<any>` / `academyApi.post<any>` — defeats type checking |
| 56 | `src/stores/generation.ts:73,88,103,118` | Double cast `as unknown as Record<string, unknown>` — most dangerous assertion form |

### Performance

| # | File | Issue |
|---|------|-------|
| 57 | **(missing files)** | Zero `loading.tsx` files anywhere — no streaming SSR, no skeleton UI |
| 58 | **(missing usage)** | Zero `next/dynamic` imports — no code splitting beyond routes |
| 59 | **(missing usage)** | Zero `React.memo` usage — all components re-render unnecessarily |
| 60 | `src/components/lesson/ContentBlockRenderer.tsx:4-15` | All 11 block types eagerly imported (most lessons use 3-4) |
| 61 | `src/components/generation/GenerationStudio.tsx:6-10` | All 5 generators eagerly imported (only 1 visible at a time) |
| 62 | `src/stores/generation.ts:130-171` | Polling at fixed 2s rate for 5 min — no exponential backoff |

### Other P1

| # | File | Issue |
|---|------|-------|
| 63 | `src/components/lesson/MarkdownBlock.tsx:15` | DOMPurify may crash during SSR (called in useMemo, no window guard) |
| 64 | `src/components/lesson/VideoBlock.tsx:8-15` | Loom URLs pass `isEmbedUrl` but `toEmbedUrl` has no Loom handler — broken iframe |
| 65 | `src/components/lesson/CalloutBlock.tsx:48` | Unknown callout type crashes — `config.icon` is undefined |
| 66 | `src/components/lesson/GenerationBlock.tsx:56` | `style` initialized to `''` — sends invalid value to backend |
| 67 | `src/components/lesson/Checkpoint.tsx:27-30` | Keyword matching uses `includes()` — "ai" matches "container", "detail" |
| 68 | `src/components/lesson/Checkpoint.tsx:27` | `msg.content.toLowerCase()` crashes if content is undefined |
| 69 | `src/components/lesson/HighlightToAsk.tsx:18-21` | `getRangeAt(0)` throws when `rangeCount === 0` |
| 70 | `src/components/generation/ImageGenerator.tsx:32` | Global `isGenerating` flag blocks unrelated generator types |
| 71 | `src/stores/gamification.ts:49-57` | Error resets all stats to zero — flashes 0 XP on network blip |
| 72 | `src/stores/auth.ts:122-127` | Logout doesn't call `cancelPolling()` — in-flight polls survive |
| 73 | `src/app/admin/talent/page.tsx:15-16` | "All Flagged" filter shows ALL learners, not just flagged |
| 74 | `src/app/admin/content/page.tsx:14` | API response type mismatch — expects array, API returns object |
| 75 | `src/app/terms/page.tsx:27` | Terms says "18 years old" but registration allows age 16 |
| 76 | `src/stores/gamification.ts:29-31` | Duplicate API calls — `loadStats()` hits both `/dashboard` AND `/profile` |
| 77 | `src/stores/auth.ts:83-116` | `login()`/`register()` + listener both fetch `/learner/profile` (redundant) |
| 78 | `src/components/ui/FileUpload.tsx:63` | `onUpload` callback not wrapped in try/catch — unhandled rejection |
| 79 | `src/components/ui/Spinner.tsx:8` | `border-3` not a standard Tailwind class — large spinner may be invisible |
| 80 | `src/app/(learner)/leaderboard/page.tsx:139` | Rank calculation wrong during pagination |
| 81 | Multiple files | Error alerts lack `role="alert"` — screen readers don't announce errors |
| 82 | `src/app/(learner)/tracks/[trackSlug]/[moduleSlug]/[lessonSlug]/page.tsx` | Mobile tabs missing ARIA tab roles |

---

## P2 — MEDIUM (Fix Before Launch)

### Input Validation (16 issues)
- No email format validation beyond `type="email"` in registration (browser validation bypassed)
- Age bounds not enforced in JS (only HTML attributes, user can submit age=999)
- No `maxLength` on: chat messages, community posts, generation prompts, name fields, exercise code
- No file size validation on CV upload or video source image upload
- No URL scheme validation on `websiteUrl` (allows `javascript:`)
- No password complexity requirements beyond length >= 8
- Settings `updateProfile` accepts arbitrary partial objects (potential mass assignment)
- Community answers use single-line `<input>` instead of `<textarea>`

### Error Handling (12 issues)
- No React error boundary anywhere — unhandled render errors crash entire page
- Settings store error handling inconsistent (some throw, some swallow)
- Generation `loadHistory` silently swallows errors
- Lesson `error` state never auto-clears after being set
- Admin pages swallow errors with `console.error`
- Upstream error bodies forwarded verbatim to client (may contain stack traces)

### State Management (8 issues)
- `streamingContent` updates on every SSE chunk — dozens of re-renders/sec during streaming
- Cross-store reset in logout uses hardcoded state shapes — breaks if stores change
- Settings `updateSettings` when `settings` is null stays null despite server success
- Module-level `saveTimer` never cleared on logout
- Chat `clearHistory` on lesson change destroys conversation with no warning

### Performance (10 issues)
- Dashboard page: `DashboardChat` is heavy inline component, not lazy-loaded
- Lesson page: full store destructuring causes excessive re-renders
- Gamification + auth + dashboard page all fetch overlapping endpoints
- Progress fetch is serial, not parallel with lesson/track fetch
- `Toaster` from sonner loaded on every page including landing
- Landing page `new Date().getFullYear()` prevents static generation

### Accessibility (15 issues)
- Registration progress stepper has no accessible labels
- CV drag-and-drop zone has no keyboard accessibility
- Chat streaming content has no `aria-live` region
- HighlightToAsk is entirely mouse-dependent (no keyboard)
- Multiple loading spinner buttons have no accessible text when loading
- No `<main>` landmark in root layout
- Leaderboard table has no `<caption>`

### CSS/Design (10 issues)
- No dark mode support despite `theme` setting in `LearnerSettings`
- No design tokens — raw Tailwind colors hardcoded everywhere
- Inconsistent border-radius across similar components
- MarkdownBlock has 500+ character className string
- DOMPurify default config allows risky elements (`<form>`, `<style>`, `<input>`)

### Other P2 (20+ issues)
- Votes have race condition with stale closure state
- `VoteButtons` defined inside render function — remounts every render
- Profile enrolled tracks not clickable
- Settings track preferences don't match actual tracks
- Admin learner rows show chevron but aren't clickable
- Terms and Privacy are placeholder documents published as real pages
- Various `useEffect` dependency array violations across pages
- OAuth callback redirect validation doesn't block backslash

---

## P3 — LOW (Nice to Have)

60+ minor issues including:
- Missing `aria-hidden` on decorative icons throughout
- Redundant spinner accessibility attributes
- Dead code (unused imports, empty functions, disabled features)
- Timer leaks (setTimeout not cleaned up on unmount)
- Missing `type="button"` on many non-submit buttons
- `focus:` vs `focus-visible:` inconsistency in form inputs
- Index-based React keys where content-based keys would be better
- Font loading could include `latin-ext` subset
- Landing page allocates arrays inline in JSX
- No syntax highlighting in CodeBlock
- Inconsistent optionality patterns in TypeScript types (`?` vs `| null`)

---

## Top 10 Fixes by Impact

1. **Create `middleware.ts`** with server-side auth for all protected routes + admin role check
2. **Sanitize proxy path** in `route.ts` to prevent SSRF (reject `..` traversal)
3. **Fix MarkdownBlock XSS** — run DOMPurify AFTER regex replacement, not before
4. **Add security headers** in `next.config.ts` (CSP, HSTS, X-Frame-Options, etc.)
5. **Add focus trap to Modal** (WCAG Level A requirement)
6. **Rename `NEXT_PUBLIC_HENRY_API_URL`** to `HENRY_API_URL` (stop leaking backend URL)
7. **Add AbortController to `stream()`** in api.ts (prevent hung connections)
8. **Replace `Set<string>` with `string[]`** in generation and interaction stores
9. **Create discriminated union for `ContentBlock`** types (eliminate all unsafe metadata casts)
10. **Add `loading.tsx` files** and `next/dynamic` imports (code splitting + UX)
