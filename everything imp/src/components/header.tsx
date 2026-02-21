"use client"

import { Sprout, Moon, Sun, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

function useTheme() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggle = () => {
    const html = document.documentElement
    const next = !html.classList.contains("dark")
    html.classList.toggle("dark", next)
    try { localStorage.setItem("cashcrop-theme", next ? "dark" : "light") } catch {}
    setDark(next)
  }

  return { dark, toggle }
}

export function Header() {
  const { dark, toggle } = useTheme()

  return (
    <header className="flex items-center justify-between border-b border-border bg-card/70 px-4 md:px-6 py-3.5 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center rounded-xl bg-primary/15 p-2.5">
          <Sprout className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
            CashCrop
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide uppercase">
            AI Energy Intelligence
          </p>
        </div>
      </div>

      {/* Center — Partner + hackathon badge */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3.5 py-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Powered by
          </span>
          <span className="text-xs font-bold text-foreground">H-E-B Partner Dataset</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        </div>
        <div className="flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-3.5 py-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Built at</span>
          <span className="text-xs font-bold text-foreground">c0mpiled × TVG</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-semibold text-primary">Live · ERCOT Grid</span>
        </div>

        {/* Theme toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-label="Toggle theme"
          className="rounded-xl"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex rounded-xl">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Github className="mr-1.5 h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>
        </Button>
      </div>
    </header>
  )
}
