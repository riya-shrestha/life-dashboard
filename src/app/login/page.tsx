"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Wrong password");
        setPassword("");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-card)",
          boxShadow: "var(--card-shadow)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Glass border effect (matching Card.tsx) */}
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

        <div className="relative z-0 px-8 py-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--accent)" }}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1
              className="text-xl font-semibold"
              style={{
                color: "var(--text)",
                fontFamily: "var(--font-plus-jakarta, 'Plus Jakarta Sans', system-ui, sans-serif)",
              }}
            >
              Life Dashboard
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              Enter your password to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: "var(--bg)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  fontFamily: "var(--font-dm-sans, 'DM Sans', system-ui, sans-serif)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124, 111, 91, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {error && (
              <p
                className="text-sm text-center"
                style={{ color: "var(--accent-blush)" }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
                opacity: loading || !password ? 0.5 : 1,
                cursor: loading || !password ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading && password) {
                  e.currentTarget.style.background = "var(--accent-hover)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent)";
              }}
            >
              {loading ? "Checking..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
