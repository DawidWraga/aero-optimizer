'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupplyChain, type SupplierRiskRow } from '@/context/SupplyChainContext'
import { getAlternatives, type Supplier, type RiskLevel } from '@/data/supply-chain'
import { FuelType } from '@/data/types'
import { cn } from '@/lib/utils'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { toast } from 'sonner'
import { Check, Leaf, Fuel, Star } from 'lucide-react'

const RISK_STYLES: Record<RiskLevel, string> = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

const FUEL_SHORT: Record<string, string> = {
  [FuelType.KEROSENE]: 'Jet A-1',
  [FuelType.SAF]: 'SAF',
  [FuelType.LIQUID_H2]: 'LH2',
  [FuelType.ELECTRIC]: 'Electric',
}

/** Colors assigned to each supplier in charts */
const CHART_COLORS = ['#f97316', '#22d3ee', '#a78bfa', '#4ade80', '#f472b6']

export interface ComparisonSheetProps {
  row: SupplierRiskRow | null
  onClose: () => void
}

export function ComparisonSheet(props: ComparisonSheetProps) {
  const { row, onClose } = props
  const { selectedAirplane, swapSupplier } = useSupplyChain()

  if (!row) return <Sheet open={false}><SheetContent /></Sheet>

  const alternatives = getAlternatives({
    component: row.component,
    currentSupplierId: row.supplier.id,
  })

  const allOptions = [row.supplier, ...alternatives]

  const handleSelect = (opts: { newSupplierId: string; newSupplierName: string }) => {
    swapSupplier({
      airplaneId: selectedAirplane.id,
      component: row.component,
      newSupplierId: opts.newSupplierId,
    })
    toast.success(`Supplier changed`, {
      description: `${row.component}: ${row.supplier.name} → ${opts.newSupplierName}`,
    })
    onClose()
  }

  // ── Chart data builders ────────────────────────────────

  const chartConfig = allOptions.reduce<ChartConfig>((acc, s, i) => {
    acc[s.id] = { label: s.name, color: CHART_COLORS[i % CHART_COLORS.length] }
    return acc
  }, {})

  /** Radar data: normalize each metric 0-100 for comparison */
  const radarData = [
    { metric: 'Quality', ...Object.fromEntries(allOptions.map((s) => [s.id, s.qualityScore])) },
    { metric: 'On-Time', ...Object.fromEntries(allOptions.map((s) => [s.id, s.onTimeDelivery])) },
    { metric: 'Speed', ...Object.fromEntries(allOptions.map((s) => [s.id, Math.max(0, 100 - (s.leadTimeDays / 2))])) },
    { metric: 'Cost Eff.', ...Object.fromEntries(allOptions.map((s) => [s.id, Math.max(0, 100 - s.costShare * 2)])) },
    { metric: 'Fuel Range', ...Object.fromEntries(allOptions.map((s) => [s.id, s.fuelCompatibility.length * 25])) },
  ]

  /** Bar data for head-to-head metric comparison */
  const barData = allOptions.map((s, i) => ({
    name: s.name,
    leadTime: s.leadTimeDays,
    onTime: s.onTimeDelivery,
    quality: s.qualityScore,
    cost: s.costShare,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const barConfig: ChartConfig = {
    leadTime: { label: 'Lead Time (days)', color: '#f97316' },
    onTime: { label: 'On-Time %', color: '#22d3ee' },
    quality: { label: 'Quality Score', color: '#a78bfa' },
    cost: { label: 'Cost Share %', color: '#4ade80' },
  }

  return (
    <Sheet open={!!row} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[90vw]! max-w-5xl! overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="font-mono">
            Change Supplier — {row.component}
          </SheetTitle>
          <SheetDescription>
            <span className="flex items-center gap-2 flex-wrap">
              Current:
              <Badge variant="secondary" className="bg-aero-900/60 text-slate-300 border-aero-700/50">
                {row.supplier.name}
              </Badge>
              on
              <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                {selectedAirplane.name}
              </Badge>
              ·
              <span className="text-slate-400">{allOptions.length} suppliers compared</span>
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-6">
          {/* ── Charts row ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar chart */}
            <Card className="bg-aero-800/60 border-aero-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-slate-400">Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    {allOptions.map((s, i) => (
                      <Radar
                        key={s.id}
                        name={s.name}
                        dataKey={s.id}
                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                        fillOpacity={i === 0 ? 0.15 : 0.08}
                        strokeWidth={i === 0 ? 2 : 1.5}
                      />
                    ))}
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RadarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Bar charts — lead time + on-time */}
            <Card className="bg-aero-800/60 border-aero-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-slate-400">Lead Time vs On-Time Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={barConfig} className="h-[280px] w-full">
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="leadTime" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="onTime" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* ── Quality & cost bar chart ───────────────── */}
          <Card className="bg-aero-800/60 border-aero-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-slate-400">Quality Score vs Cost Share</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barConfig} className="h-[200px] w-full">
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="quality" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="cost" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* ── Supplier cards grid ────────────────────── */}
          <div>
            <p className="text-xs text-slate-500 mb-3">
              Select a supplier below. <span className="text-emerald-400">Green border</span> = supports sustainable fuels.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {allOptions.map((s, i) => {
                const isCurrent = s.id === row.supplier.id
                const isKeroOnly = s.fuelCompatibility.length === 1 && s.fuelCompatibility[0] === FuelType.KEROSENE
                const supportsSustainable = s.fuelCompatibility.some((f) => f !== FuelType.KEROSENE)

                return (
                  <SupplierOptionCard
                    key={s.id}
                    supplier={s}
                    color={CHART_COLORS[i % CHART_COLORS.length]}
                    isCurrent={isCurrent}
                    isKeroOnly={isKeroOnly}
                    supportsSustainable={supportsSustainable}
                    onSelect={() => handleSelect({ newSupplierId: s.id, newSupplierName: s.name })}
                  />
                )
              })}
            </div>
          </div>

          {alternatives.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No alternative suppliers available for this component.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ── Supplier option card (compact, inside the sheet grid) ──

interface SupplierOptionCardProps {
  supplier: Supplier
  color: string
  isCurrent: boolean
  isKeroOnly: boolean
  supportsSustainable: boolean
  onSelect: () => void
}

function SupplierOptionCard(props: SupplierOptionCardProps) {
  const { supplier, color, isCurrent, isKeroOnly, supportsSustainable, onSelect } = props

  return (
    <Card className={cn(
      'border-aero-700/50 bg-aero-900/60 relative',
      supportsSustainable && 'border-emerald-500/20',
      isCurrent && 'ring-1 ring-cyan-500/40',
    )}>
      {/* Color indicator matching chart */}
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: color }} />

      <CardContent className="p-4 pl-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{supplier.name}</p>
              {isCurrent && (
                <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">
                  <Star className="size-2.5 mr-0.5" /> Current
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500">{supplier.country} · T{supplier.tier}</p>
          </div>
          <Badge variant="secondary" className={RISK_STYLES[supplier.risk]}>
            {supplier.risk}
          </Badge>
        </div>

        {/* Fuel compat */}
        <div className="flex items-center gap-1.5">
          {isKeroOnly ? (
            <Fuel className="size-3.5 text-rose-400 shrink-0" />
          ) : (
            <Leaf className="size-3.5 text-emerald-400 shrink-0" />
          )}
          <div className="flex gap-1 flex-wrap">
            {supplier.fuelCompatibility.map((f) => (
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

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Lead Time</span>
            <span className="font-mono text-slate-300">{supplier.leadTimeDays}d</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">On-Time</span>
            <span className="font-mono text-slate-300">{supplier.onTimeDelivery}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Quality</span>
            <span className="font-mono text-slate-300">{supplier.qualityScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Cost</span>
            <span className="font-mono text-slate-300">{supplier.costShare}%</span>
          </div>
        </div>

        {/* Action */}
        {!isCurrent ? (
          <Button className="w-full gap-2" size="sm" onClick={onSelect}>
            <Check className="size-3.5" />
            Select Supplier
          </Button>
        ) : (
          <Button className="w-full" size="sm" variant="outline" disabled>
            Currently Assigned
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
