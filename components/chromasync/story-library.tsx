"use client"

import { useState, useEffect } from "react"
import { loadStories, deleteStory, type Story } from "@/lib/story"
import { Trash2 } from "lucide-react"
import { Spinner } from "./ui"

interface StoryLibraryProps {
  onResume: (story: Story) => void
  onNewStory: () => void
}

function stageLabel(stage: number, beats: any): string {
  if (stage === 0) return "Idea saved"
  if (stage === 1) return "Logline locked"
  if (stage === 2) return "Character built"
  if (stage >= 3) {
    const beatCount = Array.isArray(beats) ? beats.length : 0
    return beatCount > 0 ? `${beatCount} beats written` : "Beat board started"
  }
  return "In progress"
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function frameworkLabel(fw: string | null): string {
  if (fw === "truby") return "Truby's Arc"
  if (fw === "story_circle") return "Story Circle"
  return "Save the Cat"
}

export function StoryLibrary({ onResume, onNewStory }: StoryLibraryProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadStories().then(({ stories: s }) => {
      setStories(s)
      setLoading(false)
    })
  }, [])

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteStory(id)
    setStories((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  return (
    <div className="story-stage story-stage-inner">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>
            Your Stories
          </p>
          <h2 className="text-foreground" style={{ fontSize: "1.2rem", fontWeight: 400 }}>
            Library
          </h2>
        </div>
        <button
          onClick={onNewStory}
          style={{ padding: "0.45rem 1.1rem", borderRadius: "var(--radius)", border: "none", backgroundColor: "var(--accent)", color: "var(--accent-foreground)", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
        >
          + New story
        </button>
      </div>

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
          <Spinner size="md" />
          Loading your stories…
        </div>
      )}

      {!loading && stories.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: "3rem" }}>
          <p className="text-muted-foreground" style={{ fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            No stories yet. Start your first one.
          </p>
          <button
            onClick={onNewStory}
            style={{ padding: "0.55rem 1.5rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--muted-foreground)", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit" }}
          >
            Begin a story →
          </button>
        </div>
      )}

      {!loading && stories.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {stories.map((s) => {
            const isDeleting = deletingId === s.id
            const isConfirming = confirmDeleteId === s.id
            const beatCount = Array.isArray(s.beats) ? s.beats.length : 0

            return (
              <div
                key={s.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "1rem 1rem 1rem 1.1rem",
                  backgroundColor: "var(--card)",
                  opacity: isDeleting ? 0.4 : 1,
                  transition: "opacity 0.2s",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                {/* Left: content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title or fallback */}
                  <p className="text-foreground" style={{ fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.3rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.title || s.raw_idea?.slice(0, 60) || "Untitled story"}
                    {!s.title && s.raw_idea && s.raw_idea.length > 60 ? "…" : ""}
                  </p>

                  {/* Logline if exists */}
                  {s.logline && (
                    <p className="text-muted-foreground" style={{ fontSize: "0.78rem", lineHeight: 1.4, marginBottom: "0.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {s.logline}
                    </p>
                  )}

                  {/* Meta row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                    <span className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>
                      {formatDate(s.updated_at)}
                    </span>
                    <span style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "var(--border)", flexShrink: 0 }} />
                    <span className="text-muted-foreground" style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {s.format === "film" ? "Film" : "Short Story"}
                    </span>
                    <span style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "var(--border)", flexShrink: 0 }} />
                    <span className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>
                      {frameworkLabel(s.framework)}
                    </span>
                    <span style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "var(--border)", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.65rem", color: s.stage >= 3 ? "var(--success)" : "var(--accent)" }}>
                      {stageLabel(s.stage, s.beats)}
                    </span>
                  </div>
                </div>

                {/* Right: actions */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem", flexShrink: 0 }}>
                  {!isConfirming ? (
                    <>
                      <button
                        onClick={() => onResume(s)}
                        style={{ padding: "0.3rem 0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--foreground)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                      >
                        Resume →
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(s.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: "0.2rem", display: "flex", alignItems: "center" }}
                        title="Delete story"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", alignItems: "flex-end" }}>
                      <p className="text-muted-foreground" style={{ fontSize: "0.65rem", textAlign: "right" }}>Delete this story?</p>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          style={{ padding: "0.25rem 0.6rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--muted-foreground)", fontSize: "0.7rem", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={isDeleting}
                          style={{ padding: "0.25rem 0.6rem", borderRadius: "var(--radius)", border: "1px solid var(--destructive)", backgroundColor: "color-mix(in srgb, var(--destructive) 10%, transparent)", color: "var(--destructive)", fontSize: "0.7rem", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          {isDeleting ? "…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}


    </div>
  )
}