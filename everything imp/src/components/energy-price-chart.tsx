"use client"

import {
  Area, AreaChart, XAxis, YAxis,
  CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { energyPriceData } from "@/lib/mock-data"

export function EnergyPriceChart() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-foreground">
            ERCOT Grid Pricing — 24h
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Texas real-time kWh cost and carbon intensity
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive text-[10px]">
            Peak: 4–8 PM
          </Badge>
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px]">
            $0.29/kWh peak
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={energyPriceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0F5730" stopOpacity={0.40} />
                  <stop offset="95%" stopColor="#0F5730" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#d4972f" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#d4972f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" vertical={false} className="dark:stroke-[rgba(255,255,255,0.07)]" />
              <XAxis
                dataKey="hour"
                tick={{ fill: "currentColor", fontSize: 11 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="price"
                tick={{ fill: "currentColor", fontSize: 11 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <YAxis
                yAxisId="carbon"
                orientation="right"
                tick={{ fill: "currentColor", fontSize: 11 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}g`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--muted-foreground)" }}
              />
              <ReferenceLine
                yAxisId="price"
                y={0.2}
                stroke="#c0392b"
                strokeDasharray="4 4"
                label={{ value: "Peak threshold", fill: "#c0392b", fontSize: 10, position: "insideTopRight" }}
              />
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="price_kwh"
                stroke="#0F5730"
                strokeWidth={2}
                fill="url(#priceGrad)"
                name="Price ($/kWh)"
              />
              <Area
                yAxisId="carbon"
                type="monotone"
                dataKey="carbon_intensity"
                stroke="#d4972f"
                strokeWidth={1.5}
                fill="url(#carbonGrad)"
                name="Carbon (g CO₂/kWh)"
                strokeDasharray="4 2"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Energy Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">Carbon Intensity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
