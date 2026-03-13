"use client"

import type { StoryFramework } from "@/lib/story"

interface StoryFrameworkPickerProps {
  value: StoryFramework
  onChange: (framework: StoryFramework) => void
}

const FRAMEWORKS: {
  id: StoryFramework
  name: string
  tagline: string
  examples: string
  colour: string
}[] = [
  {
    id: "save_the_cat",
    name: "Save the Cat",
    tagline: "Plot-driven. Clear stakes. Satisfying.",
    examples: "Good for thrillers, comedies, most commercial films",
    colour: "var(--accent)",
  },
  {
    id: "truby",
    name: "Truby's Arc",
    tagline: "Morally complex. Character at the centre.",
    examples: "Good for dramas, ambiguous endings, literary work",
    colour: "var(--pro)",
  },
  {
    id: "story_circle",
    name: "Story Circle",
    tagline: "Cyclical. Intimate. The protagonist returns changed.",
    examples: "Good for short films, contained stories, character studies",
    colour: "var(--info)",
  },
]

export function StoryFrameworkPicker({ value, onChange }: StoryFrameworkPickerProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {FRAMEWORKS.map((f) => {
        const isSelected = value === f.id
        return (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            style={{
              textAlign: "left",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius)",
              border: "1px solid",
              borderColor: isSelected ? f.colour : "var(--border)",
              backgroundColor: isSelected
                ? `color-mix(in srgb, ${f.colour} 8%, var(--card))`
                : "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            {/* Selection dot */}
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                border: `2px solid ${isSelected ? f.colour : "var(--border)"}`,
                backgroundColor: isSelected ? f.colour : "transparent",
                flexShrink: 0,
                marginTop: "2px",
                transition: "all 0.15s",
              }}
            />
            <div>
              <p style={{
                fontSize: "0.82rem",
                fontWeight: 500,
                color: isSelected ? f.colour : "var(--foreground)",
                margin: "0 0 0.2rem",
                transition: "color 0.15s",
              }}>
                {f.name}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", margin: "0 0 0.15rem" }}>
                {f.tagline}
              </p>
              <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", margin: 0, opacity: 0.7 }}>
                {f.examples}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}