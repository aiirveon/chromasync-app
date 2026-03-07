"use client"

import { Camera, Crosshair, Palette, Wifi, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: "pre-shoot" | "on-shoot" | "post-correction"
  onTabChange: (tab: "pre-shoot" | "on-shoot" | "post-correction") => void
  userEmail?: string
  onSignOut?: () => void
}

const navItems = [
  { id: "pre-shoot"       as const, label: "Pre-Shoot",      icon: Camera    },
  { id: "on-shoot"        as const, label: "On-Shoot",       icon: Crosshair },
  { id: "post-correction" as const, label: "Post Correction", icon: Palette  },
]

export function Sidebar({ activeTab, onTabChange, userEmail, onSignOut }: SidebarProps) {
  return (
    <aside
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 shrink-0">
            <svg viewBox="0 0 32 32" className="w-full h-full">
              <circle cx="16" cy="16" r="14" fill="none" stroke="var(--accent)" strokeWidth="2" />
              <circle cx="16"  cy="8"  r="3" fill="var(--destructive)" />
              <circle cx="22.9" cy="20" r="3" fill="var(--success)" />
              <circle cx="9.1"  cy="20" r="3" fill="var(--info)" />
              <circle cx="16"  cy="16" r="4" fill="var(--accent)" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">ChromaSync</span>
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
                  "w-full flex items-center gap-3 px-3 rounded text-sm transition-colors",
                  "touch-target justify-start",
                  activeTab === item.id
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User + API Status */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {userEmail && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
            <button
              onClick={onSignOut}
              className="shrink-0 text-muted-foreground hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="relative">
            <Wifi className="w-3.5 h-3.5 text-success" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          </div>
          <span>API Connected</span>
        </div>
      </div>
    </aside>
  )
}
