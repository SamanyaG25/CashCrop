"use client"

import { AlertTriangle, ThermometerSun } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import type { InventoryItem } from "@/lib/mock-data"

const riskConfig: Record<string, { className: string; label: string }> = {
  low:      { className: "border-primary/30 bg-primary/10 text-primary", label: "low" },
  medium:   { className: "border-warning/30 bg-warning/10 text-warning", label: "medium" },
  high:     { className: "border-destructive/40 bg-destructive/15 text-destructive-foreground", label: "high" },
  critical: { className: "bg-destructive text-destructive-foreground border-transparent", label: "critical" },
}

interface InventoryTableProps {
  data: InventoryItem[]
}

export function InventoryTable({ data }: InventoryTableProps) {
  const criticalCount = data.filter((d) => d.spoilage_risk === "critical").length
  const warehouseCount = new Set(data.map((d) => d.warehouse)).size

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm font-medium text-foreground">
            Inventory Monitor
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.length} SKUs across {warehouseCount} nodes
          </p>
        </div>
        {criticalCount > 0 && (
          <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive-foreground">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {criticalCount} Critical
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">SKU</TableHead>
              <TableHead className="text-muted-foreground">Product</TableHead>
              <TableHead className="text-right text-muted-foreground">Qty</TableHead>
              <TableHead className="text-right text-muted-foreground">
                <ThermometerSun className="inline mr-1 h-3 w-3" />Temp
              </TableHead>
              <TableHead className="text-right text-muted-foreground">Expiry</TableHead>
              <TableHead className="text-right text-muted-foreground">kWh/hr</TableHead>
              <TableHead className="text-muted-foreground">Risk</TableHead>
              <TableHead className="text-muted-foreground">Node</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const risk = riskConfig[item.spoilage_risk]
              return (
                <TableRow key={item.sku_id} className="border-border">
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.sku_id}</TableCell>
                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                  <TableCell className="text-right font-mono text-foreground">{item.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-foreground">{item.storage_temp_f}°F</TableCell>
                  <TableCell className="text-right">
                    <span className={item.days_until_expiry <= 2 ? "font-semibold text-destructive-foreground" : "text-foreground"}>
                      {item.days_until_expiry}d
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">{item.kwh_per_hour}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={risk.className}>{risk.label}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.warehouse}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
