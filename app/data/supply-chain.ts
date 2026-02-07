import { FuelType } from './types'

/** Supply chain risk levels */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

/** Supplier tier in the supply chain hierarchy */
export type SupplierTier = 1 | 2 | 3

export interface Supplier {
  id: string
  name: string
  tier: SupplierTier
  country: string
  region: string
  component: string
  leadTimeDays: number
  costShare: number
  risk: RiskLevel
  onTimeDelivery: number
  qualityScore: number
  /** Fuel types this supplier's parts are compatible with */
  fuelCompatibility: FuelType[]
}

export interface Airplane {
  id: string
  name: string
  model: string
  /** Maps component name -> assigned supplier id */
  suppliers: Record<string, string>
}

export interface ComponentGroup {
  name: string
  costPercent: number
  color: string
  supplierCount: number
}

export interface LeadTimeData {
  component: string
  current: number
  target: number
}

export interface RiskEvent {
  id: string
  title: string
  risk: RiskLevel
  impact: string
  supplier: string
  mitigation: string
  probability: number
}

export interface MonthlySpend {
  month: string
  tier1: number
  tier2: number
  tier3: number
}

// ── Mock suppliers ─────────────────────────────────────────

const ALL_FUELS = [FuelType.KEROSENE, FuelType.SAF, FuelType.LIQUID_H2, FuelType.ELECTRIC]
const CONVENTIONAL = [FuelType.KEROSENE]
const KEROSENE_SAF = [FuelType.KEROSENE, FuelType.SAF]

/** All known suppliers (assigned + alternatives) */
export const ALL_SUPPLIERS: Supplier[] = [
  // ── Engines ──────────────────────────────────────────────
  { id: 's1', name: 'Rolls-Royce', tier: 1, country: 'UK', region: 'Europe', component: 'Engines', leadTimeDays: 180, costShare: 22, risk: 'low', onTimeDelivery: 96, qualityScore: 98, fuelCompatibility: KEROSENE_SAF },
  { id: 'alt-eng-1', name: 'CFM International', tier: 1, country: 'France', region: 'Europe', component: 'Engines', leadTimeDays: 170, costShare: 24, risk: 'low', onTimeDelivery: 95, qualityScore: 97, fuelCompatibility: ALL_FUELS },
  { id: 'alt-eng-2', name: 'Pratt & Whitney', tier: 1, country: 'USA', region: 'North America', component: 'Engines', leadTimeDays: 190, costShare: 21, risk: 'medium', onTimeDelivery: 89, qualityScore: 94, fuelCompatibility: KEROSENE_SAF },
  { id: 'alt-eng-3', name: 'GE Aerospace', tier: 1, country: 'USA', region: 'North America', component: 'Engines', leadTimeDays: 175, costShare: 23, risk: 'low', onTimeDelivery: 93, qualityScore: 96, fuelCompatibility: ALL_FUELS },

  // ── Landing Gear ─────────────────────────────────────────
  { id: 's2', name: 'Safran', tier: 1, country: 'France', region: 'Europe', component: 'Landing Gear', leadTimeDays: 150, costShare: 14, risk: 'low', onTimeDelivery: 94, qualityScore: 97, fuelCompatibility: ALL_FUELS },
  { id: 'alt-lg-1', name: 'Héroux-Devtek', tier: 1, country: 'Canada', region: 'North America', component: 'Landing Gear', leadTimeDays: 140, costShare: 13, risk: 'low', onTimeDelivery: 92, qualityScore: 95, fuelCompatibility: ALL_FUELS },
  { id: 'alt-lg-2', name: 'Liebherr Aerospace', tier: 1, country: 'Germany', region: 'Europe', component: 'Landing Gear', leadTimeDays: 155, costShare: 15, risk: 'low', onTimeDelivery: 93, qualityScore: 96, fuelCompatibility: ALL_FUELS },

  // ── Avionics ─────────────────────────────────────────────
  { id: 's3', name: 'Collins Aerospace', tier: 1, country: 'USA', region: 'North America', component: 'Avionics', leadTimeDays: 120, costShare: 12, risk: 'medium', onTimeDelivery: 91, qualityScore: 95, fuelCompatibility: CONVENTIONAL },
  { id: 'alt-av-1', name: 'Thales Avionics', tier: 1, country: 'France', region: 'Europe', component: 'Avionics', leadTimeDays: 110, costShare: 13, risk: 'low', onTimeDelivery: 94, qualityScore: 97, fuelCompatibility: ALL_FUELS },
  { id: 'alt-av-2', name: 'Honeywell Aerospace', tier: 1, country: 'USA', region: 'North America', component: 'Avionics', leadTimeDays: 115, costShare: 14, risk: 'low', onTimeDelivery: 93, qualityScore: 96, fuelCompatibility: KEROSENE_SAF },

  // ── Fuselage ─────────────────────────────────────────────
  { id: 's4', name: 'Spirit AeroSystems', tier: 1, country: 'USA', region: 'North America', component: 'Fuselage', leadTimeDays: 200, costShare: 18, risk: 'medium', onTimeDelivery: 88, qualityScore: 93, fuelCompatibility: CONVENTIONAL },
  { id: 'alt-fus-1', name: 'Aernnova', tier: 1, country: 'Spain', region: 'Europe', component: 'Fuselage', leadTimeDays: 185, costShare: 17, risk: 'low', onTimeDelivery: 92, qualityScore: 95, fuelCompatibility: ALL_FUELS },
  { id: 'alt-fus-2', name: 'FACC AG', tier: 1, country: 'Austria', region: 'Europe', component: 'Fuselage', leadTimeDays: 195, costShare: 16, risk: 'low', onTimeDelivery: 91, qualityScore: 96, fuelCompatibility: KEROSENE_SAF },

  // ── Composite Panels ─────────────────────────────────────
  { id: 's5', name: 'Hexcel', tier: 2, country: 'USA', region: 'North America', component: 'Composite Panels', leadTimeDays: 90, costShare: 8, risk: 'low', onTimeDelivery: 95, qualityScore: 96, fuelCompatibility: ALL_FUELS },
  { id: 'alt-cp-1', name: 'Solvay Composites', tier: 2, country: 'Belgium', region: 'Europe', component: 'Composite Panels', leadTimeDays: 85, costShare: 9, risk: 'low', onTimeDelivery: 93, qualityScore: 95, fuelCompatibility: ALL_FUELS },

  // ── Flight Control Systems ───────────────────────────────
  { id: 's6', name: 'Moog Inc.', tier: 2, country: 'USA', region: 'North America', component: 'Flight Control Systems', leadTimeDays: 110, costShare: 6, risk: 'low', onTimeDelivery: 93, qualityScore: 95, fuelCompatibility: KEROSENE_SAF },
  { id: 'alt-fcs-1', name: 'Parker Hannifin', tier: 2, country: 'USA', region: 'North America', component: 'Flight Control Systems', leadTimeDays: 100, costShare: 7, risk: 'low', onTimeDelivery: 91, qualityScore: 94, fuelCompatibility: ALL_FUELS },

  // ── Actuation Systems ────────────────────────────────────
  { id: 's7', name: 'Curtiss-Wright', tier: 2, country: 'USA', region: 'North America', component: 'Actuation Systems', leadTimeDays: 85, costShare: 4, risk: 'medium', onTimeDelivery: 90, qualityScore: 94, fuelCompatibility: CONVENTIONAL },
  { id: 'alt-act-1', name: 'Eaton Aerospace', tier: 2, country: 'Ireland', region: 'Europe', component: 'Actuation Systems', leadTimeDays: 80, costShare: 5, risk: 'low', onTimeDelivery: 94, qualityScore: 96, fuelCompatibility: ALL_FUELS },

  // ── Thermal Systems ──────────────────────────────────────
  { id: 's8', name: 'Meggitt', tier: 2, country: 'UK', region: 'Europe', component: 'Thermal Systems', leadTimeDays: 75, costShare: 3, risk: 'low', onTimeDelivery: 92, qualityScore: 96, fuelCompatibility: KEROSENE_SAF },

  // ── Aluminum Alloys ──────────────────────────────────────
  { id: 's9', name: 'Alcoa', tier: 3, country: 'USA', region: 'North America', component: 'Aluminum Alloys', leadTimeDays: 45, costShare: 4, risk: 'medium', onTimeDelivery: 89, qualityScore: 92, fuelCompatibility: ALL_FUELS },
  { id: 'alt-al-1', name: 'Constellium', tier: 3, country: 'France', region: 'Europe', component: 'Aluminum Alloys', leadTimeDays: 40, costShare: 4, risk: 'low', onTimeDelivery: 93, qualityScore: 95, fuelCompatibility: ALL_FUELS },

  // ── Carbon Fiber ─────────────────────────────────────────
  { id: 's10', name: 'Toray Industries', tier: 3, country: 'Japan', region: 'Asia Pacific', component: 'Carbon Fiber', leadTimeDays: 60, costShare: 5, risk: 'high', onTimeDelivery: 85, qualityScore: 97, fuelCompatibility: ALL_FUELS },
  { id: 'alt-cf-1', name: 'Teijin Carbon', tier: 3, country: 'Japan', region: 'Asia Pacific', component: 'Carbon Fiber', leadTimeDays: 55, costShare: 6, risk: 'medium', onTimeDelivery: 88, qualityScore: 95, fuelCompatibility: ALL_FUELS },

  // ── Titanium Forgings ────────────────────────────────────
  { id: 's11', name: 'Titanium Metals Corp', tier: 3, country: 'USA', region: 'North America', component: 'Titanium Forgings', leadTimeDays: 70, costShare: 3, risk: 'critical', onTimeDelivery: 82, qualityScore: 91, fuelCompatibility: CONVENTIONAL },
  { id: 'alt-ti-1', name: 'VSMPO-AVISMA', tier: 3, country: 'Russia', region: 'Europe', component: 'Titanium Forgings', leadTimeDays: 80, costShare: 3, risk: 'high', onTimeDelivery: 78, qualityScore: 90, fuelCompatibility: ALL_FUELS },
  { id: 'alt-ti-2', name: 'ATI Inc.', tier: 3, country: 'USA', region: 'North America', component: 'Titanium Forgings', leadTimeDays: 65, costShare: 4, risk: 'low', onTimeDelivery: 91, qualityScore: 94, fuelCompatibility: ALL_FUELS },

  // ── Adhesives & Sealants ─────────────────────────────────
  { id: 's12', name: 'Solvay', tier: 3, country: 'Belgium', region: 'Europe', component: 'Adhesives & Sealants', leadTimeDays: 30, costShare: 1, risk: 'low', onTimeDelivery: 97, qualityScore: 98, fuelCompatibility: ALL_FUELS },
]

/** Helper to look up a supplier by id */
export function getSupplierById(opts: { supplierId: string }): Supplier | undefined {
  return ALL_SUPPLIERS.find((s) => s.id === opts.supplierId)
}

/** Get all alternative suppliers for a given component (excluding the current one) */
export function getAlternatives(opts: { component: string; currentSupplierId: string }): Supplier[] {
  return ALL_SUPPLIERS.filter((s) => s.component === opts.component && s.id !== opts.currentSupplierId)
}

/** All unique component names */
export const COMPONENTS = [...new Set(ALL_SUPPLIERS.map((s) => s.component))]

// ── Compatible component alternatives ──────────────────────

export interface ComponentAlternative {
  component: string
  /** Why this is a viable substitute */
  rationale: string
  /** Trade-off summary */
  tradeoff: string
  /** Weight delta in kg (negative = lighter) */
  weightDelta: number
  /** Cost delta as percentage (negative = cheaper) */
  costDelta: number
  /** Sustainability score 0-100 */
  sustainabilityScore: number
  /** Structural integrity score 0-100 */
  structuralScore: number
  /** Default supplier id for this component */
  defaultSupplierId: string
}

/**
 * Maps a component to its substitutable alternatives.
 * E.g. Titanium Forgings can be swapped for Aluminum Alloys or Composite Panels.
 */
export const COMPATIBLE_COMPONENTS: Record<string, ComponentAlternative[]> = {
  'Titanium Forgings': [
    { component: 'Aluminum Alloys', rationale: 'Lower-density alloy for non-critical structural joins', tradeoff: 'Lighter & cheaper but lower fatigue resistance', weightDelta: -120, costDelta: -35, sustainabilityScore: 72, structuralScore: 68, defaultSupplierId: 's9' },
    { component: 'Composite Panels', rationale: 'Carbon-fiber-reinforced polymer as structural replacement', tradeoff: 'Excellent weight savings; longer lead time for certification', weightDelta: -200, costDelta: 15, sustainabilityScore: 85, structuralScore: 78, defaultSupplierId: 's5' },
  ],
  'Aluminum Alloys': [
    { component: 'Composite Panels', rationale: 'Advanced composites as full structural replacement', tradeoff: 'Lighter but more expensive; superior corrosion resistance', weightDelta: -90, costDelta: 25, sustainabilityScore: 88, structuralScore: 82, defaultSupplierId: 's5' },
    { component: 'Titanium Forgings', rationale: 'High-strength titanium for critical load paths', tradeoff: 'Heavier & more expensive; far superior fatigue life', weightDelta: 120, costDelta: 40, sustainabilityScore: 55, structuralScore: 96, defaultSupplierId: 'alt-ti-2' },
  ],
  'Carbon Fiber': [
    { component: 'Composite Panels', rationale: 'Pre-impregnated composite panels with embedded fiber', tradeoff: 'Easier manufacturing; slightly lower tensile strength', weightDelta: 15, costDelta: -10, sustainabilityScore: 80, structuralScore: 85, defaultSupplierId: 's5' },
  ],
  'Composite Panels': [
    { component: 'Aluminum Alloys', rationale: 'Traditional alloy panels for cost-sensitive areas', tradeoff: 'Cheaper but heavier; well-understood maintenance', weightDelta: 90, costDelta: -30, sustainabilityScore: 60, structuralScore: 75, defaultSupplierId: 'alt-al-1' },
    { component: 'Carbon Fiber', rationale: 'Raw carbon fiber layup for maximum strength-to-weight', tradeoff: 'Best strength-to-weight but expensive and slow to produce', weightDelta: -15, costDelta: 20, sustainabilityScore: 82, structuralScore: 95, defaultSupplierId: 's10' },
  ],
  'Engines': [
    { component: 'Engines', rationale: 'Hydrogen fuel-cell powertrain (experimental)', tradeoff: 'Zero emissions; limited range; requires new infrastructure', weightDelta: 300, costDelta: 80, sustainabilityScore: 98, structuralScore: 70, defaultSupplierId: 'alt-eng-1' },
  ],
  'Actuation Systems': [
    { component: 'Flight Control Systems', rationale: 'Integrated fly-by-wire with built-in actuation', tradeoff: 'Consolidated system reduces part count; higher upfront cost', weightDelta: -25, costDelta: 30, sustainabilityScore: 78, structuralScore: 88, defaultSupplierId: 'alt-fcs-1' },
  ],
  'Flight Control Systems': [
    { component: 'Actuation Systems', rationale: 'Discrete actuators with separate FCS controller', tradeoff: 'More modular; easier to service individual units', weightDelta: 25, costDelta: -20, sustainabilityScore: 70, structuralScore: 80, defaultSupplierId: 'alt-act-1' },
  ],
}

/** Check if a component has compatible alternatives */
export function hasCompatibleComponents(opts: { component: string }): boolean {
  return (COMPATIBLE_COMPONENTS[opts.component]?.length ?? 0) > 0
}

/** Get compatible component alternatives */
export function getCompatibleComponents(opts: { component: string }): ComponentAlternative[] {
  return COMPATIBLE_COMPONENTS[opts.component] ?? []
}

// ── Backward-compat: SUPPLIERS is the "default" set (original 12) ──
export const SUPPLIERS = ALL_SUPPLIERS.filter((s) => s.id.startsWith('s'))

// ── Airplanes ──────────────────────────────────────────────

export const INITIAL_AIRPLANES: Airplane[] = [
  {
    id: 'a320neo',
    name: 'A320neo',
    model: 'Airbus A320neo',
    suppliers: {
      'Engines': 'alt-eng-1',           // CFM — all fuels
      'Landing Gear': 's2',             // Safran
      'Avionics': 'alt-av-1',           // Thales — all fuels
      'Fuselage': 'alt-fus-1',          // Aernnova — all fuels
      'Composite Panels': 's5',         // Hexcel
      'Flight Control Systems': 'alt-fcs-1', // Parker — all fuels
      'Actuation Systems': 'alt-act-1', // Eaton — all fuels
      'Thermal Systems': 's8',          // Meggitt
      'Aluminum Alloys': 'alt-al-1',    // Constellium
      'Carbon Fiber': 's10',            // Toray — high risk
      'Titanium Forgings': 'alt-ti-2',  // ATI
      'Adhesives & Sealants': 's12',    // Solvay
    },
  },
  {
    id: '737max',
    name: '737 MAX',
    model: 'Boeing 737 MAX',
    suppliers: {
      'Engines': 's1',                  // Rolls-Royce — kerosene+SAF only
      'Landing Gear': 's2',             // Safran
      'Avionics': 's3',                 // Collins — kerosene only ⚠️
      'Fuselage': 's4',                 // Spirit — kerosene only ⚠️
      'Composite Panels': 's5',         // Hexcel
      'Flight Control Systems': 's6',   // Moog — kerosene+SAF
      'Actuation Systems': 's7',        // Curtiss-Wright — kerosene only ⚠️
      'Thermal Systems': 's8',          // Meggitt
      'Aluminum Alloys': 's9',          // Alcoa — medium risk
      'Carbon Fiber': 's10',            // Toray — high risk
      'Titanium Forgings': 's11',       // TIMET — critical ⚠️
      'Adhesives & Sealants': 's12',    // Solvay
    },
  },
  {
    id: 'zeroe',
    name: 'ZEROe H2',
    model: 'Airbus ZEROe Concept',
    suppliers: {
      'Engines': 'alt-eng-1',           // CFM — all fuels
      'Landing Gear': 'alt-lg-1',       // Héroux-Devtek
      'Avionics': 'alt-av-1',           // Thales — all fuels
      'Fuselage': 'alt-fus-1',          // Aernnova — all fuels
      'Composite Panels': 's5',         // Hexcel
      'Flight Control Systems': 'alt-fcs-1', // Parker — all fuels
      'Actuation Systems': 'alt-act-1', // Eaton — all fuels
      'Thermal Systems': 's8',          // Meggitt — kerosene+SAF ⚠️
      'Aluminum Alloys': 'alt-al-1',    // Constellium
      'Carbon Fiber': 'alt-cf-1',       // Teijin — medium risk
      'Titanium Forgings': 'alt-ti-2',  // ATI
      'Adhesives & Sealants': 's12',    // Solvay
    },
  },
]

// ── Chart / misc data (unchanged) ──────────────────────────

export const COMPONENT_GROUPS: ComponentGroup[] = [
  { name: 'Engines & Nacelles', costPercent: 28, color: '#22d3ee', supplierCount: 4 },
  { name: 'Fuselage & Structure', costPercent: 22, color: '#a78bfa', supplierCount: 3 },
  { name: 'Avionics & Electronics', costPercent: 15, color: '#4ade80', supplierCount: 2 },
  { name: 'Landing Gear', costPercent: 12, color: '#fbbf24', supplierCount: 2 },
  { name: 'Flight Controls', costPercent: 10, color: '#f472b6', supplierCount: 2 },
  { name: 'Interior & Cabin', costPercent: 8, color: '#fb923c', supplierCount: 3 },
  { name: 'Raw Materials', costPercent: 5, color: '#94a3b8', supplierCount: 4 },
]

export const LEAD_TIME_DATA: LeadTimeData[] = [
  { component: 'Engines', current: 180, target: 150 },
  { component: 'Fuselage', current: 200, target: 160 },
  { component: 'Landing Gear', current: 150, target: 120 },
  { component: 'Avionics', current: 120, target: 90 },
  { component: 'Composites', current: 90, target: 70 },
  { component: 'Flight Controls', current: 110, target: 85 },
  { component: 'Titanium Forgings', current: 70, target: 50 },
  { component: 'Carbon Fiber', current: 60, target: 40 },
]

export const RISK_EVENTS: RiskEvent[] = [
  { id: 'r1', title: 'Titanium supply disruption', risk: 'critical', impact: 'Production halt — 3-week delay per aircraft', supplier: 'Titanium Metals Corp', mitigation: 'Dual-source from VSMPO-AVISMA; 6-month strategic buffer stock', probability: 35 },
  { id: 'r2', title: 'Carbon fiber shortage', risk: 'high', impact: 'Wing panel production delayed 2 weeks', supplier: 'Toray Industries', mitigation: 'Qualify Hexcel as alternate supplier; increase safety stock to 90 days', probability: 25 },
  { id: 'r3', title: 'Avionics chip lead-time increase', risk: 'medium', impact: 'Cockpit integration pushed back 10 days', supplier: 'Collins Aerospace', mitigation: 'Long-term purchase agreements; pre-order 12-month chip inventory', probability: 40 },
  { id: 'r4', title: 'Fuselage quality non-conformance', risk: 'medium', impact: 'Rework adds 5 days per unit', supplier: 'Spirit AeroSystems', mitigation: 'Embedded quality engineers; real-time defect monitoring system', probability: 20 },
  { id: 'r5', title: 'Geopolitical trade restriction', risk: 'high', impact: 'Loss of rare-earth magnets for actuators', supplier: 'Moog Inc.', mitigation: 'Diversify sourcing to non-restricted regions; redesign with alternative materials', probability: 15 },
]

export const MONTHLY_SPEND: MonthlySpend[] = [
  { month: 'Jul', tier1: 42, tier2: 18, tier3: 8 },
  { month: 'Aug', tier1: 45, tier2: 19, tier3: 9 },
  { month: 'Sep', tier1: 48, tier2: 20, tier3: 9 },
  { month: 'Oct', tier1: 44, tier2: 21, tier3: 10 },
  { month: 'Nov', tier1: 50, tier2: 22, tier3: 11 },
  { month: 'Dec', tier1: 52, tier2: 23, tier3: 10 },
  { month: 'Jan', tier1: 47, tier2: 21, tier3: 12 },
  { month: 'Feb', tier1: 51, tier2: 24, tier3: 11 },
  { month: 'Mar', tier1: 55, tier2: 25, tier3: 13 },
  { month: 'Apr', tier1: 53, tier2: 23, tier3: 12 },
  { month: 'May', tier1: 58, tier2: 26, tier3: 14 },
  { month: 'Jun', tier1: 60, tier2: 28, tier3: 13 },
]

// ── Derived KPIs ──────────────────────────────────────────

export const SUPPLY_CHAIN_KPIS = {
  totalSuppliers: SUPPLIERS.length,
  countries: [...new Set(SUPPLIERS.map((s) => s.country))].length,
  avgLeadTime: Math.round(SUPPLIERS.reduce((a, s) => a + s.leadTimeDays, 0) / SUPPLIERS.length),
  avgOnTimeDelivery: +(SUPPLIERS.reduce((a, s) => a + s.onTimeDelivery, 0) / SUPPLIERS.length).toFixed(1),
  avgQualityScore: +(SUPPLIERS.reduce((a, s) => a + s.qualityScore, 0) / SUPPLIERS.length).toFixed(1),
  criticalRisks: RISK_EVENTS.filter((r) => r.risk === 'critical').length,
  highRisks: RISK_EVENTS.filter((r) => r.risk === 'high').length,
  totalAnnualSpend: '$1.04B',
}
