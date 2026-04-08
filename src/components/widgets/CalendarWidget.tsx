"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, ExternalLink, MapPin, RefreshCw } from "lucide-react";
import type { CalendarEvent } from "@/types";
import { formatTime } from "@/lib/utils";

interface GroupedEvents {
  [date: string]: CalendarEvent[];
}

function formatDayHeader(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (isToday) return `Today, ${monthDay}`;
  if (isTomorrow) return `Tomorrow, ${monthDay}`;
  return `${dayName}, ${monthDay}`;
}

function groupByDate(events: CalendarEvent[]): GroupedEvents {
  const groups: GroupedEvents = {};
  for (const event of events) {
    const date = event.all_day
      ? event.start_time.split("T")[0]
      : new Date(event.start_time).toLocaleDateString("en-CA");
    if (!groups[date]) groups[date] = [];
    groups[date].push(event);
  }
  return groups;
}

export function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calendar")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
        setLastSynced(data.lastSynced);
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped = groupByDate(events);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Calendar</h2>
        <div className="flex items-center gap-2">
          {lastSynced && (
            <span className="text-[10px] text-[var(--text-muted)]">
              Synced {new Date(lastSynced).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          )}
          <Calendar size={16} className="text-[var(--text-muted)]" />
        </div>
      </div>

      {loading ? (
        <div className="flex-1 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 w-24 bg-[var(--border)] rounded mb-2" />
              <div className="h-12 bg-[var(--border)] rounded-lg" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Clock size={32} className="text-[var(--text-muted)] mb-3" />
          <p className="text-sm text-[var(--text-muted)]">No upcoming events</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Events sync automatically each morning
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 -mr-1">
          {sortedDates.map((date) => (
            <div key={date}>
              <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                {formatDayHeader(date)}
              </h3>
              <div className="space-y-2">
                {grouped[date].map((event) => (
                  <EventCard key={event.gcal_event_id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: CalendarEvent }) {
  const timeStr = event.all_day
    ? "All day"
    : `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`;

  const isNow =
    !event.all_day &&
    new Date(event.start_time) <= new Date() &&
    new Date(event.end_time) > new Date();

  return (
    <a
      href={event.html_link || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-lg px-3 py-2.5 border transition-all duration-200
        hover:shadow-sm group
        ${isNow
          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
          : "border-[var(--border)] hover:border-[var(--text-muted)]"
        }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Color bar */}
        <div
          className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
          style={{ backgroundColor: event.color || "var(--accent)" }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium truncate">{event.summary || "Untitled"}</span>
            {isNow && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-white shrink-0">
                NOW
              </span>
            )}
            <ExternalLink
              size={12}
              className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            />
          </div>

          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Clock size={10} />
              {timeStr}
            </span>
            {event.location && !event.location.startsWith("http") && (
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 truncate">
                <MapPin size={10} />
                {event.location}
              </span>
            )}
          </div>

          {event.description && !event.description.startsWith("<") && (
            <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-1">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
