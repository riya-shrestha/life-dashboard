export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: "active" | "paused" | "completed" | "archived";
  progress: number;
  color: string;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: number;
  job_title: string;
  company: string;
  location: string | null;
  source: string | null;
  status: string;
  link: string | null;
  date_applied: string;
  notes: string | null;
  created_at: string;
}

export interface BriefingSummary {
  id: number;
  briefing_date: string;
  summary: string;
  full_briefing: string | null;
  new_jobs_today: number;
  new_jobs_week: number;
  total_applied: number;
  top_matches: { title: string; company: string; location?: string; link?: string }[] | null;
  app_stats: Record<string, number> | null;
  created_at: string;
}

export interface CalendarEvent {
  id: number;
  gcal_event_id: string;
  calendar_id: string;
  calendar_name: string | null;
  summary: string | null;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  status: string;
  html_link: string | null;
  color: string | null;
  synced_at: string;
}

export interface UserSettings {
  id: number;
  theme: "light" | "dark";
  background_image: string;
  background_type: "preset" | "custom" | "none";
  pomodoro_work_min: number;
  pomodoro_break_min: number;
  pomodoro_long_break: number;
  greeting_name: string;
  updated_at: string;
}
