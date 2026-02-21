"use client"

import { useState } from "react"
import {
  ArrowDownRight, Snowflake, Tag, Heart, AlertCircle, CheckCircle,
  Zap, Check, X, Pencil, RotateCcw, Building2, DollarSign, Leaf,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { OptimizationResult } from "@/lib/mock-data"

const actionConfig: Record<string, { icon: React.ReactNode; label: string; className: string; darkIcon: string }> = {
  maintain:      { icon: <CheckCircle className="h-3.5 w-3.5" />,  label: "Maintain",       className: "border-primary/30 bg-primary/10 text-primary",                       darkIcon: "✅" },
  reduce_cooling:{ icon: <Snowflake  className="h-3.5 w-3.5" />,   label: "Reduce Cooling", className: "border-info/30 bg-info/10 text-info",                                darkIcon: "❄️" },
  discount:      { icon: <Tag         className="h-3.5 w-3.5" />,   label: "Discount",       className: "border-warning/30 bg-warning/10 text-warning",                       darkIcon: "🏷️" },
  donate:        { icon: <Heart       className="h-3.5 w-3.5" />,   label: "Donate",         className: "border-chart-2/30 bg-chart-2/10 text-chart-2",                       darkIcon: "💚" },
  urgent_sale:   { icon: <AlertCircle className="h-3.5 w-3.5" />,   label: "Urgent Sale",    className: "bg-destructive text-destructive-foreground border-transparent",       darkIcon: "🚨" },
  grid_recovery: { icon: <Zap         className="h-3.5 w-3.5" />,   label: "Grid Recovery",  className: "border-warning/40 bg-warning/15 text-warning",                       darkIcon: "⚡" },
}

interface OptimizationPanelProps {
  results:   OptimizationResult[]
  onDecision?: (sku_id: string, decision: "accepted"|"rejected"|"modified", modifiedText?: string) => void
}

export function OptimizationPanel({ results, onDecision }: OptimizationPanelProps) {
  // Local override map: sku_id → status
  const [statuses, setStatuses]     = useState<Record<string,OptimizationResult["action_status"]>>({})
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editText, setEditText]     = useState("")
  const [overrides, setOverrides]   = useState<Record<string, string>>({})

  const getStatus = (id: string) => statuses[id] ?? "pending"

  const decide = (id: string, name: string, action: string, savings: number, decision: "accepted"|"rejected") => {
    setStatuses(s => ({ ...s, [id]: decision }))
    onDecision?.(id, decision)
  }

  const startEdit  = (r: OptimizationResult) => { setEditingId(r.sku_id); setEditText(overrides[r.sku_id] ?? r.discount_trigger) }
  const saveEdit   = (id: string, savings: number) => {
    setOverrides(o => ({ ...o, [id]: editText }))
    setStatuses(s => ({ ...s, [id]: "modified" }))
    onDecision?.(id, "modified", editText)
    setEditingId(null)
  }
  const resetItem  = (id: string) => { setStatuses(s => ({ ...s, [id]: "pending" })); setOverrides(o => { const n={...o}; delete n[id]; return n }) }

  const pending  = results.filter(r => getStatus(r.sku_id) === "pending").length
  const accepted = results.filter(r => getStatus(r.sku_id) === "accepted").length
  const rejected = results.filter(r => getStatus(r.sku_id) === "rejected").length
  const modified = results.filter(r => getStatus(r.sku_id) === "modified").length

  const activeSavings   = results.filter(r => getStatus(r.sku_id) !== "rejected").reduce((a,r) => a + r.expected_energy_savings, 0)
  const activeCarbon    = results.filter(r => getStatus(r.sku_id) !== "rejected").reduce((a,r) => a + r.carbon_reduction_kg, 0)
  const activeTaxCredit = results.filter(r => getStatus(r.sku_id) !== "rejected").reduce((a,r) => a + r.tax_credit_usd, 0)
  const activeGridRev   = results.filter(r => getStatus(r.sku_id) !== "rejected").reduce((a,r) => a + r.grid_revenue_usd, 0)
  const activeRevenue   = results.filter(r => getStatus(r.sku_id) !== "rejected").reduce((a,r) => a + r.revenue_protected, 0)
  const maxCarbon       = Math.max(...results.map(r => r.carbon_reduction_kg), 1)

  return (
    <div className="flex flex-col gap-4">
      {/* ── Summary bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Energy Savings", value: `$${activeSavings.toLocaleString()}`, color: "text-primary",   icon: <Zap className="h-3.5 w-3.5" /> },
          { label: "CO₂ Avoided",    value: `${activeCarbon} kg`,                color: "text-chart-2",   icon: <Leaf className="h-3.5 w-3.5" /> },
          { label: "Tax Credits",    value: `$${activeTaxCredit.toLocaleString()}`, color: "text-warning", icon: <Heart className="h-3.5 w-3.5" /> },
          { label: "Grid Revenue",   value: `$${activeGridRev.toLocaleString()}`,   color: "text-info",    icon: <Zap className="h-3.5 w-3.5" /> },
          { label: "Rev Protected",  value: `$${activeRevenue.toLocaleString()}`,   color: "text-chart-4", icon: <DollarSign className="h-3.5 w-3.5" /> },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-3">
            <div className={`flex items-center gap-1.5 ${s.color} mb-1`}>{s.icon}<span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</span></div>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Decision tracker ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-muted-foreground">{results.length} SKUs:</span>
        {[["pending","border-border text-muted-foreground",pending],["accepted","border-primary/30 text-primary bg-primary/8",accepted],["modified","border-warning/30 text-warning bg-warning/8",modified],["rejected","border-destructive/30 text-destructive bg-destructive/8",rejected]].map(([k,cls,n]) => (
          n > 0 && <span key={k as string} className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>{n} {k as string}</span>
        ))}
        {(accepted+modified+rejected) > 0 && (
          <button onClick={() => setStatuses({})} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> Reset all
          </button>
        )}
      </div>

      {/* ── Per-SKU cards ── */}
      <div className="flex flex-col gap-3">
        {results.map((result) => {
          const config = actionConfig[result.action] ?? actionConfig.maintain
          const status = getStatus(result.sku_id)
          const isDonate = result.action === "donate"
          const isGrid   = result.action === "grid_recovery"

          return (
            <Card key={result.sku_id} className={`border transition-all duration-200 ${
              status === "accepted" ? "border-primary/40 bg-primary/5"
              : status === "rejected" ? "border-border bg-card opacity-50"
              : status === "modified" ? "border-warning/40 bg-warning/5"
              : "border-border bg-card"
            }`}>
              <CardContent className="p-4 flex flex-col gap-3">
                {/* ── Top row ── */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 flex-wrap">
                    <Badge variant="outline" className={config.className}>
                      {config.icon}
                      <span className="ml-1">{config.label}</span>
                    </Badge>
                    <div>
                      <span className="font-semibold text-foreground text-sm">{result.name}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">{result.sku_id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === "pending" ? (
                      <>
                        <button onClick={() => decide(result.sku_id, result.name, result.action, result.expected_energy_savings, "accepted")}
                          className="flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/30 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">
                          <Check className="h-3 w-3" /> Accept
                        </button>
                        <button onClick={() => startEdit(result)}
                          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                          <Pencil className="h-3 w-3" /> Modify
                        </button>
                        <button onClick={() => decide(result.sku_id, result.name, result.action, result.expected_energy_savings, "rejected")}
                          className="flex items-center gap-1 rounded-lg border border-destructive/30 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                          <X className="h-3 w-3" /> Reject
                        </button>
                      </>
                    ) : (
                      <button onClick={() => resetItem(result.sku_id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <RotateCcw className="h-3 w-3" />
                        {status === "accepted" ? "✓ Accepted" : status === "rejected" ? "✗ Rejected" : "~ Modified"}
                      </button>
                    )}
                    <span className="font-mono text-sm font-bold text-primary">
                      −${result.expected_energy_savings.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* ── Modify inline editor ── */}
                {editingId === result.sku_id && (
                  <div className="rounded-xl border border-warning/40 bg-warning/8 p-3 space-y-2">
                    <p className="text-xs font-semibold text-warning">Edit action instruction:</p>
                    <textarea rows={2} value={editText} onChange={e => setEditText(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(result.sku_id, result.expected_energy_savings)}
                        className="rounded-lg bg-warning/20 border border-warning/40 px-3 py-1 text-xs font-semibold text-warning hover:bg-warning/30 transition-colors">
                        Save override
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Detail grid ── */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="flex items-start gap-2">
                    <Snowflake className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Cooling</p>
                      <p className="text-xs font-medium text-foreground">{result.cooling_adjustment}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Action</p>
                      <p className="text-xs font-medium text-foreground">
                        {overrides[result.sku_id] ?? result.discount_trigger}
                        {overrides[result.sku_id] && <span className="ml-1 text-warning text-[10px]">(modified)</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Compressor</p>
                      <p className="text-xs font-medium text-foreground">{result.compressor_schedule}</p>
                    </div>
                  </div>
                </div>

                {/* ── Metrics bar ── */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 border-t border-border/60">
                  <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">CO₂:</span>
                    <Progress value={(result.carbon_reduction_kg / maxCarbon) * 100} className="h-1.5 flex-1" />
                    <span className="font-mono text-[10px] text-chart-2 whitespace-nowrap">{result.carbon_reduction_kg} kg</span>
                  </div>

                  {isDonate && result.tax_credit_usd > 0 && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-chart-2/10 border border-chart-2/25 px-2.5 py-1">
                      <Heart className="h-3 w-3 text-chart-2" />
                      <span className="text-[10px] font-semibold text-chart-2">
                        Tax credit: ${result.tax_credit_usd.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {isDonate && result.food_bank && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{result.food_bank}</span>
                    </div>
                  )}

                  {result.grid_recovery_kwh > 0 && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-warning/10 border border-warning/25 px-2.5 py-1">
                      <Zap className="h-3 w-3 text-warning" />
                      <span className="text-[10px] font-semibold text-warning">
                        ERCOT: {result.grid_recovery_kwh} kWh → ${result.grid_revenue_usd}
                      </span>
                    </div>
                  )}

                  {result.revenue_protected > 0 && (
                    <div className="flex items-center gap-1">
                      <ArrowDownRight className="h-3 w-3 text-primary" />
                      <span className="text-[10px] text-muted-foreground">Revenue: ${result.revenue_protected.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
