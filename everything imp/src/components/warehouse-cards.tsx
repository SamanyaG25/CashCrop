"use client"

import { Building2, Leaf, Zap, BarChart3, Thermometer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { warehouseData } from "@/lib/mock-data"

export function WarehouseCards() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">H-E-B Texas Cold Chain Network</h3>
        <span className="text-xs text-muted-foreground">3 distribution nodes · 46,600 units managed</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {warehouseData.map((wh) => {
          // Map to HEB Texas locations
          const hebName = wh.id === "WH-OAK"
            ? "H-E-B Austin DC"
            : wh.id === "WH-CHI"
            ? "H-E-B San Antonio Hub"
            : "H-E-B Houston Node"
          const hebLocation = wh.id === "WH-OAK"
            ? "Austin, TX"
            : wh.id === "WH-CHI"
            ? "San Antonio, TX"
            : "Houston, TX"

          return (
            <Card key={wh.id} className="border-border bg-card hover:border-primary/40 transition-colors duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground leading-tight">{hebName}</CardTitle>
                      <p className="text-[11px] text-muted-foreground">{hebLocation}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">{wh.id}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Efficiency bar */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BarChart3 className="h-3 w-3" /> Efficiency Score
                    </span>
                    <span className={`text-xs font-bold ${wh.efficiency_score >= 88 ? "text-primary" : wh.efficiency_score >= 80 ? "text-warning" : "text-muted-foreground"}`}>
                      {wh.efficiency_score}%
                    </span>
                  </div>
                  <Progress value={wh.efficiency_score} />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-primary/8 border border-primary/15 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="h-3 w-3 text-primary" />
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Saved</span>
                    </div>
                    <p className="text-sm font-bold text-primary">${wh.savings_usd.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-chart-2/8 border border-chart-2/15 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Leaf className="h-3 w-3 text-chart-2" />
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">CO₂</span>
                    </div>
                    <p className="text-sm font-bold text-chart-2">{wh.carbon_saved_kg.toLocaleString()} kg</p>
                  </div>
                  <div className="rounded-lg bg-secondary border border-border p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Thermometer className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Peak Avoided</span>
                    </div>
                    <p className="text-sm font-bold text-foreground">{wh.peak_avoided_kw} kW</p>
                  </div>
                  <div className="rounded-lg bg-secondary border border-border p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BarChart3 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Items</span>
                    </div>
                    <p className="text-sm font-bold text-foreground">{wh.items_count.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
