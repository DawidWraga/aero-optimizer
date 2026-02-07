"use client"

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { FuelType } from '@/app/data/types'
import {
  Airplane,
  INITIAL_AIRPLANES,
  getSupplierById,
  type Supplier,
  type RiskLevel,
} from '@/app/data/supply-chain'

export interface SupplierRiskRow {
  component: string
  supplier: Supplier
  sustainabilityRisk: boolean
  riskLevel: RiskLevel
}

// 1. THE INTERNAL HOOK
function useSupplyChainInner() {
  const [airplanes, setAirplanes] = useState<Airplane[]>(INITIAL_AIRPLANES)
  const [selectedAirplaneId, setSelectedAirplaneId] = useState<string>(INITIAL_AIRPLANES[1].id) // 737 MAX by default — has most risks

  const selectedAirplane = useMemo(
    () => airplanes.find((a) => a.id === selectedAirplaneId) ?? airplanes[0],
    [airplanes, selectedAirplaneId]
  )

  /** Get supplier rows for the selected airplane with risk flags */
  const supplierRows = useMemo<SupplierRiskRow[]>(() => {
    return Object.entries(selectedAirplane.suppliers).map(([component, supplierId]) => {
      const supplier = getSupplierById({ supplierId })!
      const sustainabilityRisk =
        supplier.fuelCompatibility.length === 1 &&
        supplier.fuelCompatibility[0] === FuelType.KEROSENE
      return {
        component,
        supplier,
        sustainabilityRisk,
        riskLevel: sustainabilityRisk && supplier.risk === 'low' ? 'medium' : supplier.risk,
      }
    })
  }, [selectedAirplane])

  /** Count risks for a given airplane */
  const getAirplaneRiskCount = useCallback(
    (opts: { airplaneId: string }) => {
      const airplane = airplanes.find((a) => a.id === opts.airplaneId)
      if (!airplane) return { high: 0, sustainability: 0 }
      let high = 0
      let sustainability = 0
      Object.values(airplane.suppliers).forEach((sid) => {
        const s = getSupplierById({ supplierId: sid })
        if (!s) return
        if (s.risk === 'high' || s.risk === 'critical') high++
        if (s.fuelCompatibility.length === 1 && s.fuelCompatibility[0] === FuelType.KEROSENE) sustainability++
      })
      return { high, sustainability }
    },
    [airplanes]
  )

  /** Swap a supplier for a given airplane + component */
  const swapSupplier = useCallback(
    (opts: { airplaneId: string; component: string; newSupplierId: string }) => {
      setAirplanes((prev) =>
        prev.map((a) =>
          a.id === opts.airplaneId
            ? { ...a, suppliers: { ...a.suppliers, [opts.component]: opts.newSupplierId } }
            : a
        )
      )
    },
    []
  )

  /** Replace a component entirely with a compatible alternative */
  const swapComponent = useCallback(
    (opts: { airplaneId: string; oldComponent: string; newComponent: string; newSupplierId: string }) => {
      setAirplanes((prev) =>
        prev.map((a) => {
          if (a.id !== opts.airplaneId) return a
          const next = { ...a.suppliers }
          delete next[opts.oldComponent]
          next[opts.newComponent] = opts.newSupplierId
          return { ...a, suppliers: next }
        })
      )
    },
    []
  )

  return {
    airplanes,
    selectedAirplaneId,
    setSelectedAirplaneId,
    selectedAirplane,
    supplierRows,
    getAirplaneRiskCount,
    swapSupplier,
    swapComponent,
  }
}

// 2. THE INFERRED TYPE
type SupplyChainContextValue = ReturnType<typeof useSupplyChainInner>

const SupplyChainContext = createContext<SupplyChainContextValue | undefined>(undefined)

// 3. THE PROVIDER
export function SupplyChainProvider({ children }: { children: ReactNode }) {
  return (
    <SupplyChainContext.Provider value={useSupplyChainInner()}>
      {children}
    </SupplyChainContext.Provider>
  )
}

// 4. THE PUBLIC HOOK
export function useSupplyChain() {
  const contextValue = useContext(SupplyChainContext)
  if (!contextValue) {
    throw new Error('useSupplyChain must be used within a SupplyChainProvider')
  }
  return contextValue
}
