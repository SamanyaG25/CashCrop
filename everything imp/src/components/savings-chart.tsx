"use client"

import {
  Bar, BarChart, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { weeklySavingsData } from "@/lib/mock-data"

export function SavingsChart() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Weekly Value Overview
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Energy savings + tax credits + ERCOT grid revenue — H-E-B Texas network
        </p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklySavingsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "currentColor", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fill: "currentColor", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                  fontSize: 11,
                }}
                labelStyle={{ color: "var(--muted-foreground)", marginBottom: 4 }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    energy_saved:      "Energy Saved",
                    tax_credits:       "Tax Credits",
                    grid_revenue:      "ERCOT Grid Rev",
                  }
                  return [`$${value.toLocaleString()}`, labels[name] ?? name]
                }}
              />
              <Bar dataKey="energy_saved"  fill="#0F5730" radius={[4, 4, 0, 0]} stackId="a" name="energy_saved" />
              <Bar dataKey="tax_credits"   fill="#e76fa3" radius={[0, 0, 0, 0]} stackId="a" name="tax_credits" />
              <Bar dataKey="grid_revenue"  fill="#d4972f" radius={[4, 4, 0, 0]} stackId="a" name="grid_revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Energy Saved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-chart-2" />
            <span className="text-xs text-muted-foreground">Tax Credits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">ERCOT Revenue</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
