'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SUPPLIERS } from '@/data/supply-chain'
import { cn } from '@/lib/utils'

const TIERS = [
  {
    tier: 1 as const,
    label: 'Tier 1 — System Integrators',
    description: 'Major assemblies: engines, fuselage, landing gear, avionics',
    color: 'bg-cyan-400',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-400/20',
  },
  {
    tier: 2 as const,
    label: 'Tier 2 — Subsystem Suppliers',
    description: 'Flight controls, thermal systems, composites, actuation',
    color: 'bg-violet-400',
    textColor: 'text-violet-400',
    borderColor: 'border-violet-400/20',
  },
  {
    tier: 3 as const,
    label: 'Tier 3 — Material Suppliers',
    description: 'Raw materials: aluminum, carbon fiber, titanium, adhesives',
    color: 'bg-slate-400',
    textColor: 'text-slate-400',
    borderColor: 'border-slate-400/20',
  },
]

export interface TierBreakdownProps {}

export function TierBreakdown(props: TierBreakdownProps) {
  const {} = props

  return (
    <Card className="bg-aero-800/60 border-aero-700/50">
      <CardHeader>
        <CardTitle className="text-sm font-mono">Supplier Tier Breakdown</CardTitle>
        <CardDescription>Supply chain hierarchy overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {TIERS.map((t) => {
          const suppliers = SUPPLIERS.filter((s) => s.tier === t.tier)
          const avgLeadTime = Math.round(suppliers.reduce((a, s) => a + s.leadTimeDays, 0) / suppliers.length)
          const totalCost = suppliers.reduce((a, s) => a + s.costShare, 0)

          return (
            <div key={t.tier} className={cn('rounded-lg border border-aero-700/40 bg-aero-900/40 p-4')}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-2 h-2 rounded-full', t.color)} />
                <h4 className={cn('text-sm font-semibold', t.textColor)}>{t.label}</h4>
              </div>
              <p className="text-xs text-slate-500 mb-3">{t.description}</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Suppliers</p>
                  <p className="font-mono font-semibold text-sm">{suppliers.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Avg Lead Time</p>
                  <p className="font-mono font-semibold text-sm">{avgLeadTime}d</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Cost Share</p>
                  <p className="font-mono font-semibold text-sm">{totalCost}%</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {suppliers.map((s) => (
                  <span key={s.id} className="text-xs bg-aero-800 border border-aero-700/50 rounded px-2 py-0.5 text-slate-400">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
