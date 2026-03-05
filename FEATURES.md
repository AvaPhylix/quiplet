# Quiplet — Feature Documentation

> Comprehensive reference of all implemented features, their behavior, and codebase locations.
> Last updated: 2026-03-04

---

## Architecture Overview

- **Framework:** Next.js 15 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"`)
- **Backend:** Supabase (Auth + PostgreSQL + Storage)
- **Fonts:** Outfit (geometric sans-serif for UI), Playfair Display (serif for quotes)
- **Icons:** Lucide React
- **PWA:** Service worker registration via `ServiceWorkerRegistrar.tsx`, manifest at `/manifest.json`

### Route Structure

```
src/app/
├── page.tsx                    # Landing page (public)
├── layout.tsx                  # Root layout (fonts, meta, global CSS)
├── globals.css                 # Tailwind import
├── (auth)/
│   ├── login/page.tsx          # Email/password login
│   └── signup/page.tsx         # Account creation
├── (app)/
│   ├── layout.tsx              # AppShell wrapper (nav, FAB)
│   ├── feed/page.tsx           # Main quote feed
│   ├── children/page.tsx       # Child profile management
│   ├── favorites/page.tsx      # Hall of Fame favorites
│   ├── search/page.tsx         # Search & filter quotes
│   ├── on-this-day/page.tsx    # Quotes from this date in past years
│   ├── settings/page.tsx       # Account settings
│   └── tv-mode/page.tsx        # Full-screen slideshow
```

### Data Model (`src/types/database.ts`)

| Entity | Key Fields | Relationships |
|--------|-----------|---------------|
| **Profile** | id, display_name, avatar_url | 1:1 with Supabase auth.users |
| **Child** | id, user_id, name, avatar_url, date_of_birth, theme_color | belongs to User |
| **Quote** | id, user_id, child_id, quote_text, context, said_at, location, emoji, bg_gradient, is_favorite, is_archived | belongs to User + Child |
| **Tag** | id, user_id, name | belongs to User |
| **QuoteTag** | quote_id, tag_id | many-to-many join (Quote ↔ Tag) |
| **Attachment** | id, quote_id, type ('image'\|'audio'), storage_path, file_name, mime_type | belongs to Quote |
| **FamilyInvite** | id, inviter_id, email, role, status | belongs to User |
| **FamilyMember** | id, family_owner_id, member_id, role | join between Users |

### Supabase Integration

- **Browser client:** `src/lib/supabase-browser.ts` — `createBrowserClient` from `@supabase/ssr`
- **Server client:** `src/lib/supabase-server.ts` — `createServerClient` with cookie handling
- **Middleware:** `src/middleware.ts` — auth guard for all `/feed`, `/children`, `/favorites`, `/search`, `/settings`, `/tv-mode`, `/on-this-day` routes. Redirects unauthenticated users to `/login`, redirects authenticated users away from auth pages to `/feed`.

---

## Feature Details

### 1. Landing Page

**Location:** `src/app/page.tsx`

A public marketing page with:
- **Sticky nav** with glassmorphism (`backdrop-blur-xl bg-white/80`), logo, Login/Get Started buttons
- **Hero section** with badge ("Capture memories that matter"), headline, subtitle, dual CTA buttons
- **Example quote card** with slight rotation (`rotate-[-1deg]`) that straightens on hover, showing Playfair Display serif typography with child avatar and age
- **Feature grid** — 6 cards (Quick Capture, Favorites & Tags, Smart Search, TV Display, On This Day, Beautiful Design) using `FeatureCard` component
- **Bottom CTA section** and **footer**

### 2. Authentication

**Location:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`

- **Login:** Email + password form → `supabase.auth.signInWithPassword()` → redirect to `/feed`
- **Signup:** Name + email + password form → `supabase.auth.signUp()` with `display_name` in user metadata → redirect to `/feed`
- Both pages show branded Quiplet logo, error messages in red rounded boxes, loading spinners on submit buttons
- Cross-links between login and signup

### 3. App Shell (Navigation)

**Location:** `src/components/layout/AppShell.tsx`

Wraps all authenticated `(app)` routes:

- **Desktop (lg+):** Fixed left sidebar (264px) with:
  - Logo link to `/feed`
  - Nav items: Feed, Kids, Favorites, Search (with active state highlighting in sage green)
  - TV Mode and Settings links
  - "New Quote" button (full-width, sage green)
  - Sign out button

- **Mobile:** Fixed bottom navigation bar with:
  - 5 icons: Feed, Kids, Favorites, Search, More (Settings)
  - Active state colors
  - `safe-area-pb` for notch/home indicator

- **Floating Action Button (mobile only):** Fixed position `right-5 bottom-22`, 56×56px sage green circle with Plus icon, `shadow-lg`, `active:scale-95` press animation

- **Quote Modal:** Triggered by FAB (mobile) or sidebar button (desktop), renders `QuoteModal` component

### 4. Quote Creation & Editing

**Location:** `src/components/quotes/QuoteModal.tsx`

A slide-up modal (from bottom on mobile, centered on desktop):

- **Quote text** — required textarea, 3 rows, Playfair Display italic, autofocused
- **Context** — optional text input ("What was happening?")
- **Child selector** — required `<select>` dropdown, populated from `children` table. Auto-selects if only one child exists.
- **Date/time** — `datetime-local` input, defaults to current timestamp
- **Location** — optional text input ("Kitchen, park, car...")
- **Tags** — displays selected tags as removable pills (`rounded-full` with × button). Text input with `<datalist>` for browser-native autocomplete from existing tags. "Add" button or Enter key to add. Creates new tags in DB if they don't exist.
- **Submit** — inserts new quote or updates existing. Handles tag association via `quote_tags` join table (deletes existing, re-inserts).
- **Edit mode** — pre-fills all fields from existing quote data, passed via `editQuote` prop.
- **Error handling** — displays error in red box, loading spinner on save button
- **Backdrop** — semi-transparent black with `backdrop-blur-sm`, click-to-close

### 5. Quote Card Display

**Location:** `src/components/quotes/QuoteCard.tsx`

Each quote renders as a white `rounded-2xl` card with:

- **Header row:**
  - Child avatar (colored circle with initial letter, using child's `theme_color`)
  - Child name + calculated age at time of quote (via `calculateAgeAtDate`)
  - Heart toggle (filled/unfilled, blush pink `#D4A0A0`, 300ms scale bounce animation)
  - Three-dot menu (appears on hover via `group-hover:opacity-100`)

- **Body:**
  - Quote text in Playfair Display serif, `text-xl`, wrapped in smart quotes
  - Context in sans-serif italic, `text-sm`, muted color
  - Tags as horizontal pill badges (`rounded-full`, warm brown `#C8956C`)

- **Footer:**
  - Calendar icon + formatted date (e.g., "Mar 4, 2026")
  - MapPin icon + location (if set)

- **Three-dot menu actions:**
  - **Edit** — opens QuoteModal in edit mode with pre-filled data
  - **Archive** — sets `is_archived: true` (soft delete, quote hidden from feed)
  - **Delete** — hard delete with browser `confirm()` dialog

- **Interactions:**
  - Cards lift slightly on hover (`hover:-translate-y-0.5`)
  - Shadow intensifies on hover
  - Heart has scale-bounce micro-animation

### 6. Memory Feed

**Location:** `src/app/(app)/feed/page.tsx`

Main authenticated view:

- **Header** — "Memory Feed" title + subtitle
- **On This Day widget** — renders `OnThisDay` component at top of feed (see §8)
- **Child filter pills** — horizontal scrollable row of pill-shaped buttons (only shown if >1 child). "All" button + one pill per child, colored with child's `theme_color` when active. Filters feed in real-time.
- **Quote list** — vertical stack on mobile, CSS `columns-2` masonry on desktop (`lg:` breakpoint) with `break-inside-avoid`
- **Empty state** — large muted icon + message + hint to tap the + button
- **Loading state** — spinning circle animation
- **Data query:** `quotes` table with `children(*)` and `quote_tags(*, tags(*))` joins, filtered by `is_archived: false`, ordered by `said_at DESC`

### 7. Favorites / Hall of Fame

**Location:** `src/app/(app)/favorites/page.tsx`

Identical layout to feed but filtered to `is_favorite: true`:
- Same QuoteCard rendering with masonry on desktop
- Blush-colored loading spinner
- Empty state: Heart icon + "No favorites yet" + hint to heart quotes
- No child filter pills (shows all favorited quotes)

### 8. On This Day

**Locations:** `src/components/quotes/OnThisDay.tsx` (widget), `src/app/(app)/on-this-day/page.tsx` (full page)

**Widget (feed page):**
- Queries quotes where `said_at` matches today's month-day pattern from any previous year
- Renders as a gradient banner (`from-[#C8956C]/10 via-[#D4A0A0]/10 to-[#C4B5E0]/10`)
- Shows each matching quote in a `bg-white/60` sub-card with quote text, child name, age at quote time, and year
- Hides entirely if no matching quotes found

**Full page:**
- Same query but renders full `QuoteCard` components grouped by year
- Year label above each card
- CalendarHeart icon in header
- Shows date in human format ("March 4")

### 9. Search & Filtering

**Location:** `src/app/(app)/search/page.tsx`

- **Search bar** — text input with SearchIcon, searches `quote_text` via `ilike` (case-insensitive partial match)
- **Child filter** — `<select>` dropdown for "All Kids" or specific child
- **Tag filter** — `<select>` dropdown for "All Tags" or specific tag (client-side filtering after fetch)
- **Search button** — triggers query
- **Results** — vertical list of QuoteCards (no masonry on this page)
- **Empty states** — different for "not searched yet" vs "no results found"

### 10. Child Profile Management

**Location:** `src/app/(app)/children/page.tsx`

- **Grid display** — 1-column mobile, 2-column desktop, white rounded cards
- **Each card shows:** Large colored initial avatar (14×14 `rounded-2xl`), child name, calculated current age from DOB
- **Edit/Delete buttons** — appear on hover (pencil + trash icons)
- **Add Child button** — top-right, sage green

**Add/Edit modal:**
- Name text input (required)
- Date of birth date picker
- Theme color picker — 6 preset colors (Lavender, Peach, Sky, Mint, Coral, Butter) as `rounded-xl` swatches with ring highlight on selected
- Submit creates/updates via Supabase

**Delete:** Confirm dialog, note that quotes remain after deletion

### 11. TV Display Mode

**Location:** `src/app/(app)/tv-mode/page.tsx`

Full-screen ambient slideshow:

- **Data:** Loads up to 50 favorite quotes; falls back to all non-archived quotes if no favorites
- **Display:** Full-viewport with rotating gradient backgrounds (5 color combos cycling). Quote in large Playfair Display (3xl–5xl responsive), child avatar + name + age, optional context below.
- **Auto-advance:** 8-second interval, toggleable play/pause
- **Controls (appear on hover):**
  - Previous/Next buttons (ChevronLeft/Right)
  - Play/Pause toggle
  - Counter ("3 / 12")
  - Close button (returns to `/feed`)
- **Keyboard shortcuts:** ArrowRight (next), ArrowLeft (prev), Space (play/pause), Escape (back)
- **Cursor:** Hidden by default (`cursor-none`), controls appear on mouse movement (`group-hover`)

### 12. Settings

**Location:** `src/app/(app)/settings/page.tsx`

- **Profile section:** Display name text input (editable), email (read-only/disabled), Save button with success feedback ("Saved ✓" for 2 seconds)
- **Quick Links:** TV Display Mode, On This Day (with icons)
- **Sign Out:** Red text button at bottom

### 13. Utility Functions

**Location:** `src/lib/utils.ts`

- `calculateAge(dob)` — returns human-readable current age ("3 years, 11 months")
- `calculateAgeAtDate(dob, date)` — returns compact age at specific date ("3y 11m")
- `formatDate(dateStr)` — returns "Mar 4, 2026" format
- `CHILD_COLORS` — array of 6 predefined `{name, value}` color options

---

## Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#FAFAF9` | Page background (warm off-white) |
| Text Primary | `#334155` | Headings, quote text |
| Text Secondary | `#64748B` | Subtitles, context, descriptions |
| Text Tertiary | `#94A3B8` | Inactive nav, timestamps |
| Border | `#E2E8F0` | Input borders, dividers |
| Sage Green | `#6B8F71` | Primary buttons, nav active, FAB, links |
| Sage Dark | `#5A7D60` | Hover state for sage buttons |
| Blush | `#D4A0A0` | Heart/favorite icon, decorative |
| Warm Brown | `#C8956C` | Tags, On This Day accent |
| Lavender | `#C4B5E0` | Child color option, decorative |

### Typography

- **UI text:** Outfit (geometric sans-serif) via CSS variable `--font-outfit`
- **Quote text:** Playfair Display (serif) via CSS variable `--font-playfair`
- Applied via `font-[family-name:var(--font-...)]` utility classes

### Component Patterns

- **Cards:** `bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]` with hover lift
- **Inputs:** `rounded-xl border border-[#E2E8F0]` with `focus:ring-2 focus:ring-[#6B8F71]/30`
- **Buttons:** `rounded-xl` with sage green fill or ghost style
- **Pills:** `rounded-full` with colored backgrounds
- **Modals:** Bottom-sheet on mobile (`items-end`), centered on desktop (`sm:items-center`), with `backdrop-blur-sm` overlay
- **Glassmorphism:** `backdrop-blur-xl bg-white/80` on nav elements

### Micro-interactions

- Card hover: `-translate-y-0.5` + shadow increase (300ms)
- Heart toggle: `scale-125` bounce (300ms)
- FAB press: `active:scale-95`
- Landing card: rotation `rotate-[-1deg]` → `hover:rotate-0` (500ms)
- Menu reveal: `opacity-0 group-hover:opacity-100`

---

## Unimplemented Features (Data Types Exist, No UI)

These have database types defined but zero frontend implementation:

1. **Attachments (Image/Audio)** — `Attachment` type with storage_path, mime_type. No upload, display, or playback code.
2. **AI Auto-Emoji** — `emoji` and `bg_gradient` fields on Quote. Never read or written.
3. **Family Invites & Members** — `FamilyInvite` and `FamilyMember` types. No invite flow, member list, or shared access.
4. **Child Avatar Photos** — `avatar_url` on Child type. All children show colored initial letter instead.
5. **Profile Avatar** — `avatar_url` on Profile type. Not used in settings or anywhere.
