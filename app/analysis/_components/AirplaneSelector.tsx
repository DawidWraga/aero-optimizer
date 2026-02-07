'use client'

import { useSupplyChain } from '@/context/SupplyChainContext'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Plane } from 'lucide-react'

export interface AirplaneSelectorProps {}

export function AirplaneSelector(props: AirplaneSelectorProps) {
  const {} = props
  const { airplanes, selectedAirplaneId, setSelectedAirplaneId, getAirplaneRiskCount } = useSupplyChain()

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {airplanes.map((airplane) => {
        const isSelected = airplane.id === selectedAirplaneId
        const risks = getAirplaneRiskCount({ airplaneId: airplane.id })

        return (
          <button
            key={airplane.id}
            onClick={() => setSelectedAirplaneId(airplane.id)}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all min-w-[200px] shrink-0',
              isSelected
                ? 'border-cyan-500/50 bg-cyan-500/10'
                : 'border-aero-700/50 bg-aero-800/40 hover:border-aero-600/50 hover:bg-aero-800/60',
            )}
          >
            <div className={cn(
              'rounded-lg p-2',
              isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-aero-900/60 text-slate-400'
            )}>
              <Plane className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn('text-sm font-semibold truncate', isSelected ? 'text-cyan-300' : 'text-slate-200')}>
                {airplane.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{airplane.model}</p>
            </div>
            <div className="flex flex-col gap-1 items-end shrink-0">
              {risks.sustainability > 0 && (
                <Badge variant="secondary" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] px-1.5">
                  {risks.sustainability} fuel risk{risks.sustainability > 1 ? 's' : ''}
                </Badge>
              )}
              {risks.high > 0 && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-1.5">
                  {risks.high} high risk{risks.high > 1 ? 's' : ''}
                </Badge>
              )}
              {risks.sustainability === 0 && risks.high === 0 && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-1.5">
                  All clear
                </Badge>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
