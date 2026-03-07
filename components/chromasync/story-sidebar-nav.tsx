"use client"

import { BookOpen, Clapperboard, Users, Map, Sparkles, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export type StoryTab = "generate" | "characters" | "scenes" | "storyboard" | "scripts" | "library"

interface StorySidebarNavProps {
  activeTab: StoryTab
  onTabChange: (tab: StoryTab) => void
}

const storyNavItems = [
  { id: "generate"   as const, label: "Generate",   icon: Sparkles    },
  { id: "characters" as const, label: "Characters",  icon: Users       },
  { id: "scenes"     as const, label: "Scenes",      icon: Map         },
  { id: "storyboard" as const, label: "Storyboard",  icon: Clapperboard },
  { id: "scripts"    as const, label: "Scripts",     icon: FileText    },
  { id: "library"    as const, label: "Library",     icon: BookOpen    },
]

export function StorySidebarNav({ activeTab, onTabChange }: StorySidebarNavProps) {
  return (
    <nav className="px-3 py-2">
      <ul className="space-y-0.5">
        {storyNavItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                activeTab === item.id
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-sm">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
