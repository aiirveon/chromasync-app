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

type TabType = "pre-shoot" | "on-shoot" | "post-correction"

const tabLabels: Record<TabType, string> = {
  "pre-shoot": "Pre-Shoot",
  "on-shoot": "On-Shoot",
  "post-correction": "Post Correction",
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("pre-shoot")
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
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
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-[#555] text-sm">Loading...</div>
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
        />
      </div>
      <div className="mobile-only">
        <MobileHeader currentModule={tabLabels[activeTab]} />
      </div>
      <main className="main-content">
        <div className="content-wrapper">
          <div className="section-stack">
            <div className={activeTab === "pre-shoot"       ? "block" : "hidden"}><PreShoot onTabChange={setActiveTab} /></div>
            <div className={activeTab === "on-shoot"        ? "block" : "hidden"}><OnShoot /></div>
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
