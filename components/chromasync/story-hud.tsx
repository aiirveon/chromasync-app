"use client"

import type { Story } from "@/lib/story"

interface StoryHudProps {
  story: Story | null
}

export function StoryHud({ story }: StoryHudProps) {
  if (!story || story.stage === 0) return null

  return (
    <div
      className="border-b border-border bg-muted"
      style={{ padding: "0.5rem 1rem" }}
    >
      <div className="story-hud-row">
        {/* Format badge */}
        <span
          className="text-muted-foreground"
          style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", paddingTop: "0.15rem" }}
        >
          {story.format === "film" ? "Film" : "Short Story"}
        </span>

        {/* Logline */}
        {story.logline && (
          <div style={{ flex: 1, minWidth: "140px" }}>
            <p
              className="text-muted-foreground"
              style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}
            >
              Logline
            </p>
            <p className="text-foreground" style={{ fontSize: "0.8rem", lineHeight: 1.4 }}>
              {story.logline}
            </p>
          </div>
        )}

        {/* Character lie */}
        {story.character_lie && (
          <div style={{ flex: 1, minWidth: "140px" }}>
            <p
              className="text-muted-foreground"
              style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}
            >
              The Lie
            </p>
            <p className="text-foreground" style={{ fontSize: "0.8rem", lineHeight: 1.4 }}>
              {story.character_lie}
            </p>
          </div>
        )}

        {/* Stage indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", paddingTop: "0.1rem" }}>
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor:
                  s < story.stage
                    ? "var(--success)"
                    : s === story.stage
                    ? "var(--accent)"
                    : "var(--border)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
