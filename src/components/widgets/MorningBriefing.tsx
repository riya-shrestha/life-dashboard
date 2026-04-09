"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Newspaper, ChevronDown, ChevronUp, ExternalLink, X, Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { BriefingSummary } from "@/types";

export function MorningBriefing() {
  const [briefing, setBriefing] = useState<BriefingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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

  // Close modal on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [modalOpen]);

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
    <>
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper size={14} className="text-[var(--accent)]" />
            <h2 className="text-lg font-semibold tracking-tight">Morning Briefing</h2>
            <span className="text-xs text-[var(--text-muted)]">
              {formatDate(briefing.briefing_date)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {briefing.full_briefing && (
              <button
                onClick={() => setModalOpen(true)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1"
                title="View full briefing"
              >
                <Maximize2 size={14} />
              </button>
            )}
            <button
              onClick={toggleCollapse}
              className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1"
            >
              <ChevronUp size={16} />
            </button>
          </div>
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

        {/* Summary — clickable to open full briefing */}
        <p
          className={`text-sm text-[var(--text-muted)] mb-3 leading-relaxed ${
            briefing.full_briefing ? "cursor-pointer hover:text-[var(--text)] transition-colors" : ""
          }`}
          onClick={briefing.full_briefing ? () => setModalOpen(true) : undefined}
        >
          {briefing.summary}
          {briefing.full_briefing && (
            <span className="text-xs text-[var(--accent)] ml-1">Read more</span>
          )}
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

      {/* Full briefing modal — portaled to body to escape card stacking context */}
      {modalOpen && briefing.full_briefing && createPortal(
        <BriefingModal
          briefing={briefing}
          onClose={() => setModalOpen(false)}
        />,
        document.body
      )}
    </>
  );
}

function BriefingModal({
  briefing,
  onClose,
}: {
  briefing: BriefingSummary;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--bg-card)",
          boxShadow: "var(--card-shadow)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Newspaper size={16} className="text-[var(--accent)]" />
            <h2 className="text-lg font-semibold">Morning Briefing</h2>
            <span className="text-xs text-[var(--text-muted)]">
              {formatDate(briefing.briefing_date)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1 rounded-lg hover:bg-[var(--bg-elevated)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex gap-3 px-5 py-3 border-b border-[var(--border)] flex-wrap">
          <Badge className="bg-[var(--accent-sage)]/20 text-[var(--accent-sage)]">
            {briefing.new_jobs_today} new today
          </Badge>
          <Badge className="bg-[var(--accent-blush)]/20 text-[var(--accent-blush)]">
            {briefing.new_jobs_week} this week
          </Badge>
          <Badge className="bg-[var(--accent)]/10 text-[var(--accent)]">
            {briefing.total_applied} total applied
          </Badge>
          {briefing.app_stats && Object.entries(briefing.app_stats).map(([status, count]) => (
            <Badge key={status} className="bg-[var(--bg-elevated)] text-[var(--text-muted)]">
              {status}: {count}
            </Badge>
          ))}
        </div>

        {/* Full briefing content — rendered markdown */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="briefing-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {briefing.full_briefing!}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
