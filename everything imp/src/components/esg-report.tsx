"use client"

import { useState } from "react"
import { Leaf, Heart, Zap, DollarSign, Download, Building2, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OptimizationResult, InventoryItem } from "@/lib/mock-data"

interface EsgReportProps {
  results:   OptimizationResult[]
  inventory: InventoryItem[]
}

export function EsgReport({ results, inventory }: EsgReportProps) {
  const [exporting, setExporting] = useState(false)

  const totalEnergy   = results.reduce((a,r) => a + r.expected_energy_savings, 0)
  const totalCarbon   = results.reduce((a,r) => a + r.carbon_reduction_kg, 0)
  const totalCredit   = results.reduce((a,r) => a + r.tax_credit_usd, 0)
  const totalGrid     = results.reduce((a,r) => a + r.grid_revenue_usd, 0)
  const totalRevenue  = results.reduce((a,r) => a + r.revenue_protected, 0)
  const donateItems   = results.filter(r => r.action === "donate")
  const gridItems     = results.filter(r => r.grid_recovery_kwh > 0)
  const totalGridKwh  = gridItems.reduce((a,r) => a + r.grid_recovery_kwh, 0)
  const donatedWeight = donateItems.reduce((a,r) => {
    const item = inventory.find(i => i.sku_id === r.sku_id)
    return a + ((item?.quantity ?? 0) * (item?.unit_weight_lbs ?? 1))
  }, 0)

  const exportReport = async () => {
    setExporting(true)
    await new Promise(r => setTimeout(r, 600))

    const now  = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString()
    const lines = [
      `CASHCROP ESG & FINANCIAL IMPACT REPORT`,
      `H-E-B Texas Cold Chain Network`,
      `Generated: ${now} ${time}`,
      ``,
      `━━━ ENERGY & CARBON ━━━`,
      `Total energy savings:       $${totalEnergy.toLocaleString()}`,
      `CO₂ avoided:                ${totalCarbon} kg`,
      `Grid load deferred (ERCOT): ${totalGridKwh} kWh`,
      `ERCOT demand response rev:  $${totalGrid.toLocaleString()}`,
      ``,
      `━━━ FOOD RESCUE & TAX ━━━`,
      `SKUs donated to food banks: ${donateItems.length}`,
      `Estimated food weight:      ${Math.round(donatedWeight).toLocaleString()} lbs`,
      `IRS §170(e)(3) tax credits: $${totalCredit.toLocaleString()}`,
      `Revenue protected (sales):  $${totalRevenue.toLocaleString()}`,
      ``,
      `━━━ PER-SKU BREAKDOWN ━━━`,
      `SKU ID,Name,Action,Energy $,Carbon kg,Tax Credit $,Grid kWh,Grid Rev $,Revenue $`,
      ...results.map(r =>
        [r.sku_id, `"${r.name}"`, r.action, r.expected_energy_savings, r.carbon_reduction_kg,
          r.tax_credit_usd, r.grid_recovery_kwh, r.grid_revenue_usd, r.revenue_protected].join(",")
      ),
      ``,
      `━━━ FOOD BANK DONATIONS ━━━`,
      ...donateItems.map(r => `${r.sku_id},${r.name},${r.food_bank},$${r.tax_credit_usd} credit`),
      ``,
      `━━━ ERCOT DEMAND RESPONSE ━━━`,
      ...gridItems.map(r => `${r.sku_id},${r.name},${r.grid_recovery_kwh} kWh deferred,$${r.grid_revenue_usd} revenue`),
    ]

    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = `cashcrop-esg-report-${now.replace(/\//g,"-")}.txt`; a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const metrics = [
    { icon: <Zap className="h-5 w-5 text-primary" />,     label: "Energy Savings",      value: `$${totalEnergy.toLocaleString()}`,   sub: `${results.reduce((a,r)=>a+r.grid_recovery_kwh,0)} kWh total`,  bg: "bg-primary/8 border-primary/20" },
    { icon: <Leaf className="h-5 w-5 text-chart-2" />,    label: "CO₂ Avoided",         value: `${totalCarbon} kg`,                  sub: `≈${Math.round(totalCarbon/24)} trees saved`,                   bg: "bg-chart-2/8 border-chart-2/20" },
    { icon: <Heart className="h-5 w-5 text-chart-2" />,   label: "Donation Tax Credits", value: `$${totalCredit.toLocaleString()}`,   sub: `${donateItems.length} SKUs · IRS §170(e)(3)`,                  bg: "bg-chart-2/8 border-chart-2/20" },
    { icon: <Zap className="h-5 w-5 text-warning" />,     label: "ERCOT Grid Revenue",   value: `$${totalGrid.toLocaleString()}`,    sub: `${totalGridKwh} kWh deferred to ERCOT`,                        bg: "bg-warning/8 border-warning/20" },
    { icon: <DollarSign className="h-5 w-5 text-chart-4" />, label: "Revenue Protected", value: `$${totalRevenue.toLocaleString()}`, sub: "spoilage prevented",                                           bg: "bg-chart-4/8 border-chart-4/20" },
    { icon: <Building2 className="h-5 w-5 text-info" />,  label: "Food Donated",         value: `${Math.round(donatedWeight).toLocaleString()} lbs`, sub: `${donateItems.length} items to TX food banks`,   bg: "bg-info/8 border-info/20" },
  ]

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold text-foreground">ESG & Financial Impact Report</CardTitle>
        </div>
        <button onClick={exportReport} disabled={exporting}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors disabled:opacity-60">
          {exporting ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Export Report
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Metric grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {metrics.map(m => (
            <div key={m.label} className={`rounded-xl border p-4 ${m.bg}`}>
              <div className="flex items-center gap-2 mb-2">{m.icon}<span className="text-xs text-muted-foreground font-medium">{m.label}</span></div>
              <p className="text-xl font-bold text-foreground">{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Donation detail */}
        {donateItems.length > 0 && (
          <div className="rounded-xl border border-chart-2/20 bg-chart-2/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-chart-2" />
              <p className="text-sm font-semibold text-foreground">Food Bank Donations</p>
            </div>
            <div className="flex flex-col gap-2">
              {donateItems.map(r => {
                const item = inventory.find(i => i.sku_id === r.sku_id)
                const lbs = Math.round((item?.quantity ?? 0) * (item?.unit_weight_lbs ?? 1))
                return (
                  <div key={r.sku_id} className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">{r.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{lbs.toLocaleString()} lbs → {r.food_bank}</span>
                      <span className="font-bold text-chart-2">${r.tax_credit_usd.toLocaleString()} credit</span>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between text-xs font-semibold border-t border-chart-2/20 pt-2 mt-1">
                <span className="text-foreground">Total IRS §170(e)(3) Credit</span>
                <span className="text-chart-2 text-sm">${totalCredit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* ERCOT grid detail */}
        {gridItems.length > 0 && (
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning" />
                <p className="text-sm font-semibold text-foreground">ERCOT Demand Response</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
                </span>
                <span className="text-[10px] font-semibold text-warning">Active event</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {gridItems.map(r => (
                <div key={r.sku_id} className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">{r.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{r.grid_recovery_kwh} kWh deferred</span>
                    <span className="font-bold text-warning">${r.grid_revenue_usd}/event</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs font-semibold border-t border-warning/20 pt-2 mt-1">
                <span className="text-foreground">Total sellback revenue</span>
                <span className="text-warning text-sm">${totalGrid.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground border-t border-border pt-3">
          Tax credit estimates based on IRS §170(e)(3) enhanced deduction rules. Consult a tax professional for exact figures.
          ERCOT sellback rates based on current demand response program pricing.
        </p>
      </CardContent>
    </Card>
  )
}
