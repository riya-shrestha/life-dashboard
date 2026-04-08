export const PRESET_BACKGROUNDS = [
  { id: "none", label: "None", url: null },
  { id: "gradient-warm", label: "Warm", url: "/backgrounds/gradient-warm.svg" },
  { id: "gradient-sage", label: "Sage", url: "/backgrounds/gradient-sage.svg" },
  { id: "gradient-dusk", label: "Dusk", url: "/backgrounds/gradient-dusk.svg" },
  { id: "gradient-ocean", label: "Ocean", url: "/backgrounds/gradient-ocean.svg" },
  { id: "gradient-marble", label: "Marble", url: "/backgrounds/gradient-marble.svg" },
] as const;

export const POMODORO_DEFAULTS = {
  workMin: 25,
  breakMin: 5,
  longBreakMin: 15,
  sessionsBeforeLong: 4,
} as const;

export const PRIORITY_COLORS = {
  high: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
  medium: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  low: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", dot: "bg-green-500" },
} as const;

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Applied: { bg: "bg-accent-sage/20", text: "text-accent-sage" },
  Interview: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  Rejected: { bg: "bg-accent-blush/20", text: "text-accent-blush" },
  Offer: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300" },
  Accepted: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
} as const;
