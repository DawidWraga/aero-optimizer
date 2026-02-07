'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { MONTHLY_SPEND } from '@/app/data/supply-chain'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const chartConfig = {
  tier1: { label: 'Tier 1', color: '#22d3ee' },
  tier2: { label: 'Tier 2', color: '#a78bfa' },
  tier3: { label: 'Tier 3', color: '#4ade80' },
} satisfies ChartConfig

export interface SpendChartProps {}

export function SpendChart(props: SpendChartProps) {
  const {} = props

  return (
    <Card className="bg-aero-800/60 border-aero-700/50">
      <CardHeader>
        <CardTitle className="text-sm font-mono">Monthly Procurement Spend ($M)</CardTitle>
        <CardDescription>Spend breakdown by supplier tier — trailing 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={MONTHLY_SPEND} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillTier1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillTier2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillTier3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="tier1" stroke="#22d3ee" fill="url(#fillTier1)" strokeWidth={2} />
            <Area type="monotone" dataKey="tier2" stroke="#a78bfa" fill="url(#fillTier2)" strokeWidth={2} />
            <Area type="monotone" dataKey="tier3" stroke="#4ade80" fill="url(#fillTier3)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
