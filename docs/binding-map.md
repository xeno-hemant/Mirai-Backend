# Mirai Data Binding Map & Shape-Lock Architecture

This document inventories every data source across the Mirai platform, maps hardcoded mock values to database schemas, and locks the DTO shapes to guarantee **Zero UI Modifications**.

---

## 1. Landing & Waitlist Module

| Component / Element | Baseline Mock Source | Target Table / Query | Backend Service & Action | DTO Shape Contract |
| :--- | :--- | :--- | :--- | :--- |
| `WaitlistForm` (`app/page.tsx:26-51`) | Hardcoded in-memory `Set` in `app/api/waitlist/route.ts` | `public.waitlist` (service-role insert, unique active email) | `src/server/services/waitlist.service.ts` -> `joinWaitlist()` | `{ message: string, email: string }` |
| Live Builder Counter (`app/page.tsx:64`) | Static string `"Join 1,200+ builders shaping what's next"` | `SELECT count(*) FROM public.waitlist WHERE deleted_at IS NULL` | `src/server/repositories/waitlist.repository.ts` -> `countActiveWaitlist()` | `number` (baseline $\ge 1200$) |
| Navigation Items (`app/page.tsx:8`) | Static `navItems` array | Static route anchor map | Unchanged static config | `string[]` |
| FAQs (`app/page.tsx:15-19`) | Static `faqs` matrix | Static editorial FAQ copy | Unchanged static config | `[string, string][]` |

---

## 2. Startups Module

| Component / Element | Baseline Mock Source | Target Table / Query | Backend Service & Action | DTO Shape Contract |
| :--- | :--- | :--- | :--- | :--- |
| Featured Ecosystem Startup (`app/page.tsx:65`) | Static hero card: Ideas in motion (+24% this week) | `public.startups` (`is_featured = true`) | `startups.service.ts` -> `fetchFeaturedStartup()` | `StartupDto` |
| Feature Cards (`app/page.tsx:9-14`) | Static `features` array | Static ecosystem pillars | Unchanged static config | `{ icon: LucideIcon, eyebrow: string, title: string, copy: string, tint: string }[]` |
| Startup Directory (API / Action) | Seeded: Komorebi AI | `public.startups` (cursor pagination, filters: stage, industry, location) | `startups.service.ts` -> `fetchStartups()` | `{ items: StartupDto[], nextCursor: string \| null }` |

---

## 3. Co-Founder Match Module

| Component / Element | Baseline Mock Source | Target Table / Query | Backend Service & Action | DTO Shape Contract |
| :--- | :--- | :--- | :--- | :--- |
| Front Profile Card (`app/page.tsx:72`) | Sana Mehta (`S`, Product + community, 92%, Product thinking, Climate, Remote) | `public.users` seeded row `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa` | `matching.service.ts` -> `fetchCandidateDeck()` | `{ id: string, full_name: string, headline: string, skills: string[], interests: string[], matchPercentage: number }` |
| Middle & Back Stack Cards | `J` (bg-blue), `M` (bg-violet) | `public.users` seeded candidate pool | `matching.service.ts` -> `fetchCandidateDeck()` | `UserRow[]` |
| Connect / Pass Handlers | Client state | `public.swipes` & `public.matches` via RPC `record_swipe_and_match` | `matching.actions.ts` -> `swipeAction()` | `{ isMatch: boolean, matchId: string \| null }` |

---

## 4. Community Module

| Component / Element | Baseline Mock Source | Target Table / Query | Backend Service & Action | DTO Shape Contract |
| :--- | :--- | :--- | :--- | :--- |
| Community Stats & Avatars (`app/page.tsx:74`) | Avatars: `N`, `T`, `V`, `+` (Jaipur to everywhere) | `public.community_groups` (`jaipur-builders`) + `public.community_posts` | `community.service.ts` -> `fetchFeed()` | `{ items: PostDto[], nextCursor: string \| null }` |
| Feed Posts | Seeded post: "Building in public: from Jaipur to everywhere" | `public.community_posts` | `community.service.ts` -> `fetchFeed()` | `PostDto` |
| Post Likes / Comments | Denormalized triggers `post_likes`, `post_comments` | `post_likes`, `post_comments` | `community.actions.ts` -> `toggleLikeAction()`, `addCommentAction()` | `{ liked: boolean }`, `CommentDto` |

---

## 5. Hackathons Module

| Component / Element | Baseline Mock Source | Target Table / Query | Backend Service & Action | DTO Shape Contract |
| :--- | :--- | :--- | :--- | :--- |
| Hackathon Tracks & Pillars (`app/page.tsx:76`) | 01 — Discover, 02 — Form, 03 — Ship | `public.hackathons` seeded row `mirai-genesis-2026` | `hackathons.service.ts` -> `fetchHackathons()` | `HackathonDto` |
| Registration & Teams | Static markup | `public.hackathon_registrations`, `public.hackathon_teams` | `hackathons.actions.ts` -> `registerHackathonAction()`, `createTeamAction()` | `{ registered: boolean }`, `TeamDto` |
| Leaderboard | In-memory points | `SELECT * FROM hackathon_teams ORDER BY points DESC, created_at ASC` | `hackathons.service.ts` -> `fetchLeaderboardForEvent()` | `TeamDto[]` |
