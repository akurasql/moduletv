# Build Prompt: "Module TV" — An Apple TV–style Streaming Front-End

## 0. Project Summary

Build a production-quality, Apple TV app–inspired web application called **Module**. It is a front-end streaming hub that mirrors the visual language, motion, and information architecture of Apple's tvOS/Apple TV app — but sources its actual playback and catalog via the **CinemaOS** embed player, and its metadata (posters, cast, ratings, descriptions, "Top 10" charts) via **TMDB (The Movie Database) API**.

This is a content aggregator front-end. It does not host or store any video files. All playback happens inside the CinemaOS iframe player.

**Non-negotiable design principle:** this must look and feel like it was designed by Apple's Human Interface team — not like a generic "AI-generated" dashboard. No purple-to-blue gradient hero banners, no glassmorphism-for-its-own-sake, no emoji-as-icons, no default shadcn "card grid of gradients" look. Reference the real Apple TV app (macOS/tvOS/iOS) for spacing, typography, motion, and hierarchy.

---

## 1. Tech Stack

- **Framework:** Next.js 14+ (App Router), TypeScript strict mode.
- **Styling:** Tailwind CSS with a custom design-token layer (see Section 3) + CSS variables for theming. No component library that imposes its own visual identity (avoid default shadcn styling verbatim — if used, restyle every primitive).
- **Animation:** Framer Motion for transitions, shared-element focus states, and parallax.
- **Auth & DB:** Supabase (Postgres + Auth + Storage). Use Supabase Auth for email/password and OAuth (Google, Apple if available). Use Supabase Storage for user avatar uploads.
- **State/data-fetching:** React Server Components for initial data, TanStack Query for client-side mutations/refetches (watchlist toggles, continue-watching updates).
- **Metadata source:** TMDB API (v3) — requires a free TMDB API key (the user must obtain their own key at themoviedb.org/settings/api and place it in `.env` as `TMDB_API_KEY`). TMDB provides posters, backdrops, cast/crew, genres, ratings, runtimes, "trending"/"top rated" lists, and season/episode data for TV shows.
- **Playback source:** CinemaOS embed player (`https://cinemaos.tech/player/{tmdb_id}` for movies, `https://cinemaos.tech/player/{tmdb_id}/{season}/{episode}` for TV). Since CinemaOS keys directly off TMDB IDs, TMDB is the single source of truth for IDs across the whole app — every card, row, and detail page carries the `tmdb_id` and `media_type` (movie | tv) forward into the player route.
- **Deployment target:** Vercel (mention this only as an assumption; don't hard-couple to Vercel-only APIs).

---

## 2. CinemaOS Integration Reference (verified from cinemaos.live/embed)

Give the agent this exact reference so it doesn't invent an API:

```
Movie endpoint:   https://cinemaos.tech/player/{tmdb_id}?theme=ffffff
TV endpoint:      https://cinemaos.tech/player/{tmdb_id}/{season}/{episode}?theme=ffffff

Embed rules:
- iframe, width 100%, height 100%
- frameborder="0"
- allowfullscreen
- allow="encrypted-media"
- Always pass theme=ffffff per project spec (white accent theme in the player chrome)
- Optional query params exposed by the configurator: autoPlay, title, autoNext (boolean-style params — confirm exact casing/values by inspecting the live configurator output at https://cinemaos.live/embed before shipping, since the docs page only renders full parameter/event/postMessage tables client-side)
- CinemaOS also exposes a postMessage API for playback events (progress, play/pause, ended) — inspect https://cinemaos.live/embed in a browser dev console (the "Events" and "PostMessage API" tabs) to capture the exact message schema, then implement a listener so "Continue Watching" progress can be persisted from real playback position rather than only "last opened" timestamps. If the postMessage schema can't be confirmed, fall back gracefully to "last opened" tracking — do not guess at an event contract and ship it silently broken.
```

**Component: `<CinemaOSPlayer />`**
- Props: `tmdbId: string`, `mediaType: 'movie' | 'tv'`, `season?: number`, `episode?: number`, `autoPlay?: boolean`.
- Renders a responsive 16:9 (or fills a fixed-position full-bleed player view on the detail/watch page, matching Apple TV's edge-to-edge playback view).
- Wrap in an `<AspectRatioBox>` utility for non-fullscreen contexts (e.g., a mini preview) and a full-viewport mode for the actual watch screen.
- Attach a `window.addEventListener('message', ...)` handler; namespace-guard it by checking `event.origin` against the CinemaOS domain before trusting payloads.

---

## 3. Design System ("Apple-native, not AI-slop")

Give the agent explicit constraints — this section is the difference between a generic clone and a convincing one.

### 3.1 Typography
- Use **SF Pro Display / SF Pro Text** via `-apple-system, BlinkMacSystemFont` stack, with **Inter** as the web-safe fallback (self-host Inter as the closest metric-compatible substitute since SF Pro isn't licensed for general web embedding).
- Type scale mirrors tvOS/macOS: large hero titles ~40–56px/bold/tight tracking (-0.02em), section headers ~22–28px/semibold, body/metadata ~14–15px/regular, captions ~12–13px/medium/70% opacity.
- Never center-align long paragraphs; left-align body copy, as Apple does.

### 3.2 Color & Theming
- **Dark mode is the primary theme** (Apple TV defaults to dark), with true near-black backgrounds (`#000000` / `#0B0B0D`), not dark gray. Support a light mode toggle later, but ship dark-first.
- Accent color: a single restrained accent (Apple TV uses a light blue/white highlight for focus states) — use `#0A84FF` (Apple's system blue) sparingly for interactive focus rings, active tab indicators, and primary buttons only. Everything else is grayscale.
- No decorative gradients on cards. The only gradients allowed: a subtle bottom-to-transparent scrim over hero/backdrop images so text stays legible (exactly how Apple TV does it) — never a rainbow/brand gradient.
- Player embed theme param is fixed to `#ffffff` per spec (Section 2) — treat this as the "light chrome on dark surface" look already used by Apple TV's own player controls.

### 3.3 Layout & Spacing
- 8pt spacing grid throughout (8/16/24/32/48/64px rhythm).
- Content max-width containers with generous side gutters (Apple TV never lets rows touch the viewport edge below ~24–32px padding).
- Card corner radius: 12–14px for posters, 18–20px for larger feature tiles — matches Apple's continuous corner curvature (`border-radius` alone is a decent approximation; document that true "squircle" superellipse can be added later with an SVG clip-path if the agent has time).

### 3.4 Motion
- Row items **scale up (1.0 → ~1.08–1.12) and lift with a soft shadow on hover/focus**, exactly like tvOS's parallax focus engine — no rotation, no bounce, no garish glow.
- Page/section transitions: soft cross-fade + slight vertical slide (8–16px), 250–350ms, ease `cubic-bezier(0.32, 0.72, 0, 1)` (Apple's standard "spring-ish" ease).
- Horizontal row scrolling: momentum/snap scrolling with edge fade masks (a `mask-image` gradient at row edges so cards fade rather than hard-clip).
- Respect `prefers-reduced-motion`.

### 3.5 Iconography
- Use SF Symbols–style line icons (Lucide or Phosphor icon sets are the closest legally-usable approximation) at consistent 1.5px stroke weight. No emoji anywhere in the UI chrome.

### 3.6 Explicit anti-patterns to avoid
State these directly to the agent as guardrails:
- ❌ No glowing neon borders, no glassmorphism blur-everything cards, no rainbow gradient text.
- ❌ No stock "hero with giant blurry gradient blob" backgrounds.
- ❌ No mismatched icon set (mixing filled + outline + emoji).
- ❌ No center-aligned dashboards with everything in rounded gradient pills.
- ✅ Reference: apple.com/apple-tv-app, tvOS marketing pages, and the actual macOS Apple TV app chrome (menu bar rows, "Up Next," "Top 10").

---

## 4. Information Architecture / Pages

### 4.1 Home (`/`)
Structure top-to-bottom, exactly mirroring the Apple TV app home screen:
1. **Featured Hero** — full-bleed backdrop (auto-rotating carousel of 3–5 editorially "featured" titles from TMDB `trending/all/week`), title logo/name, short synopsis (2 lines, clamped), Play + More Info buttons, muted looping backdrop image (no video autoplay on home for performance/bandwidth — static backdrop with subtle Ken Burns zoom is enough).
2. **Continue Watching** — only visible when signed in and history exists; horizontal row with progress bars burned into each card's bottom edge.
3. **Top 10 Movies Today** — numbered row (giant translucent "1", "2"... behind/beside each poster, exactly like Apple TV/Netflix's Top 10 treatment) sourced from TMDB `trending/movie/day` (top 10 sliced) — or `movie/top_rated` combined with `trending` if a "daily chart" isn't available; document the actual TMDB endpoint chosen in code comments.
4. **Top 10 TV Shows Today** — same treatment, `trending/tv/day`.
5. Genre rows: Action, Comedy, Sci-Fi & Fantasy, Documentaries, Kids & Family, etc. — each its own horizontal row (TMDB `discover/movie` + `discover/tv` filtered by `with_genres`).
6. **Because you watched X** — a simple recommendation row using TMDB's `/movie/{id}/recommendations` or `/tv/{id}/recommendations` keyed off the user's most recent watch-history item. Fine to be heuristic, not ML.
7. New Releases row, Networks/Studios row (optional stretch).

### 4.2 Browse (`/movies`, `/shows`)
- Same visual system as Home but as a dedicated grid+filter view: filter chips for genre, sort by (Popular, Top Rated, Newest, A–Z), and a responsive poster grid (6 cols desktop → 2 cols mobile).

### 4.3 Search (`/search`)
- Debounced live search against TMDB `/search/multi`.
- Recent searches stored per-user (localStorage if signed out, Supabase table if signed in).
- Empty/no-results state should still feel designed — not a bare "no results" string; give it an icon + suggestion chips of trending searches.

### 4.4 Title Detail Page (`/title/[mediaType]/[tmdbId]`)
This is the "movie's own page" the user called out — mirror Apple TV's title detail screen:
- Full-bleed backdrop hero (parallax on scroll) with title treatment, year, rating (MPAA/TV rating from TMDB `content_ratings` / `release_dates`), runtime, genre tags, and a prominent **Play** button that routes into the watch view (`/watch/...`).
- **Add to Up Next / Watchlist** button (bookmark icon, toggles Supabase `watchlist` row) — Apple TV's "+" button equivalent.
- Synopsis (full, expandable if long).
- Cast & crew row — horizontal scroll of circular headshot cards (TMDB `credits` endpoint), name + character/role beneath, matching Apple TV's cast row treatment.
- **For TV shows specifically**, include the parameters Apple TV surfaces for series:
  - Season selector (dropdown/segmented control).
  - Episode list for the selected season: episode thumbnail, number, title, air date, runtime, overview, and its own Play button that deep-links to `/watch/tv/{id}/{season}/{episode}`.
  - "Up Next" indicator on whichever episode is next after the user's last watched.
- Related/"More Like This" row (TMDB recommendations endpoint).
- Details panel: director/creator, studio/network logo, original language, TMDB rating displayed as Apple-style star/percentage badge (design a clean custom badge — don't just paste TMDB's raw logo per their attribution/logo-usage terms; text-only "TMDB" attribution footer is required per TMDB's API terms — include a small "Data provided by TMDB" credit in the footer of every page that uses it, and a "This product uses the TMDB API but is not endorsed or certified by TMDB" line in an About/Legal page).

### 4.5 Watch View (`/watch/movie/[tmdbId]` and `/watch/tv/[tmdbId]/[season]/[episode]`)
- Full-viewport, chrome-minimized layout: just the `<CinemaOSPlayer />` and a slim top bar (back button + title) that auto-hides after a few seconds of inactivity, matching Apple TV's immersive playback screen.
- On mount/unmount, write/update a row in the `watch_history` table (tmdb_id, media_type, season, episode, last_watched_at, and progress_seconds if the postMessage progress event is confirmed working — else just a timestamp).
- For TV, an "Up Next" overlay in the last ~10% doesn't apply since we don't control the player's internal timeline reliably without a confirmed postMessage contract — instead provide a persistent small "Next Episode" button in the top bar while watching a TV episode.

### 4.6 Profile / Account (`/profile`)
- Avatar (upload via Supabase Storage, with a set of default Apple-Memoji-style placeholder avatars as an alternative — do NOT literally rip Apple's Memoji art; commission simple abstract gradient-monogram avatars instead as the default set, consistent with the grayscale/blue palette).
- Display name, email, sign-out, delete account.
- "Multiple profiles under one account" — Apple TV supports multiple viewer profiles (like Netflix profiles); implement a `profiles` table (one auth user → many profile rows) with a profile-switcher on first load, each with its own avatar, watchlist, and history. This is a core requested parameter ("customize their profile picture and more") so make it a real profile system, not a single-user settings page.
- Watchlist tab (grid of saved titles).
- Watch History tab (chronological list, with a "remove from history" affordance).

### 4.7 Auth (`/login`, `/signup`)
- Apple-style minimal auth screens: centered card, generous whitespace, system font, no marketing copy clutter.
- Email/password + optional Google OAuth via Supabase.
- Post-signup flow routes into "create your first profile" (name + avatar) before landing on Home.

---

## 5. Data Model (Supabase / Postgres)

```sql
-- auth.users is managed by Supabase Auth

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  avatar_color text, -- fallback gradient/monogram seed if no uploaded avatar
  is_kids boolean default false,
  created_at timestamptz default now()
);

create table watchlist (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  tmdb_id integer not null,
  media_type text check (media_type in ('movie','tv')) not null,
  added_at timestamptz default now(),
  unique (profile_id, tmdb_id, media_type)
);

create table watch_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  tmdb_id integer not null,
  media_type text check (media_type in ('movie','tv')) not null,
  season integer,
  episode integer,
  progress_seconds integer,
  last_watched_at timestamptz default now(),
  unique (profile_id, tmdb_id, media_type, season, episode)
);

create table recent_searches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  query text not null,
  searched_at timestamptz default now()
);
```
Enable Row Level Security on every table; policies should scope all reads/writes to rows where `profile_id` belongs to a profile owned by `auth.uid()`.

---

## 6. TMDB Integration Notes for the Agent

- Base URL: `https://api.themoviedb.org/3`
- Auth: Bearer token (v4 read access token) or `?api_key=` (v3 key) — use environment variable, never hard-code.
- Key endpoints to wire up: `/trending/{media_type}/{time_window}`, `/movie/top_rated`, `/tv/top_rated`, `/discover/movie`, `/discover/tv`, `/search/multi`, `/movie/{id}`, `/tv/{id}`, `/movie/{id}/credits`, `/tv/{id}/credits`, `/tv/{id}/season/{season_number}`, `/movie/{id}/recommendations`, `/tv/{id}/recommendations`, `/genre/movie/list`, `/genre/tv/list`.
- Images: build URLs as `https://image.tmdb.org/t/p/{size}/{path}` — use `w500`/`w780` for posters/backdrops in cards and `original` only for the hero backdrop.
- Cache TMDB responses at the route/server level (Next.js `fetch` with `revalidate: 3600` or similar) to stay within rate limits and keep the app snappy — do not hit TMDB on every client render.
- Attribution requirement (TMDB terms): include the standard TMDB attribution notice somewhere in the UI (footer is fine) — this is a real legal requirement of using their free API, not optional polish.

---

## 7. Build Order (suggested milestones for the agent to work through sequentially)

1. Scaffold Next.js + Tailwind + design tokens (Section 3) + font setup. Build a small internal style-guide route (`/dev/styleguide`) rendering buttons, cards, type scale — delete or gate behind dev-only before shipping.
2. Supabase project wiring: auth, profiles table, RLS policies, profile switcher.
3. TMDB client module (`lib/tmdb.ts`) with typed responses (define TS interfaces for Movie, TVShow, Credits, Episode, etc.).
4. Home page: hero carousel + Top 10 rows + genre rows, all server-rendered from TMDB.
5. `<CinemaOSPlayer />` component + Watch view, verifying the real embed URL, params, and (if feasible) postMessage events directly against https://cinemaos.live/embed before wiring persistence.
6. Title Detail page (movie first, then TV with season/episode selector).
7. Search page.
8. Watchlist + Watch History wiring (Supabase reads/writes from the pages above).
9. Profile management (avatar upload, multi-profile switcher, account settings).
10. Responsive pass (mobile/tablet breakpoints), focus-state/keyboard navigation pass (this app should be fully keyboard/remote-navigable in spirit, even though it's a web app, not just mouse-hover-dependent), and a final motion/polish pass against Section 3.4.
11. Legal/footer: TMDB attribution + CinemaOS "content aggregator, no files hosted" disclaimer, mirroring the disclaimer language CinemaOS itself displays.

---

## 8. Acceptance Criteria (what "done" looks like)

- Visually, a stranger shown a screenshot should guess "Apple" before guessing "Netflix clone" or "AI-generated dashboard."
- Every row (Top 10 Movies, Top 10 Shows, genre rows, Continue Watching) is driven by real TMDB data, not placeholder/mock JSON.
- Clicking any poster goes to a fully-populated detail page with real cast, synopsis, ratings, and (for TV) a working season/episode picker.
- Play buttons correctly route to a working CinemaOS embed keyed to the right TMDB ID/season/episode, themed `#ffffff`.
- A new user can sign up, create a profile with a custom avatar, watch something, leave, come back, and see it under Continue Watching.
- Multiple profiles under one login work like Apple TV / Netflix profiles.
- The app is responsive from ~375px mobile width up through large desktop, with no layout breakage.
- No hard-coded API keys committed; `.env.example` documents `TMDB_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## 9. Notes for the Agent on Ambiguity

- Where CinemaOS's exact query-parameter names/values or postMessage event schema aren't fully confirmed from static docs, inspect the live page/network tab before implementing, and degrade gracefully (timestamp-only history) rather than guessing at an event contract.
- Where TMDB doesn't expose a literal "Top 10 today" endpoint, use `trending/{media_type}/day` sliced to 10 items and label it clearly in code comments so it's easy to swap later.
- Prioritize getting the design system (Section 3) right early — it's the part that most determines whether this reads as a premium, Apple-caliber product versus a generic template.
