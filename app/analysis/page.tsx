'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SupplyChainProvider } from '@/context/SupplyChainContext'
import { AirplaneSelector } from './_components/AirplaneSelector'
import { SupplierRiskTable } from './_components/SupplierRiskTable'
import { KpiCards } from './_components/KpiCards'
import { SpendChart } from './_components/SpendChart'
import { CostBreakdownChart } from './_components/CostBreakdownChart'
import { LeadTimeChart } from './_components/LeadTimeChart'
import { TierBreakdown } from './_components/TierBreakdown'
import { RiskAssessment } from './_components/RiskAssessment'

export default function AnalysisPage() {
  return (
    <SupplyChainProvider>
      <div className="min-h-[calc(100vh-57px)] bg-aero-900 p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold font-mono tracking-tight">
            Supply Chain Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Per-aircraft supplier network — risk & sustainability overview
          </p>
        </div>

        {/* Airplane selector */}
        <AirplaneSelector />

        {/* Tabbed sections */}
        <Tabs defaultValue="suppliers" orientation="vertical" className="flex gap-4">
          <TabsList className="flex-col h-fit w-36 shrink-0 sticky top-20">
            <TabsTrigger value="suppliers" className="w-full justify-start">Suppliers</TabsTrigger>
            <TabsTrigger value="overview" className="w-full justify-start">Overview</TabsTrigger>
            <TabsTrigger value="logistics" className="w-full justify-start">Logistics</TabsTrigger>
            <TabsTrigger value="risk" className="w-full justify-start">Risk</TabsTrigger>
          </TabsList>

          <div className="flex-1 min-w-0 space-y-4">
            <TabsContent value="suppliers" className="mt-0 space-y-4">
              <KpiCards />
              <SupplierRiskTable />
            </TabsContent>

            <TabsContent value="overview" className="mt-0 space-y-4">
              <KpiCards />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SpendChart />
                <CostBreakdownChart />
              </div>
              <TierBreakdown />
            </TabsContent>

            <TabsContent value="logistics" className="mt-0 space-y-4">
              <LeadTimeChart />
              <TierBreakdown />
            </TabsContent>

            <TabsContent value="risk" className="mt-0">
              <RiskAssessment />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </SupplyChainProvider>
  )
}
