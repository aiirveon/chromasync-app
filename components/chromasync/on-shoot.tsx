"use client"

import { useState } from "react"
import { RefreshCw, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getOnShootRecommendations, Recommendation } from "@/lib/api"

const conditions = [
  { id: "location", label: "Location Type", options: ["Indoor", "Outdoor", "Mixed"], default: "Outdoor" },
  { id: "time_of_day", label: "Time of Day", options: ["Golden Hour", "Midday", "Overcast", "Night"], default: "Golden Hour" },
  { id: "lighting_source", label: "Lighting Source", options: ["Natural", "Tungsten", "Fluorescent", "Mixed"], default: "Natural" },
]

export function OnShoot() {
  const [values, setValues] = useState({ location: "Outdoor", time_of_day: "Golden Hour", lighting_source: "Natural" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null)

  async function handleUpdate() {
    setLoading(true)
    setError(null)
    try {
      const data = await getOnShootRecommendations({
        location: values.location,
        time_of_day: values.time_of_day,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">On-Shoot Guidance</h1>
        <p className="text-muted-foreground mt-1">Real-time parameter updates as conditions change</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Current Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {conditions.map((condition) => (
              <div key={condition.id} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{condition.label}</Label>
                <Select
                  defaultValue={condition.default}
                  onValueChange={(val) => setValues((prev) => ({ ...prev, [condition.id]: val }))}
                >
                  <SelectTrigger className="bg-secondary border-border h-9">
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
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Update Recommendations
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 rounded border border-destructive/30 bg-destructive/10 text-sm text-destructive">{error}</div>
      )}

      {recommendations && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Live Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.map((rec) => (
              <div key={rec.parameter} className="flex items-center justify-between p-3 bg-secondary rounded border border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{rec.parameter}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.explanation}</p>
                </div>
                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="mono-value text-sm text-muted-foreground">{rec.current}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-accent" />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Recommended</p>
                    <p className="mono-value text-sm text-foreground font-medium">{rec.recommended}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs mono-value ${
                    rec.direction === "up" ? "bg-accent/10 text-accent" :
                    rec.direction === "down" ? "bg-blue-500/10 text-blue-400" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {rec.delta}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!recommendations && !loading && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Set your conditions and click Update to get live recommendations
        </p>
      )}
    </div>
  )
}
