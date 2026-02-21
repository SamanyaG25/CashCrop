"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sprout, Eye, EyeOff, ArrowRight, Zap, Leaf, DollarSign } from "lucide-react"

const DEMO_CREDENTIALS = { email: "demo@heb.com", password: "cashcrop2026" }

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))

    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      try { localStorage.setItem("cashcrop-authed", "1") } catch {}
      const onboarded = localStorage.getItem("cashcrop-onboarded")
      router.push(onboarded ? "/dashboard" : "/onboarding")
    } else {
      setError("Invalid credentials. Try demo@heb.com / cashcrop2026")
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setError("")
  }

  const stats = [
    { icon: <DollarSign className="h-4 w-4" />, value: "$7,100", label: "Saved this week" },
    { icon: <Leaf className="h-4 w-4" />       , value: "3,630 kg",label: "CO₂ avoided" },
    { icon: <Zap className="h-4 w-4" />        , value: "1,040 kW", label: "Peak load avoided" },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Left panel — branding ── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 h-48 w-48 rounded-full bg-white/8 blur-2xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">CashCrop</p>
            <p className="text-xs text-primary-foreground/70 tracking-widest uppercase">AI Energy Intelligence</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/60">
              c0mpiled × Texas Venture Group · 2026
            </p>
            <h1 className="text-4xl font-bold leading-tight">
              Turn cold chain energy into competitive advantage
            </h1>
            <p className="text-base text-primary-foreground/75 leading-relaxed max-w-md">
              CashCrop tells you exactly when to discount, donate, or shift your refrigeration load — with live ERCOT grid pricing and automated tax credit calculation.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-primary-foreground/60">
                  {s.icon}
                  <span className="text-xs uppercase tracking-wider">{s.label}</span>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Partner badges */}
          <div className="flex flex-wrap gap-2">
            {["H-E-B Partner Dataset", "ERCOT Grid Live", "IRS §170(e)(3) Credits", "Texas Food Banks"].map(b => (
              <span key={b} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-primary-foreground/40">
          Built in Austin, TX · Powered by Morph AI · Patent pending
        </p>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Sprout className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">CashCrop</p>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your H-E-B supply chain dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          {/* Demo shortcut */}
          <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground">🚀 Hackathon Demo Access</p>
            <p className="text-xs text-muted-foreground font-mono">demo@heb.com / cashcrop2026</p>
            <button
              onClick={fillDemo}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Auto-fill credentials →
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            SSO enterprise login available for H-E-B supply chain teams
          </p>
        </div>
      </div>
    </div>
  )
}
