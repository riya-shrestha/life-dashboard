"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type PomodoroPhase = "idle" | "work" | "break" | "longBreak";

interface PomodoroState {
  phase: PomodoroPhase;
  timeRemaining: number;
  isRunning: boolean;
  sessionCount: number;
  totalCompleted: number;
}

interface PomodoroConfig {
  workMin: number;
  breakMin: number;
  longBreakMin: number;
  sessionsBeforeLong?: number;
}

const STORAGE_KEY = "pomodoro_state";

function loadSavedState(config: PomodoroConfig): PomodoroState {
  if (typeof window === "undefined") {
    return { phase: "idle", timeRemaining: config.workMin * 60, isRunning: false, sessionCount: 0, totalCompleted: 0 };
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { phase: "idle", timeRemaining: config.workMin * 60, isRunning: false, sessionCount: 0, totalCompleted: 0 };
    const saved = JSON.parse(raw);
    const elapsed = Math.floor((Date.now() - (saved.savedAt || Date.now())) / 1000);
    let timeRemaining = saved.timeRemaining;
    let isRunning = saved.isRunning;

    // If timer was running, subtract elapsed time
    if (isRunning && elapsed > 0) {
      timeRemaining = Math.max(0, timeRemaining - elapsed);
      if (timeRemaining === 0) isRunning = false;
    }

    return {
      phase: saved.phase || "idle",
      timeRemaining,
      isRunning,
      sessionCount: saved.sessionCount || 0,
      totalCompleted: saved.totalCompleted || 0,
    };
  } catch {
    return { phase: "idle", timeRemaining: config.workMin * 60, isRunning: false, sessionCount: 0, totalCompleted: 0 };
  }
}

function saveState(state: PomodoroState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
  } catch { /* ignore quota errors */ }
}

export function usePomodoro(config: PomodoroConfig) {
  const sessionsBeforeLong = config.sessionsBeforeLong ?? 4;

  const [state, setState] = useState<PomodoroState>(() => loadSavedState(config));

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const notify = useCallback((title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  }, []);

  const transitionPhase = useCallback(
    (currentPhase: PomodoroPhase, sessionCount: number, totalCompleted: number) => {
      if (currentPhase === "work") {
        const newTotal = totalCompleted + 1;
        const newSessionCount = sessionCount + 1;
        if (newSessionCount >= sessionsBeforeLong) {
          notify("Long break!", `${sessionsBeforeLong} sessions done. Take a longer rest.`);
          return {
            phase: "longBreak" as PomodoroPhase,
            timeRemaining: config.longBreakMin * 60,
            sessionCount: 0,
            totalCompleted: newTotal,
          };
        }
        notify("Break time!", `Session ${newSessionCount} complete. Take a short break.`);
        return {
          phase: "break" as PomodoroPhase,
          timeRemaining: config.breakMin * 60,
          sessionCount: newSessionCount,
          totalCompleted: newTotal,
        };
      }
      notify("Back to work!", "Break is over. Let's focus.");
      return {
        phase: "work" as PomodoroPhase,
        timeRemaining: config.workMin * 60,
        sessionCount,
        totalCompleted,
      };
    },
    [config, sessionsBeforeLong, notify]
  );

  // Persist state to sessionStorage on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (!state.isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.timeRemaining <= 1) {
          const next = transitionPhase(prev.phase, prev.sessionCount, prev.totalCompleted);
          return { ...prev, ...next, isRunning: true };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return clearTimer;
  }, [state.isRunning, clearTimer, transitionPhase]);

  const start = useCallback(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setState((prev) => ({
      ...prev,
      phase: prev.phase === "idle" ? "work" : prev.phase,
      timeRemaining: prev.phase === "idle" ? config.workMin * 60 : prev.timeRemaining,
      isRunning: true,
    }));
  }, [config.workMin]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    sessionStorage.removeItem(STORAGE_KEY);
    setState({
      phase: "idle",
      timeRemaining: config.workMin * 60,
      isRunning: false,
      sessionCount: 0,
      totalCompleted: 0,
    });
  }, [clearTimer, config.workMin]);

  const skip = useCallback(() => {
    const next = transitionPhase(state.phase, state.sessionCount, state.totalCompleted);
    setState((prev) => ({ ...prev, ...next }));
  }, [state, transitionPhase]);

  const totalDuration =
    state.phase === "work"
      ? config.workMin * 60
      : state.phase === "break"
      ? config.breakMin * 60
      : state.phase === "longBreak"
      ? config.longBreakMin * 60
      : config.workMin * 60;

  const progress = ((totalDuration - state.timeRemaining) / totalDuration) * 100;

  return {
    ...state,
    progress,
    totalDuration,
    start,
    pause,
    reset,
    skip,
  };
}
