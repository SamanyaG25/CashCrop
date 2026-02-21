"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Sprout, Play, Loader2, Zap, Key, Database,
  ChevronDown, ChevronUp, Download, CheckCircle, LogOut,
} from "lucide-react"
import { Header } from "@/components/header"
import { KpiCards } from "@/components/kpi-cards"
import { EnergyPriceChart } from "@/components/energy-price-chart"
import { SavingsChart } from "@/components/savings-chart"
import { InventoryTable } from "@/components/inventory-table"
import { OptimizationPanel } from "@/components/optimization-panel"
import { WarehouseCards } from "@/components/warehouse-cards"
import { CsvUpload } from "@/components/csv-upload"
import { AiPromptViewer } from "@/components/ai-prompt-viewer"
import { EsgReport } from "@/components/esg-report"
import { AuditLog } from "@/components/audit-log"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  inventoryData, optimizationResults, energyPriceData,
  type InventoryItem, type OptimizationResult, type AuditEntry,
} from "@/lib/mock-data"
import { runOptimization, generateOptimizationPrompt } from "@/lib/optimization-engine"

const HEB_DEMO_CSV = `sku_id,name,quantity,expiry_date,storage_temp_f,kwh_per_hour,warehouse,category
HEB-DAIRY-001,H-E-B Select Greek Yogurt (32oz),2400,2026-02-21,38,0.14,WH-AUS,dairy
HEB-PROD-042,H-E-B Organics Bagged Salad,1800,2026-02-22,34,0.18,WH-AUS,produce
HEB-MEAT-019,H-E-B Ground Beef 80/20 (1lb),950,2026-02-23,32,0.22,WH-AUS,meat
HEB-DAIRY-088,H-E-B Shredded Mozzarella,3100,2026-03-06,38,0.12,WH-SAT,dairy
HEB-JUICE-003,H-E-B OJ Concentrate,2200,2026-02-25,35,0.09,WH-SAT,beverage
HEB-MEAT-044,H-E-B Chicken Breast (2lb),1600,2026-02-22,30,0.24,WH-SAT,meat
HEB-PROD-091,H-E-B Hass Avocados (bag),4200,2026-02-23,45,0.08,WH-HOU,produce
HEB-BVEG-007,H-E-B Frozen Broccoli Florets,3200,2026-08-20,0,0.31,WH-AUS,frozen
HEB-DELI-012,H-E-B Rotisserie Chicken,420,2026-02-21,36,0.19,WH-AUS,meat
HEB-BKRY-033,H-E-B Scratch Bakery Bread,880,2026-02-22,65,0.04,WH-HOU,bakery`

export default function DashboardPage() {
  const router = useRouter()

  // Auth guard
  useEffect(() => {
    try {
      if (!localStorage.getItem("cashcrop-authed")) router.replace("/login")
    } catch {}
  }, [router])

  const [inventory, setInventory]           = useState<InventoryItem[]>(inventoryData)
  const [results, setResults]               = useState<OptimizationResult[]>(optimizationResults)
  const [isOptimizing, setIsOptimizing]     = useState(false)
  const [hasOptimized, setHasOptimized]     = useState(true)
  const [morphApiKey, setMorphApiKey]       = useState(() => { try { return localStorage.getItem("cashcrop-morphkey") ?? "" } catch { return "" } })
  const [showApiInput, setShowApiInput]     = useState(false)
  const [dataInput, setDataInput]           = useState(HEB_DEMO_CSV)
  const [showDataInput, setShowDataInput]   = useState(false)
  const [morphStatus, setMorphStatus]       = useState<"idle"|"success"|"fallback">("idle")
  const [auditLog, setAuditLog]             = useState<AuditEntry[]>([])
  const dataRef = useRef<HTMLTextAreaElement>(null)

  const prompt = useMemo(() => generateOptimizationPrompt(inventory), [inventory])

  const saveMorphKey = (key: string) => {
    setMorphApiKey(key)
    try { localStorage.setItem("cashcrop-morphkey", key) } catch {}
  }

  // Parse CSV or JSON from the data input area
  const parseDataInput = useCallback((raw: string): InventoryItem[] | null => {
    try { const p = JSON.parse(raw); if (Array.isArray(p)) return p as InventoryItem[] } catch {}
    try {
      const lines   = raw.trim().split("\n").filter(Boolean)
      const headers = lines[0].split(",").map(h => h.trim())
      const now     = new Date("2026-02-20")
      return lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim())
        const row: Record<string,string> = {}
        headers.forEach((h,i) => { row[h] = vals[i] ?? "" })
        const expiryDate  = row.expiry_date || "2026-03-01"
        const expiry      = new Date(expiryDate)
        const diffDays    = Math.max(1, Math.ceil((expiry.getTime() - now.getTime()) / 86400000))
        const risk: InventoryItem["spoilage_risk"] =
          diffDays <= 1 ? "critical" : diffDays <= 3 ? "high" : diffDays <= 7 ? "medium" : "low"
        return {
          sku_id:            row.sku_id || "SKU-000",
          name:              row.name || "Unknown Product",
          quantity:          parseInt(row.quantity) || 0,
          expiry_date:       expiryDate,
          days_until_expiry: diffDays,
          storage_temp_f:    parseInt(row.storage_temp_f) || 38,
          kwh_per_hour:      parseFloat(row.kwh_per_hour) || 0.1,
          spoilage_risk:     risk,
          warehouse:         row.warehouse || "WH-UPLOAD",
          category:          row.category,
        }
      })
    } catch {}
    return null
  }, [])

  const handleCsvUpload = useCallback((rows: Record<string, string>[]) => {
    const now = new Date("2026-02-20")
    const parsed: InventoryItem[] = rows.map((row) => {
      const expiryDate  = row.expiry_date || "2026-03-01"
      const expiry      = new Date(expiryDate)
      const diffDays    = Math.max(1, Math.ceil((expiry.getTime() - now.getTime()) / 86400000))
      const risk: InventoryItem["spoilage_risk"] =
        diffDays <= 1 ? "critical" : diffDays <= 3 ? "high" : diffDays <= 7 ? "medium" : "low"
      return {
        sku_id:            row.sku_id || "SKU-000",
        name:              row.name || "Unknown",
        quantity:          parseInt(row.quantity) || 0,
        expiry_date:       expiryDate,
        days_until_expiry: diffDays,
        storage_temp_f:    parseInt(row.storage_temp_f) || 38,
        kwh_per_hour:      parseFloat(row.kwh_per_hour) || 0.1,
        spoilage_risk:     risk,
        warehouse:         row.warehouse || "WH-UPLOAD",
        category:          row.category,
      }
    })
    setInventory(parsed)
    setHasOptimized(false)
    setMorphStatus("idle")
  }, [])

  const handleOptimize = useCallback(async () => {
    setIsOptimizing(true)
    setMorphStatus("idle")

    // Parse data input if populated
    if (dataInput.trim()) {
      const parsed = parseDataInput(dataInput)
      if (parsed && parsed.length > 0) setInventory(parsed)
    }

    // Try Morph API route
    try {
      const currentHour = new Date().getHours()
      const isPeak      = [16,17,18,19,20].includes(currentHour)
      const currentPrice = energyPriceData[Math.floor(currentHour / 2)]?.price_kwh ?? 0.18
      const morphInventory = inventory.map(i => ({
        sku: i.sku_id, name: i.name, units: i.quantity, expiry: i.days_until_expiry,
        tempF: i.storage_temp_f, kwhPerHour: i.kwh_per_hour, warehouse: i.warehouse, category: i.category,
      }))
      if (morphApiKey) {
        const res = await fetch("/api/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inventory: morphInventory,
            energyPricing: { currentPriceKwh: currentPrice, isPeak, peakWindow: "4 PM–8 PM", offPeakWindow: "12 AM–5 AM", carbonIntensity: isPeak ? 385 : 198 },
            morphApiKey,
          }),
        })
        setMorphStatus(res.ok ? "success" : "fallback")
      } else {
        setMorphStatus("fallback")
      }
    } catch { setMorphStatus("fallback") }

    await new Promise(r => setTimeout(r, morphApiKey ? 400 : 1200))
    const optimized = runOptimization(inventory)
    setResults(optimized)
    setHasOptimized(true)
    setIsOptimizing(false)
  }, [inventory, morphApiKey, dataInput, parseDataInput])

  const handleDecision = useCallback((sku_id: string, decision: "accepted"|"rejected"|"modified", modifiedText?: string) => {
    const result = results.find(r => r.sku_id === sku_id)
    if (!result) return
    const entry: AuditEntry = {
      id:          `${sku_id}-${Date.now()}`,
      timestamp:   new Date().toLocaleTimeString(),
      sku_id,
      sku_name:    result.name,
      action:      result.action + (modifiedText ? ` → "${modifiedText}"` : ""),
      decision,
      user:        "demo@heb.com",
      savings_usd: result.expected_energy_savings,
    }
    setAuditLog(prev => [...prev, entry])
  }, [results])

  const exportCSV = () => {
    const headers = ["SKU","Name","Action","Energy Savings ($)","Carbon (kg)","Tax Credit ($)","Grid kWh","Grid Rev ($)","Revenue ($)","Status"]
    const rows    = results.map(r => [r.sku_id, `"${r.name}"`, r.action, r.expected_energy_savings, r.carbon_reduction_kg, r.tax_credit_usd, r.grid_recovery_kwh, r.grid_revenue_usd, r.revenue_protected, r.action_status])
    const csv     = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob    = new Blob([csv], { type: "text/csv" })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement("a")
    a.href = url; a.download = "cashcrop-optimization.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const signOut = () => {
    try { localStorage.removeItem("cashcrop-authed") } catch {}
    router.push("/login")
  }

  const criticalCount = inventory.filter(i => i.spoilage_risk === "critical").length
  const totalTaxCredit = results.reduce((a,r) => a + r.tax_credit_usd, 0)
  const totalGridRev   = results.reduce((a,r) => a + r.grid_revenue_usd, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">

          {/* ── Hero Banner ─────────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/8 p-5 md:p-6">
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Sprout className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">AI Energy Intelligence</h2>
                    <span className="rounded-full bg-accent/30 border border-accent/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-foreground">H-E-B Dataset</span>
                    {morphStatus === "success" && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/15 border border-primary/30 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        <CheckCircle className="h-3 w-3" /> Morph AI
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground max-w-lg">
                    Shift refrigeration loads, prevent spoilage, and sell demand response back to ERCOT — all from one dashboard.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {criticalCount > 0 && (
                      <span className="text-xs font-semibold text-destructive">⚠ {criticalCount} SKU{criticalCount>1?"s":""} expiring in &lt;24h</span>
                    )}
                    {totalTaxCredit > 0 && (
                      <span className="text-xs font-semibold text-chart-2">💚 ${totalTaxCredit.toLocaleString()} in tax credits available</span>
                    )}
                    {totalGridRev > 0 && (
                      <span className="text-xs font-semibold text-warning">⚡ ${totalGridRev.toLocaleString()} ERCOT sellback identified</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold shadow-md"
                  onClick={handleOptimize} disabled={isOptimizing}>
                  {isOptimizing
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Optimizing...</>
                    : <><Play className="mr-2 h-4 w-4"/>Run AI Optimization</>}
                </Button>
                <div className="flex gap-2">
                  {hasOptimized && (
                    <Button size="sm" variant="outline" onClick={exportCSV} className="flex-1 rounded-xl text-xs">
                      <Download className="mr-1.5 h-3.5 w-3.5"/>Export CSV
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={signOut} className="flex-1 rounded-xl text-xs text-muted-foreground">
                    <LogOut className="mr-1.5 h-3.5 w-3.5"/>Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── API Key + Data Input ─────────────────── */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-border">
              <button className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => setShowApiInput(v => !v)}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Key className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Morph API Key</p>
                    <p className="text-xs text-muted-foreground">{morphApiKey ? "Key saved ✓" : "Optional — rule engine active"}</p>
                  </div>
                </div>
                {showApiInput ? <ChevronUp className="h-4 w-4 text-muted-foreground"/> : <ChevronDown className="h-4 w-4 text-muted-foreground"/>}
              </button>
              {showApiInput && (
                <div className="px-4 pb-4 space-y-2">
                  <input type="password" placeholder="sk-morph-..." value={morphApiKey}
                    onChange={e => saveMorphKey(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-[11px] text-muted-foreground">Sent only to your /api/optimize route. Saved to localStorage.</p>
                </div>
              )}
            </Card>

            <Card className="border-border">
              <button className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => setShowDataInput(v => !v)}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/30">
                    <Database className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Dataset Input</p>
                    <p className="text-xs text-muted-foreground">Paste CSV or JSON — H-E-B demo pre-loaded</p>
                  </div>
                </div>
                {showDataInput ? <ChevronUp className="h-4 w-4 text-muted-foreground"/> : <ChevronDown className="h-4 w-4 text-muted-foreground"/>}
              </button>
              {showDataInput && (
                <div className="px-4 pb-4 space-y-2">
                  <textarea ref={dataRef} rows={6} value={dataInput} onChange={e => setDataInput(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                    placeholder="Paste CSV or JSON inventory data here…"
                  />
                  <p className="text-[11px] text-muted-foreground">Parsed on next &quot;Run AI Optimization&quot; click.</p>
                </div>
              )}
            </Card>
          </div>

          {/* ── KPI Row ─────────────────────────────── */}
          <KpiCards />

          {/* ── Charts ──────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <EnergyPriceChart />
            <SavingsChart />
          </div>

          {/* ── Tabs ────────────────────────────────── */}
          <Tabs defaultValue="optimization" className="flex flex-col gap-4">
            <TabsList className="w-fit flex-wrap">
              <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
              <TabsTrigger value="esg">ESG Report</TabsTrigger>
              <TabsTrigger value="audit">Audit Log {auditLog.length > 0 && `(${auditLog.length})`}</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
              <TabsTrigger value="upload">Upload & Prompt</TabsTrigger>
            </TabsList>

            <TabsContent value="optimization">
              {hasOptimized ? (
                <OptimizationPanel results={results} onDecision={handleDecision} />
              ) : (
                <Card className="border-border bg-card">
                  <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
                    <div className="flex items-center justify-center rounded-full bg-primary/10 p-4">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">New inventory loaded</p>
                      <p className="mt-1 text-sm text-muted-foreground">Click &quot;Run AI Optimization&quot; to generate decisions.</p>
                    </div>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                      onClick={handleOptimize} disabled={isOptimizing}>
                      {isOptimizing
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Running...</>
                        : <><Play className="mr-2 h-4 w-4"/>Run Optimization</>}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="esg">
              <EsgReport results={results} inventory={inventory} />
            </TabsContent>

            <TabsContent value="audit">
              <AuditLog entries={auditLog} />
            </TabsContent>

            <TabsContent value="inventory">
              <InventoryTable data={inventory} />
            </TabsContent>

            <TabsContent value="warehouses">
              <WarehouseCards />
            </TabsContent>

            <TabsContent value="upload" className="flex flex-col gap-6">
              <CsvUpload onUpload={handleCsvUpload} />
              <AiPromptViewer prompt={prompt} />
            </TabsContent>
          </Tabs>

          {/* ── Footer ──────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left max-w-xl">
                <span className="font-bold text-foreground">CashCrop</span> makes food supply chains energy-intelligent and grid-aware.
                Shift cooling loads, accelerate sales, donate for tax credit, and sell ERCOT demand response — without any new hardware.
              </p>
              <div className="flex flex-wrap items-center gap-2 shrink-0 text-[10px]">
                <span className="rounded-full bg-accent/20 border border-accent/40 px-3 py-1 font-bold text-foreground">H-E-B Partnership</span>
                <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 font-bold text-primary">ERCOT Grid</span>
                <span className="rounded-full bg-chart-2/10 border border-chart-2/20 px-3 py-1 font-bold text-chart-2">IRS §170(e)(3)</span>
                <span className="rounded-full bg-secondary border border-border px-3 py-1 text-muted-foreground">c0mpiled × TVG 2026</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
