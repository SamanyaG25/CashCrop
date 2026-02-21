"use client"

import { useState } from "react"
import { Brain, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AiPromptViewerProps {
  prompt: string
}

export function AiPromptViewer({ prompt }: AiPromptViewerProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium text-foreground">
            AI Optimization Prompt
          </CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          {copied
            ? <><Check className="mr-1.5 h-3.5 w-3.5" />Copied</>
            : <><Copy className="mr-1.5 h-3.5 w-3.5" />Copy</>
          }
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="max-h-[420px] overflow-auto rounded-lg bg-secondary/80 p-4 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap">
          {prompt}
        </pre>
      </CardContent>
    </Card>
  )
}
