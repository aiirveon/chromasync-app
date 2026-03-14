"use client"

import { useState } from "react"
import { Spinner } from "./ui"
import {
  FILM_BEATS,
  SHORT_BEATS,
  generateBeatQuestion,
  generateBeatSuggestions,
  type StoryFormat,
  type StoryFramework,
  type BeatDefinition,
  type CompletedBeat,
  type BeatResponse,
} from "@/lib/story"

interface StoryBeatBoardProps {
  format: StoryFormat
  framework?: StoryFramework
  logline: string
  characterLie: string
  characterWant: string
  characterNeed: string
  onBack: () => void
  onBeatSaved?: (beats: CompletedBeat[]) => void
  onComplete: (beats: CompletedBeat[]) => void
}

type BeatState = "locked" | "active" | "done"

interface BeatSlot {
  def: BeatDefinition
  state: BeatState
  answer: string
  aiResponse: BeatResponse | null
  suggestions: string[]
}

function getBeatColour(number: number, total: number): string {
  if (total === 15) {
    if (number <= 3)  return "var(--info)"
    if (number <= 6)  return "var(--accent)"
    if (number <= 9)  return "var(--pro)"
    if (number <= 12) return "var(--destructive)"
    return "var(--success)"
  }
  const pct = number / total
  if (pct <= 0.4) return "var(--accent)"
  if (pct <= 0.7) return "var(--pro)"
  return "var(--success)"
}

export function StoryBeatBoard({
  format,
  framework = "save_the_cat",
  logline,
  characterLie,
  characterWant,
  characterNeed,
  onBack,
  onBeatSaved,
  onComplete,
}: StoryBeatBoardProps) {
  const beatDefs = format === "film" ? FILM_BEATS : SHORT_BEATS
  const total = beatDefs.length

  const [slots, setSlots] = useState<BeatSlot[]>(() =>
    beatDefs.map((def, i) => ({
      def,
      state: i === 0 ? "active" : "locked",
      answer: "",
      aiResponse: null,
      suggestions: [],
    }))
  )

  const [activeBeat, setActiveBeat] = useState<number>(0)
  const [loadingBeat, setLoadingBeat] = useState<number | null>(null)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [suggestionsRequested, setSuggestionsRequested] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const completedCount = slots.filter((s) => s.state === "done").length
  const progress = completedCount / total

  function getCompletedBeats(): CompletedBeat[] {
    return slots
      .filter((s) => s.state === "done")
      .map((s) => ({ number: s.def.number, name: s.def.name, answer: s.answer }))
  }

  async function loadBeatQuestion(index: number) {
    const slot = slots[index]
    if (slot.aiResponse) return
    setLoadingQuestion(true)
    setError(null)

    const { data, error: apiError } = await generateBeatQuestion(
      slot.def.number, slot.def.name, format,
      logline, characterLie, characterWant, characterNeed,
      getCompletedBeats()
    )

    if (apiError || !data) {
      setError(apiError ?? "Could not load beat question")
      setLoadingQuestion(false)
      return
    }

    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, aiResponse: data } : s)))
    setLoadingQuestion(false)
  }

  async function loadSuggestions() {
    if (loadingSuggestions) return
    setLoadingSuggestions(true)
    setSuggestionsRequested(true)

    const slot = slots[activeBeat]
    const { data } = await generateBeatSuggestions(
      slot.def.number, slot.def.name, format, framework,
      logline, characterLie, characterWant, characterNeed,
      getCompletedBeats()
    )

    if (data) {
      setSlots((prev) => prev.map((s, i) => (i === activeBeat ? { ...s, suggestions: data.suggestions } : s)))
    }
    setLoadingSuggestions(false)
  }

  async function selectBeat(index: number) {
    const slot = slots[index]
    if (slot.state === "locked") return
    setActiveBeat(index)
    setCurrentAnswer(slot.answer)
    setShowHint(false)
    setSuggestionsRequested(false)
    await loadBeatQuestion(index)
  }

  function applySuggestion(suggestion: string) {
    setCurrentAnswer(suggestion)
  }

  async function submitAnswer() {
    if (!currentAnswer.trim()) return
    setLoadingBeat(activeBeat)

    const nextIndex = activeBeat + 1

    setSlots((prev) =>
      prev.map((s, i) => {
        if (i === activeBeat) return { ...s, state: "done", answer: currentAnswer.trim() }
        if (i === nextIndex && s.state === "locked") return { ...s, state: "active" }
        return s
      })
    )

    const updatedBeats: CompletedBeat[] = [
      ...getCompletedBeats(),
      { number: slots[activeBeat].def.number, name: slots[activeBeat].def.name, answer: currentAnswer.trim() },
    ]

    onBeatSaved?.(updatedBeats)

    // Show saved flash
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1800)

    if (completedCount + 1 === total) {
      setLoadingBeat(null)
      onComplete(updatedBeats)
      return
    }

    if (nextIndex < total) {
      setActiveBeat(nextIndex)
      setCurrentAnswer("")
      setShowHint(false)
      setSuggestionsRequested(false)

      const nextSlot = slots[nextIndex]
      if (!nextSlot.aiResponse) {
        const completedForNext: CompletedBeat[] = [
          ...getCompletedBeats(),
          { number: slots[activeBeat].def.number, name: slots[activeBeat].def.name, answer: currentAnswer.trim() },
        ]
        setLoadingQuestion(true)
        const { data } = await generateBeatQuestion(
          nextSlot.def.number, nextSlot.def.name, format,
          logline, characterLie, characterWant, characterNeed,
          completedForNext
        )
        if (data) {
          setSlots((prev) => prev.map((s, i) => (i === nextIndex ? { ...s, aiResponse: data } : s)))
        }
        setLoadingQuestion(false)
      }
    }

    setLoadingBeat(null)
  }

  const activeSlot = slots[activeBeat]
  const canSubmit = currentAnswer.trim().length > 10 && loadingBeat === null
  const activeSuggestions = activeSlot.suggestions

  return (
    <div
      className="story-stage"
      style={{ maxWidth: "900px", margin: "0 auto" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={onBack}
          className="text-muted-foreground"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit", padding: 0, marginBottom: "1rem", display: "block" }}
        >
          ← back
        </button>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <p className="text-muted-foreground" style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.3rem" }}>
              Stage 3 — Beat Board · {format === "film" ? `Film (${total} beats)` : `Short Story (${total} beats)`}
            </p>
            <h2 className="text-foreground" style={{ fontSize: "1.1rem", fontWeight: 400 }}>
              Build your structure, one beat at a time.
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Saved flash */}
            {savedFlash && (
              <span style={{ fontSize: "0.7rem", color: "var(--success)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                ✓ Saved
              </span>
            )}
            <span className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{completedCount} / {total}</span>
            <div style={{ width: "100px", height: "4px", backgroundColor: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${progress * 100}%`,
                backgroundColor: progress >= 0.5 ? "var(--success)" : "var(--accent)",
                borderRadius: "2px", transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "0.65rem 1rem", backgroundColor: "color-mix(in srgb, var(--destructive) 10%, var(--card))", border: "1px solid var(--destructive)", borderRadius: "var(--radius)", color: "var(--destructive)", fontSize: "0.8rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--destructive)" }}>✕</button>
        </div>
      )}

      {/* Beat timeline */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        {slots.map((slot, i) => {
          const colour = getBeatColour(slot.def.number, total)
          const isActive = i === activeBeat
          const isDone = slot.state === "done"
          const isLocked = slot.state === "locked"
          return (
            <button
              key={slot.def.number}
              onClick={() => selectBeat(i)}
              disabled={isLocked}
              title={`${slot.def.number}. ${slot.def.name}`}
              style={{
                flex: "1 1 auto",
                minWidth: total === 15 ? "40px" : "70px",
                maxWidth: total === 15 ? "60px" : "130px",
                padding: "0.4rem 0.3rem",
                borderRadius: "4px",
                border: "1px solid",
                borderColor: isActive ? colour : isDone ? `color-mix(in srgb, ${colour} 40%, var(--border))` : "var(--border)",
                backgroundColor: isDone
                  ? `color-mix(in srgb, ${colour} 15%, var(--card))`
                  : isActive ? `color-mix(in srgb, ${colour} 8%, var(--card))` : "transparent",
                cursor: isLocked ? "default" : "pointer",
                opacity: isLocked ? 0.35 : 1,
                transition: "all 0.15s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
              }}
            >
              <span style={{ fontSize: "0.6rem", color: isDone || isActive ? colour : "var(--muted-foreground)", fontWeight: 600 }}>
                {slot.def.number}
              </span>
              {isDone && <span style={{ fontSize: "0.55rem", color: colour }}>✓</span>}
            </button>
          )
        })}
      </div>

      {/* Active beat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Beat label */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "28px", height: "28px", borderRadius: "50%",
            border: `1px solid ${getBeatColour(activeSlot.def.number, total)}`,
            color: getBeatColour(activeSlot.def.number, total),
            fontSize: "0.75rem", fontWeight: 600, flexShrink: 0,
          }}>
            {activeSlot.def.number}
          </span>
          <div>
            <p className="text-foreground" style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "0.15rem" }}>
              {activeSlot.def.name}
            </p>
            <p className="text-muted-foreground" style={{ fontSize: "0.78rem" }}>
              {activeSlot.def.description}
            </p>
          </div>
        </div>

        {/* AI question */}
        {loadingQuestion ? (
          <div style={{ padding: "1.25rem", backgroundColor: "var(--muted)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Spinner size="md" />
            <span className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>Thinking about your story…</span>
          </div>
        ) : activeSlot.aiResponse ? (
          <div style={{ padding: "1.25rem", backgroundColor: "var(--card)", borderRadius: "var(--radius)", borderLeft: `2px solid ${getBeatColour(activeSlot.def.number, total)}` }}>
            <p className="text-foreground" style={{ fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "0.75rem", fontStyle: "italic" }}>
              "{activeSlot.aiResponse.question}"
            </p>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <span className="text-muted-foreground" style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0, paddingTop: "1px" }}>Audience feels:</span>
              <span className="text-muted-foreground" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>{activeSlot.aiResponse.emotional_note}</span>
            </div>
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-muted-foreground"
              style={{ marginTop: "0.75rem", background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", fontFamily: "inherit", padding: 0, textDecoration: "underline", textDecorationStyle: "dotted" }}
            >
              {showHint ? "Hide hint" : "I'm stuck — show hint"}
            </button>
            {showHint && (
              <p className="text-muted-foreground" style={{ marginTop: "0.5rem", fontSize: "0.8rem", lineHeight: 1.5, padding: "0.65rem 0.9rem", backgroundColor: "var(--muted)", borderRadius: "calc(var(--radius) - 2px)" }}>
                {activeSlot.aiResponse.hint}
              </p>
            )}
          </div>
        ) : null}

        {/* Completed beat display */}
        {activeSlot.state === "done" ? (
          <div style={{ padding: "1rem 1.25rem", backgroundColor: "var(--muted)", borderRadius: "var(--radius)", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <span style={{ color: "var(--success)", fontSize: "0.85rem", flexShrink: 0, marginTop: "1px" }}>✓</span>
            <p className="text-foreground" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>{activeSlot.answer}</p>
          </div>
        ) : (
          <>
            {/* Textarea */}
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSubmit) submitAnswer() }}
              placeholder="Write what happens in this beat — a sentence or two is enough to begin."
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
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = getBeatColour(activeSlot.def.number, total) }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)" }}
            />

            {/* Suggestions section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button
                onClick={loadSuggestions}
                disabled={loadingSuggestions}
                className="text-muted-foreground"
                style={{
                  alignSelf: "flex-start",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  backgroundColor: "transparent",
                  fontSize: "0.72rem",
                  cursor: loadingSuggestions ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  transition: "all 0.15s",
                }}
              >
                {loadingSuggestions ? <><Spinner size="sm" /> Suggesting…</> : suggestionsRequested ? "↻ New suggestions" : "Suggest →"}
              </button>

              {/* Suggestion chips */}
              {activeSuggestions.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {activeSuggestions.map((s, si) => {
                    const isApplied = currentAnswer === s
                    return (
                      <button
                        key={si}
                        onClick={() => applySuggestion(s)}
                        style={{
                          textAlign: "left",
                          padding: "0.6rem 0.85rem",
                          borderRadius: "var(--radius)",
                          border: "1px solid",
                          borderColor: isApplied ? getBeatColour(activeSlot.def.number, total) : "var(--border)",
                          backgroundColor: isApplied
                            ? `color-mix(in srgb, ${getBeatColour(activeSlot.def.number, total)} 8%, var(--card))`
                            : "var(--card)",
                          fontSize: "0.82rem",
                          lineHeight: 1.5,
                          color: isApplied ? "var(--foreground)" : "var(--muted-foreground)",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Submit row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
              <button
                onClick={submitAnswer}
                disabled={!canSubmit}
                style={{
                  padding: "0.55rem 1.5rem",
                  borderRadius: "var(--radius)",
                  border: "none",
                  backgroundColor: canSubmit ? getBeatColour(activeSlot.def.number, total) : "var(--border)",
                  color: canSubmit ? "var(--accent-foreground)" : "var(--muted-foreground)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  alignSelf: "flex-start",
                }}
              >
                {loadingBeat === activeBeat ? <><Spinner size="md" /> Saving…</> : activeBeat + 1 === total ? "Complete beat board →" : `Next: ${slots[activeBeat + 1]?.def.name ?? "Done"} →`}
              </button>
              <span className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>⌘↵ to continue</span>
            </div>
          </>
        )}
      </div>


    </div>
  )
}