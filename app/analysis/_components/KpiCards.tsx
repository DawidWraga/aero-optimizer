'use client'

import { Card, CardContent } from '@/components/ui/card'
import { SUPPLY_CHAIN_KPIS } from '@/app/data/supply-chain'
import { Package, Globe, Clock, ShieldAlert, TrendingUp, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

const KPIS = [
  { label: 'Total Suppliers', value: SUPPLY_CHAIN_KPIS.totalSuppliers, icon: Package, color: 'text-cyan-400' },
  { label: 'Countries', value: SUPPLY_CHAIN_KPIS.countries, icon: Globe, color: 'text-violet-400' },
  { label: 'Avg Lead Time', value: `${SUPPLY_CHAIN_KPIS.avgLeadTime}d`, icon: Clock, color: 'text-amber-400' },
  { label: 'On-Time Delivery', value: `${SUPPLY_CHAIN_KPIS.avgOnTimeDelivery}%`, icon: TrendingUp, color: 'text-emerald-400' },
  { label: 'Critical Risks', value: `${SUPPLY_CHAIN_KPIS.criticalRisks + SUPPLY_CHAIN_KPIS.highRisks}`, icon: ShieldAlert, color: 'text-rose-400' },
  { label: 'Annual Spend', value: SUPPLY_CHAIN_KPIS.totalAnnualSpend, icon: DollarSign, color: 'text-cyan-400' },
]

export interface KpiCardsProps {}

export function KpiCards(props: KpiCardsProps) {
  const {} = props

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {KPIS.map((kpi) => (
        <Card key={kpi.label} className="bg-aero-800/60 border-aero-700/50">
          <CardContent className="flex items-center gap-3 pt-1 pb-1">
            <div className={cn('rounded-lg bg-aero-900/80 p-2', kpi.color)}>
              <kpi.icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 truncate">{kpi.label}</p>
              <p className="text-lg font-semibold font-mono tracking-tight">{kpi.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
