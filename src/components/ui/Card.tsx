"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-[var(--bg-card)] shadow-[var(--card-shadow)]",
        "border border-[var(--border)]",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        hover && "hover:shadow-[var(--card-shadow-hover)] hover:scale-[1.01]",
        className
      )}
    >
      {/* Glass border effect */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-10"
        style={{
          padding: "1px",
          background: `conic-gradient(
            from 45deg,
            var(--glass-peak) 0deg,
            var(--glass-valley) 45deg,
            var(--glass-peak) 90deg,
            var(--glass-valley) 135deg,
            var(--glass-peak) 180deg,
            var(--glass-valley) 225deg,
            var(--glass-peak) 270deg,
            var(--glass-valley) 315deg,
            var(--glass-peak) 360deg
          )`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      />
      <div className="relative z-0 h-full">{children}</div>
    </div>
  );
}
