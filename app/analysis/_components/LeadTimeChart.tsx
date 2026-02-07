'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { LEAD_TIME_DATA } from '@/data/supply-chain'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const chartConfig = {
  current: { label: 'Current', color: '#f97316' },
  target: { label: 'Target', color: '#22d3ee' },
} satisfies ChartConfig

export interface LeadTimeChartProps {}

export function LeadTimeChart(props: LeadTimeChartProps) {
  const {} = props

  return (
    <Card className="bg-aero-800/60 border-aero-700/50">
      <CardHeader>
        <CardTitle className="text-sm font-mono">Lead Time Analysis (Days)</CardTitle>
        <CardDescription>Current vs target lead times by component</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            data={LEAD_TIME_DATA}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit="d" />
            <YAxis
              type="category"
              dataKey="component"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              width={120}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="current" fill="#f97316" radius={[0, 4, 4, 0]} barSize={12} />
            <Bar dataKey="target" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
