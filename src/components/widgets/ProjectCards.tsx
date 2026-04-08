"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, MoreHorizontal, Pause, Play, CheckCircle, Archive } from "lucide-react";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import type { Project } from "@/types";

const STATUS_LABELS: Record<Project["status"], { label: string; icon: React.ReactNode }> = {
  active: { label: "Active", icon: <Play size={10} /> },
  paused: { label: "Paused", icon: <Pause size={10} /> },
  completed: { label: "Done", icon: <CheckCircle size={10} /> },
  archived: { label: "Archived", icon: <Archive size={10} /> },
};

export function ProjectCards() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data.projects);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    setProjects((prev) => [data.project, ...prev]);
    setNewName("");
    setShowAdd(false);
  };

  const updateProgress = async (id: number, progress: number) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, progress } : p))
    );
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress }),
    });
  };

  const cycleStatus = async (project: Project) => {
    const statuses: Project["status"][] = ["active", "paused", "completed"];
    const idx = statuses.indexOf(project.status);
    const next = statuses[(idx + 1) % statuses.length];
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, status: next } : p))
    );
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
  };

  const archiveProject = async (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
  };

  return (
    <div className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-7 h-7 rounded-lg flex items-center justify-center
            text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]
            transition-all duration-200"
        >
          <Plus size={16} />
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addProject();
          }}
          className="mb-3"
        >
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name..."
            autoFocus
            onBlur={() => !newName && setShowAdd(false)}
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-[var(--border)] animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-8">
            No projects yet
          </p>
        ) : (
          projects.map((project) => {
            const statusInfo = STATUS_LABELS[project.status];
            return (
              <div
                key={project.id}
                className="group p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium truncate">{project.name}</h3>
                      {project.description && (
                        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => cycleStatus(project)}>
                      <Badge className="bg-[var(--border)] text-[var(--text-muted)] cursor-pointer hover:bg-[var(--accent)]/10 transition-colors">
                        <span className="mr-1">{statusInfo.icon}</span>
                        {statusInfo.label}
                      </Badge>
                    </button>
                    <button
                      onClick={() => archiveProject(project.id)}
                      className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 p-1 transition-all"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} color={project.color} className="flex-1" />
                  <span className="text-[10px] text-[var(--text-muted)] tabular-nums w-8 text-right">
                    {project.progress}%
                  </span>
                </div>
                {/* Progress slider */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={project.progress}
                  onChange={(e) => updateProgress(project.id, Number(e.target.value))}
                  className="w-full h-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer accent-[var(--accent)]"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
