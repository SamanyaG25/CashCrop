/**
 * POST /api/optimize
 *
 * Body: { inventory: MorphInventoryItem[], energyPricing: MorphEnergyPricing, morphApiKey?: string }
 * Returns: MorphResult
 */

import { NextRequest, NextResponse } from "next/server"
import { optimizeWithMorph, optimizeWithRules } from "@/lib/morphOptimization"
import type { MorphInventoryItem, MorphEnergyPricing } from "@/lib/morphOptimization"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { inventory, energyPricing, morphApiKey } = body as {
      inventory:     MorphInventoryItem[]
      energyPricing: MorphEnergyPricing
      morphApiKey?:  string
    }

    if (!inventory || !Array.isArray(inventory) || inventory.length === 0) {
      return NextResponse.json({ error: "inventory is required and must be a non-empty array" }, { status: 400 })
    }

    if (!energyPricing) {
      return NextResponse.json({ error: "energyPricing is required" }, { status: 400 })
    }

    // Use server-side env key if available, fallback to client-provided key
    const apiKey = process.env.MORPH_API_KEY || morphApiKey

    const result = apiKey
      ? await optimizeWithMorph(inventory, energyPricing, apiKey)
      : optimizeWithRules(inventory, energyPricing)

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error("[/api/optimize] error:", err)
    return NextResponse.json({ error: "Internal optimization error" }, { status: 500 })
  }
}
