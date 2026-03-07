"use client"

import { Sparkles, Users, Map, Clapperboard, FileText, BookOpen, ArrowRight } from "lucide-react"
import type { StoryTab } from "./story-sidebar-nav"

interface StoryDashboardProps {
  activeTab: StoryTab
  onTabChange: (tab: StoryTab) => void
}

function EmptyState({ icon, label, hint, action }: {
  icon: React.ReactNode
  label: string
  hint: string
  action: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-sm font-medium text-foreground mb-1">{label}</p>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs">{hint}</p>
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-accent/30 bg-accent/5 text-sm text-accent hover:bg-accent/10 transition-colors">
        {action} <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function GeneratePanel({ onTabChange }: { onTabChange: (tab: StoryTab) => void }) {
  const templates = [
    { title: "Character-driven drama",   desc: "A personal journey of change and self-discovery",  tab: "characters" as StoryTab },
    { title: "Thriller / Suspense",      desc: "Rising tension, hidden secrets, a ticking clock",  tab: "scenes"     as StoryTab },
    { title: "Visual storyboard first",  desc: "Start with shots and build the story around them", tab: "storyboard" as StoryTab },
    { title: "Adapt an existing script", desc: "Upload or paste a script to break it into scenes",  tab: "scripts"    as StoryTab },
  ]

  return (
    <div className="section-stack">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Story Generator</h1>
        <p className="text-sm text-muted-foreground mt-1">Describe your film idea and let AI build the foundation</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-wider">Your idea</label>
        <textarea
          rows={4}
          placeholder="e.g. A war veteran returns to his coastal hometown and discovers his estranged daughter has been secretly documenting the disappearance of local fishermen..."
          className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 transition-colors resize-none"
        />
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {["Short Film", "Feature", "Series", "Documentary"].map((f) => (
              <button key={f} className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-accent/50 hover:text-foreground transition-colors">
                {f}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors">
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Or start from a template</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map((card) => (
            <button
              key={card.title}
              onClick={() => onTabChange(card.tab)}
              className="text-left bg-card border border-border rounded-lg p-4 hover:border-accent/30 transition-colors group"
            >
              <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors mb-1">{card.title}</p>
              <p className="text-xs text-muted-foreground">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
          <Sparkles className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Your generated story will appear here</p>
        <p className="text-xs text-muted-foreground/50 mt-1">Characters, scenes and a storyboard will be created automatically</p>
      </div>
    </div>
  )
}

export function StoryDashboard({ activeTab, onTabChange }: StoryDashboardProps) {
  if (activeTab === "generate") return <GeneratePanel onTabChange={onTabChange} />

  const panels: Record<Exclude<StoryTab, "generate">, { title: string; sub: string; icon: React.ReactNode; label: string; hint: string; action: string }> = {
    characters: { title: "Characters", sub: "Build and manage your cast",                       icon: <Users       className="w-5 h-5 text-muted-foreground" />, label: "No characters yet",     hint: "Generate a story first, or add a character manually",                  action: "Add character" },
    scenes:     { title: "Scenes",     sub: "Structure your narrative beat by beat",            icon: <Map         className="w-5 h-5 text-muted-foreground" />, label: "No scenes yet",         hint: "Generate a story or add scenes manually to build your structure",       action: "Add scene"     },
    storyboard: { title: "Storyboard", sub: "Visualise your shots before you roll camera",      icon: <Clapperboard className="w-5 h-5 text-muted-foreground" />, label: "No shots yet",        hint: "Add scenes first, then generate or draw panels for each shot",          action: "Add shot"      },
    scripts:    { title: "Scripts",    sub: "Write, import, or generate your screenplay",       icon: <FileText    className="w-5 h-5 text-muted-foreground" />, label: "No scripts yet",       hint: "Generate from your story, paste existing text, or start from scratch",  action: "New script"    },
    library:    { title: "Library",    sub: "All your saved stories in one place",              icon: <BookOpen    className="w-5 h-5 text-muted-foreground" />, label: "Your library is empty", hint: "Stories you generate and save will appear here",                       action: "New story"     },
  }

  const p = panels[activeTab as Exclude<StoryTab, "generate">]

  return (
    <div className="section-stack">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{p.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{p.sub}</p>
      </div>
      <EmptyState icon={p.icon} label={p.label} hint={p.hint} action={p.action} />
    </div>
  )
}
