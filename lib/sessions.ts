import { createClient } from "@/lib/supabase"

export interface SavedSession {
  id: string
  name: string
  created_at: string
  project_id: string | null
  camera_name: string | null
  colour_temperature_k: number | null
  exposure_ev: number | null
  saturation_pct: number | null
  contrast_ratio: number | null
  scene_analysis: Record<string, string> | null
  recommendations: Array<{ label: string; plainEnglish: string; technical: string }> | null
  reference_image_url: string | null
}

export async function uploadReferenceImage(file: File, userId: string): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split(".").pop() ?? "jpg"
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from("reference-images")
    .upload(path, file, { upsert: false, contentType: file.type })
  if (error) return null
  const { data } = supabase.storage.from("reference-images").getPublicUrl(path)
  return data.publicUrl
}

export async function saveSession(data: {
  name: string
  project_id: string | null
  camera_name: string | null
  colour_temperature_k: number | null
  exposure_ev: number | null
  saturation_pct: number | null
  contrast_ratio: number | null
  scene_analysis: Record<string, string> | null
  recommendations: Array<{ label: string; plainEnglish: string; technical: string }> | null
  reference_image_url: string | null
}): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not signed in" }

  const { error } = await supabase.from("sessions").insert({
    user_id: user.id,
    ...data,
  })

  return { error: error?.message ?? null }
}

export async function loadSessions(projectId?: string | null): Promise<{ sessions: SavedSession[]; error: string | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { sessions: [], error: "Not signed in" }

  let query = supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (projectId !== undefined) {
    query = projectId ? query.eq("project_id", projectId) : query.is("project_id", null)
  }

  const { data, error } = await query
  return { sessions: (data as SavedSession[]) ?? [], error: error?.message ?? null }
}

export async function deleteSession(id: string): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from("sessions").delete().eq("id", id)
  return { error: error?.message ?? null }
}
