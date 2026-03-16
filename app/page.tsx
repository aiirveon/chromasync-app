"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Sidebar } from "@/components/chromasync/sidebar"
import { MobileHeader } from "@/components/chromasync/mobile-header"
import { MobileBottomNav } from "@/components/chromasync/mobile-bottom-nav"
import { PreShoot } from "@/components/chromasync/pre-shoot"
import { OnShoot } from "@/components/chromasync/on-shoot"
import { PostCorrection } from "@/components/chromasync/post-correction"
import { StatusBar } from "@/components/chromasync/status-bar"
import { PreShootResponse } from "@/lib/api"
import { SavedSession } from "@/lib/sessions"
import { StoryDashboard } from "@/components/chromasync/story-dashboard"
import { type AppMode } from "@/components/chromasync/mode-switcher"
import { type StoryTab } from "@/components/chromasync/story-sidebar-nav"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://chromasync-api.onrender.com"

function BetaBanner() {
  const [apiReady, setApiReady] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(() => setApiReady(true))
      .catch(() => setApiReady(true))
  }, [])

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: apiReady ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "color-mix(in srgb, var(--muted-foreground) 8%, transparent)",
        borderBottom: "1px solid var(--border)",
        padding: "0.35rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        fontSize: "0.7rem",
        color: "var(--muted-foreground)",
        zIndex: 100,
        transition: "background-color 0.4s",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: apiReady ? "var(--accent)" : "var(--muted-foreground)",
          flexShrink: 0,
          transition: "background-color 0.4s",
        }}
      />
      {apiReady
        ? "Beta — AI features are live. Some responses may be slower than usual."
        : "Beta — warming up the AI engine, first request may take up to 50 seconds."}
    </div>
  )
}

export interface LivePreShootState {
  preview: string | null
  result: PreShootResponse | null
  cameraName: string | null
  recommendations: Array<{ label: string; plainEnglish: string; technical: string }> | null
  sceneAnalysis: Record<string, string> | null
}

type TabType = "pre-shoot" | "on-shoot" | "post-correction"

const tabLabels: Record<TabType, string> = {
  "pre-shoot": "Pre-Shoot",
  "on-shoot": "On-Shoot",
  "post-correction": "Post Correction",
}

export default function Home() {
  const [activeTab, setActiveTab]       = useState<TabType>("pre-shoot")
  const [appMode, setAppMode]           = useState<AppMode>("colour")
  const [storyTab, setStoryTab]         = useState<StoryTab>("generate")
  const [user, setUser]                 = useState<{ email?: string } | null>(null)
  const [authLoading, setAuthLoading]   = useState(true)
  const [jumpToCurrent, setJumpToCurrent]   = useState(false)
  const [sidebarSession, setSidebarSession] = useState<SavedSession | null>(null)
  const [livePreShoot, setLivePreShoot] = useState<LivePreShootState>({
    preview: null, result: null, cameraName: null, recommendations: null, sceneAnalysis: null,
  })
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login")
      } else {
        setUser(data.user)
        setAuthLoading(false)
      }
    })
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground/60 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="app-shell film-grain">
      <BetaBanner />
      <div className="desktop-only">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userEmail={user?.email}
          onSignOut={handleSignOut}
          onSessionSelect={(s) => { setSidebarSession(s); setActiveTab("on-shoot") }}
          appMode={appMode}
          onAppModeChange={setAppMode}
          storyTab={storyTab}
          onStoryTabChange={setStoryTab}
        />
      </div>
      <div className="mobile-only">
        <MobileHeader currentModule={appMode === "story" ? "Story" : tabLabels[activeTab]} />
      </div>
      <main className={appMode === "story" ? "" : "main-content"}>
        {appMode === "story" ? (
          <StoryDashboard activeTab={storyTab} onTabChange={setStoryTab} />
        ) : (
          <div className="content-wrapper">
            <div className="section-stack">
              <div className={activeTab === "pre-shoot"       ? "block" : "hidden"}><PreShoot onTabChange={setActiveTab} onLiveStateChange={setLivePreShoot} onGoToOnShoot={() => { setJumpToCurrent(true); setActiveTab("on-shoot") }} /></div>
              <div className={activeTab === "on-shoot"        ? "block" : "hidden"}><OnShoot livePreShoot={livePreShoot} jumpToCurrent={jumpToCurrent} onJumpHandled={() => setJumpToCurrent(false)} sidebarSession={sidebarSession} onSidebarSessionHandled={() => setSidebarSession(null)} /></div>
              <div className={activeTab === "post-correction" ? "block" : "hidden"}><PostCorrection /></div>
            </div>
          </div>
        )}
      </main>
      <div className="desktop-only">
        <StatusBar processingState="Ready" />
      </div>
      <div className="mobile-only">
      <MobileBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          appMode={appMode}
          onAppModeChange={setAppMode}
          storyTab={storyTab}
          onStoryTabChange={setStoryTab}
        />
        </div>
    </div>
  )
}
