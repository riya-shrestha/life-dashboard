"use client";

import { useState, useRef } from "react";
import { Paintbrush, X, Upload, Check } from "lucide-react";
import { PRESET_BACKGROUNDS } from "@/lib/constants";

interface BackgroundPickerProps {
  current: string;
  onChange: (bg: string, type: "preset" | "custom" | "none") => void;
}

export function BackgroundPicker({ current, onChange }: BackgroundPickerProps) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onChange(dataUrl, "custom");
      setOpen(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50
          w-10 h-10 rounded-full flex items-center justify-center
          bg-[var(--bg-card)] border border-[var(--border)]
          text-[var(--text-muted)] hover:text-[var(--text)]
          shadow-lg hover:shadow-xl
          backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Change background"
      >
        <Paintbrush size={16} />
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-[var(--bg-card)] rounded-2xl p-6 w-full max-w-md
              border border-[var(--border)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Background</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Presets grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {PRESET_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => {
                    onChange(bg.id, bg.id === "none" ? "none" : "preset");
                    setOpen(false);
                  }}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all
                    ${current === bg.id ? "border-[var(--accent)] scale-105" : "border-[var(--border)] hover:border-[var(--text-muted)]"}`}
                >
                  {bg.url ? (
                    <div
                      className="w-full h-full"
                      style={{
                        background: getPresetGradient(bg.id),
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--bg)] flex items-center justify-center">
                      <span className="text-[10px] text-[var(--text-muted)]">None</span>
                    </div>
                  )}
                  {current === bg.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-0 right-0 text-[9px] text-center text-white drop-shadow">
                    {bg.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Upload */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--border)]
                text-sm text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]
                flex items-center justify-center gap-2 transition-colors"
            >
              <Upload size={16} />
              Upload image (max 2MB)
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>
      )}
    </>
  );
}

function getPresetGradient(id: string): string {
  switch (id) {
    case "gradient-warm":
      return "linear-gradient(135deg, #FAF8F5 0%, #E8D5C4 50%, #C9A99A 100%)";
    case "gradient-sage":
      return "linear-gradient(135deg, #E8F0E4 0%, #A8B5A2 50%, #7C8F73 100%)";
    case "gradient-dusk":
      return "linear-gradient(135deg, #F0E0E8 0%, #C9A0B8 50%, #8B6B80 100%)";
    case "gradient-ocean":
      return "linear-gradient(135deg, #E0EEF0 0%, #90B8C8 50%, #5A8898 100%)";
    case "gradient-marble":
      return "linear-gradient(135deg, #F5F2ED 0%, #D8D0C8 30%, #E8E0D8 60%, #C8C0B8 100%)";
    default:
      return "var(--bg)";
  }
}
