"use client"

import { useState, useEffect } from "react"
import { Camera, Crosshair, Palette, Wifi, LogOut, FolderOpen, Plus, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { loadProjects, createProject, Project } from "@/lib/projects"

interface SidebarProps {
  activeTab: "pre-shoot" | "on-shoot" | "post-correction"
  onTabChange: (tab: "pre-shoot" | "on-shoot" | "post-correction") => void
  userEmail?: string
  onSignOut?: () => void
}

const navItems = [
  { id: "pre-shoot"       as const, label: "Pre-Shoot",      icon: Camera    },
  { id: "on-shoot"        as const, label: "On-Shoot",       icon: Crosshair },
  { id: "post-correction" as const, label: "Post Correction", icon: Palette  },
]

export function Sidebar({ activeTab, onTabChange, userEmail, onSignOut }: SidebarProps) {
  const [projects, setProjects]         = useState<Project[]>([])
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [showNewInput, setShowNewInput] = useState(false)
  const [newName, setNewName]           = useState("")
  const [creating, setCreating]         = useState(false)

  useEffect(() => {
    loadProjects().then(({ projects: p }) => setProjects(p))
  }, [])

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

  return (
    <aside
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 shrink-0">
            <svg viewBox="0 0 32 32" className="w-full h-full">
              <circle cx="16" cy="16" r="14" fill="none" stroke="var(--accent)" strokeWidth="2" />
              <circle cx="16"  cy="8"  r="3" fill="var(--destructive)" />
              <circle cx="22.9" cy="20" r="3" fill="var(--success)" />
              <circle cx="9.1"  cy="20" r="3" fill="var(--info)" />
              <circle cx="16"  cy="16" r="4" fill="var(--accent)" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">ChromaSync</span>
        </div>
      </div>

      {/* Scrollable middle */}
      <div className="flex-1 overflow-y-auto">

        {/* Navigation */}
        <nav className="p-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 rounded text-sm transition-colors",
                    "touch-target justify-start",
                    activeTab === item.id
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-sidebar-border" />

        {/* Projects */}
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
              >
                <Plus className="w-3 h-3" />
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${projectsOpen ? "" : "-rotate-90"}`} />
            </div>
          </button>

          {projectsOpen && (
            <div className="mt-1 space-y-0.5">
              {showNewInput && (
                <div className="flex gap-1.5 px-1 mb-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate()
                      if (e.key === "Escape") { setShowNewInput(false); setNewName("") }
                    }}
                    placeholder="Project name..."
                    className="flex-1 bg-card border border-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
                    autoFocus
                  />
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim() || creating}
                    className="px-2 py-1.5 rounded bg-accent text-accent-foreground text-xs disabled:opacity-50"
                  >
                    {creating ? "..." : "Add"}
                  </button>
                </div>
              )}

              {projects.length === 0 && !showNewInput && (
                <button
                  onClick={() => setShowNewInput(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-muted-foreground/50 hover:text-muted-foreground border border-dashed border-border/40 hover:border-border transition-colors"
                >
                  <Plus className="w-3 h-3" /> New project
                </button>
              )}

              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onTabChange("on-shoot")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
                >
                  <FolderOpen className="w-3.5 h-3.5 shrink-0 text-accent/50" />
                  <span className="truncate">{project.name}</span>
                </button>
              ))}

              {projects.length > 0 && (
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

      </div> {/* end scrollable */}

      {/* User + API Status */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {userEmail && (
          <div className="space-y-2">
            <span className="block text-xs text-muted-foreground truncate">{userEmail}</span>
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-red-400 hover:bg-red-400/10 transition-colors border border-red-400/20 hover:border-red-400/40"
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
