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
      {/* Mobile: stack vertically. Desktop: single row */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}>
        {/* Top row: format badge + stage dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            className="text-muted-foreground"
            style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            {story.format === "film" ? "Film" : "Short Story"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                style={{
                  width: "5px",
                  height: "5px",
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

        {/* Logline */}
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
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {story.logline}
            </p>
          </div>
        )}

        {/* Character lie */}
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
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {story.character_lie}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
