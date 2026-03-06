"use client"

import { Camera, Crosshair, Palette, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: "pre-shoot" | "on-shoot" | "post-correction"
  onTabChange: (tab: "pre-shoot" | "on-shoot" | "post-correction") => void
}

const navItems = [
  { id: "pre-shoot" as const, label: "Pre-Shoot", icon: Camera },
  { id: "on-shoot" as const, label: "On-Shoot", icon: Crosshair },
  { id: "post-correction" as const, label: "Post Correction", icon: Palette },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-sidebar border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8">
            <svg viewBox="0 0 32 32" className="w-full h-full">
              <circle cx="16" cy="16" r="14" fill="none" stroke="#f97316" strokeWidth="2" />
              <circle cx="16" cy="8" r="3" fill="#ef4444" />
              <circle cx="22.9" cy="20" r="3" fill="#22c55e" />
              <circle cx="9.1" cy="20" r="3" fill="#3b82f6" />
              <circle cx="16" cy="16" r="4" fill="#f97316" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-foreground">ChromaSync</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors",
                  activeTab === item.id
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* API Status */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="relative">
            <Wifi className="w-3.5 h-3.5 text-[#22c55e]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
          </div>
          <span>API Connected</span>
        </div>
      </div>
    </aside>
  )
}
