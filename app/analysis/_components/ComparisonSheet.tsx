'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useSupplyChain, type SupplierRiskRow } from '@/context/SupplyChainContext'
import { getAlternatives } from '@/data/supply-chain'
import { SupplierComparisonCard } from './SupplierComparisonCard'
import { toast } from 'sonner'

export interface ComparisonSheetProps {
  row: SupplierRiskRow | null
  onClose: () => void
}

export function ComparisonSheet(props: ComparisonSheetProps) {
  const { row, onClose } = props
  const { selectedAirplane, swapSupplier } = useSupplyChain()

  if (!row) return <Sheet open={false}><SheetContent /></Sheet>

  const alternatives = getAlternatives({
    component: row.component,
    currentSupplierId: row.supplier.id,
  })

  const handleSelect = (opts: { newSupplierId: string; newSupplierName: string }) => {
    swapSupplier({
      airplaneId: selectedAirplane.id,
      component: row.component,
      newSupplierId: opts.newSupplierId,
    })
    toast.success(`Supplier changed`, {
      description: `${row.component}: ${row.supplier.name} → ${opts.newSupplierName}`,
    })
    onClose()
  }

  return (
    <Sheet open={!!row} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-mono text-sm">
            Change Supplier — {row.component}
          </SheetTitle>
          <SheetDescription>
            <span className="flex items-center gap-2 flex-wrap">
              Current:
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

        <div className="px-4 pb-6 space-y-3">
          <p className="text-xs text-slate-500">
            {alternatives.length} alternative supplier{alternatives.length !== 1 ? 's' : ''} available. Green border = supports sustainable fuels.
          </p>

          {alternatives.map((alt) => (
            <SupplierComparisonCard
              key={alt.id}
              alternative={alt}
              current={row.supplier}
              onSelect={() => handleSelect({ newSupplierId: alt.id, newSupplierName: alt.name })}
            />
          ))}

          {alternatives.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No alternative suppliers available for this component.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
