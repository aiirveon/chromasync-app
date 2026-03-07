"use client"

import { useState, useRef } from "react"
import { Camera, Upload, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyseReferenceFrame, PreShootResponse } from "@/lib/api"

export function PreShoot() {
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [result, setResult]     = useState<PreShootResponse | null>(null)
  const [preview, setPreview]   = useState<string | null>(null)
  const inputRef                = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    try {
      const data = await analyseReferenceFrame(file)
      setResult(data)
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const profile  = result?.colour_profile
  const settings = result?.camera_settings

  const colourMetrics = profile
    ? [
        { label: "Colour Temp",  value: profile.colour_temperature_k.toString(), unit: "K"  },
        { label: "Exposure",     value: (profile.exposure_ev >= 0 ? "+" : "") + profile.exposure_ev.toFixed(2), unit: "EV" },
        { label: "Saturation",   value: profile.saturation_pct.toFixed(1),       unit: "%"  },
        { label: "Contrast",     value: profile.contrast_ratio.toFixed(3),       unit: "x"  },
      ]
    : [
        { label: "Colour Temp",  value: "—", unit: "K"  },
        { label: "Exposure",     value: "—", unit: "EV" },
        { label: "Saturation",   value: "—", unit: "%"  },
        { label: "Contrast",     value: "—", unit: "x"  },
      ]

  const cameraSettings = settings
    ? [
        { name: "White Balance",        value: settings.white_balance.value,        explanation: settings.white_balance.explanation        },
        { name: "ISO",                  value: settings.iso.value,                  explanation: settings.iso.explanation                  },
        { name: "Picture Profile",      value: settings.picture_profile.value,      explanation: settings.picture_profile.explanation      },
        { name: "Exposure Comp.",       value: settings.exposure_compensation.value, explanation: settings.exposure_compensation.explanation },
      ]
    : []

  return (
    <div className="section-stack">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Pre-Shoot Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Define your target look before you press record</p>
      </div>

      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-border rounded bg-card hover:border-muted-foreground/50 transition-colors cursor-pointer relative overflow-hidden"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

        {preview ? (
          <div className="relative">
            <img src={preview} alt="Reference frame" className="w-full max-h-52 object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-7 h-7 text-accent animate-spin" />
                  <p className="text-sm text-foreground font-medium">Analysing colour profile...</p>
                </div>
              ) : (
                <p className="text-sm text-foreground font-medium bg-background/80 px-3 py-1.5 rounded">
                  Tap to change frame
                </p>
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
              <span>PNG, JPG, TIFF, WEBP up to 50MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded border border-destructive/30 bg-destructive/10 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Colour profile metrics — 2 cols on mobile, 4 on desktop */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Colour Profile Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {colourMetrics.map((metric) => (
              <div key={metric.label} className="bg-secondary rounded p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                <p className="text-xl font-semibold mono-value text-foreground leading-tight">
                  {metric.value}
                  <span className="text-xs text-muted-foreground ml-1">{metric.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Camera settings — 1 col on mobile, 2 on desktop */}
      {cameraSettings.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-foreground mb-3">Recommended Camera Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cameraSettings.map((setting) => (
              <Card key={setting.name} className="bg-card border-border border-l-2 border-l-accent">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-xs text-muted-foreground">{setting.name}</p>
                    <p className="text-base font-semibold mono-value text-foreground">{setting.value}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{setting.explanation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!result && !loading && (
        <p className="text-center text-xs text-muted-foreground py-4">
          Upload a reference frame to see AI-generated camera recommendations
        </p>
      )}
    </div>
  )
}
