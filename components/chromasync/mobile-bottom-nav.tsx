"use client"

import { Camera, Crosshair, Palette, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppMode } from "./mode-switcher"

interface MobileBottomNavProps {
  activeTab: "pre-shoot" | "on-shoot" | "post-correction"
  onTabChange: (tab: "pre-shoot" | "on-shoot" | "post-correction") => void
  appMode: AppMode
  onAppModeChange: (mode: AppMode) => void
}

const colourItems = [
  { id: "pre-shoot"       as const, label: "Pre-Shoot",   icon: Camera    },
  { id: "on-shoot"        as const, label: "On-Shoot",    icon: Crosshair },
  { id: "post-correction" as const, label: "Post",        icon: Palette   },
]

export function MobileBottomNav({ activeTab, onTabChange, appMode, onAppModeChange }: MobileBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-border bg-sidebar"
      style={{
        height: "var(--bottom-nav-height)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Colour mode tabs */}
      {colourItems.map((item) => {
        const active = appMode === "colour" && activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => { onAppModeChange("colour"); onTabChange(item.id) }}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
              active ? "text-accent" : "text-muted-foreground hover:text-foreground"
            )}
            style={{ minHeight: "var(--touch-target)" }}
          >
            <item.icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
            <span className={cn("text-[10px]", active && "font-medium")}>{item.label}</span>
            {active && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-t-full" />
            )}
          </button>
        )
      })}

      {/* Divider */}
      <div style={{ width: "1px", backgroundColor: "var(--border)", margin: "0.5rem 0" }} />

      {/* Story mode tab */}
      {(() => {
        const active = appMode === "story"
        return (
          <button
            onClick={() => onAppModeChange("story")}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
              active ? "text-accent" : "text-muted-foreground hover:text-foreground"
            )}
            style={{ minHeight: "var(--touch-target)" }}
          >
            <BookOpen className={cn("w-5 h-5", active && "stroke-[2.5]")} />
            <span className={cn("text-[10px]", active && "font-medium")}>Story</span>
            {active && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-t-full" />
            )}
          </button>
        )
      })()}
    </nav>
  )
}
