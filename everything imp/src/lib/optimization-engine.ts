import type { InventoryItem, OptimizationResult } from "./mock-data"

// ─── GRID STATE ───────────────────────────────────────────────────────────────
const CURRENT_PRICE_KWH    = 0.29
const PEAK_SELLBACK_RATE   = 0.22     // ERCOT demand response sellback $/kWh
const PEAK_HOURS           = [16, 17, 18, 19, 20]
const CURRENT_HOUR         = new Date().getHours()
const IS_PEAK              = PEAK_HOURS.includes(CURRENT_HOUR)
const CARBON_INTENSITY_NOW = 385      // g CO₂/kWh

// ─── TAX CREDIT RULES ─────────────────────────────────────────────────────────
// IRS Section 170(e)(3) — enhanced deduction for food donations to qualified orgs
// Deduction = FMV + min(FMV × 25%, cost basis × 25%), capped at 2× cost basis
// Simplified: tax_credit ≈ FMV × 0.30  (conservative 30% of fair market value)
const TAX_CREDIT_RATE = 0.30

// DONATION WORTHINESS: donate if tax credit > expected salvage value
// Salvage = expected_revenue × (1 - spoilage_loss_factor)
function shouldDonate(item: InventoryItem): boolean {
  if (item.days_until_expiry > 3) return false  // still sellable
  const fmv         = (item.unit_value_usd ?? 3.0) * item.quantity
  const taxCredit   = fmv * TAX_CREDIT_RATE
  const salvageRate = item.days_until_expiry <= 1 ? 0.10
    : item.days_until_expiry <= 2 ? 0.30 : 0.55
  const salvageValue = fmv * salvageRate * (1 - 0.20)  // minus 20% discount to move
  return taxCredit > salvageValue
}

// ─── GRID RECOVERY LOGIC ──────────────────────────────────────────────────────
// Items that can participate in ERCOT demand response:
// - Frozen goods (can raise temp 2°F, defer compressor for 4h)
// - Low-urgency dairy/produce with ample shelf life
function gridRecoveryKwh(item: InventoryItem): number {
  if (item.category === "frozen") return item.kwh_per_hour * 4.0   // 4h compressor deferral
  if (item.days_until_expiry > 7 && item.category !== "meat") return item.kwh_per_hour * 2.0
  return item.kwh_per_hour * 0.5   // minimal recovery
}

function gridRevenueUsd(recoveryKwh: number): number {
  const rate = IS_PEAK ? PEAK_SELLBACK_RATE : 0.04
  return parseFloat((recoveryKwh * rate).toFixed(2))
}

// ─── ACTION DETERMINATION ─────────────────────────────────────────────────────
function determineAction(item: InventoryItem): OptimizationResult["action"] {
  // Frozen with long shelf life → grid_recovery primary action
  if (item.category === "frozen" && item.days_until_expiry > 30) return "grid_recovery"
  if (shouldDonate(item)) return "donate"
  if (item.days_until_expiry <= 1) return "urgent_sale"
  if (item.days_until_expiry <= 2 && item.spoilage_risk === "critical") return "urgent_sale"
  if (item.days_until_expiry <= 3) return "discount"
  if (item.days_until_expiry <= 7) return "reduce_cooling"
  return "maintain"
}

// ─── ENERGY SAVINGS ───────────────────────────────────────────────────────────
function calcEnergySavings(item: InventoryItem, action: OptimizationResult["action"]): number {
  const urgencyMultiplier =
    action === "donate"        ? 2.8
    : action === "grid_recovery" ? 4.5
    : item.days_until_expiry <= 1 ? 3.2
    : item.days_until_expiry <= 2 ? 2.4
    : item.days_until_expiry <= 3 ? 1.6
    : item.days_until_expiry <= 7 ? 1.1
    : 0.5
  const peakMultiplier = IS_PEAK ? 1.8 : 1.0
  const base = item.kwh_per_hour * item.quantity * 0.01 * CURRENT_PRICE_KWH
  return Math.round(base * urgencyMultiplier * peakMultiplier * 100)
}

// ─── CARBON REDUCTION ─────────────────────────────────────────────────────────
function calcCarbonReduction(energySavingsUsd: number): number {
  const kwhSaved = energySavingsUsd / CURRENT_PRICE_KWH
  return Math.round(kwhSaved * (CARBON_INTENSITY_NOW / 1000))
}

// ─── REVENUE PROTECTED ────────────────────────────────────────────────────────
function calcRevenueProtected(item: InventoryItem, action: OptimizationResult["action"]): number {
  if (action === "donate" || action === "grid_recovery") return 0
  if (item.days_until_expiry > 7) return 0
  const unitValue  = item.unit_value_usd ?? 2.80
  const riskFactor = item.days_until_expiry <= 1 ? 0.85
    : item.days_until_expiry <= 3 ? 0.60
    : 0.30
  return Math.round(item.quantity * unitValue * riskFactor)
}

// ─── TAX CREDIT ───────────────────────────────────────────────────────────────
function calcTaxCredit(item: InventoryItem, action: OptimizationResult["action"]): number {
  if (action !== "donate") return 0
  const fmv = (item.unit_value_usd ?? 3.0) * item.quantity
  return Math.round(fmv * TAX_CREDIT_RATE)
}

// ─── COOLING ADJUSTMENT ───────────────────────────────────────────────────────
function coolingAdjustment(item: InventoryItem): string {
  if (item.category === "meat") return `Hold at ${item.storage_temp_f}°F — no relaxation (FDA safety)`
  if (item.category === "frozen") return `Raise ${item.storage_temp_f}°F → ${item.storage_temp_f + 2}°F overnight`
  if (item.days_until_expiry <= 2) return `Maintain ${item.storage_temp_f}°F — expiry-critical`
  if (item.days_until_expiry <= 7) return `Relax 2°F to ${item.storage_temp_f + 2}°F overnight`
  return `Hold at ${item.storage_temp_f}°F — optimal`
}

// ─── DISCOUNT TRIGGER ─────────────────────────────────────────────────────────
function discountTrigger(item: InventoryItem, action: OptimizationResult["action"]): string {
  if (action === "donate") {
    const fmv = (item.unit_value_usd ?? 3.0) * item.quantity
    const credit = Math.round(fmv * TAX_CREDIT_RATE)
    return `Donate — tax credit est. $${credit.toLocaleString()} exceeds markdown salvage`
  }
  if (action === "grid_recovery") return `No markdown — defer compressor load to ERCOT sellback`
  if (action === "urgent_sale") {
    const pct = item.days_until_expiry <= 1 ? 25 : 20
    return `Flash sale: ${pct}% off — notify retail partners now`
  }
  if (action === "discount") return `${item.days_until_expiry <= 3 ? 12 : 8}% markdown — bundle promotions`
  if (action === "reduce_cooling") return `5% markdown to accelerate turnover`
  return `No discount required`
}

// ─── COMPRESSOR SCHEDULE ─────────────────────────────────────────────────────
function compressorSchedule(item: InventoryItem, action: OptimizationResult["action"]): string {
  if (action === "grid_recovery") return `Defer compressor 4–8 PM peak, burst-cool 12–4 AM (ERCOT DR event)`
  if (item.category === "frozen") return `Heavy shift to 12–4 AM off-peak — high impact`
  if (IS_PEAK) return `Shift cycles to 2–5 AM, reduce intensity 4–8 PM`
  return `Prefer off-peak 1–5 AM for compressor bursts`
}

// ─── FOOD BANK MATCHING ───────────────────────────────────────────────────────
const WAREHOUSE_FOOD_BANKS: Record<string, string> = {
  "WH-AUS": "Central Texas Food Bank",
  "WH-SAT": "San Antonio Food Bank",
  "WH-HOU": "Houston Food Bank",
}

function matchFoodBank(item: InventoryItem, action: OptimizationResult["action"]): string {
  if (action !== "donate") return ""
  return WAREHOUSE_FOOD_BANKS[item.warehouse] ?? "Feeding America TX"
}

// ─── MAIN OPTIMIZER ───────────────────────────────────────────────────────────
export function runOptimization(inventory: InventoryItem[]): OptimizationResult[] {
  return inventory.map((item) => {
    const action       = determineAction(item)
    const energySavings = calcEnergySavings(item, action)
    const recoveryKwh  = gridRecoveryKwh(item)

    return {
      sku_id:                  item.sku_id,
      name:                    item.name,
      action,
      cooling_adjustment:      coolingAdjustment(item),
      discount_trigger:        discountTrigger(item, action),
      compressor_schedule:     compressorSchedule(item, action),
      expected_energy_savings: energySavings,
      carbon_reduction_kg:     calcCarbonReduction(energySavings),
      revenue_protected:       calcRevenueProtected(item, action),
      tax_credit_usd:          calcTaxCredit(item, action),
      grid_recovery_kwh:       Math.round(recoveryKwh),
      grid_revenue_usd:        gridRevenueUsd(recoveryKwh),
      food_bank:               matchFoodBank(item, action),
      action_status:           "pending" as const,
    }
  })
}

// ─── PROMPT GENERATOR ─────────────────────────────────────────────────────────
export function generateOptimizationPrompt(inventory: InventoryItem[]): string {
  const inventoryBlock = inventory
    .map((i) =>
      `  ${i.sku_id} – ${i.name}: ${i.quantity} units, expires in ${i.days_until_expiry} day(s), ` +
      `stored at ${i.storage_temp_f}°F, energy draw ${i.kwh_per_hour} kWh/hr, ` +
      `warehouse ${i.warehouse}, risk: ${i.spoilage_risk}, ` +
      `unit value: $${i.unit_value_usd ?? "N/A"}, unit weight: ${i.unit_weight_lbs ?? "N/A"} lbs`
    )
    .join("\n")

  return `You are CASHCROP, an AI energy optimization engine for H-E-B Texas food cold chain.

OBJECTIVE
Minimize (Energy Cost + Spoilage Loss + Carbon Emissions) across all SKUs
while maximizing (Revenue + Tax Credits + ERCOT Grid Revenue).

CURRENT ENERGY STATUS
  Time: ${new Date().toLocaleTimeString()}
  ERCOT grid price: $${CURRENT_PRICE_KWH}/kWh ${IS_PEAK ? "(PEAK WINDOW ACTIVE ⚡)" : "(off-peak)"}
  ERCOT demand response sellback: $${PEAK_SELLBACK_RATE}/kWh during peak
  Peak window: 4 PM – 8 PM @ $0.29–0.31/kWh
  Off-peak: 12 AM – 6 AM @ $0.05–0.07/kWh
  Carbon intensity: ${CARBON_INTENSITY_NOW}g CO₂/kWh (${CARBON_INTENSITY_NOW > 300 ? "HIGH" : "moderate"})

INVENTORY (${inventory.length} SKUs)
${inventoryBlock}

DECISION FRAMEWORK
For each SKU, choose the BEST action from:
  • maintain        — hold temp, no action needed
  • reduce_cooling  — safely raise temp 1–3°F to save energy
  • discount        — markdown to accelerate sales
  • donate          — donate to food bank if tax_credit > salvage markdown value
                      Tax credit = FMV × 30% (IRS §170(e)(3) enhanced deduction)
  • urgent_sale     — flash discount, partner alerts
  • grid_recovery   — defer compressor load to ERCOT sellback window

TAX CREDIT LOGIC
  Recommend "donate" when: (quantity × unit_value × 0.30) > (projected_sale_revenue × 0.55)
  Specify food_bank from: Central Texas Food Bank | San Antonio Food Bank | Houston Food Bank

GRID RECOVERY LOGIC  
  Frozen goods can defer compressor 4h during peak → sell load reduction to ERCOT at $0.22/kWh
  Long-shelf dairy/produce can shift 2h of cooling to off-peak

CONSTRAINTS
  - Meat/poultry: never relax temp above FDA safe limits
  - Frozen goods: max +2°F temp relaxation overnight only
  - Produce: max +3°F if shelf life > 3 days
  - Dairy: max +2°F if shelf life > 5 days
  - Items expiring in ≤24h: donate or urgent_sale immediately

Return a JSON array with all fields per SKU.`
}
