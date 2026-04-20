import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  color?: string;
}

export function Progress({ value, className, color }: ProgressProps) {
  return (
    <div
      className={cn(
        "h-1.5 w-full rounded-full bg-[var(--border)] overflow-hidden",
        className
      )}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: color || "var(--accent-sage)",
        }}
      />
    </div>
  );
}
