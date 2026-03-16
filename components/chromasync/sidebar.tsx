"use client"

import { useState, useEffect, useCallback } from "react"
import { Camera, Crosshair, Palette, Wifi, LogOut, FolderOpen, Plus, ChevronDown, ChevronRight, Trash2, FileImage } from "lucide-react"
import { cn } from "@/lib/utils"
import { loadProjects, createProject, deleteProject, Project } from "@/lib/projects"
import { loadSessions, deleteSession, SavedSession } from "@/lib/sessions"
import { ModeSwitcher, type AppMode } from "./mode-switcher"
import { StorySidebarNav, type StoryTab } from "./story-sidebar-nav"

interface SidebarProps {
  activeTab: "pre-shoot" | "on-shoot" | "post-correction"
  onTabChange: (tab: "pre-shoot" | "on-shoot" | "post-correction") => void
  userEmail?: string
  onSignOut?: () => void
  onSessionSelect?: (session: SavedSession) => void
  appMode: AppMode
  onAppModeChange: (mode: AppMode) => void
  storyTab: StoryTab
  onStoryTabChange: (tab: StoryTab) => void
}

const navItems = [
  { id: "pre-shoot"       as const, label: "Pre-Shoot",       icon: Camera    },
  { id: "on-shoot"        as const, label: "On-Shoot",        icon: Crosshair },
  { id: "post-correction" as const, label: "Post Correction", icon: Palette   },
]

type ConfirmTarget =
  | { type: "session"; id: string; name: string }
  | { type: "project"; id: string; name: string }

export function Sidebar({ activeTab, onTabChange, userEmail, onSignOut, onSessionSelect, appMode, onAppModeChange, storyTab, onStoryTabChange }: SidebarProps) {
  const [projects, setProjects]           = useState<Project[]>([])
  const [projectsOpen, setProjectsOpen]   = useState(true)
  const [expanded, setExpanded]           = useState<Record<string, boolean>>({})
  const [cache, setCache]                 = useState<Record<string, SavedSession[]>>({})
  const [loadingId, setLoadingId]         = useState<string | null>(null)
  const NONE_KEY = "__none__"
  const [showNewInput, setShowNewInput]   = useState(false)
  const [newName, setNewName]             = useState("")
  const [creating, setCreating]           = useState(false)
  const [confirm, setConfirm]             = useState<ConfirmTarget | null>(null)
  const [deleting, setDeleting]           = useState(false)

  useEffect(() => {
    loadProjects().then(({ projects: p }) => setProjects(p))
    loadSessions(null).then(({ sessions: s }) => {
      setCache((prev) => ({ ...prev, [NONE_KEY]: s }))
    })
  }, [])

  const handleSessionSaved = useCallback((e: Event) => {
    const pid: string | null = (e as CustomEvent).detail?.project_id ?? null
    const key = pid ?? NONE_KEY
    loadSessions(pid).then(({ sessions: s }) => {
      setCache((prev) => ({ ...prev, [key]: s }))
    })
    if (pid) loadProjects().then(({ projects: p }) => setProjects(p))
  }, [])

  useEffect(() => {
    window.addEventListener("chromasync:session-saved", handleSessionSaved)
    return () => window.removeEventListener("chromasync:session-saved", handleSessionSaved)
  }, [handleSessionSaved])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const { project } = await createProject(newName.trim())
    if (project) {
      setProjects((prev) => [project, ...prev])
      setNewName("")
      setShowNewInput(false)
    }
    setCreating(false)
  }

  async function toggle(id: string) {
    const isOpen = !!expanded[id]
    setExpanded((prev) => ({ ...prev, [id]: !isOpen }))
    if (!isOpen && !cache[id]) {
      setLoadingId(id)
      const { sessions: s } = await loadSessions(id)
      setCache((prev) => ({ ...prev, [id]: s }))
      setLoadingId(null)
    }
  }

  async function handleDelete() {
    if (!confirm) return
    setDeleting(true)
    if (confirm.type === "session") {
      await deleteSession(confirm.id)
      setCache((prev) => {
        const u = { ...prev }
        for (const k of Object.keys(u)) u[k] = u[k].filter((s) => s.id !== confirm.id)
        return u
      })
    } else {
      await deleteProject(confirm.id)
      setProjects((prev) => prev.filter((p) => p.id !== confirm.id))
      setCache((prev) => { const u = { ...prev }; delete u[confirm.id]; return u })
      setExpanded((prev) => { const u = { ...prev }; delete u[confirm.id]; return u })
    }
    setConfirm(null)
    setDeleting(false)
  }

  const noneSessions = cache[NONE_KEY] ?? []

  return (
    <aside
      className="fixed left-0 bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
      style={{
        top: "var(--beta-banner-height)",
        width: "var(--sidebar-width)",
        height: "calc(100vh - var(--beta-banner-height))",
      }}
    >
      {/* Logo + mode switcher */}
      <div className="p-4 border-b border-sidebar-border shrink-0 space-y-3">
        <div className="flex items-center">
          <span className="wordmark text-xl text-sidebar-foreground">Ojuit</span>
        </div>
        <ModeSwitcher mode={appMode} onChange={onAppModeChange} />
      </div>

      {/* Scrollable middle */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">

        {/* Navigation — swaps based on app mode */}
        {appMode === "story" ? (
          <StorySidebarNav activeTab={storyTab} onTabChange={onStoryTabChange} />
        ) : (
          <nav className="px-3 py-2">
            <ul className="space-y-0.5">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    title={item.label}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      activeTab === item.id
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mx-3 border-t border-sidebar-border" />

        {/* Projects — only shown in colour mode */}
        {appMode === "colour" && (<>
        <div className="p-3">
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors group rounded hover:bg-secondary"
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="uppercase tracking-wider font-medium">Projects</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                onClick={(e) => { e.stopPropagation(); setShowNewInput(true); setProjectsOpen(true) }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-accent rounded transition-all"
                title="New project"
              >
                <Plus className="w-3 h-3" />
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${projectsOpen ? "" : "-rotate-90"}`} />
            </div>
          </button>

          {projectsOpen && (
            <div className="mt-1 space-y-0.5">

              {/* New project input */}
              {showNewInput && (
                <div className="flex items-center gap-1.5 px-1 mb-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate()
                      if (e.key === "Escape") { setShowNewInput(false); setNewName("") }
                    }}
                    placeholder="Project name..."
                    className="flex-1 min-w-0 bg-card border border-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
                    autoFocus
                  />
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim() || creating}
                    className="shrink-0 px-2 py-1.5 rounded bg-accent text-accent-foreground text-xs font-medium disabled:opacity-50 hover:bg-accent/90 transition-colors"
                  >
                    {creating ? "…" : "Add"}
                  </button>
                </div>
              )}

              {/* Empty state */}
              {projects.length === 0 && noneSessions.length === 0 && !showNewInput && (
                <button
                  onClick={() => setShowNewInput(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-muted-foreground/50 hover:text-muted-foreground border border-dashed border-border/40 hover:border-border transition-colors"
                >
                  <Plus className="w-3 h-3" /> New project
                </button>
              )}

              {/* Unprojectd sessions — no project_id, shown directly in sidebar */}
              {noneSessions.map((session) => (
                <div key={session.id} className="flex items-center group/ns rounded hover:bg-secondary transition-colors">
                  <button
                    onClick={() => { onSessionSelect?.(session); onTabChange("on-shoot") }}
                    className="flex-1 flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors text-left min-w-0"
                  >
                    <FileImage className="w-3 h-3 shrink-0 text-muted-foreground/40" />
                    <span className="truncate">{session.name}</span>
                  </button>
                  <button
                    onClick={() => setConfirm({ type: "session", id: session.id, name: session.name })}
                    className="opacity-0 group-hover/ns:opacity-100 p-1.5 mr-1 shrink-0 text-muted-foreground/40 hover:text-destructive transition-all"
                    title="Delete look"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Divider if both exist */}
              {noneSessions.length > 0 && projects.length > 0 && (
                <div className="border-t border-border/20 my-1" />
              )}

              {/* Project folders */}
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex items-center group/proj rounded hover:bg-secondary transition-colors">
                    <button
                      onClick={() => toggle(project.id)}
                      className="flex-1 flex items-center gap-1.5 px-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors text-left min-w-0"
                    >
                      <ChevronRight className={`w-3 h-3 shrink-0 text-muted-foreground/40 transition-transform ${expanded[project.id] ? "rotate-90" : ""}`} />
                      <FolderOpen className="w-3.5 h-3.5 shrink-0 text-accent/50" />
                      <span className="truncate">{project.name}</span>
                      {loadingId === project.id && <span className="ml-auto text-muted-foreground/40">…</span>}
                    </button>
                    <button
                      onClick={() => setConfirm({ type: "project", id: project.id, name: project.name })}
                      className="opacity-0 group-hover/proj:opacity-100 p-1.5 mr-1 shrink-0 text-muted-foreground/40 hover:text-destructive transition-all"
                      title="Delete project"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Sessions inside project */}
                  {expanded[project.id] && (
                    <div className="ml-4 border-l border-border/30 pl-2 space-y-0.5 mt-0.5 mb-1">
                      {(cache[project.id] ?? []).length === 0 && loadingId !== project.id && (
                        <p className="px-2 py-1.5 text-xs text-muted-foreground/30 italic">No saved looks</p>
                      )}
                      {(cache[project.id] ?? []).map((session) => (
                        <div key={session.id} className="flex items-center group/sess rounded hover:bg-secondary transition-colors">
                          <button
                            onClick={() => { onSessionSelect?.(session); onTabChange("on-shoot") }}
                            className="flex-1 flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors text-left min-w-0"
                          >
                            <FileImage className="w-3 h-3 shrink-0 text-muted-foreground/30" />
                            <span className="truncate">{session.name}</span>
                          </button>
                          <button
                            onClick={() => setConfirm({ type: "session", id: session.id, name: session.name })}
                            className="opacity-0 group-hover/sess:opacity-100 p-1.5 mr-1 shrink-0 text-muted-foreground/40 hover:text-destructive transition-all"
                            title="Delete look"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* New project footer button */}
              {(projects.length > 0 || noneSessions.length > 0) && !showNewInput && (
                <button
                  onClick={() => setShowNewInput(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors mt-1"
                >
                  <Plus className="w-3 h-3" /> New project
                </button>
              )}
            </div>
          )}
        </div>
      </>)}
      </div>

      {/* Delete confirmation overlay */}
      {confirm && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 p-5">
          <div className="w-full bg-card border border-border rounded-lg p-4 space-y-3 shadow-xl">
            <p className="text-sm font-medium text-foreground">Delete {confirm.type}?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {confirm.type === "project"
                ? `"${confirm.name}" and all its saved looks will be permanently deleted.`
                : `"${confirm.name}" will be permanently deleted.`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirm(null)}
                disabled={deleting}
                className="flex-1 px-3 py-2 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-3 py-2 rounded bg-destructive/10 border border-destructive/30 text-xs text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User + status */}
      <div className="p-4 border-t border-sidebar-border space-y-3 shrink-0">
        {userEmail && (
          <div className="space-y-2">
            <span className="block text-xs text-muted-foreground truncate">{userEmail}</span>
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20 hover:border-destructive/40"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="relative">
            <Wifi className="w-3.5 h-3.5 text-success" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          </div>
          <span>API Connected</span>
        </div>
      </div>
    </aside>
  )
}
