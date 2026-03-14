"use client"

import { useState } from "react"
import { Spinner } from "./ui"
import {
  regenerateSingleLogline,
  generateThemeSuggestions,
  type LoglineResponse,
  type LoglineVersion,
  type StoryFormat,
  type StoryFramework,
  type InterrogationAnswers,
} from "@/lib/story"

interface StoryLoglineForgeProps {
  response: LoglineResponse
  rawIdea: string
  format: StoryFormat
  framework: StoryFramework
  interrogation: InterrogationAnswers
  initialTheme?: string | null
  onThemeChange?: (theme: string) => void
  onSelect: (version: LoglineVersion) => void
  onBack: () => void
  loading?: boolean
}

export function StoryLoglineForge({
  response,
  rawIdea,
  format,
  framework,
  interrogation,
  initialTheme,
  onThemeChange,
  onSelect,
  onBack,
  loading = false,
}: StoryLoglineForgeProps) {
  const [versions, setVersions] = useState<LoglineVersion[]>(response.versions)
  const [selected, setSelected] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [refreshingIndex, setRefreshingIndex] = useState<number | null>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [customLogline, setCustomLogline] = useState("")

  // Theme state
  const [themeValue, setThemeValue] = useState(initialTheme ?? response.primal_question ?? "")
  const [themeSuggestions, setThemeSuggestions] = useState<string[]>([])
  const [loadingTheme, setLoadingTheme] = useState(false)
  const [themeRequested, setThemeRequested] = useState(false)

  function handleThemeChange(val: string) {
    setThemeValue(val)
    onThemeChange?.(val)
  }

  async function requestThemeSuggestions() {
    if (loadingTheme) return
    setLoadingTheme(true)
    setThemeRequested(true)
    const existingLoglines = versions.map((v) => v.logline)
    const { data } = await generateThemeSuggestions(rawIdea, format, framework, interrogation, existingLoglines, themeValue)
    if (data) setThemeSuggestions(data.suggestions)
    setLoadingTheme(false)
  }

  const labelColours: Record<string, string> = {
    "External Stakes": "var(--accent)",
    "Internal Stakes": "var(--info)",
    "Tonal Shift": "var(--pro)",
  }

  function getLabelColour(label: string) {
    return labelColours[label] ?? "var(--muted-foreground)"
  }

  async function handleRefresh(index: number) {
    if (refreshingIndex !== null) return
    setRefreshingIndex(index)
    setEditingIndex(null)

    const existingLoglines = versions.map((v) => v.logline)
    const { data, error } = await regenerateSingleLogline(
      rawIdea, format, framework,
      versions[index].label,
      interrogation.location,
      interrogation.broken_relationship,
      interrogation.private_behaviour,
      existingLoglines
    )

    if (data && !error) {
      setVersions((prev) => prev.map((v, i) => (i === index ? data : v)))
      if (selected === index) setSelected(null) // deselect if refreshed
    }
    setRefreshingIndex(null)
  }

  function handleStartEdit(index: number) {
    setEditingIndex(index)
    setEditValue(versions[index].logline)
    setShowCustom(false)
  }

  function handleApplyEdit(index: number) {
    if (!editValue.trim()) return
    setVersions((prev) =>
      prev.map((v, i) => i === index ? { ...v, logline: editValue.trim() } : v)
    )
    setEditingIndex(null)
    setSelected(index)
  }

  function handleLock() {
    if (showCustom && customLogline.trim()) {
      onSelect({ label: "Custom", logline: customLogline.trim(), angle: "Written by you" })
      return
    }
    if (selected === null) return
    onSelect(versions[selected])
  }

  const canLock = selected !== null || (showCustom && customLogline.trim().length > 10)

  return (
    <div className="story-stage story-stage-inner">
      {/* Back */}
      <button
        onClick={onBack}
        className="text-muted-foreground"
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: "0.8rem", fontFamily: "inherit", padding: 0,
          marginBottom: "1.5rem", display: "block",
        }}
      >
        ← back
      </button>

      <p
        className="text-muted-foreground"
        style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}
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
        Pick one, edit it, refresh it — or write your own below.
      </p>

      {/* Theme — editable primal question */}
      <div className="story-theme">
        <div className="story-theme__row">
          <span className="story-theme__label">Theme</span>
          <button
            className="story-theme__suggest"
            onClick={requestThemeSuggestions}
            disabled={loadingTheme}
          >
            {loadingTheme ? <><Spinner size="sm" /> Suggesting…</> : themeRequested ? "↻ new suggestions" : "suggest"}
          </button>
        </div>
        <textarea
          className="story-theme__input"
          value={themeValue}
          onChange={(e) => handleThemeChange(e.target.value)}
          rows={2}
          placeholder="The question your story is answering…"
        />
        {themeSuggestions.length > 0 && (
          <div className="story-theme__chips">
            {themeSuggestions.map((s, i) => (
              <button
                key={i}
                className={`story-theme__chip${themeValue === s ? " story-theme__chip--selected" : ""}`}
                onClick={() => handleThemeChange(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logline cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
        {versions.map((v, i) => {
          const isSelected = selected === i
          const isEditing = editingIndex === i
          const isRefreshing = refreshingIndex === i
          const colour = getLabelColour(v.label)

          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {/* Card */}
              <div
                style={{
                  padding: "1.1rem 1rem",
                  borderRadius: isEditing ? "var(--radius) var(--radius) 0 0" : "var(--radius)",
                  border: "1px solid",
                  borderColor: isSelected ? colour : "var(--border)",
                  borderBottom: isEditing ? "none" : undefined,
                  backgroundColor: isSelected
                    ? `color-mix(in srgb, ${colour} 8%, var(--card))`
                    : "var(--card)",
                  transition: "all 0.15s",
                  opacity: isRefreshing ? 0.5 : 1,
                  position: "relative",
                }}
              >
                {/* Top row: label + actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{
                    fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: colour,
                  }}>
                    {v.label}
                  </span>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      onClick={() => handleStartEdit(i)}
                      className="text-muted-foreground"
                      title="Edit this logline"
                      style={{
                        background: "none", border: "1px solid var(--border)", borderRadius: "3px",
                        cursor: "pointer", padding: "0.15rem 0.4rem", fontSize: "0.65rem", fontFamily: "inherit",
                      }}
                    >
                      edit
                    </button>
                    <button
                      onClick={() => handleRefresh(i)}
                      disabled={refreshingIndex !== null}
                      className="text-muted-foreground"
                      title="Regenerate this logline"
                      style={{
                        background: "none", border: "1px solid var(--border)", borderRadius: "3px",
                        cursor: refreshingIndex !== null ? "not-allowed" : "pointer",
                        padding: "0.15rem 0.4rem", fontSize: "0.65rem", fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: "0.25rem",
                      }}
                    >
                      {isRefreshing ? <Spinner size="sm" /> : "↻"}
                    </button>
                  </div>
                </div>

                {/* Logline text — clickable to select */}
                <p
                  className="text-foreground"
                  onClick={() => { setSelected(i); setEditingIndex(null); setShowCustom(false) }}
                  style={{ fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "0.5rem", cursor: "pointer" }}
                >
                  {v.logline}
                </p>

                <p className="text-muted-foreground" style={{ fontSize: "0.72rem", lineHeight: 1.4 }}>
                  {v.angle}
                </p>
              </div>

              {/* Edit panel — appears below card when editing */}
              {isEditing && (
                <div
                  style={{
                    border: "1px solid",
                    borderColor: colour,
                    borderTop: "none",
                    borderRadius: "0 0 var(--radius) var(--radius)",
                    padding: "0.75rem",
                    backgroundColor: `color-mix(in srgb, ${colour} 4%, var(--card))`,
                  }}
                >
                  <p className="text-muted-foreground" style={{ fontSize: "0.65rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Edit this logline
                  </p>
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    rows={3}
                    style={{
                      width: "100%",
                      backgroundColor: "var(--muted)",
                      color: "var(--foreground)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      padding: "0.65rem",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      resize: "vertical",
                      outline: "none",
                      fontFamily: "inherit",
                      marginBottom: "0.5rem",
                    }}
                  />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleApplyEdit(i)}
                      disabled={!editValue.trim()}
                      style={{
                        padding: "0.35rem 0.85rem",
                        borderRadius: "var(--radius)",
                        border: "none",
                        backgroundColor: editValue.trim() ? colour : "var(--border)",
                        color: editValue.trim() ? "var(--accent-foreground)" : "var(--muted-foreground)",
                        fontSize: "0.75rem",
                        cursor: editValue.trim() ? "pointer" : "not-allowed",
                        fontFamily: "inherit",
                      }}
                    >
                      Use my version
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="text-muted-foreground"
                      style={{
                        padding: "0.35rem 0.75rem",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--border)",
                        backgroundColor: "transparent",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Write your own — collapsible */}
      <div style={{ marginBottom: "1.75rem" }}>
        <button
          onClick={() => { setShowCustom((v) => !v); setSelected(null); setEditingIndex(null) }}
          className="text-muted-foreground"
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "0.75rem", fontFamily: "inherit", padding: 0,
            display: "flex", alignItems: "center", gap: "0.35rem",
          }}
        >
          <span style={{ fontSize: "0.65rem" }}>{showCustom ? "▲" : "▼"}</span>
          Write your own logline instead
        </button>

        {showCustom && (
          <div style={{ marginTop: "0.75rem" }}>
            <textarea
              value={customLogline}
              onChange={(e) => setCustomLogline(e.target.value)}
              autoFocus
              placeholder="Write your own logline here — one sentence, under 40 words."
              rows={3}
              style={{
                width: "100%",
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "0.75rem",
                fontSize: "0.875rem",
                lineHeight: 1.5,
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)" }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "" }}
            />
          </div>
        )}
      </div>

      {/* Lock in */}
      <button
        onClick={handleLock}
        disabled={!canLock || loading}
        style={{
          padding: "0.6rem 1.5rem",
          borderRadius: "var(--radius)",
          border: "none",
          backgroundColor: canLock ? "var(--accent)" : "var(--border)",
          color: canLock ? "var(--accent-foreground)" : "var(--muted-foreground)",
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: canLock ? "pointer" : "not-allowed",
          fontFamily: "inherit",
          transition: "all 0.15s",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          alignSelf: "flex-start",
        }}
      >
        {loading ? <><Spinner size="md" /> Building character…</> : "Lock this logline →"}
      </button>


    </div>
  )
}