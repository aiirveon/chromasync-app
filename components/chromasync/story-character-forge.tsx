"use client"

import { useState } from "react"
import type { CharacterResponse, SaveTheCatOption } from "@/lib/story"

interface StoryCharacterForgeProps {
  logline: string
  format: string
  characterResponse: CharacterResponse | null
  loading: boolean
  onAskWound: (woundAnswer: string, characterName: string) => void
  onSelectSaveTheCat: (option: SaveTheCatOption) => void
  onBack: () => void
}

export function StoryCharacterForge({
  logline,
  format,
  characterResponse,
  loading,
  onAskWound,
  onSelectSaveTheCat,
  onBack,
}: StoryCharacterForgeProps) {
  const [woundAnswer, setWoundAnswer] = useState("")
  const [characterName, setCharacterName] = useState("")
  const [selectedSTC, setSelectedSTC] = useState<number | null>(null)

  const canSubmitWound = woundAnswer.trim().length > 8 && !loading

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      if (canSubmitWound) onAskWound(woundAnswer.trim(), characterName.trim())
    }
  }

  function handleLockCharacter() {
    if (selectedSTC === null || !characterResponse) return
    onSelectSaveTheCat(characterResponse.save_the_cat[selectedSTC])
  }

  return (
    <div className="story-stage story-stage-inner">
      {/* Back */}
      <button
        onClick={onBack}
        className="text-muted-foreground"
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: "0.8rem", fontFamily: "inherit", padding: 0,
          marginBottom: "1.5rem", display: "block", textAlign: "left",
        }}
      >
        ← back
      </button>

      <p
        className="text-muted-foreground"
        style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}
      >
        Stage 2 — Character Forge
      </p>

      {/* Locked logline reminder */}
      <div
        style={{
          padding: "0.75rem 1rem",
          backgroundColor: "var(--muted)",
          borderRadius: "var(--radius)",
          marginBottom: "2rem",
          borderLeft: "2px solid var(--accent)",
        }}
      >
        <p className="text-muted-foreground" style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.3rem" }}>
          Your logline
        </p>
        <p className="text-foreground" style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>{logline}</p>
      </div>

      {/* Wound phase — shown until response arrives */}
      {!characterResponse && (
        <>
          <h2
            className="text-foreground"
            style={{ fontSize: "1.2rem", fontWeight: 400, lineHeight: 1.4, marginBottom: "0.5rem" }}
          >
            Every protagonist carries a wound.
          </h2>
          <p className="text-muted-foreground" style={{ fontSize: "0.875rem", lineHeight: 1.5, marginBottom: "1.75rem" }}>
            Not a plot wound — something that happened before the story began that changed how they see themselves or the world.
            Describe it in a sentence or two.
          </p>

          {/* Optional name */}
          <input
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Protagonist's name (optional)"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "var(--muted)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "0.65rem 1rem",
              fontSize: "0.9rem",
              fontFamily: "inherit",
              outline: "none",
              marginBottom: "0.75rem",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)" }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)" }}
          />

          {/* Wound textarea */}
          <textarea
            value={woundAnswer}
            onChange={(e) => setWoundAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Her father left when she was eight and never explained why. She decided it was because she wasn't worth staying for."
            disabled={loading}
            rows={4}
            autoFocus
            style={{
              width: "100%",
              backgroundColor: "var(--muted)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1rem",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color 0.15s",
              marginBottom: "1.25rem",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)" }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)" }}
          />

          <button
            onClick={() => canSubmitWound && onAskWound(woundAnswer.trim(), characterName.trim())}
            disabled={!canSubmitWound}
            style={{
              alignSelf: "flex-start",
              padding: "0.55rem 1.5rem",
              borderRadius: "var(--radius)",
              border: "none",
              backgroundColor: canSubmitWound ? "var(--accent)" : "var(--border)",
              color: canSubmitWound ? "var(--accent-foreground)" : "var(--muted-foreground)",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: canSubmitWound ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: "13px", height: "13px",
                  border: "2px solid var(--accent-foreground)", borderTopColor: "transparent",
                  borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block",
                }} />
                Building character…
              </>
            ) : "Forge the character →"}
          </button>
        </>
      )}

      {/* Character result phase */}
      {characterResponse && (
        <>
          {/* Lie / Want / Need */}
          <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.75rem" }}>
            {[
              { label: "The Lie", value: characterResponse.lie, colour: "var(--destructive)" },
              { label: "What they Want", value: characterResponse.want, colour: "var(--accent)" },
              { label: "What they Need", value: characterResponse.need, colour: "var(--success)" },
            ].map(({ label, value, colour }) => (
              <div
                key={label}
                style={{
                  padding: "1rem 1.25rem",
                  backgroundColor: "var(--muted)",
                  borderRadius: "var(--radius)",
                  borderLeft: `2px solid ${colour}`,
                }}
              >
                <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: colour, marginBottom: "0.4rem" }}>
                  {label}
                </p>
                <p className="text-foreground" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Save the Cat */}
          <h3
            className="text-foreground"
            style={{ fontSize: "1rem", fontWeight: 400, marginBottom: "0.4rem" }}
          >
            How does the audience fall for them?
          </h3>
          <p className="text-muted-foreground" style={{ fontSize: "0.8rem", marginBottom: "1rem" }}>
            Pick the opening moment that makes us root for this person before anything goes wrong.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.75rem" }}>
            {characterResponse.save_the_cat.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedSTC(i)}
                style={{
                  textAlign: "left",
                  padding: "1.1rem 1.25rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid",
                  borderColor: selectedSTC === i ? "var(--accent)" : "var(--border)",
                  backgroundColor: selectedSTC === i
                    ? "color-mix(in srgb, var(--accent) 8%, var(--card))"
                    : "var(--card)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                <span style={{
                  fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em",
                  color: opt.framing === "active" ? "var(--success)" : "var(--info)",
                  display: "block", marginBottom: "0.4rem",
                }}>
                  Option {opt.option} — {opt.framing}
                </span>
                <p className="text-foreground" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
                  {opt.scene}
                </p>
              </button>
            ))}
          </div>

          {/* Secondary character prompt */}
          <div style={{
            padding: "1rem 1.25rem",
            backgroundColor: "var(--muted)",
            borderRadius: "var(--radius)",
            borderLeft: "2px solid var(--pro)",
            marginBottom: "1.75rem",
          }}>
            <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--pro)", marginBottom: "0.4rem" }}>
              To think about next
            </p>
            <p className="text-foreground" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
              {characterResponse.secondary_character_prompt}
            </p>
          </div>

          {/* Lock */}
          <button
            onClick={handleLockCharacter}
            disabled={selectedSTC === null}
            style={{
              alignSelf: "flex-start",
              padding: "0.6rem 1.75rem",
              borderRadius: "var(--radius)",
              border: "none",
              backgroundColor: selectedSTC !== null ? "var(--accent)" : "var(--border)",
              color: selectedSTC !== null ? "var(--accent-foreground)" : "var(--muted-foreground)",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: selectedSTC !== null ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            Lock this character →
          </button>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
