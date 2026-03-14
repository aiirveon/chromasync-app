"use client"

/**
 * Shared UI primitives for ChromaSync Story Mode.
 * All loading states come from here — edit once, updates everywhere.
 */

import React from "react"

// ─── Design tokens ────────────────────────────────────────────────────────────
// Change these to update every spinner/button in the app at once.

const SPINNER_SIZES = {
  sm: "10px",
  md: "13px",
  lg: "16px",
} as const

const SPINNER_THICKNESS = {
  sm: "1.5px",
  md: "2px",
  lg: "2.5px",
} as const

type SpinnerSize = keyof typeof SPINNER_SIZES

// ─── Spinner ──────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: SpinnerSize
  /** Defaults to currentColor so it inherits from the parent button */
  color?: string
}

export function Spinner({ size = "md", color }: SpinnerProps) {
  const dim = SPINNER_SIZES[size]
  const thickness = SPINNER_THICKNESS[size]
  const col = color ?? "currentColor"

  return (
    <>
      <span
        style={{
          display: "inline-block",
          flexShrink: 0,
          width: dim,
          height: dim,
          border: `${thickness} solid transparent`,
          borderTopColor: col,
          borderRightColor: col,
          borderRadius: "50%",
          animation: "cs-spin 0.65s linear infinite",
        }}
        aria-hidden="true"
      />
      <style>{`
        @keyframes cs-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

// ─── LoadingButton ────────────────────────────────────────────────────────────
// Drop-in replacement for any <button> that needs a loading state.
// Renders a spinner + label when loading, label only when idle.

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingLabel?: string
  spinnerSize?: SpinnerSize
  children: React.ReactNode
}

export function LoadingButton({
  loading = false,
  loadingLabel,
  spinnerSize = "md",
  children,
  disabled,
  style,
  ...rest
}: LoadingButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled ?? loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.45rem",
        opacity: loading ? 0.75 : 1,
        transition: "opacity 0.15s, background-color 0.15s",
        ...style,
      }}
    >
      {loading && <Spinner size={spinnerSize} />}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
    </button>
  )
}
