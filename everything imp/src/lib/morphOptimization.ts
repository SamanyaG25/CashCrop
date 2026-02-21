/**
 * morphOptimization.ts
 * Morph API integration for CashCrop AI recommendations.
 *
 * Usage:
 *   import { optimizeWithMorph, optimizeWithRules } from "@/lib/morphOptimization"
 */

const MORPH_API_URL = "https://api.morphllm.com/v1/chat/completions"
const MORPH_MODEL   = "morph-v3-fast"

export interface MorphInventoryItem {
  sku: string
  name: string
  units: number
  expiry: number        // days until expiry
  tempF: number         // current storage temp °F
  kwhPerHour: number
  warehouse: string
  category?: string
}

export interface MorphEnergyPricing {
  currentPriceKwh: number
  isPeak: boolean
  peakWindow: string
  offPeakWindow: string
  carbonIntensity: number   // g CO₂/kWh
}

export interface MorphRecommendation {
  sku: string
  name: string
  action: string
  energySavings: number     // USD
  carbonReductionKg: number
  revenueProtected: number
  coolingAdjustment: string
  compressorSchedule: string
  urgency: "low" | "medium" | "high" | "critical"
}

export interface MorphResult {
  recommendations: MorphRecommendation[]
  summary: {
    totalEnergySavings: number
    totalCarbonKg: number
    totalRevenueProtected: number
    keyInsight: string
    peakLoadAvoidedKw: number
  }
}

// ── Live Morph API call ────────────────────────────────────────────────────────

export async function optimizeWithMorph(
  inventory: MorphInventoryItem[],
  energyPricing: MorphEnergyPricing,
  morphApiKey: string
): Promise<MorphResult> {
  const systemPrompt = `
You are CashCrop, an AI energy optimization engine for food cold chain operations.
Minimize (Energy Cost + Spoilage Loss + Carbon Emissions) while maintaining food safety.

Return ONLY valid JSON in this EXACT format, no preamble, no markdown fences:
{
  "recommendations": [
    {
      "sku": "string",
      "name": "string",
      "action": "string (e.g. Shift cooling to off-peak | Flash sale 25% off | Donate to food bank)",
      "energySavings": number,
      "carbonReductionKg": number,
      "revenueProtected": number,
      "coolingAdjustment": "string",
      "compressorSchedule": "string",
      "urgency": "low|medium|high|critical"
    }
  ],
  "summary": {
    "totalEnergySavings": number,
    "totalCarbonKg": number,
    "totalRevenueProtected": number,
    "keyInsight": "string",
    "peakLoadAvoidedKw": number
  }
}

FOOD SAFETY CONSTRAINTS:
- Meat/poultry: NEVER relax temp above FDA limits
- Frozen goods: temp relaxation max +2°F only
- Produce: temp relaxation max +3°F if shelf life > 3 days
- Dairy: temp relaxation max +2°F if shelf life > 5 days
- Items expiring in ≤24h: urgent_sale or donate immediately
`.trim()

  const userPrompt = `
Grid status: ${JSON.stringify(energyPricing, null, 2)}

Inventory (${inventory.length} SKUs):
${JSON.stringify(inventory, null, 2)}

Generate energy-aware optimization recommendations for each SKU.
`.trim()

  try {
    const res = await fetch(MORPH_API_URL, {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${morphApiKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        model:       MORPH_MODEL,
        messages:    [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt   },
        ],
        temperature: 0.1,
        max_tokens:  2048,
      }),
    })

    if (!res.ok) throw new Error(`Morph API error: ${res.status}`)

    const data = await res.json()
    const raw  = data.choices[0].message.content
    const clean = raw
      .replace(/^```json\s*/m, "")
      .replace(/^```\s*/m, "")
      .replace(/```\s*$/m, "")
      .trim()

    return JSON.parse(clean) as MorphResult
  } catch (err) {
    console.warn("[CashCrop] Morph API unavailable — falling back to rule engine:", err)
    return optimizeWithRules(inventory, energyPricing)
  }
}

// ── Rule-based fallback (runs instantly if API fails / no key) ─────────────────

export function optimizeWithRules(
  inventory: MorphInventoryItem[],
  energyPricing: MorphEnergyPricing
): MorphResult {
  const recommendations: MorphRecommendation[] = inventory.map((item) => {
    const urgency: MorphRecommendation["urgency"] =
      item.expiry <= 1 ? "critical"
      : item.expiry <= 3 ? "high"
      : item.expiry <= 7 ? "medium"
      : "low"

    const energySavings = parseFloat(
      (item.units * item.kwhPerHour * energyPricing.currentPriceKwh * 0.25 *
        (urgency === "critical" ? 3.5 : urgency === "high" ? 2.0 : urgency === "medium" ? 1.2 : 0.5)
      ).toFixed(2)
    )
    const carbonReductionKg = parseFloat(
      ((energySavings / energyPricing.currentPriceKwh) * (energyPricing.carbonIntensity / 1000)).toFixed(1)
    )
    const revenueProtected = urgency === "critical"
      ? Math.round(item.units * 2.8 * 0.80)
      : urgency === "high"
      ? Math.round(item.units * 2.8 * 0.55)
      : urgency === "medium"
      ? Math.round(item.units * 2.8 * 0.25)
      : 0

    const isMeat    = item.category === "meat"
    const isFrozen  = item.category === "frozen"

    const coolingAdjustment = isMeat
      ? `Hold at ${item.tempF}°F — no relaxation (food safety)`
      : isFrozen
      ? `Raise ${item.tempF}°F → ${item.tempF + 2}°F overnight`
      : item.expiry <= 2
      ? `Maintain ${item.tempF}°F — expiry critical`
      : `Relax 2°F to ${item.tempF + 2}°F during off-peak`

    const action = urgency === "critical"
      ? `Flash sale: 25% off — notify retail partners now`
      : urgency === "high"
      ? `12% markdown + bundle promotions`
      : urgency === "medium"
      ? `Shift cooling to off-peak window`
      : `Maintain optimal — shift compressor to 12–4 AM`

    const compressorSchedule = isFrozen
      ? `Heavy shift to 12–4 AM off-peak — maximum savings`
      : energyPricing.isPeak
      ? `Minimize run time 4–8 PM, burst cool 2–5 AM`
      : `Prefer off-peak 1–5 AM for compressor bursts`

    return {
      sku:                item.sku,
      name:               item.name,
      action,
      energySavings,
      carbonReductionKg,
      revenueProtected,
      coolingAdjustment,
      compressorSchedule,
      urgency,
    }
  })

  const totalEnergySavings    = recommendations.reduce((s, r) => s + r.energySavings,    0)
  const totalCarbonKg         = recommendations.reduce((s, r) => s + r.carbonReductionKg, 0)
  const totalRevenueProtected = recommendations.reduce((s, r) => s + r.revenueProtected,  0)
  const peakLoadAvoidedKw     = Math.round(totalEnergySavings * 3.2)

  return {
    recommendations,
    summary: {
      totalEnergySavings:    parseFloat(totalEnergySavings.toFixed(2)),
      totalCarbonKg:         parseFloat(totalCarbonKg.toFixed(1)),
      totalRevenueProtected,
      peakLoadAvoidedKw,
      keyInsight: energyPricing.isPeak
        ? `Shifted ${Math.round(totalEnergySavings / 0.31 * 0.8)} kWh of cooling load away from peak — saves $${(totalEnergySavings * 0.78).toFixed(0)} in demand charges.`
        : `Off-peak cooling strategy locks in lowest grid rates. Pre-cool frozen inventory between 12–4 AM for maximum savings.`,
    },
  }
}
