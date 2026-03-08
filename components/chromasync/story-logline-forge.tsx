"use client"

import { useState } from "react"
import type { LoglineResponse, LoglineVersion } from "@/lib/story"

interface StoryLoglineForgeProps {
  response: LoglineResponse
  format: string
  onSelect: (version: LoglineVersion) => void
  onBack: () => void
  loading?: boolean
}

export function StoryLoglineForge({
  response,
  format,
  onSelect,
  onBack,
  loading = false,
}: StoryLoglineForgeProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const labelColours: Record<string, string> = {
    "External Stakes": "var(--accent)",
    "Internal Stakes": "var(--info)",
    "Tonal Shift": "var(--pro)",
  }

  function getLabelColour(label: string) {
    return labelColours[label] ?? "var(--muted-foreground)"
  }

  function handleLock() {
    if (selected === null) return
    onSelect(response.versions[selected])
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        backgroundColor: "var(--background)",
        maxWidth: "760px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "0.5rem" }}>
        <button
          onClick={onBack}
          className="text-muted-foreground"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontFamily: "inherit",
            padding: 0,
            marginBottom: "1.5rem",
            display: "block",
          }}
        >
          ← back
        </button>
        <p
          className="text-muted-foreground"
          style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}
        >
          Stage 1 — Logline Forge
        </p>
        <h2
          className="text-foreground"
          style={{ fontSize: "1.25rem", fontWeight: 400, lineHeight: 1.4, marginBottom: "0.75rem" }}
        >
          Three versions of your story.
        </h2>
        <p className="text-muted-foreground" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
          Pick the one that feels most true — or use it to find the angle you haven't named yet.
        </p>
      </div>

      {/* Primal question */}
      <div
        style={{
          margin: "1.75rem 0",
          padding: "1rem 1.25rem",
          backgroundColor: "var(--muted)",
          borderRadius: "var(--radius)",
          borderLeft: "2px solid var(--accent)",
        }}
      >
        <p
          className="text-muted-foreground"
          style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}
        >
          Before you choose — sit with this
        </p>
        <p className="text-foreground" style={{ fontSize: "0.9rem", lineHeight: 1.5, fontStyle: "italic" }}>
          {response.primal_question}
        </p>
      </div>

      {/* Logline cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
        {response.versions.map((v, i) => {
          const isSelected = selected === i
          const colour = getLabelColour(v.label)
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                textAlign: "left",
                padding: "1.25rem",
                borderRadius: "var(--radius)",
                border: "1px solid",
                borderColor: isSelected ? colour : "var(--border)",
                backgroundColor: isSelected
                  ? `color-mix(in srgb, ${colour} 8%, var(--card))`
                  : "var(--card)",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {/* Label */}
              <span
                style={{
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: colour,
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                {v.label}
              </span>

              {/* Logline */}
              <p
                className="text-foreground"
                style={{ fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "0.6rem" }}
              >
                {v.logline}
              </p>

              {/* Angle */}
              <p className="text-muted-foreground" style={{ fontSize: "0.75rem", lineHeight: 1.4 }}>
                {v.angle}
              </p>
            </button>
          )
        })}
      </div>

      {/* Lock in */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={handleLock}
          disabled={selected === null || loading}
          style={{
            padding: "0.6rem 1.75rem",
            borderRadius: "var(--radius)",
            border: "none",
            backgroundColor: selected !== null ? "var(--accent)" : "var(--border)",
            color: selected !== null ? "var(--accent-foreground)" : "var(--muted-foreground)",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: selected !== null ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            transition: "all 0.15s",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: "13px",
                  height: "13px",
                  border: "2px solid var(--accent-foreground)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                  display: "inline-block",
                }}
              />
              Building character…
            </>
          ) : (
            "Lock this logline →"
          )}
        </button>
        {selected !== null && (
          <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
            "{response.versions[selected].label}" selected
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
