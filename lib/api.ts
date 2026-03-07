const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://chromasync-api.onrender.com"

// Wake-up ping (Render free tier cold start)
export async function pingAPI(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/ping`, { method: "GET" })
    return res.ok
  } catch {
    return false
  }
}


// ─── Pre-Shoot ───────────────────────────────────────────────────────────────

export async function analyseReferenceFrame(file: File) {
  const form = new FormData()
  form.append("file", file)

  const res = await fetch(`${API_BASE}/api/pre-shoot/analyse`, {
    method: "POST",
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Analysis failed")
  }

  return res.json() as Promise<PreShootResponse>
}

// ─── On-Shoot ────────────────────────────────────────────────────────────────

export async function getOnShootRecommendations(params: OnShootRequest) {
  const res = await fetch(`${API_BASE}/api/on-shoot/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Recommendation failed")
  }

  return res.json() as Promise<OnShootResponse>
}

// ─── Post Correction ─────────────────────────────────────────────────────────

export async function analyseFootage(reference: File, scenes: File[]) {
  const form = new FormData()
  form.append("reference", reference)
  scenes.forEach((scene) => form.append("scenes", scene))

  const res = await fetch(`${API_BASE}/api/post-correction/analyse`, {
    method: "POST",
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Footage analysis failed")
  }

  return res.json() as Promise<PostCorrectionResponse>
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ColourProfile {
  colour_temperature_k: number
  exposure_ev: number
  saturation_pct: number
  contrast_ratio: number
  mean_r: number
  mean_g: number
  mean_b: number
}

export interface CameraSetting {
  value: string
  explanation: string
  label?: string
}

export interface CameraSettings {
  white_balance: CameraSetting
  iso: CameraSetting
  picture_profile: CameraSetting
  exposure_compensation: CameraSetting
}

export interface PreShootResponse {
  colour_profile: ColourProfile
  camera_settings: CameraSettings
  histogram: number[]
}

export interface OnShootRequest {
  location: string
  time_of_day: string
  lighting_source: string
  reference_temp_k?: number
  reference_iso?: number
}

export interface Recommendation {
  parameter: string
  current: string
  recommended: string
  delta: string
  direction: "up" | "down" | "neutral"
  explanation: string
}

export interface OnShootResponse {
  conditions: {
    location: string
    time_of_day: string
    lighting_source: string
  }
  recommendations: Recommendation[]
}

export interface SceneResult {
  scene_number: number
  scene_name: string
  delta_e: number
  status: "Accepted" | "Corrected" | "Needs Review"
  temperature: string
  exposure: string
  temp_delta: number
  exposure_delta: number
  saturation_delta: number
}

export interface PostCorrectionResponse {
  scenes: SceneResult[]
  summary: {
    total_scenes: number
    avg_delta_e: number
    max_delta_e: number
    needs_review_count: number
    reference_temp: string
    reference_exposure: string
  }
}
