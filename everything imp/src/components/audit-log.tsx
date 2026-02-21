"use client"

import { ClipboardList, Check, X, Pencil, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AuditEntry } from "@/lib/mock-data"

interface AuditLogProps {
  entries: AuditEntry[]
}

const decisionConfig = {
  accepted: { icon: <Check className="h-3 w-3" />, cls: "text-primary bg-primary/10 border-primary/25" },
  rejected: { icon: <X className="h-3 w-3" />,     cls: "text-destructive bg-destructive/10 border-destructive/25" },
  modified: { icon: <Pencil className="h-3 w-3" />, cls: "text-warning bg-warning/10 border-warning/25" },
}

export function AuditLog({ entries }: AuditLogProps) {
  const exportLog = () => {
    const csv = ["Timestamp,SKU,Name,Action,Decision,User,Savings ($)",
      ...entries.map(e => `${e.timestamp},"${e.sku_id}","${e.sku_name}","${e.action}","${e.decision}","${e.user}",$${e.savings_usd}`)
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = "cashcrop-audit-log.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  if (entries.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold text-foreground">Decision Audit Log</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No decisions recorded yet. Accept, reject, or modify AI recommendations to build your audit trail.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold text-foreground">Decision Audit Log</CardTitle>
          <span className="text-xs text-muted-foreground">({entries.length} entries)</span>
        </div>
        <button onClick={exportLog}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Download className="h-3 w-3" /> Export
        </button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {entries.slice().reverse().map((entry) => {
            const cfg = decisionConfig[entry.decision]
            return (
              <div key={entry.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex items-center justify-center rounded-lg border p-1.5 shrink-0 ${cfg.cls}`}>
                    {cfg.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{entry.sku_name}</p>
                    <p className="text-xs text-muted-foreground">{entry.action} · {entry.user}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <span className="font-mono text-xs font-bold text-primary">${entry.savings_usd.toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground">{entry.timestamp}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
