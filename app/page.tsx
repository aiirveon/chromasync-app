"use client"

import { useState } from "react"
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

  return (
    <div className="app-shell film-grain">

      {/* Desktop sidebar — hidden on mobile via CSS class */}
      <div className="desktop-only">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile top header — hidden on desktop via CSS class */}
      <div className="mobile-only">
        <MobileHeader currentModule={tabLabels[activeTab]} />
      </div>

      {/* Main scrollable content */}
      <main className="main-content">
        <div className="content-wrapper">
          <div className="section-stack">
            {activeTab === "pre-shoot"      && <PreShoot />}
            {activeTab === "on-shoot"       && <OnShoot />}
            {activeTab === "post-correction" && <PostCorrection />}
          </div>
        </div>
      </main>

      {/* Desktop status bar — hidden on mobile via CSS class */}
      <div className="desktop-only">
        <StatusBar processingState="Ready" />
      </div>

      {/* Mobile bottom nav — hidden on desktop via CSS class */}
      <div className="mobile-only">
        <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

    </div>
  )
}
