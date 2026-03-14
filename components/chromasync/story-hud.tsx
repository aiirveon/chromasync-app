"use client"

import { useState, useEffect } from "react"
import type { Story } from "@/lib/story"

interface StoryHudProps {
  story: Story | null
}

const HUD_KEY = "cs-hud-collapsed"

export function StoryHud({ story }: StoryHudProps) {
  const [collapsed, setCollapsed] = useState(true)

  // Restore preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HUD_KEY)
      if (saved !== null) setCollapsed(saved === "1")
    } catch {}
  }, [])

  function toggle() {
    setCollapsed((v) => {
      const next = !v
      try { localStorage.setItem(HUD_KEY, next ? "1" : "0") } catch {}
      return next
    })
  }

  if (!story || story.stage === 0) return null

  const hasDetail = story.logline || story.character_lie

  return (
    <div
      className="story-hud-shell border-b border-border bg-muted"
    >
      {/* Always-visible bar: format + dots + chevron */}
      <button
        onClick={toggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.45rem 1rem",
          background: "none",
          border: "none",
          cursor: hasDetail ? "pointer" : "default",
          fontFamily: "inherit",
          textAlign: "left",
          minWidth: 0,
        }}
      >
        {/* Format badge */}
        <span
          className="text-muted-foreground"
          style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}
        >
          {story.format === "film" ? "Film" : "Short"}
        </span>

        {/* Collapsed preview: logline + lie truncated to 1 line each */}
        {collapsed && hasDetail && (
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.1rem" }}>
            {story.logline && (
              <p className="text-foreground" style={{
                fontSize: "0.7rem",
                lineHeight: 1.3,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                margin: 0,
              }}>
                {story.logline}
              </p>
            )}
            {story.character_lie && (
              <p className="text-muted-foreground" style={{
                fontSize: "0.65rem",
                lineHeight: 1.3,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                margin: 0,
              }}>
                Lie: {story.character_lie}
              </p>
            )}
          </div>
        )}

        {/* Stage dots — always visible, pushed to right */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginLeft: "auto", flexShrink: 0 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                backgroundColor:
                  s < story.stage ? "var(--success)"
                  : s === story.stage ? "var(--accent)"
                  : "var(--border)",
              }}
            />
          ))}
        </div>

        {/* Chevron */}
        {hasDetail && (
          <span
            className="text-muted-foreground"
            style={{
              fontSize: "0.55rem",
              flexShrink: 0,
              transition: "transform 0.2s",
              display: "inline-block",
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
            }}
          >
            ▼
          </span>
        )}
      </button>

      {/* Expanded detail */}
      {!collapsed && hasDetail && (
        <div style={{
          padding: "0 1rem 0.65rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}>
          {story.logline && (
            <div>
              <p className="text-muted-foreground" style={{ fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.15rem" }}>Logline</p>
              <p className="text-foreground" style={{ fontSize: "0.75rem", lineHeight: 1.5, margin: 0 }}>
                {story.logline}
              </p>
            </div>
          )}
          {story.character_lie && (
            <div>
              <p className="text-muted-foreground" style={{ fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.15rem" }}>The Lie</p>
              <p className="text-foreground" style={{ fontSize: "0.75rem", lineHeight: 1.5, margin: 0 }}>
                {story.character_lie}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
