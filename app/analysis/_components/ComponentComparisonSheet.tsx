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
import { getCompatibleComponents, getSupplierById, type ComponentAlternative } from '@/data/supply-chain'
import { cn } from '@/lib/utils'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { toast } from 'sonner'
import { Check, ArrowDown, ArrowUp, Weight, DollarSign, Leaf, Shield, Star } from 'lucide-react'

const CHART_COLORS = ['#f97316', '#22d3ee', '#a78bfa', '#4ade80', '#f472b6']

export interface ComponentComparisonSheetProps {
  row: SupplierRiskRow | null
  onClose: () => void
}

export function ComponentComparisonSheet(props: ComponentComparisonSheetProps) {
  const { row, onClose } = props
  const { selectedAirplane, swapComponent } = useSupplyChain()

  if (!row) return <Sheet open={false}><SheetContent /></Sheet>

  const alternatives = getCompatibleComponents({ component: row.component })

  const handleSelect = (opts: { alt: ComponentAlternative }) => {
    swapComponent({
      airplaneId: selectedAirplane.id,
      oldComponent: row.component,
      newComponent: opts.alt.component,
      newSupplierId: opts.alt.defaultSupplierId,
    })
    const newSupplier = getSupplierById({ supplierId: opts.alt.defaultSupplierId })
    toast.success('Component replaced', {
      description: `${row.component} → ${opts.alt.component} (${newSupplier?.name ?? 'unknown'})`,
    })
    onClose()
  }

  // Build a "current" entry for chart comparison
  const currentEntry = {
    name: row.component,
    weightDelta: 0,
    costDelta: 0,
    sustainabilityScore: row.sustainabilityRisk ? 30 : 75,
    structuralScore: 85,
    isCurrent: true,
  }

  const allEntries = [
    currentEntry,
    ...alternatives.map((a) => ({
      name: a.component,
      weightDelta: a.weightDelta,
      costDelta: a.costDelta,
      sustainabilityScore: a.sustainabilityScore,
      structuralScore: a.structuralScore,
      isCurrent: false,
    })),
  ]

  // ── Chart configs ────────────────────────────────────────

  const radarConfig = allEntries.reduce<ChartConfig>((acc, e, i) => {
    acc[e.name] = { label: e.name, color: CHART_COLORS[i % CHART_COLORS.length] }
    return acc
  }, {})

  const radarData = [
    { metric: 'Sustainability', ...Object.fromEntries(allEntries.map((e) => [e.name, e.sustainabilityScore])) },
    { metric: 'Structural', ...Object.fromEntries(allEntries.map((e) => [e.name, e.structuralScore])) },
    { metric: 'Weight Eff.', ...Object.fromEntries(allEntries.map((e) => [e.name, Math.max(0, 100 + (e.weightDelta / 3))])) },
    { metric: 'Cost Eff.', ...Object.fromEntries(allEntries.map((e) => [e.name, Math.max(0, 100 - e.costDelta)])) },
  ]

  const barConfig: ChartConfig = {
    sustainabilityScore: { label: 'Sustainability', color: '#4ade80' },
    structuralScore: { label: 'Structural Integrity', color: '#22d3ee' },
  }

  const barData = allEntries.map((e, i) => ({
    name: e.name,
    sustainabilityScore: e.sustainabilityScore,
    structuralScore: e.structuralScore,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <Sheet open={!!row} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[90vw]! max-w-5xl! overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-mono">
            Change Component — {row.component}
          </SheetTitle>
          <SheetDescription>
            <span className="flex items-center gap-2 flex-wrap">
              Compare compatible alternatives for
              <Badge variant="secondary" className="bg-aero-900/60 text-slate-300 border-aero-700/50">
                {row.component}
              </Badge>
              on
              <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                {selectedAirplane.name}
              </Badge>
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-6">
          {/* ── Charts ──────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar */}
            <Card className="bg-aero-800/60 border-aero-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-slate-400">Trade-off Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={radarConfig} className="h-[280px] w-full">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    {allEntries.map((e, i) => (
                      <Radar
                        key={e.name}
                        name={e.name}
                        dataKey={e.name}
                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                        fillOpacity={e.isCurrent ? 0.15 : 0.08}
                        strokeWidth={e.isCurrent ? 2 : 1.5}
                      />
                    ))}
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RadarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Bar: sustainability vs structural */}
            <Card className="bg-aero-800/60 border-aero-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-slate-400">Sustainability vs Structural Integrity</CardTitle>
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
                      angle={-15}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sustainabilityScore" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="structuralScore" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* ── Component cards ─────────────────────────── */}
          <div>
            <p className="text-xs text-slate-500 mb-3">
              {alternatives.length} compatible component{alternatives.length !== 1 ? 's' : ''} available. Select one to replace <span className="text-slate-300">{row.component}</span>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {/* Current component card */}
              <ComponentOptionCard
                name={row.component}
                rationale="Currently installed component"
                tradeoff="No change required"
                weightDelta={0}
                costDelta={0}
                sustainabilityScore={currentEntry.sustainabilityScore}
                structuralScore={currentEntry.structuralScore}
                color={CHART_COLORS[0]}
                supplierName={row.supplier.name}
                isCurrent
              />

              {/* Alternative cards */}
              {alternatives.map((alt, i) => {
                const altSupplier = getSupplierById({ supplierId: alt.defaultSupplierId })
                return (
                  <ComponentOptionCard
                    key={alt.component}
                    name={alt.component}
                    rationale={alt.rationale}
                    tradeoff={alt.tradeoff}
                    weightDelta={alt.weightDelta}
                    costDelta={alt.costDelta}
                    sustainabilityScore={alt.sustainabilityScore}
                    structuralScore={alt.structuralScore}
                    color={CHART_COLORS[(i + 1) % CHART_COLORS.length]}
                    supplierName={altSupplier?.name ?? 'Unknown'}
                    isCurrent={false}
                    onSelect={() => handleSelect({ alt })}
                  />
                )
              })}
            </div>
          </div>

          {alternatives.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No compatible component alternatives available.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ── Component option card ──────────────────────────────────

interface ComponentOptionCardProps {
  name: string
  rationale: string
  tradeoff: string
  weightDelta: number
  costDelta: number
  sustainabilityScore: number
  structuralScore: number
  color: string
  supplierName: string
  isCurrent: boolean
  onSelect?: () => void
}

function ComponentOptionCard(props: ComponentOptionCardProps) {
  const {
    name, rationale, tradeoff, weightDelta, costDelta,
    sustainabilityScore, structuralScore, color, supplierName,
    isCurrent, onSelect,
  } = props

  return (
    <Card className={cn(
      'border-aero-700/50 bg-aero-900/60 relative',
      isCurrent && 'ring-1 ring-cyan-500/40',
      sustainabilityScore >= 80 && !isCurrent && 'border-emerald-500/20',
    )}>
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: color }} />

      <CardContent className="p-4 pl-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{name}</p>
              {isCurrent && (
                <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">
                  <Star className="size-2.5 mr-0.5" /> Current
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Default: {supplierName}</p>
          </div>
        </div>

        {/* Rationale */}
        <p className="text-xs text-slate-400">{rationale}</p>

        {/* Tradeoff */}
        <div className="rounded bg-aero-800/80 border border-aero-700/30 px-3 py-2">
          <p className="text-[11px] text-slate-500 leading-relaxed">{tradeoff}</p>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500">
              <Weight className="size-3" /> Weight
            </span>
            <span className={cn(
              'font-mono',
              weightDelta < 0 ? 'text-emerald-400' : weightDelta > 0 ? 'text-rose-400' : 'text-slate-400'
            )}>
              {weightDelta === 0 ? '—' : (
                <span className="flex items-center gap-0.5">
                  {weightDelta < 0 ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />}
                  {Math.abs(weightDelta)}kg
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500">
              <DollarSign className="size-3" /> Cost
            </span>
            <span className={cn(
              'font-mono',
              costDelta < 0 ? 'text-emerald-400' : costDelta > 0 ? 'text-rose-400' : 'text-slate-400'
            )}>
              {costDelta === 0 ? '—' : (
                <span className="flex items-center gap-0.5">
                  {costDelta < 0 ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />}
                  {Math.abs(costDelta)}%
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500">
              <Leaf className="size-3" /> Sustain.
            </span>
            <span className={cn(
              'font-mono',
              sustainabilityScore >= 80 ? 'text-emerald-400' : sustainabilityScore >= 60 ? 'text-amber-400' : 'text-rose-400'
            )}>
              {sustainabilityScore}/100
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500">
              <Shield className="size-3" /> Struct.
            </span>
            <span className={cn(
              'font-mono',
              structuralScore >= 85 ? 'text-emerald-400' : structuralScore >= 70 ? 'text-amber-400' : 'text-rose-400'
            )}>
              {structuralScore}/100
            </span>
          </div>
        </div>

        {/* Action */}
        {!isCurrent && onSelect ? (
          <Button className="w-full gap-2" size="sm" onClick={onSelect}>
            <Check className="size-3.5" />
            Use This Component
          </Button>
        ) : (
          <Button className="w-full" size="sm" variant="outline" disabled>
            Currently Installed
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
