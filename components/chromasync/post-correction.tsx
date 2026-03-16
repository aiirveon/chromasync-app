"use client"

import { useState, useRef } from "react"
import { Film, ImageIcon, Search, Loader2, Plus, X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { analyseFootage, downloadLut, PostCorrectionResponse } from "@/lib/api"

function getStatusBadge(status: string) {
  switch (status) {
    case "Corrected":
      return <Badge className="badge-corrected border">{status}</Badge>
    case "Needs Review":
      return <Badge className="badge-needs-review border">{status}</Badge>
    case "Accepted":
      return <Badge className="badge-accepted border">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getDeltaColor(delta: number) {
  if (delta < 2.0) return "drift-good"
  if (delta < 5.0) return "drift-warn"
  return "drift-bad"
}

export function PostCorrection() {
  const [reference, setReference] = useState<File | null>(null)
  const [scenes, setScenes] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PostCorrectionResponse | null>(null)
  const [lutLoading, setLutLoading] = useState<number | null>(null)
  const [lutError, setLutError] = useState<string | null>(null)
  const [referencePreview, setReferencePreview] = useState<string | null>(null)
  const refInputRef = useRef<HTMLInputElement>(null)
  const scenesInputRef = useRef<HTMLInputElement>(null)

  function onReferenceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setReference(file)
      const url = URL.createObjectURL(file)
      setReferencePreview(url)
    }
  }

  function onScenesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length) setScenes((prev) => [...prev, ...files].slice(0, 20))
  }

  function removeScene(index: number) {
    setScenes((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleDownloadLut(sceneIndex: number) {
    if (!reference) return
    const sceneFile = scenes[sceneIndex]
    if (!sceneFile) return
    setLutLoading(sceneIndex)
    setLutError(null)
    try {
      await downloadLut(sceneFile, reference)
    } catch (e: any) {
      setLutError(`LUT failed for scene ${sceneIndex + 1}. Try again.`)
    } finally {
      setLutLoading(null)
    }
  }

  async function handleAnalyse() {
    if (!reference) { setError("Please upload a reference frame"); return }
    if (scenes.length === 0) { setError("Please upload at least one scene"); return }
    setLoading(true)
    setError(null)
    try {
      const data = await analyseFootage(reference, scenes)
      setResult(data)
    } catch (e: any) {
      setError(e.message || "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section-stack">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">Post Correction</h1>
        <p className="text-muted-foreground mt-1 text-sm">Detect and correct colour drift in your footage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="border-2 border-dashed border-border rounded bg-card hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={() => refInputRef.current?.click()}
        >
          <input ref={refInputRef} type="file" accept="image/*" className="hidden" onChange={onReferenceChange} />
          {reference && referencePreview ? (
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              <img
                src={referencePreview}
                alt="Reference frame"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "calc(var(--radius) - 2px)",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)",
                  borderRadius: "calc(var(--radius) - 2px)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "0.6rem 0.75rem",
                  gap: "0.4rem",
                }}
              >
                <ImageIcon className="w-3.5 h-3.5 text-white/80" style={{ flexShrink: 0 }} />
                <p className="text-xs text-white/90 truncate" style={{ flex: 1 }}>{reference.name}</p>
                <p className="text-xs text-white/60 flex-shrink-0">Click to change</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Reference Frame</p>
              <p className="text-xs text-muted-foreground">Drop or click to browse</p>
            </div>
          )}
        </div>

        <div
          className="border-2 border-dashed border-border rounded bg-card hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={() => scenesInputRef.current?.click()}
        >
          <input ref={scenesInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onScenesChange} />
          {scenes.length > 0 ? (
            <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{scenes.length} scene{scenes.length > 1 ? "s" : ""} selected</p>
                <div className="flex items-center gap-1 text-xs text-accent">
                  <Plus className="w-3 h-3" />
                  <span>Add more</span>
                </div>
              </div>
              {scenes.map((scene, i) => (
                <div key={i} className="flex items-center justify-between bg-secondary rounded px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <Film className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-foreground truncate max-w-[160px]">{scene.name}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeScene(i) }} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Film className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Scene Frames</p>
              <p className="text-xs text-muted-foreground">Select multiple images (max 20)</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded border border-destructive/30 bg-destructive/10 text-sm text-destructive">{error}</div>
      )}

      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-11" onClick={handleAnalyse} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
        {loading ? "Analysing..." : "Analyse Footage"}
      </Button>

      {result && (
        <>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Scene Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Horizontal scroll on mobile for the data table */}
              <div className="overflow-x-auto">
              <div className="divide-y divide-border min-w-[480px]">
                <div className="grid grid-cols-7 gap-3 px-4 py-2 text-xs text-muted-foreground bg-secondary/50">
                  <div>Scene</div><div>Name</div><div>Temp</div><div>Exposure</div><div>ΔE Drift</div><div>Status</div><div>LUT</div>
                </div>
                {result.scenes.map((scene) => (
                  <div key={scene.scene_number} className="grid grid-cols-7 gap-3 px-4 py-3 items-center hover:bg-secondary/30 transition-colors">
                    <div className="mono-value text-sm text-foreground">{String(scene.scene_number).padStart(3, "0")}</div>
                    <div className="text-xs text-muted-foreground truncate">{scene.scene_name}</div>
                    <div className="mono-value text-sm text-foreground">{scene.temperature}</div>
                    <div className="mono-value text-sm text-foreground">{scene.exposure}</div>
                    <div className={`mono-value text-sm font-medium ${getDeltaColor(scene.delta_e)}`}>{scene.delta_e}</div>
                    <div>{getStatusBadge(scene.status)}</div>
                    <div>
                      <button
                        onClick={() => handleDownloadLut(scene.scene_number - 1)}
                        disabled={lutLoading === scene.scene_number - 1}
                        title="Download correction LUT for DaVinci Resolve or Premiere Pro"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "var(--radius)",
                          border: "1px solid var(--border)",
                          backgroundColor: "transparent",
                          color: lutLoading === scene.scene_number - 1 ? "var(--muted-foreground)" : "var(--accent)",
                          fontSize: "0.7rem",
                          cursor: lutLoading === scene.scene_number - 1 ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lutLoading === scene.scene_number - 1
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Download className="w-3 h-3" />
                        }
                        {lutLoading === scene.scene_number - 1 ? "" : ".cube"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </CardContent>
          </Card>

          {lutError && (
            <div className="p-3 rounded border border-destructive/30 bg-destructive/10 text-sm text-destructive">{lutError}</div>
          )}

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Correction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: "Scenes Analysed", value: result.summary.total_scenes.toString(), delta: -1 },
                  { label: "Avg ΔE Drift", value: result.summary.avg_delta_e.toString(), delta: result.summary.avg_delta_e },
                  { label: "Max ΔE Drift", value: result.summary.max_delta_e.toString(), delta: result.summary.max_delta_e },
                  { label: "Needs Review", value: result.summary.needs_review_count.toString(), delta: result.summary.needs_review_count > 0 ? 6 : 0 },
                  { label: "Reference Temp", value: result.summary.reference_temp, delta: -1 },
                  { label: "Reference Exposure", value: result.summary.reference_exposure, delta: -1 },
                ].map((stat) => (
                  <div key={stat.label} className="bg-secondary rounded p-3 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`mono-value text-2xl font-semibold ${stat.delta < 0 ? "text-foreground" : getDeltaColor(stat.delta)}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!result && !loading && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Upload a reference frame and scene images to detect colour drift
        </p>
      )}
    </div>
  )
}
