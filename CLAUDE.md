# Life Dashboard

Personal life database / dashboard — a single-page bento grid with todos, projects, calendar, pomodoro timer, job tracker, and morning briefing.

## Tech Stack
- Next.js 14+ (App Router, TypeScript)
- Tailwind CSS v4
- @neondatabase/serverless (HTTP driver)
- next-themes (dark/light mode)
- framer-motion (animations)
- pnpm package manager

## Database
- **Neon project**: `spring-brook-56906158`
- **Branch**: `br-little-darkness-aku120s4`
- **Database**: `neondb`
- **Tables**: job_applications (existing), todos, projects, briefing_summaries, user_settings

## Design System
- Light: warm whites (#FAF8F5), dark: warm blacks (#1A1816)
- Accents: sage (#A8B5A2), blush (#C9A99A), taupe (#7C6F5B)
- Font: DM Sans (body) + Plus Jakarta Sans (display)
- Glass-border cards, 16px radius, layered shadows
- "Barely-there UI" — calm, minimal

## Dev Server
- `pnpm dev` serves at http://localhost:3000

## Related
- Daily job search task writes briefing summaries to `briefing_summaries` table
- Google Calendar integration for calendar widget
- Single-user app — no auth needed
