'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SUPPLIERS, type RiskLevel } from '@/data/supply-chain'
import { cn } from '@/lib/utils'

const RISK_STYLES: Record<RiskLevel, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  low: { variant: 'secondary', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  medium: { variant: 'secondary', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  high: { variant: 'secondary', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  critical: { variant: 'destructive', className: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
}

const TIER_COLORS: Record<number, string> = {
  1: 'text-cyan-400',
  2: 'text-violet-400',
  3: 'text-slate-400',
}

export interface SupplierTableProps {}

export function SupplierTable(props: SupplierTableProps) {
  const {} = props

  return (
    <Card className="bg-aero-800/60 border-aero-700/50">
      <CardHeader>
        <CardTitle className="text-sm font-mono">Supplier Directory</CardTitle>
        <CardDescription>All suppliers across tiers with performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-aero-700/50 hover:bg-transparent">
              <TableHead className="text-slate-400">Supplier</TableHead>
              <TableHead className="text-slate-400">Tier</TableHead>
              <TableHead className="text-slate-400">Component</TableHead>
              <TableHead className="text-slate-400">Country</TableHead>
              <TableHead className="text-slate-400">Lead Time</TableHead>
              <TableHead className="text-slate-400">On-Time</TableHead>
              <TableHead className="text-slate-400">Quality</TableHead>
              <TableHead className="text-slate-400">Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SUPPLIERS.map((s) => {
              const riskStyle = RISK_STYLES[s.risk]
              return (
                <TableRow key={s.id} className="border-aero-700/30">
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <span className={cn('font-mono font-semibold', TIER_COLORS[s.tier])}>
                      T{s.tier}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-300">{s.component}</TableCell>
                  <TableCell className="text-slate-400">{s.country}</TableCell>
                  <TableCell className="font-mono text-slate-300">{s.leadTimeDays}d</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={s.onTimeDelivery} className="h-1.5 flex-1" />
                      <span className="font-mono text-xs text-slate-400">{s.onTimeDelivery}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-300">{s.qualityScore}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={riskStyle.variant} className={riskStyle.className}>
                      {s.risk}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
