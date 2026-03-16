"use client"

import { useEffect, useState } from "react"
import { Activity, Clock, HardDrive, Wifi, WifiOff } from "lucide-react"
import { pingAPI } from "@/lib/api"

interface StatusBarProps {
  processingState?: string
}

export function StatusBar({ processingState = "Ready" }: StatusBarProps) {
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking")

  useEffect(() => {
    // Ping API on mount to wake up Render free tier immediately
    pingAPI().then((ok) => {
      setApiStatus(ok ? "online" : "offline")
    })
  }, [])

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
        <div className="flex items-center gap-1.5">
          {apiStatus === "checking" && (
            <>
              <Wifi className="w-3 h-3 animate-pulse text-yellow-500" />
              <span className="text-yellow-500">Connecting...</span>
            </>
          )}
          {apiStatus === "online" && (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-green-500">API Connected</span>
            </>
          )}
          {apiStatus === "offline" && (
            <>
              <WifiOff className="w-3 h-3 text-red-500" />
              <span className="text-red-500">API Offline</span>
            </>
          )}
        </div>
      </div>
      <div className="ml-auto">
        <span className="wordmark" style={{ fontSize: "0.7rem" }}>Ojuit</span>
      </div>
    </footer>
  )
}
