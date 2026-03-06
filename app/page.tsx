"use client"

import { useState } from "react"
import { Sidebar } from "@/components/chromasync/sidebar"
import { PreShoot } from "@/components/chromasync/pre-shoot"
import { OnShoot } from "@/components/chromasync/on-shoot"
import { PostCorrection } from "@/components/chromasync/post-correction"
import { StatusBar } from "@/components/chromasync/status-bar"
import { BreadcrumbNav } from "@/components/chromasync/breadcrumb-nav"

type TabType = "pre-shoot" | "on-shoot" | "post-correction"

const tabLabels: Record<TabType, string> = {
  "pre-shoot": "Pre-Shoot",
  "on-shoot": "On-Shoot",
  "post-correction": "Post Correction",
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("pre-shoot")

  return (
    <div className="min-h-screen bg-background film-grain">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="ml-[220px] min-h-screen pb-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <BreadcrumbNav currentModule={tabLabels[activeTab]} />

          {/* Page Content */}
          {activeTab === "pre-shoot" && <PreShoot />}
          {activeTab === "on-shoot" && <OnShoot />}
          {activeTab === "post-correction" && <PostCorrection />}
        </div>
      </main>

      {/* Status Bar */}
      <StatusBar processingState="Ready" />
    </div>
  )
}
