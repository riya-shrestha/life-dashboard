"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { GreetingClock } from "@/components/widgets/GreetingClock";
import { MorningBriefing } from "@/components/widgets/MorningBriefing";
import { PomodoroTimer } from "@/components/widgets/PomodoroTimer";
import { TodoList } from "@/components/widgets/TodoList";
import { CalendarWidget } from "@/components/widgets/CalendarWidget";
import { ProjectCards } from "@/components/widgets/ProjectCards";
import { JobTracker } from "@/components/widgets/JobTracker";
import { BackgroundPicker } from "@/components/widgets/BackgroundPicker";

function getBackgroundStyle(bg: string, type: string): string | undefined {
  if (type === "none" || bg === "none") return undefined;
  if (type === "custom") return bg;
  switch (bg) {
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
      return undefined;
  }
}

export default function Dashboard() {
  const [background, setBackground] = useState("none");
  const [bgType, setBgType] = useState<"preset" | "custom" | "none">("none");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setBackground(data.settings.background_image || "none");
          setBgType(data.settings.background_type || "none");
        }
        setSettingsLoaded(true);
      });
  }, []);

  const handleBgChange = useCallback(
    (bg: string, type: "preset" | "custom" | "none") => {
      setBackground(bg);
      setBgType(type);
      fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ background_image: bg, background_type: type }),
      });
    },
    []
  );

  const bgStyle = getBackgroundStyle(background, bgType);
  const isImage = bgType === "custom" && background.startsWith("data:");

  return (
    <>
      {/* Background layer */}
      {bgStyle && (
        <div className="fixed inset-0 -z-10">
          {isImage ? (
            <img
              src={bgStyle}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full" style={{ background: bgStyle }} />
          )}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "var(--overlay-bg)", backdropFilter: "blur(2px)" }}
          />
        </div>
      )}

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-40">
        <ThemeToggle />
      </div>

      {/* Dashboard grid */}
      <main className="min-h-screen p-4 md:p-6 lg:p-8">
        <div
          className="grid gap-4 max-w-[1440px] mx-auto"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "auto auto auto auto",
          }}
        >
          {/* Row 1 */}
          <Card className="col-span-4 sm:col-span-2 lg:col-span-1 min-h-[180px]">
            <GreetingClock />
          </Card>

          <Card className="col-span-4 sm:col-span-2 lg:col-span-2 min-h-[180px]">
            <MorningBriefing refreshKey={refreshKey} onRefresh={handleRefresh} />
          </Card>

          <Card className="col-span-4 sm:col-span-2 lg:col-span-1 min-h-[180px]">
            <PomodoroTimer />
          </Card>

          {/* Row 2+3 */}
          <Card className="col-span-4 lg:col-span-2 min-h-[360px] lg:row-span-2">
            <TodoList />
          </Card>

          <Card className="col-span-4 lg:col-span-2 min-h-[360px] lg:row-span-2">
            <CalendarWidget refreshKey={refreshKey} />
          </Card>

          {/* Row 4 */}
          <Card className="col-span-4 lg:col-span-2 min-h-[300px]">
            <ProjectCards />
          </Card>

          <Card className="col-span-4 lg:col-span-2 min-h-[300px] max-h-[480px]">
            <JobTracker />
          </Card>
        </div>
      </main>

      {/* Background picker */}
      {settingsLoaded && (
        <BackgroundPicker current={background} onChange={handleBgChange} />
      )}
    </>
  );
}
