"use client"

import { useState } from "react"
import { StoryColdOpen } from "./story-cold-open"
import { StoryLoglineForge } from "./story-logline-forge"
import { StoryCharacterForge } from "./story-character-forge"
import { StoryBeatBoard } from "./story-beat-board"
import { StoryHud } from "./story-hud"
import { StoryBible } from "./story-bible"
import { StoryInterrogation } from "./story-interrogation"
import {
  generateLoglines,
  generateCharacter,
  createStory,
  updateStory,
  type StoryFormat,
  type StoryFramework,
  type InterrogationAnswers,
  type LoglineResponse,
  type LoglineVersion,
  type CharacterResponse,
  type SaveTheCatOption,
  type CompletedBeat,
  type Story,
} from "@/lib/story"

type Stage = "cold-open" | "interrogation" | "logline-forge" | "character-forge" | "beat-board" | "complete"

export function StoryDashboard() {
  const [stage, setStage] = useState<Stage>("cold-open")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Story state
  const [story, setStory] = useState<Story | null>(null)
  const [format, setFormat] = useState<StoryFormat>("film")
  const [framework, setFramework] = useState<StoryFramework>("save_the_cat")
  const [rawIdea, setRawIdea] = useState("")
  const [interrogation, setInterrogation] = useState<InterrogationAnswers>({ location: "", broken_relationship: "", private_behaviour: "" })
  const [loglineResponse, setLoglineResponse] = useState<LoglineResponse | null>(null)
  const [selectedLogline, setSelectedLogline] = useState<LoglineVersion | null>(null)
  const [characterResponse, setCharacterResponse] = useState<CharacterResponse | null>(null)
  const [completedBeats, setCompletedBeats] = useState<CompletedBeat[]>([])

  // ─── Stage 0 → 1 ──────────────────────────────────────────────────────────

  // Stage 0 → interrogation
  function handleBegin(idea: string, fmt: StoryFormat, fw: StoryFramework) {
    setRawIdea(idea)
    setFormat(fmt)
    setFramework(fw)
    setStage("interrogation")
  }

  // Interrogation → logline forge
  async function handleInterrogationContinue(answers: InterrogationAnswers) {
    setInterrogation(answers)
    setError(null)
    setLoading(true)

    const { data, error: apiError } = await generateLoglines(rawIdea, format, framework, answers)
    if (apiError || !data) {
      setError(apiError ?? "Something went wrong")
      setLoading(false)
      return
    }

    setLoglineResponse(data)
    setStage("logline-forge")
    setLoading(false)
  }

  // ─── Stage 1 → 2 ──────────────────────────────────────────────────────────

  async function handleSelectLogline(version: LoglineVersion) {
    setError(null)
    setLoading(true)
    setSelectedLogline(version)

    // Create the story record in Supabase
    const { story: newStory, error: dbError } = await createStory(format, rawIdea)
    if (dbError || !newStory) {
      // Don't block — continue without persistence if Supabase fails
      console.warn("Could not save story:", dbError)
    } else {
      await updateStory(newStory.id, {
        logline: version.logline,
        logline_label: version.label,
        stage: 1,
      })
      setStory({ ...newStory, logline: version.logline, logline_label: version.label, stage: 1 })
    }

    setStage("character-forge")
    setLoading(false)
  }

  // ─── Stage 2 — wound submitted ────────────────────────────────────────────

  async function handleAskWound(woundAnswer: string, characterName: string) {
    if (!selectedLogline) return
    setError(null)
    setLoading(true)

    const { data, error: apiError } = await generateCharacter(
      selectedLogline.logline,
      format,
      woundAnswer,
      characterName || undefined
    )

    if (apiError || !data) {
      setError(apiError ?? "Something went wrong")
      setLoading(false)
      return
    }

    setCharacterResponse(data)
    setLoading(false)
  }

  // ─── Stage 2 — Save the Cat selected ──────────────────────────────────────

  async function handleSelectSaveTheCat(option: SaveTheCatOption) {
    if (!characterResponse) return

    if (story) {
      await updateStory(story.id, {
        character_lie: characterResponse.lie,
        character_want: characterResponse.want,
        character_need: characterResponse.need,
        save_the_cat_scene: option.scene,
        save_the_cat_framing: option.framing,
        stage: 2,
      })
      setStory((prev) =>
        prev
          ? {
              ...prev,
              character_lie: characterResponse.lie,
              character_want: characterResponse.want,
              character_need: characterResponse.need,
              save_the_cat_scene: option.scene,
              save_the_cat_framing: option.framing,
              stage: 2,
            }
          : prev
      )
    }

    setStage("beat-board")
  }

  // ─── Stage 3 — beat saved incrementally ────────────────────────────────────

  async function handleBeatSaved(beats: CompletedBeat[]) {
    setCompletedBeats(beats)
    if (story) {
      await updateStory(story.id, { beats: beats as any })
    }
  }

  // ─── Stage 3 — beat board complete ────────────────────────────────────────

  async function handleBeatsComplete(beats: CompletedBeat[]) {
    setCompletedBeats(beats)
    if (story) {
      await updateStory(story.id, { stage: 3, beats: beats as any })
      setStory((prev) => prev ? { ...prev, stage: 3 } : prev)
    }
    setStage("complete")
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "var(--background)" }}>
      {/* Persistent HUD — visible once logline is locked */}
      {stage !== "cold-open" && stage !== "logline-forge" && (
        <StoryHud story={story} />
      )}

      {/* Story Bible — slides in from right */}
      <StoryBible
        story={story}
        completedBeats={completedBeats}
        currentStage={stage}
        onEditLogline={() => setStage("logline-forge")}
        onEditCharacter={() => setStage("character-forge")}
      />

      {/* Error banner */}
      {error && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            padding: "0.65rem 1.25rem",
            backgroundColor: "color-mix(in srgb, var(--destructive) 12%, var(--card))",
            border: "1px solid var(--destructive)",
            borderRadius: "var(--radius)",
            color: "var(--destructive)",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          {error}
          <button
            onClick={() => setError(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--destructive)", fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Stage router */}
      {stage === "cold-open" && (
        <StoryColdOpen onBegin={handleBegin} loading={loading} />
      )}

      {stage === "interrogation" && (
        <StoryInterrogation
          rawIdea={rawIdea}
          format={format}
          framework={framework}
          onBack={() => setStage("cold-open")}
          onContinue={handleInterrogationContinue}
        />
      )}

      {stage === "logline-forge" && loglineResponse && (
        <StoryLoglineForge
          response={loglineResponse}
          rawIdea={rawIdea}
          format={format}
          framework={framework}
          interrogation={interrogation}
          onSelect={handleSelectLogline}
          onBack={() => setStage("interrogation")}
          loading={loading}
        />
      )}

      {stage === "character-forge" && selectedLogline && (
        <StoryCharacterForge
          logline={selectedLogline.logline}
          format={format}
          characterResponse={characterResponse}
          loading={loading}
          onAskWound={handleAskWound}
          onSelectSaveTheCat={handleSelectSaveTheCat}
          onBack={() => {
            setStage("logline-forge")
            setCharacterResponse(null)
          }}
        />
      )}

      {stage === "beat-board" && selectedLogline && characterResponse && (
        <StoryBeatBoard
          format={format}
          framework={framework}
          logline={selectedLogline.logline}
          characterLie={characterResponse.lie}
          characterWant={characterResponse.want}
          characterNeed={characterResponse.need}
          onBack={() => setStage("character-forge")}
          onBeatSaved={handleBeatSaved}
          onComplete={handleBeatsComplete}
        />
      )}

      {stage === "complete" && (
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <p
            className="text-muted-foreground"
            style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}
          >
            Phase 1 complete
          </p>
          <h2
            className="text-foreground"
            style={{ fontSize: "1.75rem", fontWeight: 300, lineHeight: 1.4, marginBottom: "1rem", maxWidth: "480px" }}
          >
            You had a story.
          </h2>
          <p className="text-muted-foreground" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
            {completedBeats.length} beats locked.
          </p>
          <p className="text-muted-foreground" style={{ fontSize: "0.875rem", marginBottom: "2.5rem" }}>
            Story Health Score coming next.
          </p>
          <button
            onClick={() => {
              setStage("cold-open")
              setLoglineResponse(null)
              setSelectedLogline(null)
              setCharacterResponse(null)
              setCompletedBeats([])
              setStory(null)
              setError(null)
            }}
            style={{
              padding: "0.55rem 1.5rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "var(--muted-foreground)",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Start a new story
          </button>
        </div>
      )}
    </div>
  )
}
