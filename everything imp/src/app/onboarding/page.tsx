"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sprout, Building2, Sliders, Database, ChevronRight, ChevronLeft, Check } from "lucide-react"

const STEPS = [
  { id: 1, title: "Warehouse Setup",   icon: Building2, description: "Tell us about your cold storage network" },
  { id: 2, title: "AI Priorities",     icon: Sliders,   description: "Tune the optimization weighting" },
  { id: 3, title: "Connect Your Data", icon: Database,  description: "Sync inventory or use demo data" },
]

interface Prefs {
  warehouseCount: string
  totalUnits: string
  hasFrozen: boolean
  hasMeat: boolean
  hasProduce: boolean
  hasDairy: boolean
  priorityCost: number
  priorityCarbon: number
  prioritySpoilage: number
  priorityRevenue: number
  dataSource: "heb" | "csv" | "erp"
  morphKey: string
}

const DEFAULT_PREFS: Prefs = {
  warehouseCount: "3",
  totalUnits: "46600",
  hasFrozen: true,
  hasMeat: true,
  hasProduce: true,
  hasDairy: true,
  priorityCost: 35,
  priorityCarbon: 25,
  prioritySpoilage: 25,
  priorityRevenue: 15,
  dataSource: "heb",
  morphKey: "",
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep]   = useState(1)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)

  const update = (k: keyof Prefs, v: Prefs[keyof Prefs]) => setPrefs(p => ({ ...p, [k]: v }))

  const finish = () => {
    try {
      localStorage.setItem("cashcrop-onboarded", "1")
      localStorage.setItem("cashcrop-prefs", JSON.stringify(prefs))
    } catch {}
    router.push("/dashboard")
  }

  const totalPriority = prefs.priorityCost + prefs.priorityCarbon + prefs.prioritySpoilage + prefs.priorityRevenue

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card/60 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
            <Sprout className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="font-bold text-foreground">CashCrop</span>
        </div>
        <button onClick={() => { try { localStorage.setItem("cashcrop-onboarded","1") } catch {} router.push("/dashboard") }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Skip setup →
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl space-y-8">

          {/* Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                    step > s.id ? "border-primary bg-primary text-primary-foreground"
                    : step === s.id ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                  }`}>
                    {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 w-24 md:w-36 mx-2 transition-all ${step > s.id ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</p>
              <h2 className="text-xl font-bold text-foreground">{STEPS[step-1].title}</h2>
              <p className="text-sm text-muted-foreground">{STEPS[step-1].description}</p>
            </div>
          </div>

          {/* Step content */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">

            {/* ── Step 1: Warehouse Setup ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Number of warehouses</label>
                    <input type="number" min={1} max={50} value={prefs.warehouseCount}
                      onChange={e => update("warehouseCount", e.target.value)}
                      className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Total managed units</label>
                    <input type="number" value={prefs.totalUnits}
                      onChange={e => update("totalUnits", e.target.value)}
                      className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Food categories stored</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([["hasFrozen","❄️ Frozen"],["hasMeat","🥩 Meat & Poultry"],["hasProduce","🥬 Fresh Produce"],["hasDairy","🥛 Dairy"]] as [keyof Prefs, string][]).map(([k,label]) => (
                      <label key={k} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition-colors ${prefs[k] ? "border-primary/40 bg-primary/8" : "border-border"}`}>
                        <input type="checkbox" checked={prefs[k] as boolean} onChange={e => update(k, e.target.checked)} className="sr-only" />
                        <div className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${prefs[k] ? "border-primary bg-primary" : "border-border"}`}>
                          {prefs[k] && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                        </div>
                        <span className="text-sm text-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: AI Priorities ── */}
            {step === 2 && (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Adjust how the AI weighs competing objectives. Weights must sum to 100%.
                </p>
                {([
                  ["priorityCost",     "💰 Energy Cost Reduction", "Minimize electricity spend"],
                  ["priorityCarbon",   "🌿 Carbon / ESG",          "Reduce CO₂ for reporting"],
                  ["prioritySpoilage", "🚫 Spoilage Prevention",   "Protect inventory value"],
                  ["priorityRevenue",  "📈 Revenue Optimization",  "Maximize margin"],
                ] as [keyof Prefs, string, string][]).map(([k, label, sub]) => (
                  <div key={k} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      </div>
                      <span className="text-sm font-bold text-primary w-10 text-right">{prefs[k]}%</span>
                    </div>
                    <input type="range" min={5} max={60} value={prefs[k] as number}
                      onChange={e => update(k, parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                ))}
                <div className={`flex items-center justify-between rounded-xl px-4 py-2 text-sm font-semibold ${
                  totalPriority === 100 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                }`}>
                  <span>Total weight</span>
                  <span>{totalPriority}% {totalPriority === 100 ? "✓" : "(must be 100%)"}</span>
                </div>
              </div>
            )}

            {/* ── Step 3: Data Source ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="space-y-3">
                  {([
                    ["heb",  "🏪 H-E-B Demo Dataset",    "Pre-loaded Texas cold chain data — perfect for demo"],
                    ["csv",  "📄 Upload CSV",             "Drag & drop your own inventory file"],
                    ["erp",  "🔗 ERP/WMS Integration",   "SAP, Oracle, or custom API (configure post-onboarding)"],
                  ] as ["heb"|"csv"|"erp", string, string][]).map(([val, label, sub]) => (
                    <label key={val} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${prefs.dataSource === val ? "border-primary/40 bg-primary/8" : "border-border"}`}>
                      <input type="radio" name="dataSource" value={val} checked={prefs.dataSource === val}
                        onChange={() => update("dataSource", val)} className="sr-only" />
                      <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${prefs.dataSource === val ? "border-primary" : "border-border"}`}>
                        {prefs.dataSource === val && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Morph API Key (optional)</label>
                  <input type="password" placeholder="sk-morph-..." value={prefs.morphKey}
                    onChange={e => update("morphKey", e.target.value)}
                    className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground">Leave blank to use the built-in rule engine. You can add this later in settings.</p>
                </div>
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}

            {step < STEPS.length ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={finish}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Launch Dashboard <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
