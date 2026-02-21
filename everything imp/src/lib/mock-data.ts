// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface InventoryItem {
  sku_id:            string
  name:              string
  quantity:          number
  expiry_date:       string
  days_until_expiry: number
  storage_temp_f:    number
  kwh_per_hour:      number
  spoilage_risk:     "low" | "medium" | "high" | "critical"
  warehouse:         string
  category?:         string
  unit_weight_lbs?:  number   // for tax credit calc
  unit_value_usd?:   number   // for revenue calc
}

export interface OptimizationResult {
  sku_id:                  string
  name:                    string
  action:                  "maintain" | "reduce_cooling" | "discount" | "donate" | "urgent_sale" | "grid_recovery"
  cooling_adjustment:      string
  discount_trigger:        string
  compressor_schedule:     string
  expected_energy_savings: number   // USD
  carbon_reduction_kg:     number
  revenue_protected:       number   // USD
  // ── new fields ──
  tax_credit_usd:          number   // donation tax credit
  grid_recovery_kwh:       number   // kWh recoverable from ERCOT demand response
  grid_revenue_usd:        number   // $ from selling load flexibility back
  food_bank:               string   // suggested donation partner
  action_status:           "pending" | "accepted" | "rejected" | "modified"
  modified_action?:        string   // user override text
}

export interface WarehouseNode {
  id:               string
  name:             string
  location:         string
  savings_usd:      number
  carbon_saved_kg:  number
  efficiency_score: number
  items_count:      number
  peak_avoided_kw:  number
  grid_revenue_usd: number
  tax_credits_usd:  number
}

export interface EnergyPricePoint {
  hour:             string
  price_kwh:        number
  carbon_intensity: number
}

export interface WeeklySavingsPoint {
  day:               string
  energy_saved:      number
  carbon_reduced:    number
  revenue_protected: number
  tax_credits:       number
  grid_revenue:      number
}

export interface AuditEntry {
  id:         string
  timestamp:  string
  sku_id:     string
  sku_name:   string
  action:     string
  decision:   "accepted" | "rejected" | "modified"
  user:       string
  savings_usd:number
}

export interface FoodBank {
  id:       string
  name:     string
  city:     string
  state:    string
  phone:    string
  accepts:  string[]    // food categories
}

// ─── TEXAS FOOD BANKS ─────────────────────────────────────────────────────────

export const texasFoodBanks: FoodBank[] = [
  { id: "tfb-austin",  name: "Central Texas Food Bank",      city: "Austin",      state: "TX", phone: "(512) 282-2111", accepts: ["produce","dairy","meat","bakery","frozen"] },
  { id: "tfb-sa",      name: "San Antonio Food Bank",        city: "San Antonio", state: "TX", phone: "(210) 431-8326", accepts: ["produce","dairy","meat","beverage","frozen"] },
  { id: "tfb-houston", name: "Houston Food Bank",            city: "Houston",     state: "TX", phone: "(832) 369-9390", accepts: ["produce","dairy","meat","bakery","frozen"] },
  { id: "tfb-dfba",    name: "North Texas Food Bank",        city: "Dallas",      state: "TX", phone: "(214) 347-9594", accepts: ["produce","dairy","frozen"] },
  { id: "tfb-comm",    name: "Feeding America – TX Panhandle",city: "Amarillo",   state: "TX", phone: "(806) 374-0034", accepts: ["produce","frozen","bakery"] },
]

// ─── ERCOT GRID DATA ──────────────────────────────────────────────────────────

export const eroctDemandResponse = {
  currentPriceKwh:      0.29,
  peakSellbackRateKwh:  0.22,    // what ERCOT pays for load reduction during peak
  offPeakSellbackRate:  0.04,
  currentCarbonIntensity: 385,   // g CO₂/kWh
  peakHours:            [16, 17, 18, 19, 20],
  activeAlert:          true,     // ERCOT is in demand-response event
  alertLevel:           "watch",  // watch | advisory | emergency
  forecastPeakMW:       72400,
  capacityMarginPct:    8.2,
}

// ─── ENERGY DATA ──────────────────────────────────────────────────────────────

export const energyPriceData: EnergyPricePoint[] = [
  { hour: "12am", price_kwh: 0.07, carbon_intensity: 180 },
  { hour: "2am",  price_kwh: 0.06, carbon_intensity: 155 },
  { hour: "4am",  price_kwh: 0.05, carbon_intensity: 148 },
  { hour: "6am",  price_kwh: 0.08, carbon_intensity: 195 },
  { hour: "8am",  price_kwh: 0.14, carbon_intensity: 265 },
  { hour: "10am", price_kwh: 0.18, carbon_intensity: 298 },
  { hour: "12pm", price_kwh: 0.21, carbon_intensity: 315 },
  { hour: "2pm",  price_kwh: 0.23, carbon_intensity: 325 },
  { hour: "4pm",  price_kwh: 0.29, carbon_intensity: 385 },
  { hour: "6pm",  price_kwh: 0.31, carbon_intensity: 400 },
  { hour: "8pm",  price_kwh: 0.22, carbon_intensity: 340 },
  { hour: "10pm", price_kwh: 0.13, carbon_intensity: 255 },
]

// ─── WEEKLY SAVINGS ───────────────────────────────────────────────────────────

export const weeklySavingsData: WeeklySavingsPoint[] = [
  { day: "Mon", energy_saved: 820,  carbon_reduced: 410, revenue_protected: 4200, tax_credits: 380,  grid_revenue: 290 },
  { day: "Tue", energy_saved: 940,  carbon_reduced: 490, revenue_protected: 5100, tax_credits: 510,  grid_revenue: 340 },
  { day: "Wed", energy_saved: 1080, carbon_reduced: 540, revenue_protected: 6300, tax_credits: 620,  grid_revenue: 410 },
  { day: "Thu", energy_saved: 760,  carbon_reduced: 380, revenue_protected: 3800, tax_credits: 290,  grid_revenue: 220 },
  { day: "Fri", energy_saved: 1340, carbon_reduced: 670, revenue_protected: 8200, tax_credits: 870,  grid_revenue: 580 },
  { day: "Sat", energy_saved: 1100, carbon_reduced: 550, revenue_protected: 5900, tax_credits: 640,  grid_revenue: 390 },
  { day: "Sun", energy_saved: 960,  carbon_reduced: 480, revenue_protected: 4900, tax_credits: 520,  grid_revenue: 310 },
]

// ─── INVENTORY ────────────────────────────────────────────────────────────────

export const inventoryData: InventoryItem[] = [
  {
    sku_id: "HEB-DAIRY-001", name: "H-E-B Select Greek Yogurt (32oz)", quantity: 2400,
    expiry_date: "2026-02-21", days_until_expiry: 1,
    storage_temp_f: 38, kwh_per_hour: 0.14, spoilage_risk: "critical",
    warehouse: "WH-AUS", category: "dairy", unit_weight_lbs: 2.0, unit_value_usd: 4.29,
  },
  {
    sku_id: "HEB-PROD-042", name: "H-E-B Organics Bagged Salad", quantity: 1800,
    expiry_date: "2026-02-22", days_until_expiry: 2,
    storage_temp_f: 34, kwh_per_hour: 0.18, spoilage_risk: "critical",
    warehouse: "WH-AUS", category: "produce", unit_weight_lbs: 0.5, unit_value_usd: 3.49,
  },
  {
    sku_id: "HEB-MEAT-019", name: "H-E-B Ground Beef 80/20 (1lb)", quantity: 950,
    expiry_date: "2026-02-23", days_until_expiry: 3,
    storage_temp_f: 32, kwh_per_hour: 0.22, spoilage_risk: "high",
    warehouse: "WH-AUS", category: "meat", unit_weight_lbs: 1.0, unit_value_usd: 5.99,
  },
  {
    sku_id: "HEB-DAIRY-088", name: "H-E-B Shredded Mozzarella", quantity: 3100,
    expiry_date: "2026-03-06", days_until_expiry: 14,
    storage_temp_f: 38, kwh_per_hour: 0.12, spoilage_risk: "low",
    warehouse: "WH-SAT", category: "dairy", unit_weight_lbs: 1.0, unit_value_usd: 3.79,
  },
  {
    sku_id: "HEB-JUICE-003", name: "H-E-B OJ Concentrate", quantity: 2200,
    expiry_date: "2026-02-25", days_until_expiry: 5,
    storage_temp_f: 35, kwh_per_hour: 0.09, spoilage_risk: "medium",
    warehouse: "WH-SAT", category: "beverage", unit_weight_lbs: 1.5, unit_value_usd: 2.99,
  },
  {
    sku_id: "HEB-MEAT-044", name: "H-E-B Chicken Breast (2lb)", quantity: 1600,
    expiry_date: "2026-02-22", days_until_expiry: 2,
    storage_temp_f: 30, kwh_per_hour: 0.24, spoilage_risk: "critical",
    warehouse: "WH-SAT", category: "meat", unit_weight_lbs: 2.0, unit_value_usd: 7.49,
  },
  {
    sku_id: "HEB-PROD-091", name: "H-E-B Hass Avocados (bag)", quantity: 4200,
    expiry_date: "2026-02-23", days_until_expiry: 3,
    storage_temp_f: 45, kwh_per_hour: 0.08, spoilage_risk: "high",
    warehouse: "WH-HOU", category: "produce", unit_weight_lbs: 1.0, unit_value_usd: 4.49,
  },
  {
    sku_id: "HEB-BVEG-007", name: "H-E-B Frozen Broccoli Florets", quantity: 3200,
    expiry_date: "2026-08-20", days_until_expiry: 180,
    storage_temp_f: 0, kwh_per_hour: 0.31, spoilage_risk: "low",
    warehouse: "WH-AUS", category: "frozen", unit_weight_lbs: 1.5, unit_value_usd: 2.49,
  },
  {
    sku_id: "HEB-DELI-012", name: "H-E-B Rotisserie Chicken", quantity: 420,
    expiry_date: "2026-02-21", days_until_expiry: 1,
    storage_temp_f: 36, kwh_per_hour: 0.19, spoilage_risk: "critical",
    warehouse: "WH-AUS", category: "meat", unit_weight_lbs: 3.0, unit_value_usd: 9.99,
  },
  {
    sku_id: "HEB-BKRY-033", name: "H-E-B Scratch Bakery Bread", quantity: 880,
    expiry_date: "2026-02-22", days_until_expiry: 2,
    storage_temp_f: 65, kwh_per_hour: 0.04, spoilage_risk: "high",
    warehouse: "WH-HOU", category: "bakery", unit_weight_lbs: 1.0, unit_value_usd: 3.29,
  },
]

// ─── OPTIMIZATION RESULTS (pre-seeded) ────────────────────────────────────────

export const optimizationResults: OptimizationResult[] = [
  {
    sku_id: "HEB-DAIRY-001", name: "H-E-B Select Greek Yogurt (32oz)",
    action: "donate",
    cooling_adjustment: "Raise to 40°F (safe upper limit) to reduce compressor load",
    discount_trigger: "Donate full lot — 1 day shelf life, tax credit exceeds salvage margin",
    compressor_schedule: "Reduce cycles 4–8 PM, idle 12–5 AM",
    expected_energy_savings: 430, carbon_reduction_kg: 38, revenue_protected: 0,
    tax_credit_usd: 1440, grid_recovery_kwh: 86, grid_revenue_usd: 19,
    food_bank: "Central Texas Food Bank", action_status: "pending",
  },
  {
    sku_id: "HEB-PROD-042", name: "H-E-B Organics Bagged Salad",
    action: "urgent_sale",
    cooling_adjustment: "Maintain 34°F — safety critical",
    discount_trigger: "20% markdown, trigger 6 AM partner notifications",
    compressor_schedule: "Shift to off-peak 1–4 AM burst cooling",
    expected_energy_savings: 310, carbon_reduction_kg: 29, revenue_protected: 2520,
    tax_credit_usd: 0, grid_recovery_kwh: 62, grid_revenue_usd: 14,
    food_bank: "", action_status: "pending",
  },
  {
    sku_id: "HEB-MEAT-019", name: "H-E-B Ground Beef 80/20 (1lb)",
    action: "discount",
    cooling_adjustment: "Hold at 32°F — no relaxation",
    discount_trigger: "10% markdown, partner butcher shops",
    compressor_schedule: "Load shift to 2–5 AM off-peak window",
    expected_energy_savings: 190, carbon_reduction_kg: 18, revenue_protected: 1710,
    tax_credit_usd: 0, grid_recovery_kwh: 38, grid_revenue_usd: 8,
    food_bank: "", action_status: "pending",
  },
  {
    sku_id: "HEB-MEAT-044", name: "H-E-B Chicken Breast (2lb)",
    action: "donate",
    cooling_adjustment: "Hold at 30°F — safety margin maintained",
    discount_trigger: "Donate — 2 day shelf life, tax credit + food safety margin favors donation",
    compressor_schedule: "Minimize run time 5–9 PM peak",
    expected_energy_savings: 520, carbon_reduction_kg: 44, revenue_protected: 0,
    tax_credit_usd: 4800, grid_recovery_kwh: 104, grid_revenue_usd: 23,
    food_bank: "San Antonio Food Bank", action_status: "pending",
  },
  {
    sku_id: "HEB-JUICE-003", name: "H-E-B OJ Concentrate",
    action: "discount",
    cooling_adjustment: "Relax 2°F to 37°F overnight",
    discount_trigger: "8% markdown, bundle with breakfast promos",
    compressor_schedule: "Standard schedule — off-peak preferred",
    expected_energy_savings: 140, carbon_reduction_kg: 12, revenue_protected: 1580,
    tax_credit_usd: 0, grid_recovery_kwh: 28, grid_revenue_usd: 6,
    food_bank: "", action_status: "pending",
  },
  {
    sku_id: "HEB-PROD-091", name: "H-E-B Hass Avocados (bag)",
    action: "reduce_cooling",
    cooling_adjustment: "Raise to 48°F — acceptable for ripening stage",
    discount_trigger: "5% markdown to accelerate turnover",
    compressor_schedule: "Reduce intensity 3–8 PM, full off-peak preferred",
    expected_energy_savings: 95, carbon_reduction_kg: 9, revenue_protected: 1890,
    tax_credit_usd: 0, grid_recovery_kwh: 19, grid_revenue_usd: 4,
    food_bank: "", action_status: "pending",
  },
  {
    sku_id: "HEB-DAIRY-088", name: "H-E-B Shredded Mozzarella",
    action: "maintain",
    cooling_adjustment: "Hold at 38°F — optimal",
    discount_trigger: "No discount required",
    compressor_schedule: "Shift non-critical cycles to off-peak 12–4 AM",
    expected_energy_savings: 60, carbon_reduction_kg: 5, revenue_protected: 0,
    tax_credit_usd: 0, grid_recovery_kwh: 12, grid_revenue_usd: 3,
    food_bank: "", action_status: "pending",
  },
  {
    sku_id: "HEB-BVEG-007", name: "H-E-B Frozen Broccoli Florets",
    action: "grid_recovery",
    cooling_adjustment: "Raise from 0°F to 2°F overnight — safety margin allows this",
    discount_trigger: "No discount needed — 180d shelf life",
    compressor_schedule: "Heavy shift to 12–4 AM off-peak — major load reduction",
    expected_energy_savings: 780, carbon_reduction_kg: 65, revenue_protected: 0,
    tax_credit_usd: 0, grid_recovery_kwh: 195, grid_revenue_usd: 43,
    food_bank: "", action_status: "pending",
  },
  {
    sku_id: "HEB-DELI-012", name: "H-E-B Rotisserie Chicken",
    action: "donate",
    cooling_adjustment: "Maintain 36°F — expiry critical, do not relax",
    discount_trigger: "Donate to food bank — expires today, tax credit maximizes value",
    compressor_schedule: "Reduce to minimum safe operation",
    expected_energy_savings: 180, carbon_reduction_kg: 16, revenue_protected: 0,
    tax_credit_usd: 2520, grid_recovery_kwh: 36, grid_revenue_usd: 8,
    food_bank: "Central Texas Food Bank", action_status: "pending",
  },
  {
    sku_id: "HEB-BKRY-033", name: "H-E-B Scratch Bakery Bread",
    action: "urgent_sale",
    cooling_adjustment: "Ambient — no cooling adjustment needed",
    discount_trigger: "30% off — bakery partner pickup by 6 AM",
    compressor_schedule: "No refrigeration — reallocate energy budget",
    expected_energy_savings: 45, carbon_reduction_kg: 4, revenue_protected: 1040,
    tax_credit_usd: 0, grid_recovery_kwh: 9, grid_revenue_usd: 2,
    food_bank: "", action_status: "pending",
  },
]

// ─── WAREHOUSES ───────────────────────────────────────────────────────────────

export const warehouseData: WarehouseNode[] = [
  {
    id: "WH-AUS", name: "H-E-B Austin Distribution Center", location: "Austin, TX",
    savings_usd: 2340, carbon_saved_kg: 1420, efficiency_score: 91,
    items_count: 14200, peak_avoided_kw: 380, grid_revenue_usd: 840, tax_credits_usd: 3960,
  },
  {
    id: "WH-SAT", name: "H-E-B San Antonio Hub", location: "San Antonio, TX",
    savings_usd: 3110, carbon_saved_kg: 1890, efficiency_score: 84,
    items_count: 22600, peak_avoided_kw: 510, grid_revenue_usd: 1120, tax_credits_usd: 4800,
  },
  {
    id: "WH-HOU", name: "H-E-B Houston Node", location: "Houston, TX",
    savings_usd: 1650, carbon_saved_kg: 920, efficiency_score: 78,
    items_count: 9800, peak_avoided_kw: 260, grid_revenue_usd: 580, tax_credits_usd: 2520,
  },
]

// ─── CSV TEMPLATE ─────────────────────────────────────────────────────────────

export const CSV_TEMPLATE = `sku_id,name,quantity,expiry_date,storage_temp_f,kwh_per_hour,warehouse,category
HEB-DAIRY-001,H-E-B Select Greek Yogurt (32oz),2400,2026-02-21,38,0.14,WH-AUS,dairy
HEB-PROD-042,H-E-B Organics Bagged Salad,1800,2026-02-22,34,0.18,WH-AUS,produce
HEB-MEAT-019,H-E-B Ground Beef 80/20 (1lb),950,2026-02-23,32,0.22,WH-AUS,meat
HEB-DAIRY-088,H-E-B Shredded Mozzarella,3100,2026-03-06,38,0.12,WH-SAT,dairy
HEB-JUICE-003,H-E-B OJ Concentrate,2200,2026-02-25,35,0.09,WH-SAT,beverage
HEB-MEAT-044,H-E-B Chicken Breast (2lb),1600,2026-02-22,30,0.24,WH-SAT,meat
HEB-PROD-091,H-E-B Hass Avocados (bag),4200,2026-02-23,45,0.08,WH-HOU,produce
HEB-BVEG-007,H-E-B Frozen Broccoli Florets,3200,2026-08-20,0,0.31,WH-AUS,frozen
HEB-DELI-012,H-E-B Rotisserie Chicken,420,2026-02-21,36,0.19,WH-AUS,meat
HEB-BKRY-033,H-E-B Scratch Bakery Bread,880,2026-02-22,65,0.04,WH-HOU,bakery`
