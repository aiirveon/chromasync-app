"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Upload, Loader2, ChevronDown, ChevronUp, Sparkles, Search, Save, CheckCircle, Crosshair } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyseReferenceFrame, PreShootResponse } from "@/lib/api"
import type { LivePreShootState } from "@/app/page"
import { CAMERAS, Camera as CameraType } from "@/lib/cameras"
import { saveSession, uploadReferenceImage } from "@/lib/sessions"
import { loadProjects, createProject, Project } from "@/lib/projects"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://chromasync-api.onrender.com"

interface SceneAnalysis {
  shot_type: string
  lighting_feel: string
  colour_mood: string
  suggested_look: string
  technical_note: string
  camera_advice: string
}

function ExpandableCard({ label, plainEnglish, technical }: { label: string; plainEnglish: string; technical: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <Card className="bg-card border-border border-l-2 border-l-accent">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm text-foreground leading-relaxed">{plainEnglish}</p>
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-2 text-xs text-accent hover:underline">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Hide technical detail" : "Show technical detail"}
        </button>
        {expanded && <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2 font-mono">{technical}</p>}
      </CardContent>
    </Card>
  )
}

interface PreShootProps {
  onTabChange?: (tab: "pre-shoot" | "on-shoot" | "post-correction") => void
  onLiveStateChange?: (state: LivePreShootState) => void
  onGoToOnShoot?: () => void
}

export function PreShoot({ onTabChange, onLiveStateChange, onGoToOnShoot }: PreShootProps) {
  const [loading, setLoading] = useState(false)
  const [visionLoading, setVisionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PreShootResponse | null>(null)
  const [sceneAnalysis, setSceneAnalysis] = useState<SceneAnalysis | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null)
  const [cameraSearch, setCameraSearch] = useState("")
  const [showCameraList, setShowCameraList] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [sessionName, setSessionName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  // Project state
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [newProjectName, setNewProjectName] = useState("")
  const [showNewProject, setShowNewProject] = useState(false)
  const [creatingProject, setCreatingProject] = useState(false)
  const [rawFile, setRawFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredCameras = CAMERAS.filter(c =>
    c.fullName.toLowerCase().includes(cameraSearch.toLowerCase()) ||
    c.brand.toLowerCase().includes(cameraSearch.toLowerCase())
  )

  async function runVisionAnalysis(file: File, cameraName: string) {
    setVisionLoading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("camera_name", cameraName)
      const res = await fetch(`${API_BASE}/api/vision/analyse`, { method: "POST", body: form })
      if (res.ok) setSceneAnalysis(await res.json())
    } catch { /* non-critical */ } finally { setVisionLoading(false) }
  }

  async function handleFile(file: File) {
    setError(null)
    setSaveSuccess(false)

    const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff", "image/bmp", "image/gif"]
    const SUPPORTED_EXT  = ["jpg","jpeg","png","webp","avif","tiff","tif","bmp","gif"]
    const SUPPORTED_LABEL = "JPG, PNG, WebP, AVIF, TIFF, BMP"
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""

    if (!SUPPORTED_TYPES.includes(file.type) && !SUPPORTED_EXT.includes(ext)) {
      setError(`"${file.name}" isn't supported. Please upload one of these formats: ${SUPPORTED_LABEL}`)
      return
    }

    setPreview(URL.createObjectURL(file))
    setLoading(true)
    setSceneAnalysis(null)
    setRawFile(file)
    const cameraName = selectedCamera?.fullName || "Unknown Camera"
    try {
      // Wake up Render free tier before sending large requests
      await fetch(`${API_BASE}/ping`).catch(() => {})
      const [data] = await Promise.all([analyseReferenceFrame(file), runVisionAnalysis(file, cameraName)])
      setResult(data)
      // Lift state up so OnShoot "Current" tab can use it without saving
      onLiveStateChange?.({
        preview: URL.createObjectURL(file),
        result: data,
        cameraName: selectedCamera?.fullName ?? null,
        recommendations: null, // will be set after buildRecommendations runs
        sceneAnalysis: null,   // will be set after vision completes
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. If this is your first upload, the server may be waking up — please try again.")
    } finally { setLoading(false) }
  }

  const profile = result?.colour_profile
  const settings = result?.camera_settings

  const colourMetrics = profile ? [
    { label: "Colour Temp", value: profile.colour_temperature_k.toString(), unit: "K" },
    { label: "Exposure", value: (profile.exposure_ev >= 0 ? "+" : "") + profile.exposure_ev.toFixed(2), unit: "EV" },
    { label: "Saturation", value: profile.saturation_pct.toFixed(1), unit: "%" },
    { label: "Contrast", value: profile.contrast_ratio.toFixed(3), unit: "x" },
  ] : [
    { label: "Colour Temp", value: "—", unit: "K" },
    { label: "Exposure", value: "—", unit: "EV" },
    { label: "Saturation", value: "—", unit: "%" },
    { label: "Contrast", value: "—", unit: "x" },
  ]

  function buildRecommendations() {
    if (!settings || !profile) return []
    const cam = selectedCamera
    const tempK = profile.colour_temperature_k
    const ev = profile.exposure_ev
    const isoNum = parseInt(settings.iso.value) || 0

    const wbPlain =
      tempK < 3500 ? "Your image looks very warm and orange. Set white balance to 'Tungsten' or ~3200K." :
      tempK < 4500 ? "Your image has a warm, cosy feel. Try 'Shade' white balance or ~4000K." :
      tempK < 5500 ? "Natural, balanced light. Set white balance to 'Daylight' or 5000K." :
      tempK < 6500 ? "Cool and bright, like overcast daylight. Try 'Cloudy' or 6000K." :
      "Very cool and blue. Try 'Cloudy' or 'Shade' to warm it up — or keep it if that's your look."

    const expPlain =
      ev < -1.5 ? "Your image is quite dark. Try more light, a wider aperture, or higher ISO." :
      ev < -0.5 ? "Slightly underexposed. Turn exposure compensation a little to the right to brighten." :
      ev < 0.5  ? "Your exposure looks well balanced for this style." :
      ev < 1.5  ? "Slightly bright. Dial exposure left a touch if it's unintentional." :
      "Your image is quite bright. Check highlights are not blown out — reduce exposure if needed."

    const profilePlain = cam?.flatSetting.plainEnglish ?? "Set your camera to a flat or neutral picture style to give yourself maximum control when editing."

    const isoPlain =
      isoNum <= 400  ? "You are in good light — keep ISO low for the cleanest image possible." :
      isoNum <= 1600 ? "Moderate light. This ISO should give you a clean image on most cameras." :
      "Low light. You may see some grain — which can look cinematic, but check your footage."

    // After buildRecommendations, push the full recs up to parent for OnShoot "Current"
    const recs = [
      { label: "White Balance",   plainEnglish: wbPlain,      technical: settings.white_balance.technical ? `${settings.white_balance.value} — ${settings.white_balance.technical}` : settings.white_balance.value },
      { label: "Exposure",        plainEnglish: expPlain,     technical: settings.exposure_compensation.technical ? `${settings.exposure_compensation.value} — ${settings.exposure_compensation.technical}` : settings.exposure_compensation.value },
      { label: "Picture Profile", plainEnglish: profilePlain, technical: cam ? cam.flatSetting.technical : "Select your camera above for a specific picture profile suggestion." },
      { label: "ISO",             plainEnglish: isoPlain,     technical: settings.iso.technical ? `ISO ${settings.iso.value} — ${settings.iso.technical}` : `ISO ${settings.iso.value}` },
    ]
    return recs
  }

  const recommendations = buildRecommendations()

  // Sync full state to parent whenever result, recommendations, or sceneAnalysis changes
  useEffect(() => {
    if (!result || !preview) return
    onLiveStateChange?.({
      preview,
      result,
      cameraName: selectedCamera?.fullName ?? null,
      recommendations: recommendations.length > 0 ? recommendations : null,
      sceneAnalysis: sceneAnalysis ? (sceneAnalysis as Record<string, string>) : null,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, sceneAnalysis, selectedCamera])

  async function openSaveModal() {
    setShowSaveModal(true)
    const { projects: loaded } = await loadProjects()
    setProjects(loaded)
  }

  async function handleCreateProject() {
    if (!newProjectName.trim()) return
    setCreatingProject(true)
    const { project, error: pErr } = await createProject(newProjectName.trim())
    setCreatingProject(false)
    if (project) {
      setProjects((prev) => [project, ...prev])
      setSelectedProjectId(project.id)
      setNewProjectName("")
      setShowNewProject(false)
    } else {
      setError(`Failed to create project: ${pErr}`)
    }
  }

  async function handleSave() {
    if (!profile || !sessionName.trim()) return
    setSaving(true)
    // Upload reference image
    const supabase = (await import("@/lib/supabase")).createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let imageUrl: string | null = null
    if (rawFile && user) {
      imageUrl = await uploadReferenceImage(rawFile, user.id)
    }
    const { error: saveError } = await saveSession({
      name: sessionName.trim(),
      project_id: selectedProjectId,
      camera_name: selectedCamera?.fullName ?? null,
      colour_temperature_k: profile.colour_temperature_k,
      exposure_ev: profile.exposure_ev,
      saturation_pct: profile.saturation_pct,
      contrast_ratio: profile.contrast_ratio,
      scene_analysis: sceneAnalysis ? (sceneAnalysis as unknown as Record<string, string>) : null,
      recommendations: recommendations.length > 0 ? recommendations : null,
      reference_image_url: imageUrl,
    })
    setSaving(false)
    if (!saveError) {
      setSaveSuccess(true)
      setShowSaveModal(false)
      setSessionName("")
      setSelectedProjectId(null)
      // Notify sidebar to refresh without page reload
      window.dispatchEvent(new CustomEvent("chromasync:session-saved", {
        detail: { project_id: selectedProjectId }
      }))
    } else {
      setError(`Failed to save: ${saveError}`)
    }
  }

  const hasResults = !!result && !loading

  const levelColour: Record<string, string> = {
    beginner: "text-green-400 bg-green-400/10 border-green-400/20",
    intermediate: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    pro: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  }

  return (
    <div className="section-stack">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Pre-Shoot Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Define your target look before you press record</p>
      </div>

      {/* Camera selector */}
      <div className="relative">
        <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">
          Your Camera <span className="normal-case">(optional — improves recommendations)</span>
        </label>
        <div
          className="w-full bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:border-accent/50 transition-colors"
          onClick={() => setShowCameraList(!showCameraList)}
        >
          {selectedCamera ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground">{selectedCamera.fullName}</span>
              <span className={`text-xs px-2 py-0.5 rounded border capitalize ${levelColour[selectedCamera.level]}`}>{selectedCamera.level}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Select your camera...</span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showCameraList ? "rotate-180" : ""}`} />
        </div>

        {showCameraList && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#1a1a1a] border border-border rounded-lg shadow-xl overflow-hidden">
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 px-2">
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search cameras..."
                  value={cameraSearch}
                  onChange={(e) => setCameraSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filteredCameras.map((camera) => (
                <button
                  key={camera.id}
                  onClick={() => { setSelectedCamera(camera); setShowCameraList(false); setCameraSearch("") }}
                  className="w-full px-4 py-3 flex items-start gap-3 hover:bg-secondary text-left transition-colors border-b border-border/50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm text-foreground">{camera.fullName}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border capitalize shrink-0 ${levelColour[camera.level]}`}>{camera.level}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{camera.plainEnglishDescription}</p>
                  </div>
                </button>
              ))}
              {filteredCameras.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No cameras found</p>}
            </div>
          </div>
        )}
      </div>

      {selectedCamera && (
        <div className="p-3 rounded-lg border border-accent/20 bg-accent/5 text-xs text-muted-foreground">
          <span className="text-accent font-medium">{selectedCamera.fullName}: </span>
          {selectedCamera.plainEnglishDescription}
        </div>
      )}

      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-border rounded bg-card hover:border-muted-foreground/50 transition-colors cursor-pointer relative overflow-hidden"
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Reference frame" className="w-full max-h-52 object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-7 h-7 text-accent animate-spin" />
                  <p className="text-sm text-foreground font-medium">Analysing your reference...</p>
                </div>
              ) : (
                <p className="text-sm text-foreground font-medium bg-background/80 px-3 py-1.5 rounded">Tap to change frame</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
              <Camera className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Drop your reference frame here</p>
            <p className="text-xs text-muted-foreground">or tap to browse</p>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <Upload className="w-3 h-3" />
              <span>JPG, PNG, WebP, AVIF, TIFF, BMP up to 50MB</span>
            </div>
          </div>
        )}
      </div>

      {error && <div className="p-3 rounded border border-destructive/30 bg-destructive/10 text-sm text-destructive">{error}</div>}

      {/* Save success banner */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 rounded border border-green-400/30 bg-green-400/5 text-sm text-green-400">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Look saved! Retrieve it in On-Shoot to match your footage.</span>
          <button onClick={() => onTabChange?.("on-shoot")} className="ml-auto flex items-center gap-1.5 text-xs text-accent hover:underline shrink-0">
            <Crosshair className="w-3.5 h-3.5" /> Go to On-Shoot
          </button>
        </div>
      )}

      {/* Vision AI scene analysis */}
      {(visionLoading || sceneAnalysis) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-medium text-foreground">Scene Analysis</h2>
            {visionLoading && <Loader2 className="w-3.5 h-3.5 text-accent animate-spin ml-1" />}
          </div>
          {sceneAnalysis && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Shot Type", value: sceneAnalysis.shot_type },
                  { label: "Lighting", value: sceneAnalysis.lighting_feel },
                  { label: "Colour Mood", value: sceneAnalysis.colour_mood },
                  { label: "Suggested Look", value: sceneAnalysis.suggested_look },
                ].map((item) => (
                  <div key={item.label} className="bg-card border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-lg border border-yellow-400/20 bg-yellow-400/5">
                <p className="text-xs text-yellow-400 font-medium mb-1">Tip</p>
                <p className="text-xs text-muted-foreground">{sceneAnalysis.technical_note}</p>
              </div>
              {selectedCamera && (
                <div className="mt-3 p-3 rounded-lg border border-accent/20 bg-accent/5">
                  <p className="text-xs text-accent font-medium mb-1">For your {selectedCamera.fullName}</p>
                  <p className="text-xs text-muted-foreground">{sceneAnalysis.camera_advice}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Colour profile metrics */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Colour Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {colourMetrics.map((metric) => (
              <div key={metric.label} className="bg-secondary rounded p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                <p className="text-xl font-semibold font-mono text-foreground leading-tight">
                  {metric.value}<span className="text-xs text-muted-foreground ml-1">{metric.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plain English recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-foreground mb-3">What to do on your camera</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendations.map((rec) => (
              <ExpandableCard key={rec.label} label={rec.label} plainEnglish={rec.plainEnglish} technical={rec.technical} />
            ))}
          </div>
        </div>
      )}

      {/* Save + Go to On-Shoot CTAs */}
      {hasResults && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={openSaveModal}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-accent/30 bg-accent/5 text-sm text-accent hover:bg-accent/10 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save this look
          </button>
          <button
            onClick={() => { onGoToOnShoot?.(); onTabChange?.("on-shoot") }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <Crosshair className="w-4 h-4" />
            Go to On-Shoot
          </button>
        </div>
      )}

      {!result && !loading && (
        <p className="text-center text-xs text-muted-foreground py-4">
          Select your camera and upload a reference frame to get personalised recommendations
        </p>
      )}

      {/* Save modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#1a1a1a] border border-border rounded-xl p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-foreground mb-1">Save this look</h3>
            <p className="text-xs text-muted-foreground mb-4">Name it and optionally add it to a project</p>

            <label className="block text-xs text-muted-foreground mb-1.5">Scene name</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !showNewProject) handleSave() }}
              placeholder='e.g. "Golden hour bedroom scene"'
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 mb-4"
              autoFocus
            />

            <label className="block text-xs text-muted-foreground mb-1.5">Project <span className="opacity-50">(optional)</span></label>
            <div className="flex flex-wrap gap-2 mb-2">
              <button onClick={() => setSelectedProjectId(null)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedProjectId === null ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}>
                No project
              </button>
              {projects.map((p) => (
                <button key={p.id} onClick={() => setSelectedProjectId(p.id)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedProjectId === p.id ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  {p.name}
                </button>
              ))}
              <button onClick={() => setShowNewProject(!showNewProject)} className="text-xs px-3 py-1.5 rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground transition-colors">
                + New project
              </button>
            </div>

            {showNewProject && (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateProject() }}
                  placeholder='e.g. "Short Film - March 2025"'
                  className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
                />
                <button onClick={handleCreateProject} disabled={!newProjectName.trim() || creatingProject} className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium disabled:opacity-50 flex items-center">
                  {creatingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create"}
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowSaveModal(false); setSessionName(""); setShowNewProject(false); setNewProjectName("") }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!sessionName.trim() || saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}