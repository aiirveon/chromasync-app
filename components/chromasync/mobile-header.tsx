"use client"

import { Wifi } from "lucide-react"

interface MobileHeaderProps {
  currentModule: string
}

export function MobileHeader({ currentModule }: MobileHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 border-b border-border bg-sidebar"
      style={{ height: "var(--mobile-header-height)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0">
          <circle cx="16" cy="16" r="14" fill="none" stroke="var(--accent)" strokeWidth="2" />
          <circle cx="16" cy="8"  r="3" fill="var(--destructive)" />
          <circle cx="22.9" cy="20" r="3" fill="var(--success)" />
          <circle cx="9.1"  cy="20" r="3" fill="var(--info)" />
          <circle cx="16"  cy="16" r="4" fill="var(--accent)" />
        </svg>
        <span className="text-sm font-semibold text-foreground">ChromaSync</span>
      </div>

      {/* Current module label */}
      <span className="text-sm font-medium text-accent">{currentModule}</span>

      {/* API status */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <div className="relative">
          <Wifi className="w-3.5 h-3.5 text-success" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
        </div>
      </div>
    </header>
  )
}
