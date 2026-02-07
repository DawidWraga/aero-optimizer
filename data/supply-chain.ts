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

// ── Mock data ──────────────────────────────────────────────

export const SUPPLIERS: Supplier[] = [
  // Tier 1 — Major system integrators
  { id: 's1', name: 'Rolls-Royce', tier: 1, country: 'UK', region: 'Europe', component: 'Engines', leadTimeDays: 180, costShare: 22, risk: 'low', onTimeDelivery: 96, qualityScore: 98 },
  { id: 's2', name: 'Safran', tier: 1, country: 'France', region: 'Europe', component: 'Landing Gear', leadTimeDays: 150, costShare: 14, risk: 'low', onTimeDelivery: 94, qualityScore: 97 },
  { id: 's3', name: 'Collins Aerospace', tier: 1, country: 'USA', region: 'North America', component: 'Avionics', leadTimeDays: 120, costShare: 12, risk: 'medium', onTimeDelivery: 91, qualityScore: 95 },
  { id: 's4', name: 'Spirit AeroSystems', tier: 1, country: 'USA', region: 'North America', component: 'Fuselage', leadTimeDays: 200, costShare: 18, risk: 'medium', onTimeDelivery: 88, qualityScore: 93 },

  // Tier 2 — Subsystem / component suppliers
  { id: 's5', name: 'Hexcel', tier: 2, country: 'USA', region: 'North America', component: 'Composite Panels', leadTimeDays: 90, costShare: 8, risk: 'low', onTimeDelivery: 95, qualityScore: 96 },
  { id: 's6', name: 'Liebherr Aerospace', tier: 2, country: 'Germany', region: 'Europe', component: 'Flight Control Systems', leadTimeDays: 110, costShare: 6, risk: 'low', onTimeDelivery: 93, qualityScore: 95 },
  { id: 's7', name: 'Moog Inc.', tier: 2, country: 'USA', region: 'North America', component: 'Actuation Systems', leadTimeDays: 85, costShare: 4, risk: 'medium', onTimeDelivery: 90, qualityScore: 94 },
  { id: 's8', name: 'Meggitt', tier: 2, country: 'UK', region: 'Europe', component: 'Thermal Systems', leadTimeDays: 75, costShare: 3, risk: 'low', onTimeDelivery: 92, qualityScore: 96 },

  // Tier 3 — Raw material / specialty suppliers
  { id: 's9', name: 'Alcoa', tier: 3, country: 'USA', region: 'North America', component: 'Aluminum Alloys', leadTimeDays: 45, costShare: 4, risk: 'medium', onTimeDelivery: 89, qualityScore: 92 },
  { id: 's10', name: 'Toray Industries', tier: 3, country: 'Japan', region: 'Asia Pacific', component: 'Carbon Fiber', leadTimeDays: 60, costShare: 5, risk: 'high', onTimeDelivery: 85, qualityScore: 97 },
  { id: 's11', name: 'Titanium Metals Corp', tier: 3, country: 'USA', region: 'North America', component: 'Titanium Forgings', leadTimeDays: 70, costShare: 3, risk: 'critical', onTimeDelivery: 82, qualityScore: 91 },
  { id: 's12', name: 'Solvay', tier: 3, country: 'Belgium', region: 'Europe', component: 'Adhesives & Sealants', leadTimeDays: 30, costShare: 1, risk: 'low', onTimeDelivery: 97, qualityScore: 98 },
]

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
  {
    id: 'r1',
    title: 'Titanium supply disruption',
    risk: 'critical',
    impact: 'Production halt — 3-week delay per aircraft',
    supplier: 'Titanium Metals Corp',
    mitigation: 'Dual-source from VSMPO-AVISMA; 6-month strategic buffer stock',
    probability: 35,
  },
  {
    id: 'r2',
    title: 'Carbon fiber shortage',
    risk: 'high',
    impact: 'Wing panel production delayed 2 weeks',
    supplier: 'Toray Industries',
    mitigation: 'Qualify Hexcel as alternate supplier; increase safety stock to 90 days',
    probability: 25,
  },
  {
    id: 'r3',
    title: 'Avionics chip lead-time increase',
    risk: 'medium',
    impact: 'Cockpit integration pushed back 10 days',
    supplier: 'Collins Aerospace',
    mitigation: 'Long-term purchase agreements; pre-order 12-month chip inventory',
    probability: 40,
  },
  {
    id: 'r4',
    title: 'Fuselage quality non-conformance',
    risk: 'medium',
    impact: 'Rework adds 5 days per unit',
    supplier: 'Spirit AeroSystems',
    mitigation: 'Embedded quality engineers; real-time defect monitoring system',
    probability: 20,
  },
  {
    id: 'r5',
    title: 'Geopolitical trade restriction',
    risk: 'high',
    impact: 'Loss of rare-earth magnets for actuators',
    supplier: 'Moog Inc.',
    mitigation: 'Diversify sourcing to non-restricted regions; redesign with alternative materials',
    probability: 15,
  },
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
