// app/analysis/_components/UnifiedChangeSheet.tsx
'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupplyChain, type SupplierRiskRow } from '@/context/SupplyChainContext'
import {
  getAlternatives,
  getCompatibleComponents,
  getSupplierById,
  type Supplier,
  type RiskLevel,
  type ComponentAlternative
} from '@/data/supply-chain'
import { FuelType } from '@/data/types'
import { cn } from '@/lib/utils'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { toast } from 'sonner'
import { Check, Leaf, Fuel, Star, ArrowDown, ArrowUp, Weight, DollarSign, Shield, AlertTriangle } from 'lucide-react'

// Constants
const CHART_COLORS = ['#f97316', '#22d3ee', '#a78bfa', '#4ade80', '#f472b6']

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

export interface UnifiedChangeSheetProps {
  row: SupplierRiskRow | null
  onClose: () => void
}

export function UnifiedChangeSheet({ row, onClose }: UnifiedChangeSheetProps) {
  const { selectedAirplane, swapSupplier, swapComponent } = useSupplyChain()

  if (!row) return <Sheet open={false}><SheetContent /></Sheet>

  // Data for Suppliers
  const supplierAlternatives = getAlternatives({
    component: row.component,
    currentSupplierId: row.supplier.id,
  })
  const allSuppliers = [row.supplier, ...supplierAlternatives]

  // Data for Components
  const componentAlternatives = getCompatibleComponents({ component: row.component })
  
  // Current component entry for comparison
  const currentComponentEntry = {
    name: row.component,
    weightDelta: 0,
    costDelta: 0,
    sustainabilityScore: row.sustainabilityRisk ? 30 : 75,
    structuralScore: 85,
    isCurrent: true,
  }
  const allComponents = [
    currentComponentEntry,
    ...componentAlternatives.map((a) => ({
      name: a.component,
      weightDelta: a.weightDelta,
      costDelta: a.costDelta,
      sustainabilityScore: a.sustainabilityScore,
      structuralScore: a.structuralScore,
      isCurrent: false,
    })),
  ]

  // Handlers
  const handleSupplierSelect = (newSupplierId: string, newSupplierName: string) => {
    swapSupplier({
      airplaneId: selectedAirplane.id,
      component: row.component,
      newSupplierId,
    })
    toast.success(`Supplier changed`, {
      description: `${row.component}: ${row.supplier.name} → ${newSupplierName}`,
    })
    onClose()
  }

  const handleComponentSelect = (alt: ComponentAlternative) => {
    swapComponent({
      airplaneId: selectedAirplane.id,
      oldComponent: row.component,
      newComponent: alt.component,
      newSupplierId: alt.defaultSupplierId,
    })
    const newSupplier = getSupplierById({ supplierId: alt.defaultSupplierId })
    toast.success('Component replaced', {
      description: `${row.component} → ${alt.component} (${newSupplier?.name ?? 'unknown'})`,
    })
    onClose()
  }

  // --- Chart Configs (Supplier) ---
  const supplierChartConfig = allSuppliers.reduce<ChartConfig>((acc, s, i) => {
    acc[s.id] = { label: s.name, color: CHART_COLORS[i % CHART_COLORS.length] }
    return acc
  }, {})

  const supplierRadarData = [
    { metric: 'Quality', ...Object.fromEntries(allSuppliers.map((s) => [s.id, s.qualityScore])) },
    { metric: 'On-Time', ...Object.fromEntries(allSuppliers.map((s) => [s.id, s.onTimeDelivery])) },
    { metric: 'Speed', ...Object.fromEntries(allSuppliers.map((s) => [s.id, Math.max(0, 100 - (s.leadTimeDays / 2))])) },
    { metric: 'Cost Eff.', ...Object.fromEntries(allSuppliers.map((s) => [s.id, Math.max(0, 100 - s.costShare * 2)])) },
    { metric: 'Fuel Range', ...Object.fromEntries(allSuppliers.map((s) => [s.id, s.fuelCompatibility.length * 25])) },
  ]

  const supplierBarData = allSuppliers.map((s, i) => ({
    name: s.name,
    leadTime: s.leadTimeDays,
    onTime: s.onTimeDelivery,
    quality: s.qualityScore,
    cost: s.costShare,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const supplierBarConfig: ChartConfig = {
    leadTime: { label: 'Lead Time (days)', color: '#f97316' },
    onTime: { label: 'On-Time %', color: '#22d3ee' },
    quality: { label: 'Quality Score', color: '#a78bfa' },
    cost: { label: 'Cost Share %', color: '#4ade80' },
  }

  // --- Chart Configs (Component) ---
  const componentRadarConfig = allComponents.reduce<ChartConfig>((acc, e, i) => {
    acc[e.name] = { label: e.name, color: CHART_COLORS[i % CHART_COLORS.length] }
    return acc
  }, {})

  const componentRadarData = [
    { metric: 'Sustainability', ...Object.fromEntries(allComponents.map((e) => [e.name, e.sustainabilityScore])) },
    { metric: 'Structural', ...Object.fromEntries(allComponents.map((e) => [e.name, e.structuralScore])) },
    { metric: 'Weight Eff.', ...Object.fromEntries(allComponents.map((e) => [e.name, Math.max(0, 100 + (e.weightDelta / 3))])) },
    { metric: 'Cost Eff.', ...Object.fromEntries(allComponents.map((e) => [e.name, Math.max(0, 100 - e.costDelta)])) },
  ]

  const componentBarConfig: ChartConfig = {
    sustainabilityScore: { label: 'Sustainability', color: '#4ade80' },
    structuralScore: { label: 'Structural Integrity', color: '#22d3ee' },
  }

  const componentBarData = allComponents.map((e, i) => ({
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
            Modify — {row.component}
          </SheetTitle>
          <SheetDescription>
            <span className="flex items-center gap-2 flex-wrap">
              Currently:
              <Badge variant="secondary" className="bg-aero-900/60 text-slate-300 border-aero-700/50">
                {row.supplier.name}
              </Badge>
              on
              <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                {selectedAirplane.name}
              </Badge>
            </span>
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="supplier" className="mt-6">
          {/* <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="supplier">Change Supplier</TabsTrigger>
            <TabsTrigger value="component" disabled={componentAlternatives.length === 0}>
              Change Component {componentAlternatives.length > 0 && `(${componentAlternatives.length})`}
            </TabsTrigger>
          </TabsList> */}

          {/* === SUPPLIER TAB === */}
          <TabsContent value="supplier" className="space-y-6 mt-6 flex-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-aero-800/60 border-aero-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono text-slate-400">Performance Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={supplierChartConfig} className="h-[250px] w-full">
                    <RadarChart data={supplierRadarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      {allSuppliers.map((s, i) => (
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

              <Card className="bg-aero-800/60 border-aero-700/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono text-slate-400">Lead Time vs On-Time Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={supplierBarConfig} className="h-[250px] w-full">
                    <BarChart data={supplierBarData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {allSuppliers.map((s, i) => {
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
                    onSelect={() => handleSupplierSelect(s.id, s.name)}
                  />
                )
              })}
            </div>
            {supplierAlternatives.length === 0 && (
                <div className="text-center py-4 text-slate-500 text-sm">
                  No alternative suppliers available.
                </div>
            )}
          </TabsContent>

          {/* === COMPONENT TAB === */}
          <TabsContent value="component" className="space-y-6 mt-6 flex-auto">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               <Card className="bg-aero-800/60 border-aero-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono text-slate-400">Trade-off Radar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={componentRadarConfig} className="h-[250px] w-full">
                      <RadarChart data={componentRadarData} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        {allComponents.map((e, i) => (
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

               <Card className="bg-aero-800/60 border-aero-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono text-slate-400">Sustainability vs Structural</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={componentBarConfig} className="h-[250px] w-full">
                      <BarChart data={componentBarData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <ComponentOptionCard
                    name={row.component}
                    rationale="Currently installed component"
                    tradeoff="No change required"
                    weightDelta={0}
                    costDelta={0}
                    sustainabilityScore={currentComponentEntry.sustainabilityScore}
                    structuralScore={currentComponentEntry.structuralScore}
                    color={CHART_COLORS[0]}
                    supplierName={row.supplier.name}
                    isCurrent
                />
                {componentAlternatives.map((alt, i) => {
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
                            onSelect={() => handleComponentSelect(alt)}
                        />
                    )
                })}
             </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

// Helper Components

function SupplierOptionCard({
  supplier,
  color,
  isCurrent,
  isKeroOnly,
  supportsSustainable,
  onSelect
}: {
  supplier: Supplier
  color: string
  isCurrent: boolean
  isKeroOnly: boolean
  supportsSustainable: boolean
  onSelect: () => void
}) {
  return (
    <Card className={cn(
      'border-aero-700/50 bg-aero-900/60 relative',
      supportsSustainable && 'border-emerald-500/20',
      isCurrent && 'ring-1 ring-cyan-500/40',
    )}>
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: color }} />
      <CardContent className="p-4 pl-5 space-y-3">
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
          <Badge variant="secondary" className={cn('text-[10px] px-1.5', RISK_STYLES[supplier.risk])}>
            {supplier.risk}
          </Badge>
        </div>

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

        {!isCurrent ? (
          <Button className="w-full gap-2" size="sm" onClick={onSelect}>
            <Check className="size-3.5" />
            Select
          </Button>
        ) : (
          <Button className="w-full" size="sm" variant="outline" disabled>
            Assigned
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function ComponentOptionCard({
  name,
  rationale,
  tradeoff,
  weightDelta,
  costDelta,
  sustainabilityScore,
  structuralScore,
  color,
  supplierName,
  isCurrent,
  onSelect
}: {
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
}) {
  return (
    <Card className={cn(
      'border-aero-700/50 bg-aero-900/60 relative',
      isCurrent && 'ring-1 ring-cyan-500/40',
      sustainabilityScore >= 80 && !isCurrent && 'border-emerald-500/20',
    )}>
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: color }} />
      <CardContent className="p-4 pl-5 space-y-3">
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
            <p className="text-xs text-slate-500 mt-0.5">Supplier: {supplierName}</p>
          </div>
        </div>

        <p className="text-xs text-slate-400">{rationale}</p>

        <div className="rounded bg-aero-800/80 border border-aero-700/30 px-3 py-2">
          <p className="text-[11px] text-slate-500 leading-relaxed">{tradeoff}</p>
        </div>

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
              {sustainabilityScore}
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
              {structuralScore}
            </span>
          </div>
        </div>

        {!isCurrent && onSelect ? (
          <Button className="w-full gap-2" size="sm" onClick={onSelect}>
            <Check className="size-3.5" />
            Switch
          </Button>
        ) : (
          <Button className="w-full" size="sm" variant="outline" disabled>
            Installed
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
