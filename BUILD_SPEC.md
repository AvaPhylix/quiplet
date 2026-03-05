# Quiplet — Build Specification

## Overview
A premium digital scrapbook for parents to capture, save, and search the funny and memorable quotes their children say.

## Tech Stack
- **Framework:** Next.js 15 with App Router (React 19)
- **Styling:** Tailwind CSS v4 (utility classes only, no custom CSS files)
- **Backend & DB:** Supabase (PostgreSQL + Supabase Storage for images/audio)
- **Auth:** Supabase Auth (email/password to start)
- **Deployment:** Vercel
- **Icons:** Lucide React

## Supabase Config (ALREADY SET UP — database schema, RLS, storage bucket all done)
- **Project Ref:** dhmtmkvxvkeormovhvak
- **URL:** https://dhmtmkvxvkeormovhvak.supabase.co
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXRta3Z4dmtlb3Jtb3ZodmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Nzc1NzEsImV4cCI6MjA4ODI1MzU3MX0.kqrlQ9HBRM6YJh8xTOKRKoL3l_LSUVTjKnORbPPhOYg

## Design System

### Art Direction
- **Vibe:** Warm, elegant, nostalgic, yet highly modern. Premium digital scrapbook.
- **NOT:** Generic AI slop. No purple gradients. No Inter/Roboto/Arial.

### Color Palette
- Background: warm off-white #FAFAF9
- Surface cards: #FFFFFF with soft diffuse shadows
- Text primary: #334155 (slate-700)
- Text secondary: #64748B (slate-500)
- Accent primary (sage): #6B8F71 — buttons, active states
- Accent secondary (blush): #D4A0A0 — favorites, hearts
- Accent tertiary (warm amber): #C8956C — tags, badges
- Child theme colors: soft pastels (lavender, peach, sky, mint, coral)

### Typography
- **UI Font:** "Outfit" from Google Fonts — warm geometric sans-serif
- **Quote Font:** "Playfair Display" from Google Fonts — elegant serif for quotes
- Load via next/font/google

### UI Components
- rounded-2xl on cards, rounded-xl on inputs/buttons
- Soft diffuse shadows
- Glassmorphism on sticky nav: backdrop-blur-xl bg-white/80
- Generous padding (p-6 on cards minimum)
- Micro-interactions: scale-bounce on save, soft hover lifts on cards

## Database Tables (ALREADY CREATED)
- profiles (id, display_name, avatar_url)
- children (id, user_id, name, avatar_url, date_of_birth, theme_color)
- quotes (id, user_id, child_id, quote_text, context, said_at, location, emoji, bg_gradient, is_favorite, is_archived)
- tags (id, user_id, name) — unique per user
- quote_tags (quote_id, tag_id)
- attachments (id, quote_id, type[image/audio], storage_path, file_name, mime_type)
- family_invites (id, inviter_id, email, role, status)
- family_members (id, family_owner_id, member_id, role)
- Storage bucket: 'attachments'
- Auto-profile creation trigger on auth.users insert

## Core Features to Build

### P0 — Must Have
1. Landing page — beautiful, explains product, CTA to sign up
2. Auth — email/password signup and login with Supabase Auth
3. Child profiles — add/edit/remove children with name, DOB, avatar photo, theme color
4. Quote capture — prominent FAB button, modal with: quote text (large), context, child picker, date/time, location, tags (autocomplete), image upload, audio recording (10s)
5. Memory feed — scrollable cards with quote in Playfair Display serif, context in Outfit, auto-calculated child age ("3 years, 11 months"), attachments
6. CRUD — three-dot menu per card: edit, delete, archive
7. Favorites — heart toggle on cards, dedicated favorites page
8. Search & filter — search bar, child filter pills, tag carousel, date range

### P1 — Important
9. "On This Day" widget — surfaces quotes from same day in past years
10. TV Display Mode — fullscreen slideshow of Hall of Fame quotes for casting
11. PDF Export — print-ready formatted export of filtered quotes
12. Masonry layout on desktop

## Key Implementation Notes
1. ALWAYS lazy-init Supabase clients — use createClient inside functions
2. Mobile-first design
3. .env.local with real Supabase URL and anon key
4. Use CSS transitions for micro-interactions
5. next/font/google for font loading
6. The app MUST build clean with `npx next build`
