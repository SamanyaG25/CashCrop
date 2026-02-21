"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    try {
      const authed = localStorage.getItem("cashcrop-authed")
      if (authed) {
        router.replace("/dashboard")
      } else {
        router.replace("/login")
      }
    } catch {
      router.replace("/login")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  )
}
