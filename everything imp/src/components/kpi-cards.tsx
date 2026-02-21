"use client"

import { useEffect, useState } from "react"
import { DollarSign, Leaf, BatteryCharging, ShieldCheck, Heart, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface KpiCardProps {
  title:       string
  value:       string
  subtitle:    string
  icon:        React.ReactNode
  trend:       string
  accentClass: string
  valueClass?: string
  badge?:      string
}

function KpiCard({ title, value, subtitle, icon, trend, accentClass, valueClass, badge }: KpiCardProps) {
  return (
    <Card className="border-border bg-card hover:border-primary/30 transition-colors duration-200">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</span>
          <div className={`flex items-center justify-center rounded-xl p-2 ${accentClass}`}>
            {icon}
          </div>
        </div>
        <div>
          <p className={`text-2xl font-bold tracking-tight ${valueClass ?? "text-foreground"}`}>
            {value}
          </p>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-primary">{trend}</span>
            <span className="text-xs text-muted-foreground">{subtitle}</span>
            {badge && (
              <span className="rounded-full bg-accent/20 border border-accent/30 px-1.5 py-0.5 text-[9px] font-bold text-foreground tracking-wide">
                {badge}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function useAnimatedCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let current = 0
    const step  = target / (duration / 16)
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else                   { setCount(Math.floor(current)) }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

export function KpiCards() {
  const savings   = useAnimatedCounter(7100)
  const carbon    = useAnimatedCounter(3630)
  const peak      = useAnimatedCounter(1040)
  const revenue   = useAnimatedCounter(36900)
  const taxCredit = useAnimatedCounter(11280)
  const gridRev   = useAnimatedCounter(2540)

  return (
    <div className="flex flex-col gap-4">
      {/* ── Primary row ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Energy Savings"
          value={`$${savings.toLocaleString()}`}
          subtitle="this week"
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          trend="+12.3%"
          accentClass="bg-primary/10"
          valueClass="text-primary"
        />
        <KpiCard
          title="Carbon Avoided"
          value={`${carbon.toLocaleString()} kg`}
          subtitle="CO₂ equivalent"
          icon={<Leaf className="h-4 w-4 text-chart-2" />}
          trend="+8.7%"
          accentClass="bg-chart-2/10"
          valueClass="text-chart-2"
        />
        <KpiCard
          title="Peak Load Avoided"
          value={`${peak.toLocaleString()} kW`}
          subtitle="ERCOT grid demand"
          icon={<BatteryCharging className="h-4 w-4 text-warning" />}
          trend="+15.1%"
          accentClass="bg-warning/10"
          valueClass="text-warning"
          badge="ERCOT DR"
        />
        <KpiCard
          title="Revenue Protected"
          value={`$${revenue.toLocaleString()}`}
          subtitle="spoilage prevented"
          icon={<ShieldCheck className="h-4 w-4 text-chart-4" />}
          trend="+6.4%"
          accentClass="bg-chart-4/10"
          valueClass="text-chart-4"
        />
      </div>

      {/* ── Secondary row — new metrics ── */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border bg-card border-chart-2/20 hover:border-chart-2/40 transition-colors duration-200">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-chart-2/10">
              <Heart className="h-5 w-5 text-chart-2" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Donation Tax Credits</p>
              <p className="text-2xl font-bold text-chart-2">${taxCredit.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">IRS §170(e)(3) enhanced deduction · 3 food banks active</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold text-primary">+18.2%</p>
              <p className="text-[10px] text-muted-foreground">vs last week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card border-warning/20 hover:border-warning/40 transition-colors duration-200">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warning/10">
              <Zap className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ERCOT Grid Revenue</p>
              <p className="text-2xl font-bold text-warning">${gridRev.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Demand response sellback · $0.22/kWh · peak window active</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1.5 justify-end mb-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
                </span>
                <span className="text-[10px] font-semibold text-warning">Live event</span>
              </div>
              <p className="text-[10px] text-muted-foreground">11,545 kWh deferred</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
