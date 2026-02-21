"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, Download, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CSV_TEMPLATE } from "@/lib/mock-data"

interface CsvUploadProps {
  onUpload: (data: Record<string, string>[]) => void
}

export function CsvUpload({ onUpload }: CsvUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [rowCount, setRowCount] = useState(0)

  const parseCSV = useCallback((text: string) => {
    const lines = text.trim().split("\n")
    if (lines.length < 2) return
    const headers = lines[0].split(",").map((h) => h.trim())
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim())
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => { obj[h] = values[i] || "" })
      return obj
    })
    setRowCount(rows.length)
    onUpload(rows)
  }, [onUpload])

  const handleFile = useCallback((file: File) => {
    setUploadedFile(file.name)
    const reader = new FileReader()
    reader.onload = (e) => { parseCSV(e.target?.result as string) }
    reader.readAsText(file)
  }, [parseCSV])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith(".csv")) handleFile(file)
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cashcrop-inventory-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadDemo = () => {
    parseCSV(CSV_TEMPLATE)
    setUploadedFile("demo-inventory.csv")
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">Upload Inventory</CardTitle>
        <p className="text-xs text-muted-foreground">
          CSV format: sku_id, name, quantity, expiry_date, storage_temp_f, kwh_per_hour, warehouse
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!uploadedFile ? (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
                isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-center rounded-full bg-primary/10 p-3">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Drop your CSV file here</p>
                <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
              </div>
              <label htmlFor="csv-input" className="cursor-pointer">
                <input id="csv-input" type="file" accept=".csv" className="sr-only" onChange={handleFileInput} />
                <Button variant="outline" size="sm" asChild><span>Browse Files</span></Button>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={downloadTemplate}>
                <Download className="mr-1.5 h-3.5 w-3.5" />Download Template
              </Button>
              <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={loadDemo}>
                <FileText className="mr-1.5 h-3.5 w-3.5" />Load Demo Data
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{uploadedFile}</p>
                <p className="text-xs text-muted-foreground">{rowCount} items loaded</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setUploadedFile(null); setRowCount(0) }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
