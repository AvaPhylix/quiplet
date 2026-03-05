# Quiplet 💬

**Capture the hilarious, heartwarming, and unforgettable things your kids say.**

Quiplet is a premium digital scrapbook for parents — a beautiful, private space to save quotes, voice memos, and photos of those priceless kid moments before they're forgotten.

## Features

- **Quick Capture** — One-tap quote entry with context, location, and tags
- **Image Attachments** — Drag-and-drop photos to pair with quotes
- **Voice Memos** — Record 10-second audio clips of the moment it happens
- **AI Auto-Emoji** — Quotes automatically get a fun emoji based on content
- **Memory Feed** — Masonry layout with child filter pills
- **Favorites / Hall of Fame** — Heart your best quotes for a curated collection
- **Smart Search** — Full-text search with child filter, tag carousel, and date range picker
- **On This Day** — Resurface quotes from the same day in past years
- **TV Display Mode** — Full-screen slideshow for casting to a TV
- **PDF Export** — Download your quotes as a beautifully formatted PDF
- **Family Sharing** — Invite co-parents and family members (viewer or contributor roles)
- **Child Profiles** — Custom avatars, theme colors, and age tracking
- **PWA Ready** — Install on your phone's home screen

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend:** [Supabase](https://supabase.com/) (Auth, PostgreSQL, Storage)
- **Icons:** [Lucide React](https://lucide.dev/)
- **PDF:** [jsPDF](https://github.com/parallax/jsPDF)
- **Fonts:** Outfit + Playfair Display (Google Fonts)
- **Deployment:** [Vercel](https://vercel.com/)

## Screenshots

> *Coming soon*

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (with the schema from BUILD_SPEC.md applied)

### Development Setup

```bash
# Clone the repo
git clone https://github.com/AvaPhylix/quiplet.git
cd quiplet

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start dev server
npx next dev
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema

The Supabase database includes these tables:

- `profiles` — User display names and avatars
- `children` — Child profiles with name, DOB, theme color, avatar
- `quotes` — The core quotes with text, context, location, emoji
- `tags` / `quote_tags` — Tagging system
- `attachments` — Image and audio files linked to quotes
- `family_invites` / `family_members` — Co-parent sharing

Storage bucket: `attachments` (for images, audio, and avatars)

## Deployment

The app auto-deploys to Vercel on push to `main` via GitHub integration.

For manual deployment:

```bash
npx vercel --prod
```

## License

ISC
