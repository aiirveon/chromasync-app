"use client"

import { useState } from "react"
import type { Story, CompletedBeat } from "@/lib/story"

interface StoryBibleProps {
  story: Story | null
  completedBeats: CompletedBeat[]
  currentStage: string
  onEditLogline?: () => void
  onEditCharacter?: () => void
}

export function StoryBible({ story, completedBeats, currentStage, onEditLogline, onEditCharacter }: StoryBibleProps) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>("logline")

  const hasContent = story?.logline || completedBeats.length > 0
  if (!hasContent) return null

  function toggle(s: string) { setExpanded((p) => (p === s ? null : s)) }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed", right: open ? "300px" : "0", top: "50%", transform: "translateY(-50%)",
          zIndex: 200, width: "26px", height: "72px",
          backgroundColor: "var(--card)", border: "1px solid var(--border)",
          borderRight: "none", borderRadius: "var(--radius) 0 0 var(--radius)",
          cursor: "pointer", transition: "right 0.25s ease",
          color: "var(--muted-foreground)", fontSize: "0.6rem",
          writingMode: "vertical-rl", letterSpacing: "0.08em", textTransform: "uppercase",
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
        }}
      >
        {open ? "close" : "bible"}
      </button>

      <div
        style={{
          position: "fixed", right: open ? "0" : "-300px", top: 0, bottom: 0, width: "300px",
          backgroundColor: "var(--card)", borderLeft: "1px solid var(--border)",
          zIndex: 199, overflowY: "auto", transition: "right 0.25s ease",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ padding: "1rem 1rem 0.75rem", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, backgroundColor: "var(--card)", zIndex: 1 }}>
          <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", margin: 0 }}>Story Bible</p>
          <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginTop: "0.2rem", marginBottom: 0 }}>Everything you have built</p>
        </div>

        <div style={{ padding: "0.75rem", flex: 1 }}>
          {story?.logline && (
            <Section label="Logline" badge={story.logline_label ?? undefined} isExpanded={expanded === "logline"} onToggle={() => toggle("logline")}
              onEdit={currentStage !== "logline-forge" ? onEditLogline : undefined}>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.6, color: "var(--foreground)", margin: 0 }}>{story.logline}</p>
            </Section>
          )}
          {story?.character_lie && (
            <Section label="Character" isExpanded={expanded === "character"} onToggle={() => toggle("character")}
              onEdit={currentStage !== "character-forge" ? onEditCharacter : undefined}>
              <Row label="Lie" value={story.character_lie} />
              <Row label="Want" value={story.character_want} />
              <Row label="Need" value={story.character_need} />
              {story.save_the_cat_scene && <Row label="Save the Cat" value={story.save_the_cat_scene} />}
            </Section>
          )}
          {completedBeats.length > 0 && (
            <Section label={"Beats (" + completedBeats.length + ")"} isExpanded={expanded === "beats"} onToggle={() => toggle("beats")}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {completedBeats.map((beat, i) => (
                  <div key={i} style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.6rem" }}>
                    <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--accent)", margin: "0 0 0.2rem" }}>
                    {beat.number}. {beat.name}
                    </p>
                    <p style={{ fontSize: "0.78rem", lineHeight: 1.5, color: "var(--foreground)", margin: 0 }}>{beat.answer}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </>
  )
}

function Section({ label, badge, isExpanded, onToggle, onEdit, children }: {
  label: string; badge?: string; isExpanded: boolean; onToggle: () => void; onEdit?: () => void; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: "0.4rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.55rem 0.7rem",
          backgroundColor: isExpanded ? "color-mix(in srgb, var(--accent) 6%, transparent)" : "transparent", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.73rem", fontWeight: 500, color: "var(--foreground)" }}>{label}</span>
          {badge && <span style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: "3px", padding: "0 0.25rem" }}>{badge}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit() }} style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", background: "none", border: "1px solid var(--border)", borderRadius: "3px", cursor: "pointer", padding: "0.1rem 0.35rem", fontFamily: "inherit" }}>
              edit
            </button>
          )}
          <span style={{ color: "var(--muted-foreground)", fontSize: "0.65rem" }}>{isExpanded ? "^" : "v"}</span>
        </div>
      </div>
      {isExpanded && <div style={{ padding: "0.65rem 0.7rem", borderTop: "1px solid var(--border)" }}>{children}</div>}
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: "0.4rem" }}>
      <p style={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted-foreground)", margin: "0 0 0.12rem" }}>{label}</p>
      <p style={{ fontSize: "0.78rem", lineHeight: 1.5, color: "var(--foreground)", margin: 0 }}>{value}</p>
    </div>
  )
}
