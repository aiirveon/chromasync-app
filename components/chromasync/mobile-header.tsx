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
      {/* Wordmark */}
      <span className="wordmark text-base text-foreground">Ojuit</span>

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
