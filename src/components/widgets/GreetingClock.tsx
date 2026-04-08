"use client";

import { useState, useEffect } from "react";
import { getGreeting } from "@/lib/utils";

interface GreetingClockProps {
  name?: string;
}

export function GreetingClock({ name = "Riya" }: GreetingClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="p-6 h-full" />;

  const greeting = getGreeting();
  const timeStr = time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-6 flex flex-col justify-between h-full">
      <div>
        <p className="text-[var(--text-muted)] text-sm font-medium">{dateStr}</p>
        <h1
          className="text-3xl font-bold tracking-tight mt-1"
          style={{ fontFamily: "var(--font-plus-jakarta, var(--font-dm-sans))" }}
        >
          {greeting}, {name}
        </h1>
      </div>
      <p
        className="text-4xl font-light tabular-nums text-[var(--text-muted)]"
        style={{ fontFamily: "var(--font-plus-jakarta, var(--font-dm-sans))" }}
      >
        {timeStr}
      </p>
    </div>
  );
}
