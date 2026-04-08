"use client";

import { useState, useEffect } from "react";
import { Briefcase, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { STATUS_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { JobApplication } from "@/types";

interface JobStats {
  status: string;
  count: number;
}

export function JobTracker() {
  const [recent, setRecent] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<JobStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        setRecent(data.recent);
        setStats(data.stats);
        setLoading(false);
      });
  }, []);

  const total = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Job Applications</h2>
        <Briefcase size={16} className="text-[var(--text-muted)]" />
      </div>

      {/* Stats row */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {loading ? (
          <div className="h-6 w-full rounded bg-[var(--border)] animate-pulse" />
        ) : (
          <>
            <Badge className="bg-[var(--accent)]/10 text-[var(--accent)]">
              Total: {total}
            </Badge>
            {stats.map((s) => {
              const colors = STATUS_COLORS[s.status] || {
                bg: "bg-[var(--border)]",
                text: "text-[var(--text-muted)]",
              };
              return (
                <Badge key={s.status} className={`${colors.bg} ${colors.text}`}>
                  {s.status}: {s.count}
                </Badge>
              );
            })}
          </>
        )}
      </div>

      {/* Recent applications */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-[var(--border)] animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">
            No applications tracked yet
          </p>
        ) : (
          recent.map((job) => {
            const colors = STATUS_COLORS[job.status] || {
              bg: "bg-[var(--border)]",
              text: "text-[var(--text-muted)]",
            };
            return (
              <div
                key={job.id}
                className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{job.job_title}</p>
                    {job.link && (
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {job.company}
                    {job.source && <span> &middot; {job.source}</span>}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                    {formatDate(job.date_applied)}
                  </span>
                  <Badge className={`${colors.bg} ${colors.text} text-[10px]`}>
                    {job.status}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
