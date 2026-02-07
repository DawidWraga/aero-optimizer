'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { type Supplier, type RiskLevel } from '@/data/supply-chain'
import { FuelType } from '@/data/types'
import { cn } from '@/lib/utils'
import { ArrowDown, ArrowUp, Check, Leaf, Fuel, Minus } from 'lucide-react'

const FUEL_SHORT: Record<string, string> = {
  [FuelType.KEROSENE]: 'Jet A-1',
  [FuelType.SAF]: 'SAF',
  [FuelType.LIQUID_H2]: 'LH2',
  [FuelType.ELECTRIC]: 'Electric',
}

const RISK_STYLES: Record<RiskLevel, string> = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

/** Renders a delta indicator — green for improvement, red for regression */
function Delta(opts: { current: number; alternative: number; lowerIsBetter?: boolean }) {
  const diff = opts.alternative - opts.current
  if (diff === 0) return <Minus className="size-3 text-slate-500" />
  const isImprovement = opts.lowerIsBetter ? diff < 0 : diff > 0
  return isImprovement ? (
    <ArrowUp className="size-3 text-emerald-400" />
  ) : (
    <ArrowDown className="size-3 text-rose-400" />
  )
}

export interface SupplierComparisonCardProps {
  alternative: Supplier
  current: Supplier
  onSelect: () => void
}

export function SupplierComparisonCard(props: SupplierComparisonCardProps) {
  const { alternative, current, onSelect } = props
  const isKeroOnly = alternative.fuelCompatibility.length === 1 && alternative.fuelCompatibility[0] === FuelType.KEROSENE
  const supportsSustainable = alternative.fuelCompatibility.some(
    (f) => f !== FuelType.KEROSENE
  )

  return (
    <Card className={cn(
      'border-aero-700/50 bg-aero-900/60',
      supportsSustainable && 'border-emerald-500/20',
    )}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{alternative.name}</p>
            <p className="text-xs text-slate-500">{alternative.country} · Tier {alternative.tier}</p>
          </div>
          <Badge variant="secondary" className={RISK_STYLES[alternative.risk]}>
            {alternative.risk}
          </Badge>
        </div>

        {/* Fuel compatibility */}
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Fuel Compatibility</p>
          <div className="flex items-center gap-1.5">
            {isKeroOnly ? (
              <Fuel className="size-3.5 text-rose-400 shrink-0" />
            ) : (
              <Leaf className="size-3.5 text-emerald-400 shrink-0" />
            )}
            <div className="flex gap-1 flex-wrap">
              {alternative.fuelCompatibility.map((f) => (
                <Badge
                  key={f}
                  variant="secondary"
                  className={cn(
                    'text-[10px] px-1.5',
                    f !== FuelType.KEROSENE
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-aero-900/60 text-slate-400 border-aero-700/50',
                  )}
                >
                  {FUEL_SHORT[f]}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <MetricRow label="Lead Time" value={`${alternative.leadTimeDays}d`}>
            <Delta current={current.leadTimeDays} alternative={alternative.leadTimeDays} lowerIsBetter />
          </MetricRow>
          <MetricRow label="Cost Share" value={`${alternative.costShare}%`}>
            <Delta current={current.costShare} alternative={alternative.costShare} lowerIsBetter />
          </MetricRow>
          <MetricRow label="On-Time" value={`${alternative.onTimeDelivery}%`}>
            <Delta current={current.onTimeDelivery} alternative={alternative.onTimeDelivery} />
          </MetricRow>
          <MetricRow label="Quality" value={`${alternative.qualityScore}`}>
            <Delta current={current.qualityScore} alternative={alternative.qualityScore} />
          </MetricRow>
        </div>

        {/* On-time visual */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>On-Time Delivery</span>
            <span className="font-mono">{alternative.onTimeDelivery}%</span>
          </div>
          <Progress value={alternative.onTimeDelivery} className="h-1.5" />
        </div>

        {/* Select button */}
        <Button
          className="w-full gap-2"
          size="sm"
          onClick={onSelect}
        >
          <Check className="size-3.5" />
          Select Supplier
        </Button>
      </CardContent>
    </Card>
  )
}

function MetricRow(opts: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{opts.label}</span>
      <div className="flex items-center gap-1">
        {opts.children}
        <span className="font-mono text-xs text-slate-300">{opts.value}</span>
      </div>
    </div>
  )
}
