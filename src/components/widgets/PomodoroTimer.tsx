"use client";

import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { usePomodoro, type PomodoroPhase } from "@/hooks/use-pomodoro";
import { formatDuration } from "@/lib/utils";
import { POMODORO_DEFAULTS } from "@/lib/constants";

const PHASE_COLORS: Record<PomodoroPhase, string> = {
  idle: "var(--accent)",
  work: "var(--accent)",
  break: "var(--accent-sage)",
  longBreak: "var(--accent-blush)",
};

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  idle: "Ready",
  work: "Focus",
  break: "Break",
  longBreak: "Long Break",
};

export function PomodoroTimer() {
  const {
    phase,
    timeRemaining,
    isRunning,
    sessionCount,
    totalCompleted,
    progress,
    start,
    pause,
    reset,
    skip,
  } = usePomodoro({
    workMin: POMODORO_DEFAULTS.workMin,
    breakMin: POMODORO_DEFAULTS.breakMin,
    longBreakMin: POMODORO_DEFAULTS.longBreakMin,
  });

  const color = PHASE_COLORS[phase];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="p-5 flex flex-col items-center justify-between h-full">
      <div className="flex items-center justify-between w-full mb-2">
        <h2 className="text-lg font-semibold tracking-tight">Timer</h2>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
        >
          {PHASE_LABELS[phase]}
        </span>
      </div>

      {/* Circular timer */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="4"
          />
          {/* Progress ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className="text-2xl font-light tabular-nums" style={{ fontFamily: "var(--font-plus-jakarta)" }}>
          {formatDuration(timeRemaining)}
        </span>
      </div>

      {/* Session dots */}
      <div className="flex gap-1.5 my-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: i < sessionCount ? color : "var(--border)",
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={reset}
          className="w-8 h-8 rounded-full flex items-center justify-center
            text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]
            transition-all duration-200 active:scale-90"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={isRunning ? pause : start}
          className="w-10 h-10 rounded-full flex items-center justify-center
            text-white transition-all duration-200 active:scale-90 hover:opacity-90"
          style={{ backgroundColor: color }}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        {phase !== "idle" && (
          <button
            onClick={skip}
            className="w-8 h-8 rounded-full flex items-center justify-center
              text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]
              transition-all duration-200 active:scale-90"
          >
            <SkipForward size={14} />
          </button>
        )}
      </div>

      {totalCompleted > 0 && (
        <p className="text-[10px] text-[var(--text-muted)] mt-1">
          {totalCompleted} session{totalCompleted !== 1 ? "s" : ""} today
        </p>
      )}
    </div>
  );
}
