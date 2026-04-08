"use client";

import { useState, useEffect } from "react";
import { Newspaper, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { BriefingSummary } from "@/types";

export function MorningBriefing() {
  const [briefing, setBriefing] = useState<BriefingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch("/api/briefing")
      .then((res) => res.json())
      .then((data) => {
        setBriefing(data.briefing);
        setLoading(false);

        // Auto-collapse if already read today
        if (data.briefing) {
          const stored = localStorage.getItem("briefing_collapsed_date");
          if (stored === data.briefing.briefing_date) {
            setCollapsed(true);
          }
        }
      });
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (next && briefing) {
      localStorage.setItem("briefing_collapsed_date", briefing.briefing_date);
    } else {
      localStorage.removeItem("briefing_collapsed_date");
    }
  };

  if (loading) {
    return (
      <div className="p-5">
        <div className="h-6 w-40 rounded bg-[var(--border)] animate-pulse mb-3" />
        <div className="h-16 rounded-lg bg-[var(--border)] animate-pulse" />
      </div>
    );
  }

  // Collapsed state — single line
  if (collapsed && briefing) {
    return (
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-[var(--accent)]" />
          <span className="text-sm font-medium">Morning Briefing</span>
          <span className="text-xs text-[var(--text-muted)]">
            {formatDate(briefing.briefing_date)}
          </span>
          {briefing.new_jobs_today > 0 && (
            <Badge className="bg-[var(--accent-sage)]/20 text-[var(--accent-sage)] text-[10px]">
              {briefing.new_jobs_today} new
            </Badge>
          )}
        </div>
        <button
          onClick={toggleCollapse}
          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ChevronDown size={16} />
        </button>
      </div>
    );
  }

  // Empty state
  if (!briefing) {
    return (
      <div className="p-5 flex flex-col items-center justify-center h-full text-center">
        <Newspaper size={24} className="text-[var(--text-muted)] mb-2" />
        <p className="text-sm text-[var(--text-muted)]">
          No briefing yet today
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Your daily search runs at 7:08 AM
        </p>
      </div>
    );
  }

  // Expanded state
  return (
    <div className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-[var(--accent)]" />
          <h2 className="text-lg font-semibold tracking-tight">Morning Briefing</h2>
          <span className="text-xs text-[var(--text-muted)]">
            {formatDate(briefing.briefing_date)}
          </span>
        </div>
        <button
          onClick={toggleCollapse}
          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ChevronUp size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <Badge className="bg-[var(--accent-sage)]/20 text-[var(--accent-sage)]">
          {briefing.new_jobs_today} new today
        </Badge>
        <Badge className="bg-[var(--accent)]/10 text-[var(--accent)]">
          {briefing.total_applied} total applied
        </Badge>
      </div>

      {/* Summary */}
      <p className="text-sm text-[var(--text-muted)] mb-3 leading-relaxed">
        {briefing.summary}
      </p>

      {/* Top matches */}
      {briefing.top_matches && briefing.top_matches.length > 0 && (
        <div className="flex-1 min-h-0">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium mb-2">
            Top Matches
          </p>
          <div className="overflow-y-auto space-y-1">
            {briefing.top_matches.map((match, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{match.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{match.company}</p>
                </div>
                {match.link && (
                  <a
                    href={match.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[var(--text-muted)] hover:text-[var(--accent)] ml-2"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
