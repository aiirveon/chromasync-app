import { createClient } from "@/lib/supabase"

export interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
}

export async function createProject(name: string, description?: string): Promise<{ project: Project | null; error: string | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { project: null, error: "Not signed in" }
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name: name.trim(), description: description?.trim() ?? null })
    .select()
    .single()
  return { project: (data as Project) ?? null, error: error?.message ?? null }
}

export async function loadProjects(): Promise<{ projects: Project[]; error: string | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { projects: [], error: "Not signed in" }
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
  return { projects: (data as Project[]) ?? [], error: error?.message ?? null }
}

export async function deleteProject(id: string): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from("projects").delete().eq("id", id)
  return { error: error?.message ?? null }
}
