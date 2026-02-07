'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useSupplyChain, type SupplierRiskRow } from '@/context/SupplyChainContext'
import { cn } from '@/lib/utils'
import { FuelType } from '@/data/types'
import type { RiskLevel } from '@/data/supply-chain'
import { AlertTriangle, ArrowRightLeft, Leaf, Fuel } from 'lucide-react'
import { UnifiedChangeSheet } from './UnifiedChangeSheet'

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

function hasRisk(row: SupplierRiskRow) {
  return row.sustainabilityRisk || row.riskLevel === 'high' || row.riskLevel === 'critical' || row.riskLevel === 'medium'
}

export interface SupplierRiskTableProps {}

export function SupplierRiskTable(props: SupplierRiskTableProps) {
  const {} = props
  const { supplierRows, selectedAirplane } = useSupplyChain()
  const [sheetRow, setSheetRow] = useState<SupplierRiskRow | null>(null)

  // Sort: critical/high/sustainability first
  const sorted = [...supplierRows].sort((a, b) => {
    const riskOrder: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    const aScore = a.sustainabilityRisk ? -1 : riskOrder[a.riskLevel]
    const bScore = b.sustainabilityRisk ? -1 : riskOrder[b.riskLevel]
    return aScore - bScore
  })

  return (
    <>
      <Card className="bg-aero-800/60 border-aero-700/50">
        <CardHeader>
          <CardTitle className="text-sm font-mono">
            Supplier Assignments — {selectedAirplane.name}
          </CardTitle>
          <CardDescription>
            Review assigned suppliers. Sustainability risks flagged for kerosene-only suppliers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-aero-700/50 hover:bg-transparent">
                <TableHead className="text-slate-400">Component</TableHead>
                <TableHead className="text-slate-400">Supplier</TableHead>
                <TableHead className="text-slate-400">Fuel Compat.</TableHead>
                <TableHead className="text-slate-400">Lead Time</TableHead>
                <TableHead className="text-slate-400">On-Time</TableHead>
                <TableHead className="text-slate-400">Quality</TableHead>
                <TableHead className="text-slate-400">Risk</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => {
                const showActions = hasRisk(row)

                return (
                  <TableRow
                    key={row.component}
                    className={cn(
                      'border-aero-700/30',
                      row.sustainabilityRisk && 'bg-rose-500/3',
                    )}
                  >
                    <TableCell className="font-medium">{row.component}</TableCell>
                    <TableCell className="text-slate-300">{row.supplier.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {row.sustainabilityRisk ? (
                          <Fuel className="size-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <Leaf className="size-3.5 text-emerald-400 shrink-0" />
                        )}
                        <div className="flex gap-1 flex-wrap">
                          {row.supplier.fuelCompatibility.map((f) => (
                            <Badge
                              key={f}
                              variant="secondary"
                              className={cn(
                                'text-[10px] px-1.5',
                                f === FuelType.KEROSENE && row.sustainabilityRisk
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : 'bg-aero-900/60 text-slate-400 border-aero-700/50',
                              )}
                            >
                              {FUEL_SHORT[f]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-slate-300 text-xs">{row.supplier.leadTimeDays}d</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[90px]">
                        <Progress value={row.supplier.onTimeDelivery} className="h-1.5 flex-1" />
                        <span className="font-mono text-xs text-slate-400">{row.supplier.onTimeDelivery}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">{row.supplier.qualityScore}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {row.sustainabilityRisk && (
                          <AlertTriangle className="size-3.5 text-rose-400 shrink-0" />
                        )}
                        <Badge variant="secondary" className={RISK_STYLES[row.riskLevel]}>
                          {row.riskLevel}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {showActions && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1.5 border-aero-700/50"
                          onClick={() => setSheetRow(row)}
                        >
                          <ArrowRightLeft className="size-3" />
                          Modify
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UnifiedChangeSheet
        row={sheetRow}
        onClose={() => setSheetRow(null)}
      />
    </>
  )
}
