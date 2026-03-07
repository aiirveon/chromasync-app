"use client"

import { cn } from "@/lib/utils"

export type AppMode = "colour" | "story"

interface ModeSwitcherProps {
  mode: AppMode
  onChange: (mode: AppMode) => void
}

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5 bg-secondary rounded-lg p-1">
      <button
        onClick={() => onChange("story")}
        className={cn(
          "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
          mode === "story"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Story
      </button>
      <button
        onClick={() => onChange("colour")}
        className={cn(
          "flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
          mode === "colour"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Colour
      </button>
    </div>
  )
}
