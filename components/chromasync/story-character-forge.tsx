"use client"

import { useState } from "react"
import {
  regenerateCharacterField,
  regenerateSaveTheCat,
  type CharacterResponse,
  type SaveTheCatOption,
  type StoryFormat,
  type StoryFramework,
} from "@/lib/story"
import { Spinner } from "./ui"

interface StoryCharacterForgeProps {
  logline: string
  format: StoryFormat
  framework?: StoryFramework
  woundAnswer?: string
  characterResponse: CharacterResponse | null
  loading: boolean
  onAskWound: (woundAnswer: string, characterName: string) => void
  onSelectSaveTheCat: (option: SaveTheCatOption) => void
  onBack: () => void
}

const FIELD_COLOURS = {
  lie:  "var(--destructive)",
  want: "var(--accent)",
  need: "var(--success)",
}

export function StoryCharacterForge({
  logline,
  format,
  framework = "save_the_cat",
  woundAnswer = "",
  characterResponse,
  loading,
  onAskWound,
  onSelectSaveTheCat,
  onBack,
}: StoryCharacterForgeProps) {
  const [woundInput, setWoundInput] = useState("")
  const [characterName, setCharacterName] = useState("")

  // Editable character fields
  const [fields, setFields] = useState<{ lie: string; want: string; need: string } | null>(null)
  const [editingField, setEditingField] = useState<"lie" | "want" | "need" | null>(null)
  const [editFieldValue, setEditFieldValue] = useState("")
  const [refreshingField, setRefreshingField] = useState<string | null>(null)

  // Save the Cat
  const [stcOptions, setStcOptions] = useState<SaveTheCatOption[] | null>(null)
  const [selectedSTC, setSelectedSTC] = useState<number | null>(null)
  const [editingSTCIndex, setEditingSTCIndex] = useState<number | null>(null)
  const [editSTCValue, setEditSTCValue] = useState("")
  const [refreshingSTCIndex, setRefreshingSTCIndex] = useState<number | null>(null)
  const [showCustomSTC, setShowCustomSTC] = useState(false)
  const [customSTC, setCustomSTC] = useState("")

  // Initialise local state when characterResponse first arrives
  if (characterResponse && !fields) {
    setFields({ lie: characterResponse.lie, want: characterResponse.want, need: characterResponse.need })
    setStcOptions(characterResponse.save_the_cat)
  }

  const canSubmitWound = woundInput.trim().length > 8 && !loading

  // ── Field refresh ────────────────────────────────────────────────────────

  async function handleRefreshField(field: "lie" | "want" | "need") {
    if (!fields || refreshingField) return
    setRefreshingField(field)
    setEditingField(null)
    const { data } = await regenerateCharacterField(
      field, logline, format, framework, woundAnswer || woundInput,
      fields.lie, fields.want, fields.need
    )
    if (data) setFields((prev) => prev ? { ...prev, [field]: data.value } : prev)
    setRefreshingField(null)
  }

  function handleStartEditField(field: "lie" | "want" | "need") {
    if (!fields) return
    setEditingField(field)
    setEditFieldValue(fields[field])
  }

  function handleApplyFieldEdit() {
    if (!fields || !editingField || !editFieldValue.trim()) return
    setFields((prev) => prev ? { ...prev, [editingField]: editFieldValue.trim() } : prev)
    setEditingField(null)
  }

  // ── Save the Cat refresh ─────────────────────────────────────────────────

  async function handleRefreshSTC(index: number) {
    if (!stcOptions || !fields || refreshingSTCIndex !== null) return
    setRefreshingSTCIndex(index)
    setEditingSTCIndex(null)
    const opt = stcOptions[index]
    const otherScene = stcOptions[1 - index]?.scene ?? ""
    const { data } = await regenerateSaveTheCat(
      opt.option as "A" | "B", opt.framing as "active" | "passive",
      logline, format, framework,
      woundAnswer || woundInput, fields.lie,
      opt.scene, otherScene
    )
    if (data) {
      setStcOptions((prev) => prev ? prev.map((o, i) => i === index ? data : o) : prev)
      if (selectedSTC === index) setSelectedSTC(null)
    }
    setRefreshingSTCIndex(null)
  }

  function handleStartEditSTC(index: number) {
    if (!stcOptions) return
    setEditingSTCIndex(index)
    setEditSTCValue(stcOptions[index].scene)
    setShowCustomSTC(false)
  }

  function handleApplySTCEdit(index: number) {
    if (!stcOptions || !editSTCValue.trim()) return
    setStcOptions((prev) => prev ? prev.map((o, i) => i === index ? { ...o, scene: editSTCValue.trim() } : o) : prev)
    setEditingSTCIndex(null)
    setSelectedSTC(index)
  }

  function handleLockCharacter() {
    if (showCustomSTC && customSTC.trim()) {
      onSelectSaveTheCat({ option: "Custom", scene: customSTC.trim(), framing: "active" })
      return
    }
    if (selectedSTC === null || !stcOptions) return
    // Pass through edited fields if changed
    onSelectSaveTheCat(stcOptions[selectedSTC])
  }

  const canLock = selectedSTC !== null || (showCustomSTC && customSTC.trim().length > 10)

  return (
    <div className="story-stage story-stage-inner">
      <button
        onClick={onBack}
        className="text-muted-foreground"
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", padding: 0, marginBottom: "1.5rem", display: "block", textAlign: "left" }}
      >
        ← back
      </button>

      <p className="text-muted-foreground" style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
        Stage 2 — Character Forge
      </p>

      {/* Locked logline */}
      <div style={{ padding: "0.75rem 1rem", backgroundColor: "var(--muted)", borderRadius: "var(--radius)", marginBottom: "2rem", borderLeft: "2px solid var(--accent)" }}>
        <p className="text-muted-foreground" style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.3rem" }}>Your logline</p>
        <p className="text-foreground" style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>{logline}</p>
      </div>

      {/* ── Wound phase ── */}
      {!characterResponse && (
        <>
          <h2 className="text-foreground" style={{ fontSize: "1.2rem", fontWeight: 400, lineHeight: 1.4, marginBottom: "0.5rem" }}>
            Every protagonist carries a wound.
          </h2>
          <p className="text-muted-foreground" style={{ fontSize: "0.875rem", lineHeight: 1.5, marginBottom: "1.75rem" }}>
            Not a plot wound — something that happened before the story began.
          </p>
          <input
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Protagonist's name (optional)"
            disabled={loading}
            style={{ width: "100%", backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.65rem 1rem", fontSize: "0.9rem", fontFamily: "inherit", outline: "none", marginBottom: "0.75rem", transition: "border-color 0.15s" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)" }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)" }}
          />
          <textarea
            value={woundInput}
            onChange={(e) => setWoundInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSubmitWound) onAskWound(woundInput.trim(), characterName.trim()) }}
            placeholder="e.g. She was the only witness to something and no one believed her. She learned that telling the truth costs more than silence."
            disabled={loading}
            rows={4}
            autoFocus
            style={{ width: "100%", backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1rem", fontSize: "0.9rem", lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", transition: "border-color 0.15s", marginBottom: "1.25rem" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)" }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)" }}
          />
          <button
            onClick={() => canSubmitWound && onAskWound(woundInput.trim(), characterName.trim())}
            disabled={!canSubmitWound}
            style={{ alignSelf: "flex-start", padding: "0.55rem 1.5rem", borderRadius: "var(--radius)", border: "none", backgroundColor: canSubmitWound ? "var(--accent)" : "var(--border)", color: canSubmitWound ? "var(--accent-foreground)" : "var(--muted-foreground)", fontSize: "0.875rem", fontWeight: 500, cursor: canSubmitWound ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {loading ? <><Spinner size="md" /> Building character…</> : "Forge the character →"}
          </button>
        </>
      )}

      {/* ── Character result phase ── */}
      {characterResponse && fields && stcOptions && (
        <>
          {/* Lie / Want / Need — editable cards */}
          <div style={{ display: "grid", gap: "0.6rem", marginBottom: "1.75rem" }}>
            {(["lie", "want", "need"] as const).map((field) => {
              const labels = { lie: "The Lie", want: "What they Want", need: "What they Need" }
              const colour = FIELD_COLOURS[field]
              const isEditing = editingField === field
              const isRefreshing = refreshingField === field

              return (
                <div key={field}>
                  <div style={{ padding: "0.9rem 1rem", backgroundColor: "var(--muted)", borderRadius: isEditing ? "var(--radius) var(--radius) 0 0" : "var(--radius)", borderLeft: `2px solid ${colour}`, opacity: isRefreshing ? 0.5 : 1, transition: "opacity 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: colour, margin: 0 }}>{labels[field]}</p>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button
                          onClick={() => handleStartEditField(field)}
                          className="text-muted-foreground"
                          style={{ background: "none", border: "1px solid var(--border)", borderRadius: "3px", cursor: "pointer", padding: "0.15rem 0.4rem", fontSize: "0.6rem", fontFamily: "inherit" }}
                        >edit</button>
                        <button
                          onClick={() => handleRefreshField(field)}
                          disabled={refreshingField !== null}
                          className="text-muted-foreground"
                          style={{ background: "none", border: "1px solid var(--border)", borderRadius: "3px", cursor: refreshingField ? "not-allowed" : "pointer", padding: "0.15rem 0.4rem", fontSize: "0.6rem", fontFamily: "inherit", display: "flex", alignItems: "center" }}
                        >
                          {isRefreshing ? <Spinner size="sm" /> : "↻"}
                        </button>
                      </div>
                    </div>
                    <p className="text-foreground" style={{ fontSize: "0.875rem", lineHeight: 1.5, margin: 0 }}>{fields[field]}</p>
                  </div>

                  {/* Edit panel */}
                  {isEditing && (
                    <div style={{ border: `1px solid ${colour}`, borderTop: "none", borderRadius: "0 0 var(--radius) var(--radius)", padding: "0.65rem", backgroundColor: `color-mix(in srgb, ${colour} 4%, var(--card))` }}>
                      <textarea
                        value={editFieldValue}
                        onChange={(e) => setEditFieldValue(e.target.value)}
                        autoFocus
                        rows={2}
                        style={{ width: "100%", backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.6rem", fontSize: "0.85rem", lineHeight: 1.5, resize: "vertical", outline: "none", fontFamily: "inherit", marginBottom: "0.5rem" }}
                      />
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          onClick={handleApplyFieldEdit}
                          disabled={!editFieldValue.trim()}
                          style={{ padding: "0.3rem 0.8rem", borderRadius: "var(--radius)", border: "none", backgroundColor: editFieldValue.trim() ? colour : "var(--border)", color: editFieldValue.trim() ? "var(--accent-foreground)" : "var(--muted-foreground)", fontSize: "0.72rem", cursor: editFieldValue.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}
                        >Use my version</button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="text-muted-foreground"
                          style={{ padding: "0.3rem 0.7rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "transparent", fontSize: "0.72rem", cursor: "pointer", fontFamily: "inherit" }}
                        >Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Save the Cat */}
          <h3 className="text-foreground" style={{ fontSize: "1rem", fontWeight: 400, marginBottom: "0.4rem" }}>
            How does the audience fall for them?
          </h3>
          <p className="text-muted-foreground" style={{ fontSize: "0.8rem", marginBottom: "1rem" }}>
            Pick the opening moment that makes us root for this person before anything goes wrong.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
            {stcOptions.map((opt, i) => {
              const isSelected = selectedSTC === i
              const isEditing = editingSTCIndex === i
              const isRefreshing = refreshingSTCIndex === i
              const colour = opt.framing === "active" ? "var(--success)" : "var(--info)"

              return (
                <div key={i}>
                  <div
                    style={{ padding: "1rem 1.1rem", borderRadius: isEditing ? "var(--radius) var(--radius) 0 0" : "var(--radius)", border: "1px solid", borderColor: isSelected ? colour : "var(--border)", borderBottom: isEditing ? "none" : undefined, backgroundColor: isSelected ? `color-mix(in srgb, ${colour} 8%, var(--card))` : "var(--card)", transition: "all 0.15s", opacity: isRefreshing ? 0.5 : 1 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: colour }}>
                        Option {opt.option} — {opt.framing}
                      </span>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button
                          onClick={() => handleStartEditSTC(i)}
                          className="text-muted-foreground"
                          style={{ background: "none", border: "1px solid var(--border)", borderRadius: "3px", cursor: "pointer", padding: "0.15rem 0.4rem", fontSize: "0.6rem", fontFamily: "inherit" }}
                        >edit</button>
                        <button
                          onClick={() => handleRefreshSTC(i)}
                          disabled={refreshingSTCIndex !== null}
                          className="text-muted-foreground"
                          style={{ background: "none", border: "1px solid var(--border)", borderRadius: "3px", cursor: refreshingSTCIndex !== null ? "not-allowed" : "pointer", padding: "0.15rem 0.4rem", fontSize: "0.6rem", fontFamily: "inherit", display: "flex", alignItems: "center" }}
                        >
                          {isRefreshing ? <Spinner size="sm" /> : "↻"}
                        </button>
                      </div>
                    </div>
                    <p
                      className="text-foreground"
                      onClick={() => { setSelectedSTC(i); setEditingSTCIndex(null); setShowCustomSTC(false) }}
                      style={{ fontSize: "0.875rem", lineHeight: 1.5, margin: 0, cursor: "pointer" }}
                    >
                      {opt.scene}
                    </p>
                  </div>

                  {/* STC edit panel */}
                  {isEditing && (
                    <div style={{ border: `1px solid ${colour}`, borderTop: "none", borderRadius: "0 0 var(--radius) var(--radius)", padding: "0.65rem", backgroundColor: `color-mix(in srgb, ${colour} 4%, var(--card))` }}>
                      <p className="text-muted-foreground" style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>Edit this scene</p>
                      <textarea
                        value={editSTCValue}
                        onChange={(e) => setEditSTCValue(e.target.value)}
                        autoFocus
                        rows={3}
                        style={{ width: "100%", backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.65rem", fontSize: "0.875rem", lineHeight: 1.5, resize: "vertical", outline: "none", fontFamily: "inherit", marginBottom: "0.5rem" }}
                      />
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          onClick={() => handleApplySTCEdit(i)}
                          disabled={!editSTCValue.trim()}
                          style={{ padding: "0.3rem 0.8rem", borderRadius: "var(--radius)", border: "none", backgroundColor: editSTCValue.trim() ? colour : "var(--border)", color: editSTCValue.trim() ? "var(--accent-foreground)" : "var(--muted-foreground)", fontSize: "0.72rem", cursor: editSTCValue.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}
                        >Use my version</button>
                        <button
                          onClick={() => setEditingSTCIndex(null)}
                          className="text-muted-foreground"
                          style={{ padding: "0.3rem 0.7rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "transparent", fontSize: "0.72rem", cursor: "pointer", fontFamily: "inherit" }}
                        >Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Write your own STC — collapsible */}
          <div style={{ marginBottom: "1.75rem" }}>
            <button
              onClick={() => { setShowCustomSTC((v) => !v); setSelectedSTC(null); setEditingSTCIndex(null) }}
              className="text-muted-foreground"
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit", padding: 0, display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              <span style={{ fontSize: "0.65rem" }}>{showCustomSTC ? "▲" : "▼"}</span>
              Write your own opening scene instead
            </button>
            {showCustomSTC && (
              <textarea
                value={customSTC}
                onChange={(e) => setCustomSTC(e.target.value)}
                autoFocus
                placeholder="Describe the opening moment that makes the audience fall for your protagonist."
                rows={3}
                style={{ width: "100%", marginTop: "0.75rem", backgroundColor: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.75rem", fontSize: "0.875rem", lineHeight: 1.5, resize: "vertical", outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)" }}
              />
            )}
          </div>

          {/* To think about next */}
          <div style={{ padding: "1rem 1.1rem", backgroundColor: "var(--muted)", borderRadius: "var(--radius)", borderLeft: "2px solid var(--pro)", marginBottom: "1.75rem" }}>
            <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--pro)", marginBottom: "0.4rem" }}>To think about next</p>
            <p className="text-foreground" style={{ fontSize: "0.875rem", lineHeight: 1.5, margin: 0 }}>
              {characterResponse.secondary_character_prompt}
            </p>
          </div>

          {/* Lock */}
          <button
            onClick={handleLockCharacter}
            disabled={!canLock}
            style={{ alignSelf: "flex-start", padding: "0.6rem 1.5rem", borderRadius: "var(--radius)", border: "none", backgroundColor: canLock ? "var(--accent)" : "var(--border)", color: canLock ? "var(--accent-foreground)" : "var(--muted-foreground)", fontSize: "0.875rem", fontWeight: 500, cursor: canLock ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 0.15s" }}
          >
            Lock this character →
          </button>
        </>
      )}


    </div>
  )
}