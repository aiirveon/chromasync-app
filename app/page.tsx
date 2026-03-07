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
      <div className="desktop-only">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userEmail={user?.email}
          onSignOut={handleSignOut}
          onSessionSelect={(s) => { setSidebarSession(s); setActiveTab("on-shoot") }}
        />
      </div>
      <div className="mobile-only">
        <MobileHeader currentModule={tabLabels[activeTab]} />
      </div>
      <main className="main-content">
        <div className="content-wrapper">
          <div className="section-stack">
            <div className={activeTab === "pre-shoot"       ? "block" : "hidden"}><PreShoot onTabChange={setActiveTab} onLiveStateChange={setLivePreShoot} onGoToOnShoot={() => { setJumpToCurrent(true); setActiveTab("on-shoot") }} /></div>
            <div className={activeTab === "on-shoot"        ? "block" : "hidden"}><OnShoot livePreShoot={livePreShoot} jumpToCurrent={jumpToCurrent} onJumpHandled={() => setJumpToCurrent(false)} sidebarSession={sidebarSession} onSidebarSessionHandled={() => setSidebarSession(null)} /></div>
            <div className={activeTab === "post-correction" ? "block" : "hidden"}><PostCorrection /></div>
          </div>
        </div>
      </main>
      <div className="desktop-only">
        <StatusBar processingState="Ready" />
      </div>
      <div className="mobile-only">
        <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}
