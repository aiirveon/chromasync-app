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

  const canProceed = rawIdea.trim().length > 10 && !loading

  function handleSubmit() {
    if (!canProceed) return
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
    </div>
  )
}
