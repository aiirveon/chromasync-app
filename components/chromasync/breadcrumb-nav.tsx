"use client"

import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbNavProps {
  currentModule: string
}

export function BreadcrumbNav({ currentModule }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
      <Home className="w-3 h-3" />
      <ChevronRight className="w-3 h-3" />
      <span>Modules</span>
      <ChevronRight className="w-3 h-3" />
      <span className="text-foreground">{currentModule}</span>
    </nav>
  )
}
