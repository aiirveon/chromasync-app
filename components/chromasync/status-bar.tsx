"use client"

import { Activity, Clock, HardDrive } from "lucide-react"

interface StatusBarProps {
  processingState?: string
}

export function StatusBar({ processingState = "Ready" }: StatusBarProps) {
  return (
    <footer
      className="fixed bottom-0 right-0 border-t border-border bg-muted flex items-center px-4 text-xs text-muted-foreground"
      style={{
        left: "var(--sidebar-width)",
        height: "var(--status-bar-height)",
      }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3" />
          <span>{processingState}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span className="mono-value">00:00:00:00</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-3 h-3" />
          <span className="mono-value">0 MB</span>
        </div>
      </div>
      <div className="ml-auto">
        <span>ChromaSync v1.0.0</span>
      </div>
    </footer>
  )
}
