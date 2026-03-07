"use client"

import { useState } from "react"
import { RefreshCw, ArrowRight, ArrowDown, Minus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getOnShootRecommendations, Recommendation } from "@/lib/api"

const conditions = [
  { id: "location",       label: "Location Type",  options: ["Indoor", "Outdoor", "Mixed"],                    default: "Outdoor"      },
  { id: "time_of_day",    label: "Time of Day",    options: ["Golden Hour", "Midday", "Overcast", "Night"],    default: "Golden Hour"  },
  { id: "lighting_source",label: "Lighting Source",options: ["Natural", "Tungsten", "Fluorescent", "Mixed"],   default: "Natural"      },
]

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
              <div
                key={rec.parameter}
                className="bg-secondary rounded border border-border p-3"
              >
                {/* Top row: parameter name + delta pill */}
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">{rec.parameter}</p>
                  <DeltaPill direction={rec.direction} delta={rec.delta} />
                </div>

                {/* Explanation */}
                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{rec.explanation}</p>

                {/* Current → Recommended — stacks nicely on narrow screens */}
                <div className="flex items-center gap-2 flex-wrap">
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
              </div>
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
