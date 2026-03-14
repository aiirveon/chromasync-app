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
      className="border-b border-border bg-muted"
      style={{
        position: "sticky",
        top: "var(--mobile-header-height)",
        zIndex: 30,
      }}
    >
      {/* Always-visible bar: format + dots + toggle */}
      <button
        onClick={toggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.45rem 1rem",
          background: "none",
          border: "none",
          cursor: hasDetail ? "pointer" : "default",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        {/* Left: format */}
        <span
          className="text-muted-foreground"
          style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          {story.format === "film" ? "Film" : "Short Story"}
        </span>

        {/* Centre: stage dots */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
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

        {/* Right: chevron toggle (only if there's detail to show) */}
        {hasDetail && (
          <span
            className="text-muted-foreground"
            style={{
              fontSize: "0.6rem",
              transition: "transform 0.2s",
              display: "inline-block",
              transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
            }}
          >
            ▼
          </span>
        )}
      </button>

      {/* Expandable detail */}
      {!collapsed && hasDetail && (
        <div style={{
          padding: "0 1rem 0.6rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}>
          {story.logline && (
            <div>
              <p
                className="text-muted-foreground"
                style={{ fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.15rem" }}
              >
                Logline
              </p>
              <p className="text-foreground" style={{
                fontSize: "0.75rem",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {story.logline}
              </p>
            </div>
          )}

          {story.character_lie && (
            <div>
              <p
                className="text-muted-foreground"
                style={{ fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.15rem" }}
              >
                The Lie
              </p>
              <p className="text-foreground" style={{
                fontSize: "0.75rem",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {story.character_lie}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
