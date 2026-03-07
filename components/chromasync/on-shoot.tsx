"use client"

import { useState, useEffect } from "react"
import { RefreshCw, ArrowRight, ArrowDown, Minus, Loader2, FolderOpen, ChevronDown, ChevronUp, X, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getOnShootRecommendations, Recommendation } from "@/lib/api"
import { loadSessions, SavedSession } from "@/lib/sessions"

const conditions = [
  { id: "location",       label: "Location Type",  options: ["Indoor", "Outdoor", "Mixed"],                    default: "Outdoor"      },
  { id: "time_of_day",    label: "Time of Day",    options: ["Golden Hour", "Midday", "Overcast", "Night"],    default: "Golden Hour"  },
  { id: "lighting_source",label: "Lighting Source",options: ["Natural", "Tungsten", "Fluorescent", "Mixed"],   default: "Natural"      },
]

// Expandable card for saved session recommendations
function ExpandableSessionRec({ rec }: { rec: { label: string; plainEnglish: string; technical: string } }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-card border border-border rounded p-3 border-l-2 border-l-accent">
      <p className="text-xs text-muted-foreground mb-0.5">{rec.label}</p>
      <p className="text-sm text-foreground leading-relaxed">{rec.plainEnglish}</p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 mt-2 text-xs text-accent hover:underline"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? "Hide technical detail" : "Show technical detail"}
      </button>
      {expanded && (
        <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2 font-mono">
          {rec.technical}
        </p>
      )}
    </div>
  )
}

// Tips per condition combination
const CONDITION_TIPS: Record<string, string> = {
  "Indoor-Golden Hour-Natural":      "Warm window light at golden hour gives beautiful directional light. Position your subject facing the window for a natural key light.",
  "Indoor-Golden Hour-Tungsten":     "Mixing warm tungsten with golden hour creates a very orange cast. Consider gelling your lights to match or choose one light source only.",
  "Indoor-Midday-Natural":           "Midday sun through windows creates harsh, unflattering shadows. Diffuse it with a sheer curtain or bounce it off a white wall.",
  "Indoor-Midday-Tungsten":          "Tungsten lights indoors at midday gives you full control. Close blinds to avoid mixing colour temperatures.",
  "Indoor-Midday-Fluorescent":       "Fluorescent lights cast a green tint. Add +3 to +5 magenta in your white balance to counteract it.",
  "Indoor-Overcast-Natural":         "Overcast light through windows is soft and flattering — great for interviews and close-ups. No direct shadows.",
  "Indoor-Night-Tungsten":           "At night with tungsten, you have complete control over your light. This is where you can be most creative with light placement.",
  "Indoor-Night-Fluorescent":        "Night fluorescent scenes look clinical and cold. Add a practical warm lamp in the background to add warmth and depth.",
  "Indoor-Night-Natural":            "No natural light at night indoors — if you see it, it's bleed from outside. Use curtains to block it and rely on practicals.",
  "Outdoor-Golden Hour-Natural":     "The best light of the day. Keep the sun behind and slightly to the side of your subject. Watch your exposure — it changes fast.",
  "Outdoor-Midday-Natural":          "Harsh overhead sun creates raccoon eyes. Find open shade or use a diffusion panel. Shoot with sun behind subject and use a reflector.",
  "Outdoor-Overcast-Natural":        "Overcast is a giant softbox. Colours are muted and shadows are soft — great for skin tones. Perfect for documentary and drama.",
  "Outdoor-Night-Natural":           "Night outdoors is very dark. Look for practical light sources like streetlamps to use as key lights. Raise ISO and open aperture.",
  "Outdoor-Night-Tungsten":          "Street and practical tungsten light at night gives a cinematic orange-night look. Lean into it — don't correct it away.",
  "Mixed-Golden Hour-Mixed":         "Mixed conditions mean mixed colour temperatures. Decide on one dominant source and grade the rest to match in post.",
  "Mixed-Overcast-Mixed":            "Overcast mixed conditions are forgiving. The soft light evens everything out. Focus on framing and composition.",
}

function getConditionTip(location: string, time: string, lighting: string): string {
  const key = `${location}-${time}-${lighting}`
  return CONDITION_TIPS[key] ?? `Shooting ${location.toLowerCase()} during ${time.toLowerCase()} with ${lighting.toLowerCase()} light. Set your white balance manually to avoid colour drift between shots.`
}

function LiveRecCard({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-secondary rounded border border-border p-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-foreground">{rec.parameter}</p>
        <DeltaPill direction={rec.direction} delta={rec.delta} />
      </div>
      <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{rec.explanation}</p>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground">Current</span>
          <span className="mono-value text-sm text-muted-foreground">{rec.current}</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0" />
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground">Recommended</span>
          <span className="mono-value text-sm text-foreground font-medium">{rec.recommended}</span>
        </div>
      </div>
      {(rec.technical_detail || rec.tip) && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Hide details" : "Show technical detail & tip"}
          </button>
          {expanded && (
            <div className="mt-2 space-y-2 border-t border-border pt-2">
              {rec.technical_detail && (
                <p className="text-xs text-muted-foreground font-mono">{rec.technical_detail}</p>
              )}
              {rec.tip && (
                <div className="flex gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{rec.tip}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function DeltaPill({ direction, delta }: { direction: string; delta: string }) {
  const cls =
    direction === "up"   ? "delta-up"   :
    direction === "down" ? "delta-down" :
    "delta-flat"

  const Icon =
    direction === "up"   ? ArrowRight :
    direction === "down" ? ArrowDown  :
    Minus

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs mono-value ${cls}`}>
      <Icon className="w-3 h-3" />
      {delta}
    </span>
  )
}

export function OnShoot() {
  const [values, setValues]               = useState({ location: "Outdoor", time_of_day: "Golden Hour", lighting_source: "Natural" })
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null)

  // Saved session state
  const [sessions, setSessions]           = useState<SavedSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [activeSession, setActiveSession] = useState<SavedSession | null>(null)
  const [showSessionPicker, setShowSessionPicker] = useState(false)
  const [projects, setProjects]           = useState<Array<{id: string; name: string}>>([]) 
  const [filterProjectId, setFilterProjectId] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    async function fetchAll() {
      setSessionsLoading(true)
      const [{ sessions: loaded }, { projects: loadedProjects }] = await Promise.all([
        loadSessions(filterProjectId),
        import("@/lib/projects").then(m => m.loadProjects()),
      ])
      setSessions(loaded)
      setProjects(loadedProjects)
      setSessionsLoading(false)
    }
    fetchAll()
  }, [filterProjectId])

  async function handleUpdate() {
    setLoading(true)
    setError(null)
    try {
      const data = await getOnShootRecommendations({
        location:        values.location,
        time_of_day:     values.time_of_day,
        lighting_source: values.lighting_source,
      })
      setRecommendations(data.recommendations)
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section-stack">

      <div>
        <h1 className="text-xl font-semibold text-foreground">On-Shoot Guidance</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time parameter updates as conditions change</p>
      </div>

      {/* Pre-Shoot Reference */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pre-Shoot Reference</p>
          {activeSession && (
            <button onClick={() => setActiveSession(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Project filter tabs */}
        {projects.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            <button
              onClick={() => setFilterProjectId(undefined)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterProjectId === undefined ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterProjectId(null)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterProjectId === null ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              No project
            </button>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterProjectId(p.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterProjectId === p.id ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Session picker */}
        <div className="relative">
          <button
            onClick={() => setShowSessionPicker(!showSessionPicker)}
            className="w-full bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between hover:border-accent/50 transition-colors"
          >
            {activeSession ? (
              <div className="text-left">
                <p className="text-sm text-foreground">{activeSession.name}</p>
                {activeSession.camera_name && <p className="text-xs text-muted-foreground">{activeSession.camera_name}</p>}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {sessionsLoading ? "Loading saved looks..." : sessions.length === 0 ? "No saved looks yet — save one in Pre-Shoot" : "Load a saved look to compare..."}
              </span>
            )}
            <div className="flex items-center gap-2">
              {sessionsLoading && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />}
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showSessionPicker ? "rotate-180" : ""}`} />
            </div>
          </button>

          {showSessionPicker && sessions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#1a1a1a] border border-border rounded-lg shadow-xl overflow-hidden">
              <div className="max-h-56 overflow-y-auto">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => { setActiveSession(session); setShowSessionPicker(false) }}
                    className="w-full px-4 py-3 flex items-start justify-between hover:bg-secondary text-left transition-colors border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {session.reference_image_url ? (
                        <img src={session.reference_image_url} alt="" className="w-10 h-10 rounded object-cover shrink-0 opacity-80" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-secondary shrink-0 flex items-center justify-center">
                          <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">{session.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {session.camera_name ?? "No camera"} · {new Date(session.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    {activeSession?.id === session.id && (
                      <span className="text-xs text-accent mt-0.5">Active</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reference image */}
        {activeSession?.reference_image_url && (
          <div className="mt-3 rounded-lg overflow-hidden border border-border">
            <img src={activeSession.reference_image_url} alt={activeSession.name} className="w-full max-h-40 object-cover opacity-90" />
            <div className="px-3 py-2 bg-card">
              <p className="text-xs text-muted-foreground">Reference frame · <span className="text-foreground">{activeSession.name}</span></p>
            </div>
          </div>
        )}

        {/* Active session metrics */}
        {activeSession && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Target Temp",       value: activeSession.colour_temperature_k ? `${activeSession.colour_temperature_k}K` : "—" },
              { label: "Target Exposure",   value: activeSession.exposure_ev != null ? `${activeSession.exposure_ev >= 0 ? "+" : ""}${activeSession.exposure_ev.toFixed(2)} EV` : "—" },
              { label: "Target Saturation", value: activeSession.saturation_pct != null ? `${activeSession.saturation_pct.toFixed(1)}%` : "—" },
              { label: "Target Contrast",   value: activeSession.contrast_ratio != null ? `${activeSession.contrast_ratio.toFixed(3)}x` : "—" },
            ].map((m) => (
              <div key={m.label} className="bg-card border border-accent/20 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <p className="text-sm font-semibold font-mono text-accent">{m.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Scene analysis from saved session */}
        {activeSession?.scene_analysis && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(activeSession.scene_analysis)
              .filter(([key]) => ["shot_type", "lighting_feel", "colour_mood", "suggested_look"].includes(key))
              .map(([key, val]) => (
                <div key={key} className="bg-card border border-border rounded p-3">
                  <p className="text-xs text-muted-foreground mb-1 capitalize">{key.replace("_", " ")}</p>
                  <p className="text-xs text-foreground">{val}</p>
                </div>
              ))
            }
          </div>
        )}

        {/* Recommendations from saved session — with expandable technical detail */}
        {activeSession?.recommendations && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Camera settings from your saved look</p>
            <div className="space-y-2">
              {activeSession.recommendations.map((rec) => (
                <ExpandableSessionRec key={rec.label} rec={rec} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conditions card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Current Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selects — stack on mobile, row on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {conditions.map((condition) => (
              <div key={condition.id} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{condition.label}</Label>
                <Select
                  defaultValue={condition.default}
                  onValueChange={(val) => setValues((prev) => ({ ...prev, [condition.id]: val }))}
                >
                  <SelectTrigger className="bg-secondary border-border h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {condition.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-11"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading
              ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              : <RefreshCw className="w-4 h-4 mr-2" />
            }
            Update Recommendations
          </Button>

          {/* Condition tip */}
          <div className="flex gap-2 p-3 rounded-lg border border-yellow-400/20 bg-yellow-400/5">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {getConditionTip(values.location, values.time_of_day, values.lighting_source)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-3 rounded border border-destructive/30 bg-destructive/10 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Recommendations */}
      {recommendations && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Live Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            {recommendations.map((rec) => (
              <LiveRecCard key={rec.parameter} rec={rec} />
            ))}
          </CardContent>
        </Card>
      )}

      {!recommendations && !loading && (
        <p className="text-center text-xs text-muted-foreground py-4">
          Set your conditions and tap Update to get live recommendations
        </p>
      )}
    </div>
  )
}
