'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RISK_EVENTS, type RiskLevel } from '@/app/data/supply-chain'
import { cn } from '@/lib/utils'
import { AlertTriangle, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react'

const RISK_CONFIG: Record<RiskLevel, { icon: typeof ShieldAlert; color: string; badgeClass: string }> = {
  low: { icon: ShieldCheck, color: 'text-emerald-400', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  medium: { icon: AlertTriangle, color: 'text-amber-400', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  high: { icon: ShieldAlert, color: 'text-orange-400', badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  critical: { icon: ShieldX, color: 'text-rose-400', badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
}

export interface RiskAssessmentProps {}

export function RiskAssessment(props: RiskAssessmentProps) {
  const {} = props

  return (
    <Card className="bg-aero-800/60 border-aero-700/50">
      <CardHeader>
        <CardTitle className="text-sm font-mono">Supply Chain Risk Register</CardTitle>
        <CardDescription>Active risks with impact analysis and mitigation strategies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {RISK_EVENTS.map((event) => {
          const config = RISK_CONFIG[event.risk]
          const Icon = config.icon
          return (
            <div
              key={event.id}
              className={cn(
                'rounded-lg border border-aero-700/40 bg-aero-900/40 p-4 space-y-3',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={cn('size-4 shrink-0', config.color)} />
                  <h4 className="font-medium text-sm truncate">{event.title}</h4>
                </div>
                <Badge variant="secondary" className={cn('shrink-0', config.badgeClass)}>
                  {event.risk}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-500 mb-1">Impact</p>
                  <p className="text-slate-300">{event.impact}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Supplier</p>
                  <p className="text-slate-300">{event.supplier}</p>
                </div>
              </div>

              <div className="text-xs">
                <p className="text-slate-500 mb-1">Mitigation</p>
                <p className="text-slate-400">{event.mitigation}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Probability</span>
                <Progress value={event.probability} className="h-1.5 flex-1 max-w-[200px]" />
                <span className="font-mono text-xs text-slate-400">{event.probability}%</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
