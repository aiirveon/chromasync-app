"use client"

import { useState, useEffect } from "react"
import type { StoryFormat, StoryFramework } from "@/lib/story"
import { StoryFrameworkPicker } from "./story-framework-picker"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://chromasync-api.onrender.com"

interface StoryColdOpenProps {
  onBegin: (rawIdea: string, format: StoryFormat, framework: StoryFramework, title: string) => void
  loading?: boolean
}

export function StoryColdOpen({ onBegin, loading = false }: StoryColdOpenProps) {
  const [rawIdea, setRawIdea] = useState("")
  const [title, setTitle] = useState("")
  const [format, setFormat] = useState<StoryFormat>("film")
  const [framework, setFramework] = useState<StoryFramework>("save_the_cat")
  const [showFramework, setShowFramework] = useState(false)
  const [apiReady, setApiReady] = useState(false)

  // Wake Render's free instance the moment this screen mounts.
  // By the time the user finishes typing, the cold-start delay is gone.
  useEffect(() => {
    fetch(`${API_BASE}/health`, { method: "GET" })
      .then(() => setApiReady(true))
      .catch(() => setApiReady(true)) // still let them try even if ping fails
  }, [])

  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)

  const canProceed = rawIdea.trim().length > 10 && !loading

  function handleSubmit() {
    if (!canProceed) return
    setShowSaveModal(true)
  }

  async function handleSaveAndContinue() {
    setSaving(true)
    // Small delay so user sees the saving state
    await new Promise((r) => setTimeout(r, 400))
    setSaving(false)
    setSavedOk(true)
    await new Promise((r) => setTimeout(r, 600))
    setShowSaveModal(false)
    setSavedOk(false)
    onBegin(rawIdea.trim(), format, framework, title.trim())
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  return (
    <div
      className="story-stage"
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <div className="story-stage-inner">

        {/* Question */}
        <h1
          className="text-foreground"
          style={{
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            fontWeight: 400,
            lineHeight: 1.4,
            marginBottom: "2.5rem",
            letterSpacing: "-0.01em",
          }}
        >
          What's the one story you've been putting off telling?
        </h1>

        {/* Story title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this story a name (optional)"
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: "transparent",
            color: "var(--foreground)",
            border: "none",
            borderBottom: "1px solid var(--border)",
            borderRadius: 0,
            padding: "0.4rem 0",
            fontSize: "0.9rem",
            fontFamily: "inherit",
            outline: "none",
            marginBottom: "1.5rem",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)" }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)" }}
        />

        {/* Textarea */}
        <textarea
          value={rawIdea}
          onChange={(e) => setRawIdea(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write anything. A feeling, a sentence, a person, a moment."
          disabled={loading}
          rows={5}
          autoFocus
          style={{
            width: "100%",
            backgroundColor: "var(--muted)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "0.875rem",
            fontSize: "0.9rem",
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)" }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)" }}
        />

        {/* Format picker + submit row */}
        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {/* Format toggle */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
            }}
          >
            {(["film", "short_story"] as StoryFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid",
                  borderColor: format === f ? "var(--accent)" : "var(--border)",
                  backgroundColor: format === f
                    ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                    : "transparent",
                  color: format === f ? "var(--accent)" : "var(--muted-foreground)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {f === "film" ? "Film" : "Short Story"}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canProceed}
            style={{
              padding: "0.55rem 1.5rem",
              borderRadius: "var(--radius)",
              border: "none",
              backgroundColor: canProceed ? "var(--accent)" : "var(--border)",
              color: canProceed ? "var(--accent-foreground)" : "var(--muted-foreground)",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: canProceed ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              alignSelf: "flex-start",
            }}
          >
            {loading ? (
              <>
                <span style={{ width: "14px", height: "14px", border: "2px solid var(--accent-foreground)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                Saving & building…
              </>
            ) : (
              "Save & Begin →"
            )}
          </button>
        </div>

        {/* Framework picker — collapsible */}
        <div style={{ marginTop: "1.25rem" }}>
          <button
            onClick={() => setShowFramework((v) => !v)}
            className="text-muted-foreground"
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "0.75rem", fontFamily: "inherit", padding: 0,
              display: "flex", alignItems: "center", gap: "0.35rem",
            }}
          >
            <span style={{ fontSize: "0.65rem" }}>{showFramework ? "▲" : "▼"}</span>
            Story structure:{" "}
            <span style={{ color: "var(--foreground)" }}>
              {framework === "save_the_cat" ? "Save the Cat" : framework === "truby" ? "Truby's Arc" : "Story Circle"}
            </span>
          </button>
          {showFramework && (
            <div style={{ marginTop: "0.75rem" }}>
              <StoryFrameworkPicker value={framework} onChange={setFramework} />
            </div>
          )}
        </div>

        {/* Hint */}
        <p
          className="text-muted-foreground"
          style={{ marginTop: "1rem", fontSize: "0.75rem" }}
        >
          {!apiReady && (
            <span style={{ color: "var(--accent)", marginRight: "0.4rem" }}>⚡ Warming up…</span>
          )}
          {format === "film"
            ? "We'll shape it into a film — one beat at a time."
            : "We'll shape it into a short story — one beat at a time."}
          {" "}Press ⌘↵ to continue.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Save modal */}
      {showSaveModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            backgroundColor: "var(--modal-overlay)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={() => setShowSaveModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: "420px",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              display: "flex", flexDirection: "column", gap: "1rem",
            }}
          >
            <div>
              <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", marginBottom: "0.3rem" }}>Save story</p>
              <h3 className="text-foreground" style={{ fontSize: "1rem", fontWeight: 400 }}>Confirm before we build</h3>
            </div>

            {/* Title field */}
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginBottom: "0.4rem" }}>Story name</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this story a name (optional)"
                style={{
                  width: "100%", backgroundColor: "var(--muted)", color: "var(--foreground)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius)",
                  padding: "0.6rem 0.75rem", fontSize: "0.875rem", fontFamily: "inherit", outline: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)" }}
              />
            </div>

            {/* Summary */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <div style={{ padding: "0.5rem 0.75rem", backgroundColor: "var(--muted)", borderRadius: "var(--radius)", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                {format === "film" ? "🎬 Film" : "📖 Short Story"}
              </div>
              <div style={{ padding: "0.5rem 0.75rem", backgroundColor: "var(--muted)", borderRadius: "var(--radius)", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                {framework === "save_the_cat" ? "Save the Cat" : framework === "truby" ? "Truby's Arc" : "Story Circle"}
              </div>
            </div>

            {/* Raw idea preview */}
            <div style={{ padding: "0.65rem 0.75rem", backgroundColor: "var(--muted)", borderRadius: "var(--radius)", borderLeft: "2px solid var(--accent)" }}>
              <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Your idea</p>
              <p className="text-foreground" style={{ fontSize: "0.82rem", lineHeight: 1.5, margin: 0 }}>
                {rawIdea.trim().slice(0, 120)}{rawIdea.length > 120 ? "…" : ""}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{ padding: "0.5rem 1rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--muted-foreground)", fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndContinue}
                disabled={saving || savedOk}
                style={{
                  padding: "0.5rem 1.25rem", borderRadius: "var(--radius)", border: "none",
                  backgroundColor: savedOk ? "var(--success)" : "var(--accent)",
                  color: "var(--accent-foreground)", fontSize: "0.8rem", fontWeight: 500,
                  cursor: saving || savedOk ? "default" : "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: "0.4rem", transition: "background-color 0.2s",
                }}
              >
                {savedOk ? (
                  "✓ Saved!"
                ) : saving ? (
                  <><span style={{ width: "12px", height: "12px", border: "2px solid var(--accent-foreground)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Saving…</>
                ) : (
                  "Save & Continue →"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
