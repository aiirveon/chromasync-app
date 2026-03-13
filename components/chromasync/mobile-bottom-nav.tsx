"use client"

import { Camera, Crosshair, Palette, BookOpen, Sparkles, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppMode } from "./mode-switcher"
import type { StoryTab } from "./story-sidebar-nav"

interface MobileBottomNavProps {
  activeTab: "pre-shoot" | "on-shoot" | "post-correction"
  onTabChange: (tab: "pre-shoot" | "on-shoot" | "post-correction") => void
  appMode: AppMode
  onAppModeChange: (mode: AppMode) => void
  storyTab?: StoryTab
  onStoryTabChange?: (tab: StoryTab) => void
}

const colourItems = [
  { id: "pre-shoot"       as const, label: "Pre-Shoot",   icon: Camera    },
  { id: "on-shoot"        as const, label: "On-Shoot",    icon: Crosshair },
  { id: "post-correction" as const, label: "Post",        icon: Palette   },
]

export function MobileBottomNav({ activeTab, onTabChange, appMode, onAppModeChange, storyTab, onStoryTabChange }: MobileBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-border bg-sidebar"
      style={{
        height: "var(--bottom-nav-height)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {appMode === "story" ? (
        /* Story mode: back to colour + Generate + Library */
        <>
          <button
            onClick={() => onAppModeChange("colour")}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors text-muted-foreground hover:text-foreground"
            style={{ minHeight: "var(--touch-target)", maxWidth: "56px" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[9px]">Back</span>
          </button>

          <div style={{ width: "1px", backgroundColor: "var(--border)", margin: "0.5rem 0" }} />

          {([
            { id: "generate" as const, label: "Generate", icon: Sparkles },
            { id: "library"  as const, label: "Library",  icon: BookOpen },
          ] as const).map((item) => {
            const active = storyTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onStoryTabChange?.(item.id)}
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
        </>
      ) : (
        /* Colour mode: Pre-Shoot, On-Shoot, Post + Story */
        <>
          {colourItems.map((item) => {
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
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

          <div style={{ width: "1px", backgroundColor: "var(--border)", margin: "0.5rem 0" }} />

          <button
            onClick={() => onAppModeChange("story")}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors text-muted-foreground hover:text-foreground"
            style={{ minHeight: "var(--touch-target)" }}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">Story</span>
          </button>
        </>
      )}
    </nav>
  )
}
