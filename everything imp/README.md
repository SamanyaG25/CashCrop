# 🌱 CashCrop — AI Energy Intelligence for Food Supply Chains

> Built for **c0mpiled × Texas Venture Group Hackathon 2026**  
> With YC Founders in Attendance · UT Austin · ERCOT Grid · H-E-B Partnership Dataset

---

## What It Does

CashCrop connects AI with cold chain refrigeration to slash energy costs and prevent food waste — without any new hardware.

For every SKU in a warehouse, CashCrop asks:
- **Reduce temp 2°F overnight?** → Save 150 kWh
- **Discount 10% to sell before expiry?** → Protect $2,400 revenue
- **Donate to food bank?** → $200 tax credit, avoid 50 kg CO₂
- **Shift compressor to off-peak?** → Avoid $0.31/kWh ERCOT peak pricing

All recommendations are AI-generated, energy-aware, and show exact numbers: money saved, energy saved, and carbon avoided.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### With Morph AI (optional)

Add to `.env.local`:
```env
MORPH_API_KEY=sk-morph-your-key-here
```

Without a key, CashCrop runs a rule-based optimization engine that works perfectly for demos.

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # Main dashboard (Morph integration, HEB data input)
│   ├── layout.tsx                # Theme provider (light/dark, DM Serif Display)
│   ├── globals.css               # Pink Lace #FFC3E0 + Forest Green #0F5730 palette
│   └── api/
│       └── optimize/
│           └── route.ts          # POST /api/optimize — Morph API bridge
├── lib/
│   ├── morphOptimization.ts      # Morph API client + rule engine fallback
│   ├── optimization-engine.ts    # Local rule-based optimizer (demo-safe)
│   └── mock-data.ts             # H-E-B Texas dataset + energy pricing
└── components/
    ├── header.tsx                # Dark/light mode toggle + hackathon badges
    ├── kpi-cards.tsx             # Animated counters: savings, carbon, revenue
    ├── energy-price-chart.tsx    # ERCOT 24h pricing + carbon intensity
    ├── savings-chart.tsx         # Weekly savings overview
    ├── optimization-panel.tsx    # Per-SKU AI recommendations
    ├── inventory-table.tsx       # Full inventory with risk badges
    ├── warehouse-cards.tsx       # H-E-B Austin / San Antonio / Houston nodes
    └── csv-upload.tsx            # Drag & drop CSV import
```

---

## Demo Flow (Hackathon)

1. **Open the dashboard** — pre-loaded with H-E-B dataset
2. **Click "Run AI Optimization"** — rule engine fires instantly (or Morph API if key set)
3. **Show KPI cards** — $7,100 energy savings, 3,630 kg CO₂ avoided
4. **Open Optimization tab** — per-SKU recommendations with action badges
5. **Paste new dataset** in the Data Input area → Run again → numbers update live
6. **Toggle light/dark** with the sun/moon button in the header
7. **Export CSV** of all recommendations for the judges

---

## API Route

```
POST /api/optimize
Content-Type: application/json

{
  "inventory": [
    { "sku": "HEB-DAIRY-001", "name": "Greek Yogurt", "units": 2400,
      "expiry": 1, "tempF": 38, "kwhPerHour": 0.14, "warehouse": "WH-AUS" }
  ],
  "energyPricing": {
    "currentPriceKwh": 0.29, "isPeak": true,
    "peakWindow": "4 PM – 8 PM", "offPeakWindow": "12 AM – 5 AM",
    "carbonIntensity": 385
  },
  "morphApiKey": "optional-if-not-in-env"
}
```

Returns structured `MorphResult` with per-SKU recommendations and summary.

---

## Color System

| Token | Light | Dark |
|-------|-------|------|
| Background | `#fdf0f6` (blush) | `#0a1f12` (deep forest) |
| Card | `#fff8fb` | `#0e2918` |
| Primary | `#0F5730` Forest Green | `#3ecf78` bright green |
| Accent | `#FFC3E0` Pink Lace | `#e8a5c8` muted pink |

---

## Tech Stack

- **Next.js 15** (App Router) + **React 19**
- **Tailwind CSS v4** with CSS variable theming
- **Recharts** for energy & savings visualizations
- **Morph v3-fast** for AI optimization (rule engine fallback)
- **TypeScript** throughout

---

*CashCrop makes food supply chains energy-intelligent — one cold room at a time.*
