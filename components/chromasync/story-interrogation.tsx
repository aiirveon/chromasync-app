"use client"

import { useState } from "react"
import {
  generateInterrogationHints,
  type StoryFormat,
  type StoryFramework,
  type InterrogationAnswers,
} from "@/lib/story"

interface StoryInterrogationProps {
  rawIdea: string
  format: StoryFormat
  framework: StoryFramework
  onBack: () => void
  onContinue: (answers: InterrogationAnswers) => void
}

interface QuestionState {
  value: string
  locked: boolean
  suggestions: string[]
  loadingSuggestions: boolean
  suggestionsRequested: boolean
}

const QUESTIONS = [
  {
    number: 1,
    field: "location" as keyof InterrogationAnswers,
    label: "Where does this story take place?",
    sublabel: "One specific location — not a city, but a place with texture.",
    placeholder: "e.g. A night-shift laundromat in East London, a decommissioned ferry, a hospital car park",
  },
  {
    number: 2,
    field: "broken_relationship" as keyof InterrogationAnswers,
    label: "What relationship is already broken before the story begins?",
    sublabel: "Not a plot point — something that happened before page one.",
    placeholder: "e.g. A former business partner who was never repaid, a sister who stopped returning calls two years ago",
  },
  {
    number: 3,
    field: "private_behaviour" as keyof InterrogationAnswers,
    label: "What does your protagonist do when no one is watching?",
    sublabel: "Small, specific, private — reveals who they truly are.",
    placeholder: "e.g. They re-read the same three text messages every morning, they buy scratch cards and never check them",
  },
]

export function StoryInterrogation({
  rawIdea,
  format,
  framework,
  onBack,
  onContinue,
}: StoryInterrogationProps) {
  const [questions, setQuestions] = useState<QuestionState[]>(
    QUESTIONS.map(() => ({
      value: "",
      locked: false,
      suggestions: [],
      loadingSuggestions: false,
      suggestionsRequested: false,
    }))
  )

  const canContinue = questions[0].value.trim().length > 3

  function updateValue(index: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, value, locked: false } : q))
    )
  }

  function lockAnswer(index: number) {
    if (!questions[index].value.trim()) return
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, locked: true } : q))
    )
  }

  async function requestSuggestions(index: number) {
    const q = questions[index]
    if (q.loadingSuggestions) return

    setQuestions((prev) =>
      prev.map((qi, i) =>
        i === index ? { ...qi, loadingSuggestions: true, suggestionsRequested: true } : qi
      )
    )

    // Use locked values as authoritative context, fall back to current input
    const location = questions[0].locked ? questions[0].value : questions[0].value
    const broken = questions[1].locked ? questions[1].value : questions[1].value

    const { data, error } = await generateInterrogationHints(
      index + 1,
      rawIdea,
      format,
      framework,
      location,
      broken
    )

    setQuestions((prev) =>
      prev.map((qi, i) =>
        i === index
          ? { ...qi, loadingSuggestions: false, suggestions: data?.suggestions ?? [] }
          : qi
      )
    )
  }

  function applySuggestion(index: number, suggestion: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, value: suggestion } : q))
    )
  }

  function handleContinue() {
    if (!canContinue) return
    onContinue({
      location: questions[0].value.trim(),
      broken_relationship: questions[1].value.trim(),
      private_behaviour: questions[2].value.trim(),
    })
  }

  return (
    <div className="story-stage story-stage-inner">
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
        style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}
      >
        Before we build — three quick questions
      </p>
      <h2
        className="text-foreground"
        style={{ fontSize: "1.2rem", fontWeight: 400, lineHeight: 1.4, marginBottom: "0.5rem" }}
      >
        Make it specific.
      </h2>
      <p
        className="text-muted-foreground"
        style={{ fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "2rem" }}
      >
        Generic inputs produce generic stories. These three answers give the AI something real to work with.
        Only the first question is required.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
        {QUESTIONS.map((q, index) => {
          const state = questions[index]
          const isOptional = index > 0
          return (
            <div key={index} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {/* Label */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
                <label
                  className="text-foreground"
                  style={{ fontSize: "0.875rem", fontWeight: 500 }}
                >
                  {q.label}
                </label>
                {isOptional && (
                  <span
                    className="text-muted-foreground"
                    style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.07em" }}
                  >
                    optional
                  </span>
                )}
              </div>
              <p className="text-muted-foreground" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>
                {q.sublabel}
              </p>

              {/* Textarea */}
              <textarea
                value={state.value}
                onChange={(e) => updateValue(index, e.target.value)}
                placeholder={q.placeholder}
                rows={2}
                className="bg-muted text-foreground border-border"
                style={{
                  width: "100%",
                  border: `1px solid ${state.locked ? "var(--success)" : ""}`,
                  borderRadius: "var(--radius)",
                  padding: "0.65rem 0.75rem",
                  fontSize: "0.82rem",
                  lineHeight: 1.5,
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s",
                  opacity: state.locked ? 0.8 : 1,
                }}
                onFocus={(e) => { if (!state.locked) e.currentTarget.style.borderColor = "var(--accent)" }}
                onBlur={(e) => { if (!state.locked) e.currentTarget.style.borderColor = "" }}
              />

              {/* Suggest + Commit row */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                  {/* Suggest button — left */}
                  <button
                    onClick={() => requestSuggestions(index)}
                    disabled={state.loadingSuggestions}
                    className="text-muted-foreground"
                    style={{
                      padding: "0.3rem 0.75rem",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--border)",
                      backgroundColor: "transparent",
                      fontSize: "0.72rem",
                      cursor: state.loadingSuggestions ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      transition: "all 0.15s",
                    }}
                  >
                    {state.loadingSuggestions ? (
                      <>
                        <span style={{ width: "10px", height: "10px", border: "1.5px solid var(--muted-foreground)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block", flexShrink: 0 }} />
                        Suggesting…
                      </>
                    ) : state.suggestionsRequested ? "↻ Refresh" : "Suggest →"}
                  </button>

                  {/* Commit button — right */}
                  {state.value.trim().length > 3 && (
                    <button
                      onClick={() => state.locked
                        ? setQuestions((prev) => prev.map((q, i) => i === index ? { ...q, locked: false } : q))
                        : lockAnswer(index)
                      }
                      style={{
                        padding: "0.3rem 0.75rem",
                        borderRadius: "var(--radius)",
                        border: `1px solid ${state.locked ? "var(--success)" : "var(--border)"}`,
                        backgroundColor: state.locked ? "color-mix(in srgb, var(--success) 10%, transparent)" : "transparent",
                        color: state.locked ? "var(--success)" : "var(--muted-foreground)",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        transition: "all 0.15s",
                      }}
                    >
                      {state.locked ? "✓ committed" : "commit"}
                    </button>
                  )}
                </div>

                {/* Suggestion cards */}
                {state.suggestions.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {state.suggestions.map((s, si) => {
                      const isSelected = state.value === s
                      return (
                        <button
                          key={si}
                          onClick={() => applySuggestion(index, s)}
                          style={{
                            textAlign: "left",
                            padding: "0.55rem 0.75rem",
                            borderRadius: "var(--radius)",
                            border: "1px solid",
                            borderColor: isSelected ? "var(--accent)" : "var(--border)",
                            backgroundColor: isSelected
                              ? "color-mix(in srgb, var(--accent) 10%, var(--card))"
                              : "var(--card)",
                            color: isSelected ? "var(--foreground)" : "var(--muted-foreground)",
                            fontSize: "0.78rem",
                            lineHeight: 1.4,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.15s",
                            width: "100%",
                          }}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Continue */}
      <button
        onClick={handleContinue}
        disabled={!canContinue}
        className={canContinue ? "" : "text-muted-foreground"}
        style={{
          padding: "0.6rem 1.5rem",
          borderRadius: "var(--radius)",
          border: "none",
          backgroundColor: canContinue ? "var(--accent)" : "var(--border)",
          color: canContinue ? "var(--accent-foreground)" : "",
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: canContinue ? "pointer" : "not-allowed",
          fontFamily: "inherit",
          transition: "all 0.15s",
          alignSelf: "flex-start",
        }}
      >
        Build my loglines →
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}