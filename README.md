# Life Dashboard

A personal life database and dashboard — a single-page bento grid with todos, projects, calendar, pomodoro timer, job tracker, and morning briefing. Built with Next.js, Tailwind CSS, and Neon PostgreSQL.

![Stack](https://img.shields.io/badge/Next.js-16-black) ![Stack](https://img.shields.io/badge/Tailwind-v4-blue) ![Stack](https://img.shields.io/badge/Neon-PostgreSQL-green)

## Features

- **Morning Briefing** — AI-generated daily summary with job alerts, email rundown, calendar overview, and news
- **Calendar Widget** — Synced from Google Calendar with 7-day lookahead and "NOW" badge for active events
- **Todo List** — Prioritized tasks with categories and due dates
- **Project Tracker** — Active projects with progress bars and status management
- **Job Application Tracker** — Scrollable list with clickable status filter tabs (Applied, Interview, Rejected, etc.)
- **Pomodoro Timer** — Focus timer with session tracking, notifications, and persistence across page reloads
- **Theme Toggle** — Light/dark mode with warm color palette
- **Background Picker** — Gradient presets or custom background images
- **Password Protected** — Cookie-based auth with rate limiting

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4, framer-motion
- **Database**: Neon PostgreSQL via `@neondatabase/serverless` (HTTP driver)
- **Fonts**: DM Sans (body) + Plus Jakarta Sans (display)
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- A [Neon](https://neon.tech/) PostgreSQL database
- [Claude Code](https://claude.ai/claude-code) (for scheduled agents: briefing, calendar sync, job search)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/riya-shrestha/life-dashboard.git
cd life-dashboard
pnpm install
```

### 2. Environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://neondb_owner:<password>@<host>.neon.tech/neondb?sslmode=require
DASHBOARD_PASSWORD=your-password-here
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string (find in Neon Console > Connection Details) |
| `DASHBOARD_PASSWORD` | Password for the dashboard login page |

### 3. Create database tables

Run the following SQL in the [Neon SQL Editor](https://console.neon.tech/):

```sql
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  completed BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'medium',
  category VARCHAR(100),
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  progress INT DEFAULT 0,
  color VARCHAR(7) DEFAULT '#A8B5A2',
  url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id SERIAL PRIMARY KEY,
  job_title VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  location VARCHAR(200),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Applied',
  link TEXT,
  notes TEXT,
  date_applied DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(LOWER(company), date_applied, LOWER(job_title))
);

CREATE TABLE IF NOT EXISTS briefing_summaries (
  id SERIAL PRIMARY KEY,
  briefing_date DATE UNIQUE NOT NULL,
  summary TEXT,
  full_briefing TEXT,
  new_jobs_today INT DEFAULT 0,
  new_jobs_week INT DEFAULT 0,
  total_applied INT DEFAULT 0,
  top_matches JSONB,
  app_stats JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  gcal_event_id VARCHAR(255) UNIQUE NOT NULL,
  calendar_id VARCHAR(255) NOT NULL,
  calendar_name VARCHAR(255),
  summary TEXT,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  all_day BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'confirmed',
  html_link TEXT,
  color VARCHAR(7),
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  id INT PRIMARY KEY DEFAULT 1,
  theme VARCHAR(20) DEFAULT 'light',
  background_image TEXT DEFAULT 'none',
  background_type VARCHAR(20) DEFAULT 'none',
  pomodoro_work_min INT DEFAULT 25,
  pomodoro_break_min INT DEFAULT 5,
  pomodoro_long_break INT DEFAULT 15,
  greeting_name VARCHAR(100) DEFAULT 'friend',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Initialize settings row
INSERT INTO user_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
```

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your `DASHBOARD_PASSWORD`.

## MCP Connectors

The dashboard is powered by data from several MCP (Model Context Protocol) connectors used within Claude Code. These connectors allow the scheduled agents to fetch data from external services and write it to the Neon database.

### Required Connectors

| Connector | Purpose | Used By |
|-----------|---------|---------|
| **Google Calendar** (`gcal_*` tools) | Fetch events from Google Calendar | Calendar sync agent |
| **Gmail** (`gmail_*` tools) | Read emails for briefing & job tracking | Morning briefing agent |
| **Neon** (`mcp__Neon__run_sql`) | Read/write to PostgreSQL database | All agents |
| **Dice Job Search** (`mcp__409ecacc__search_jobs`) | Search tech job listings | Morning briefing agent |
| **Indeed** (`mcp__55f50398__search_jobs`) | Search job listings | Morning briefing agent |
| **LinkedIn** (`mcp__linkedin__*`) | Search jobs and profiles | Morning briefing agent |

### Connecting MCPs

MCP connectors are configured in Claude Code. When you first use a tool that requires a connector, Claude Code will prompt you to authenticate. You can also search for and connect MCPs manually:

1. Open Claude Code
2. Type `/connectors` or ask Claude to search for a connector
3. Authenticate with the service (Google, LinkedIn, etc.)

The Google Calendar and Gmail connectors require a Google account with OAuth permissions for calendar read access and email read access.

## Morning Briefing

The morning briefing is generated by a Claude Code scheduled task that runs daily. It produces a comprehensive markdown report and writes a summary to the `briefing_summaries` database table.

### What the briefing includes

1. **Calendar Overview** — Today's events and free time windows (fetched via Google Calendar MCP)
2. **Email Rundown** — Job updates, financial alerts, important emails (fetched via Gmail MCP)
3. **Job Alerts** — New postings from Dice, Indeed, LinkedIn, and academic job boards
4. **Job Search Report** — Top matches compiled across all sources with apply links
5. **Weekly Application Tracker** — Applications sent, rejections, interview invites from the past 7 days
6. **Job Database Backfill** — Upserts new applications to the `job_applications` table
7. **News Briefing** — Headlines from politics, tech/AI, and public health

### Setting up the briefing agent

The briefing agent is defined as a Claude Code scheduled task at:

```
~/.claude/scheduled-tasks/daily-morning-brief/SKILL.md
```

To create or modify it:

1. Open Claude Code in any project
2. Ask Claude to create a scheduled task for your morning briefing
3. Define the schedule (e.g., `0 9 * * *` for 9 AM daily)
4. The SKILL.md file contains the full prompt — customize sections, job search criteria, calendar IDs, etc.

The briefing output is also saved as a markdown file to a local outputs directory (e.g., `~/Projects/morning-brief/outputs/YYYY-MM-DD-morning-brief.md`).

### How the briefing reaches the dashboard

The agent writes to the `briefing_summaries` table with:
- `summary` — 1-2 sentence overview shown on the dashboard card
- `full_briefing` — Complete markdown rendered in the "Read more" modal
- `new_jobs_today`, `new_jobs_week`, `total_applied` — Stats shown as badges
- `top_matches` — JSON array of top job matches shown in the widget
- `app_stats` — JSON object with status counts (Applied, Interview, Rejected, etc.)

## Calendar Sync

The calendar widget displays events from the `calendar_events` database table. A separate Claude Code scheduled task syncs events from Google Calendar.

### Setting up calendar sync

The sync agent is defined at:

```
~/.claude/scheduled-tasks/calendar-sync/SKILL.md
```

It fetches events from configured Google Calendar accounts for the next 14 days and upserts them into the database. Configure:

- **Calendar IDs** — Which Google calendars to sync (primary, secondary, shared calendars, holidays)
- **Colors** — Hex color per calendar for the widget's color bar
- **Time zone** — Your local timezone for event display
- **Schedule** — e.g., `0 9 * * *` to sync each morning, or more frequently

The dashboard's refresh button (on the Morning Briefing widget) re-fetches both briefing and calendar data from the database.

## Deployment

### Vercel (recommended)

```bash
vercel deploy
```

Set environment variables in the Vercel project settings:
- `DATABASE_URL`
- `DASHBOARD_PASSWORD`

The project uses `@neondatabase/serverless` (HTTP driver), which is compatible with Vercel's serverless/edge runtime — no persistent database connections needed.

### Other platforms

Any platform that supports Next.js should work. Ensure the environment variables are set and the platform supports serverless functions.

## Project Structure

```
src/
  app/
    api/              # API routes (auth, briefing, calendar, jobs, projects, settings, todos)
    login/            # Login page
    page.tsx          # Main dashboard (bento grid layout)
    layout.tsx        # Root layout with theme provider
  components/
    layout/           # ThemeToggle
    ui/               # Badge, Card
    widgets/          # All dashboard widgets
  hooks/              # usePomodoro custom hook
  lib/                # db.ts, auth.ts, constants.ts, utils.ts
  types/              # TypeScript interfaces
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server at http://localhost:3000 |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
