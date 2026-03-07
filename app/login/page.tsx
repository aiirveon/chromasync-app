"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!email) return
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message) } else { setSent(true) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-10">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="16" stroke="#f97316" strokeWidth="2" fill="none" />
            <circle cx="18" cy="18" r="8" stroke="#f97316" strokeWidth="1.5" fill="none" />
            <line x1="18" y1="2" x2="18" y2="10" stroke="#f97316" strokeWidth="1.5" />
            <line x1="18" y1="26" x2="18" y2="34" stroke="#f97316" strokeWidth="1.5" />
            <line x1="2" y1="18" x2="10" y2="18" stroke="#f97316" strokeWidth="1.5" />
            <line x1="26" y1="18" x2="34" y2="18" stroke="#f97316" strokeWidth="1.5" />
          </svg>
          <span className="text-xl font-semibold text-[#f0f0f0] tracking-wide">ChromaSync</span>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-8">
          {!sent ? (
            <>
              <h1 className="text-[#f0f0f0] text-xl font-semibold mb-1">Sign in</h1>
              <p className="text-[#888] text-sm mb-6">Enter your email and we will send you a magic link. No password needed.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#888] mb-1.5 uppercase tracking-wider">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="you@example.com"
                    className="w-full bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg px-4 py-3 text-[#f0f0f0] text-sm placeholder:text-[#555] focus:outline-none focus:border-[#f97316] transition-colors"
                  />
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  onClick={handleLogin}
                  disabled={loading || !email}
                  className="w-full bg-[#f97316] hover:bg-[#ea6c0a] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors text-sm"
                >
                  {loading ? "Sending..." : "Send magic link"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-[#f0f0f0] font-semibold mb-2">Check your email</h2>
              <p className="text-[#888] text-sm">We sent a magic link to <span className="text-[#f0f0f0]">{email}</span></p>
              <p className="text-[#555] text-xs mt-3">Click the link in the email to sign in.</p>
              <button onClick={() => { setSent(false); setEmail("") }} className="mt-6 text-xs text-[#f97316] hover:underline">
                Use a different email
              </button>
            </div>
          )}
        </div>
        <p className="text-center text-[#555] text-xs mt-6">AI colour intelligence for indie filmmakers</p>
      </div>
    </div>
  )
}
