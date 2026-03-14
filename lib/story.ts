import { createClient } from "@/lib/supabase"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://chromasync-api.onrender.com"

// ─── Types ────────────────────────────────────────────────────────────────────

export type StoryFormat = "film" | "short_story"
export type StoryFramework = "save_the_cat" | "truby" | "story_circle"

export interface InterrogationAnswers {
  location: string
  broken_relationship: string
  private_behaviour: string
}

export interface LoglineVersion {
  label: string
  logline: string
  angle: string
}

export interface LoglineResponse {
  versions: LoglineVersion[]
  primal_question: string
}

export interface SaveTheCatOption {
  option: "A" | "B" | "Custom"
  scene: string
  framing: "active" | "passive"
}

export interface CharacterResponse {
  lie: string
  want: string
  need: string
  save_the_cat: SaveTheCatOption[]
  secondary_character_prompt: string
}

export interface CompletedBeat {
  number: number
  name: string
  answer: string
}

export interface BeatResponse {
  question: string
  hint: string
  emotional_note: string
}

export interface BeatDefinition {
  number: number
  name: string
  description: string
}

export const FILM_BEATS: BeatDefinition[] = [
  { number: 1,  name: "Opening Image",         description: "A single image capturing the hero's world before the adventure begins." },
  { number: 2,  name: "Theme Stated",           description: "Someone states the theme — the lesson the hero must learn." },
  { number: 3,  name: "Set-Up",                 description: "The world, the problem, the hero's flaw and potential for change." },
  { number: 4,  name: "Catalyst",               description: "The inciting incident that upends the hero's world and forces a choice." },
  { number: 5,  name: "Debate",                 description: "The hero resists the call. Fear holds them back." },
  { number: 6,  name: "Break into Two",         description: "The hero makes an active choice and steps into the upside-down world." },
  { number: 7,  name: "B Story",                description: "A new relationship arrives to carry the theme." },
  { number: 8,  name: "Fun and Games",          description: "The promise of the premise. The hero tries to get what they want." },
  { number: 9,  name: "Midpoint",               description: "A false victory or false defeat that raises the stakes." },
  { number: 10, name: "Bad Guys Close In",      description: "External pressure and internal doubt conspire." },
  { number: 11, name: "All Is Lost",            description: "The lowest point. The hero loses everything." },
  { number: 12, name: "Dark Night of the Soul", description: "The hero wallows. Then — a breakthrough from within." },
  { number: 13, name: "Break into Three",       description: "Armed with new insight, the hero acts." },
  { number: 14, name: "Finale",                 description: "The hero storms the castle and proves the theme." },
  { number: 15, name: "Final Image",            description: "A mirror of the Opening Image showing how the world has changed." },
]

export const SHORT_BEATS: BeatDefinition[] = [
  { number: 1, name: "Inciting Moment", description: "The disruption that breaks the protagonist's equilibrium." },
  { number: 2, name: "Rising Pressure", description: "Tension compounds. The protagonist tries and fails." },
  { number: 3, name: "Crisis Point",    description: "The moment of no return — a choice must be made." },
  { number: 4, name: "Climax",          description: "The protagonist acts from their deepest truth." },
  { number: 5, name: "Resonance",       description: "The final image that carries the emotional aftershock." },
]

export interface Story {
  id: string
  user_id: string
  title: string | null
  format: StoryFormat
  framework: string | null
  raw_idea: string | null
  // Interrogation answers
  interrogation_location: string | null
  interrogation_broken_relationship: string | null
  interrogation_private_behaviour: string | null
  // Logline
  logline: string | null
  logline_label: string | null
  // Character
  wound_answer: string | null
  character_name: string | null
  character_lie: string | null
  character_want: string | null
  character_need: string | null
  save_the_cat_scene: string | null
  save_the_cat_framing: string | null
  // Theme (primal question from logline generation)
  theme: string | null
  // Beats
  beats: any | null
  stage: number
  created_at: string
  updated_at: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function generateLoglines(
  rawIdea: string,
  format: StoryFormat,
  framework: StoryFramework = "save_the_cat",
  interrogation: InterrogationAnswers = { location: "", broken_relationship: "", private_behaviour: "" }
): Promise<{ data: LoglineResponse | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/story/logline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_idea: rawIdea,
        format,
        framework,
        location: interrogation.location,
        broken_relationship: interrogation.broken_relationship,
        private_behaviour: interrogation.private_behaviour,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { data: null, error: err.detail ?? "Failed to generate loglines" }
    }
    const data = await res.json()
    return { data, error: null }
  } catch {
    return { data: null, error: "Could not reach the server" }
  }
}

export async function generateBeatQuestion(
  beatNumber: number,
  beatName: string,
  format: StoryFormat,
  logline: string,
  characterLie: string,
  characterWant: string,
  characterNeed: string,
  completedBeats: CompletedBeat[]
): Promise<{ data: BeatResponse | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/story/beat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beat_number: beatNumber,
        beat_name: beatName,
        format,
        logline,
        character_lie: characterLie,
        character_want: characterWant,
        character_need: characterNeed,
        completed_beats: completedBeats,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { data: null, error: err.detail ?? "Failed to generate beat question" }
    }
    const data = await res.json()
    return { data, error: null }
  } catch {
    return { data: null, error: "Could not reach the server" }
  }
}

export async function generateCharacter(
  logline: string,
  format: StoryFormat,
  woundAnswer: string,
  characterName?: string
): Promise<{ data: CharacterResponse | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/story/character`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logline,
        format,
        wound_answer: woundAnswer,
        character_name: characterName ?? null,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { data: null, error: err.detail ?? "Failed to generate character" }
    }
    const data = await res.json()
    return { data, error: null }
  } catch {
    return { data: null, error: "Could not reach the server" }
  }
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

export async function createStory(
  format: StoryFormat,
  rawIdea: string,
  title?: string,
  framework?: StoryFramework
): Promise<{ story: Story | null; error: string | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { story: null, error: "Not signed in" }

  const { data, error } = await supabase
    .from("stories")
    .insert({ user_id: user.id, format, raw_idea: rawIdea, title: title ?? null, framework: framework ?? "save_the_cat", stage: 0 })
    .select()
    .single()

  return { story: data as Story ?? null, error: error?.message ?? null }
}

export async function deleteStory(id: string): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from("stories").delete().eq("id", id)
  return { error: error?.message ?? null }
}

export async function updateStory(
  id: string,
  updates: Partial<Omit<Story, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from("stories").update(updates).eq("id", id)
  return { error: error?.message ?? null }
}

export async function loadStories(): Promise<{ stories: Story[]; error: string | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { stories: [], error: "Not signed in" }

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(20)

  return { stories: (data as Story[]) ?? [], error: error?.message ?? null }
}

export async function loadStory(id: string): Promise<{ story: Story | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .single()

  return { story: data as Story ?? null, error: error?.message ?? null }
}

// ─── New API functions ────────────────────────────────────────────────────────

export async function generateInterrogationHints(
  questionNumber: number,
  rawIdea: string,
  format: StoryFormat,
  framework: StoryFramework,
  location: string = "",
  brokenRelationship: string = "",
  privateBehaviour: string = "",
  theme: string = ""
): Promise<{ data: { suggestions: string[] } | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/story/interrogation-hints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_number: questionNumber,
        raw_idea: rawIdea,
        format,
        framework,
        location,
        broken_relationship: brokenRelationship,
        private_behaviour: privateBehaviour,
        theme,
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    return { data: await res.json(), error: null }
  } catch (e: any) {
    return { data: null, error: e.message }
  }
}

export async function regenerateCharacterField(
  field: "lie" | "want" | "need",
  logline: string,
  format: StoryFormat,
  framework: StoryFramework,
  woundAnswer: string,
  currentLie: string,
  currentWant: string,
  currentNeed: string,
  extra: {
    characterName?: string
    location?: string
    brokenRelationship?: string
    privateBehaviour?: string
    theme?: string
  } = {}
): Promise<{ data: { value: string } | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/story/character-field`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field, logline, format, framework,
        wound_answer: woundAnswer,
        character_name: extra.characterName ?? "",
        location: extra.location ?? "",
        broken_relationship: extra.brokenRelationship ?? "",
        private_behaviour: extra.privateBehaviour ?? "",
        theme: extra.theme ?? "",
        current_lie: currentLie,
        current_want: currentWant,
        current_need: currentNeed,
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    return { data: await res.json(), error: null }
  } catch (e: any) {
    return { data: null, error: e.message }
  }
}

export async function regenerateSaveTheCat(
  option: "A" | "B",
  framing: "active" | "passive",
  logline: string,
  format: StoryFormat,
  framework: StoryFramework,
  woundAnswer: string,
  lie: string,
  existingScene: string,
  otherScene: string
): Promise<{ data: SaveTheCatOption | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/story/save-the-cat-single`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        option, framing, logline, format, framework,
        wound_answer: woundAnswer,
        lie,
        existing_scene: existingScene,
        other_scene: otherScene,
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    return { data: await res.json(), error: null }
  } catch (e: any) {
    return { data: null, error: e.message }
  }
}

export async function generateBeatSuggestions(
  beatNumber: number,
  beatName: string,
  format: StoryFormat,
  framework: StoryFramework,
  logline: string,
  characterLie: string,
  characterWant: string,
  characterNeed: string,
  completedBeats: CompletedBeat[]
): Promise<{ data: { suggestions: string[] } | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/story/beat-suggestion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beat_number: beatNumber,
        beat_name: beatName,
        format,
        framework,
        logline,
        character_lie: characterLie,
        character_want: characterWant,
        character_need: characterNeed,
        completed_beats: completedBeats,
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    return { data: await res.json(), error: null }
  } catch (e: any) {
    return { data: null, error: e.message }
  }
}

export async function generateThemeSuggestions(
  rawIdea: string,
  format: StoryFormat,
  framework: StoryFramework,
  interrogation: InterrogationAnswers,
  existingLoglines: string[] = [],
  currentTheme: string = ""
): Promise<{ data: { suggestions: string[] } | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/story/theme-suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_idea: rawIdea,
        format,
        framework,
        location: interrogation.location,
        broken_relationship: interrogation.broken_relationship,
        private_behaviour: interrogation.private_behaviour,
        existing_loglines: existingLoglines,
        current_theme: currentTheme,
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    return { data: await res.json(), error: null }
  } catch (e: any) {
    return { data: null, error: e.message }
  }
}

export async function regenerateSingleLogline(
  rawIdea: string,
  format: StoryFormat,
  framework: StoryFramework,
  label: string,
  location: string = "",
  brokenRelationship: string = "",
  privateBehaviour: string = "",
  existingLoglines: string[] = []
): Promise<{ data: LoglineVersion | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/story/logline-single`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_idea: rawIdea,
        format,
        framework,
        label,
        location,
        broken_relationship: brokenRelationship,
        private_behaviour: privateBehaviour,
        existing_loglines: existingLoglines,
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    return { data: await res.json(), error: null }
  } catch (e: any) {
    return { data: null, error: e.message }
  }
}
