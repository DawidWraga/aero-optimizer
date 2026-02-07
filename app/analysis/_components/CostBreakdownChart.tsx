'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { COMPONENT_GROUPS } from '@/data/supply-chain'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'

const chartConfig = COMPONENT_GROUPS.reduce<ChartConfig>((acc, g) => {
  acc[g.name] = { label: g.name, color: g.color }
  return acc
}, {})

export interface CostBreakdownChartProps {}

export function CostBreakdownChart(props: CostBreakdownChartProps) {
  const {} = props

  return (
    <Card className="bg-aero-800/60 border-aero-700/50">
      <CardHeader>
        <CardTitle className="text-sm font-mono">Component Cost Breakdown</CardTitle>
        <CardDescription>Percentage of total aircraft cost by component group</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            data={COMPONENT_GROUPS}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              width={130}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              formatter={(value) => [`${value}%`, 'Cost Share']}
            />
            <Bar dataKey="costPercent" radius={[0, 4, 4, 0]} barSize={18}>
              {COMPONENT_GROUPS.map((g) => (
                <Cell key={g.name} fill={g.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
